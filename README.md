# Six Modern React Website Templates

Six independent, responsive React + Vite + TypeScript websites. Each template has a completely different visual direction and keeps **all visible copy, links, image URLs, alt text, list items, labels, validation messages, and contact details in one file:** `src/content.json`.

## Templates

| Template | Folder | Design direction | Key interactions |
| --- | --- | --- | --- |
| Orbit SaaS | `templates/saas` | Dark futuristic product site | Dashboard preview, billing toggle, CTA validation |
| Form Agency | `templates/agency` | Bold editorial creative studio | Animated work grid, marquee, contact validation |
| Alex Morgan | `templates/portfolio` | Minimal Swiss portfolio | Project category filters, responsive project index |
| Ember & Vine | `templates/restaurant` | Warm photography-led restaurant | Menu tabs, reservation drawer, newsletter form |
| Atelier Estates | `templates/real-estate` | Refined luxury real estate | Property filters, editorial journal, private inquiry |
| Aether | `templates/dimension` | Cinematic interactive 3D studio | Morphing particle worlds, drag/keyboard rotation, live controls |

## Quick start

Requires Node.js 18 or newer.

```bash
npm install
npm run dev:saas
```

Replace `saas` with `agency`, `portfolio`, `restaurant`, `real-estate`, or `dimension`. Vite prints the local preview URL in the terminal.

Build or test every site from the repository root:

```bash
npm run build
npm test
```

Run the responsive browser smoke tests after installing Playwright's Chromium browser:

```bash
npx playwright install chromium
npm run test:e2e
```

Each app is also standalone. For example:

```bash
cd templates/restaurant
npm run dev
npm run build
```

The generated static site is written to that template's `dist` folder and can be deployed to any static host.

## GitHub Pages

The repository includes an automatic GitHub Pages deployment. Every folder directly under `templates/` is discovered, built, added to the gallery, and published at its own URL when changes are pushed to `main`.

To preview the same combined output locally:

```bash
npm run build:pages
npx vite preview --outDir pages-dist
```

To add another site, create `templates/your-site` with:

- an `index.html` file;
- a `package.json` containing a `build` script; and
- a Vite build that writes to `dist`.

Run `npm install` once after adding the folder so its dependencies are recorded in the root lockfile, then commit and push the new site normally. No deployment workflow or gallery code needs to be updated.

The folder name becomes the public path, such as `/Websites/your-site/`. The gallery title and description are read from `src/content.json` (`meta.title` and `meta.description`) when available, then fall back to the document title and folder name.

Optional `package.json` settings can override that behavior:

```json
{
  "pages": {
    "title": "Displayed gallery title",
    "description": "Displayed gallery description",
    "outputDirectory": "dist"
  }
}
```

Set `"pages": false` to keep a template out of the published gallery. After the workflow is committed, select **Settings → Pages → Build and deployment → GitHub Actions** once in the GitHub repository.

## Editing a site

Open the template's `src/content.json`. No JSX changes are needed for content updates.

```json
{
  "hero": {
    "title": "Your new headline",
    "body": "Your new introduction",
    "image": "https://example.com/hero.jpg",
    "alt": "A useful description of the new image"
  }
}
```

Arrays drive repeating UI. Add, remove, or reorder an object to change navigation items, features, projects, dishes, properties, testimonials, social links, or journal entries. Keep the existing key names so TypeScript and the runtime section validator can detect incomplete configuration.

Remote images are intentionally configured in JSON. For local images, place a file in an app's `public` directory and use a root-relative value such as `"/images/hero.jpg"`.

## Accessibility and behavior

- Semantic landmarks and heading structure
- Keyboard-operable navigation, tabs, filters, and forms
- Visible focus states inherited from native controls
- JSON-configured alt text and accessible labels
- Responsive layouts from small mobile screens through large desktops
- Reduced-motion behavior for users who request it
- Frontend-only form validation and simulated success messages; no data is transmitted

## Project structure

```text
templates/
  saas/
  agency/
  portfolio/
  restaurant/
  real-estate/
  dimension/
    src/
      App.tsx
      content.json
      content.ts
      styles.css
```

The root uses npm workspaces only for convenient installation and shared commands. Every template retains its own package, source, tests, styles, and content file, with no shared runtime dependency between sites.
