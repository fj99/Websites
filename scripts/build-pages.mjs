import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templatesRoot = join(projectRoot, 'templates');
const outputRoot = join(projectRoot, 'pages-dist');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function normalizeBasePath(value) {
  const path = (value || '/').trim().replace(/^\/+|\/+$/g, '');
  return path ? `/${path}/` : '/';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function humanize(value) {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function readSiteMetadata(siteDir, slug, packageJson) {
  const pages = typeof packageJson.pages === 'object' ? packageJson.pages : {};
  const contentPath = join(siteDir, 'src', 'content.json');
  const content = existsSync(contentPath) ? readJson(contentPath) : {};
  const sourceHtml = readFileSync(join(siteDir, 'index.html'), 'utf8');
  const documentTitle = sourceHtml.match(/<title>(.*?)<\/title>/i)?.[1];
  const heroTitle =
    typeof content.hero?.title === 'string'
      ? content.hero.title
      : [content.hero?.titleLead, content.hero?.titleAccent].filter(Boolean).join(' ');

  return {
    title:
      pages.title ||
      content.meta?.title ||
      documentTitle ||
      content.brand?.name ||
      heroTitle ||
      humanize(slug),
    description:
      pages.description ||
      content.meta?.description ||
      content.hero?.body ||
      `Explore the ${humanize(slug)} website.`,
  };
}

function discoverSites() {
  return readdirSync(templatesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const siteDir = join(templatesRoot, entry.name);
      const packagePath = join(siteDir, 'package.json');
      const indexPath = join(siteDir, 'index.html');

      if (!existsSync(packagePath) || !existsSync(indexPath)) return null;

      const packageJson = readJson(packagePath);
      if (packageJson.pages === false || !packageJson.scripts?.build) return null;

      const outputDirectory =
        typeof packageJson.pages === 'object' && packageJson.pages.outputDirectory
          ? packageJson.pages.outputDirectory
          : 'dist';

      return {
        slug: entry.name,
        siteDir,
        packageJson,
        outputDirectory,
        ...readSiteMetadata(siteDir, entry.name, packageJson),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function createGallery(sites) {
  const cards = sites
    .map(
      (site, index) => `
        <article class="site-card">
          <div class="preview">
            <iframe src="./${encodeURIComponent(site.slug)}/" title="Preview of ${escapeHtml(site.title)}" loading="lazy" tabindex="-1"></iframe>
          </div>
          <div class="site-copy">
            <span>${String(index + 1).padStart(2, '0')}</span>
            <div>
              <h2>${escapeHtml(site.title)}</h2>
              <p>${escapeHtml(site.description)}</p>
            </div>
          </div>
          <a href="./${encodeURIComponent(site.slug)}/">Open site <span aria-hidden="true">↗</span></a>
        </article>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="A collection of ${sites.length} React website templates." />
    <title>Website Collection</title>
    <style>
      :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #181815; background: #f4f1e9; }
      * { box-sizing: border-box; }
      body { margin: 0; min-width: 320px; }
      header, main, footer { width: min(1480px, calc(100% - 40px)); margin-inline: auto; }
      header { display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: end; padding: clamp(56px, 10vw, 140px) 0 34px; border-bottom: 1px solid #b9b5aa; }
      .eyebrow { margin: 0 0 16px; font: 700 12px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .16em; text-transform: uppercase; }
      h1 { max-width: 950px; margin: 0; font: 500 clamp(3rem, 8vw, 8rem)/.88 Georgia, serif; letter-spacing: -.055em; }
      header > p { margin: 0; font-size: 14px; color: #605e57; }
      main { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 390px), 1fr)); gap: 24px; padding: 40px 0 80px; }
      .site-card { overflow: hidden; background: #fff; border: 1px solid #d6d2c7; border-radius: 6px; box-shadow: 0 12px 34px rgba(35, 31, 22, .06); transition: transform .2s ease, box-shadow .2s ease; }
      .site-card:hover { transform: translateY(-4px); box-shadow: 0 20px 46px rgba(35, 31, 22, .12); }
      .preview { aspect-ratio: 16 / 10; overflow: hidden; background: #ddd8cc; border-bottom: 1px solid #d6d2c7; }
      iframe { width: 160%; height: 160%; border: 0; pointer-events: none; transform: scale(.625); transform-origin: top left; }
      .site-copy { display: grid; grid-template-columns: 34px 1fr; gap: 12px; padding: 24px 24px 18px; }
      .site-copy > span { padding-top: 5px; color: #77736a; font: 700 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace; }
      h2 { margin: 0 0 10px; font-size: 22px; line-height: 1.15; }
      .site-copy p { margin: 0; min-height: 42px; color: #67645d; font-size: 14px; line-height: 1.5; }
      .site-card > a { display: flex; justify-content: space-between; margin: 0 24px; padding: 16px 0 22px; border-top: 1px solid #e4e1d9; color: inherit; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: .08em; }
      .site-card > a:hover { color: #6654d9; }
      footer { display: flex; justify-content: space-between; gap: 24px; padding: 24px 0 40px; border-top: 1px solid #b9b5aa; color: #67645d; font-size: 12px; }
      footer p { margin: 0; }
      @media (max-width: 640px) { header { grid-template-columns: 1fr; } header > p { display: none; } main { padding-top: 24px; } footer { flex-direction: column; } }
      @media (prefers-reduced-motion: reduce) { .site-card { transition: none; } }
    </style>
  </head>
  <body>
    <header>
      <div>
        <p class="eyebrow">React website collection</p>
        <h1>Choose a direction.</h1>
      </div>
      <p>${sites.length} live ${sites.length === 1 ? 'site' : 'sites'}</p>
    </header>
    <main>${cards}
    </main>
    <footer>
      <p>Created by Felix Fernandez</p>
    </footer>
  </body>
</html>`;
}

const basePath = normalizeBasePath(process.env.PAGES_BASE_PATH);
const sites = discoverSites();

if (sites.length === 0) {
  throw new Error('No publishable sites were found in the templates directory.');
}

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });

for (const site of sites) {
  const siteBasePath = `${basePath}${encodeURIComponent(site.slug)}/`;
  console.log(`\nBuilding ${site.slug} at ${siteBasePath}`);

  const result = spawnSync(
    npmCommand,
    ['run', 'build', '--', `--base=${siteBasePath}`],
    { cwd: site.siteDir, stdio: 'inherit' },
  );

  if (result.status !== 0) {
    throw new Error(`The ${site.slug} build failed with exit code ${result.status}.`);
  }

  const buildOutput = resolve(site.siteDir, site.outputDirectory);
  if (!existsSync(join(buildOutput, 'index.html'))) {
    throw new Error(`${site.slug} did not produce ${site.outputDirectory}/index.html.`);
  }

  cpSync(buildOutput, join(outputRoot, site.slug), { recursive: true });
}

writeFileSync(join(outputRoot, 'index.html'), createGallery(sites));
writeFileSync(join(outputRoot, '.nojekyll'), '');

console.log(`\nCreated pages-dist with ${sites.length} sites.`);
