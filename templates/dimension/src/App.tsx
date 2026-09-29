import { CSSProperties, FormEvent, KeyboardEvent, PointerEvent, useEffect, useRef, useState } from 'react';
import { content } from './content';

type Point = { x: number; y: number; z: number; size: number };
type World = (typeof content.worlds)[number];

const TAU = Math.PI * 2;

function createGeometry(type: string, count = 760): Point[] {
  return Array.from({ length: count }, (_, index) => {
    const t = index / count;
    const golden = index * 2.399963229728653;

    if (type === 'ribbon') {
      const u = (t - 0.5) * Math.PI * 5;
      const across = ((index % 19) / 18 - 0.5) * 0.74;
      const radius = 1.72 + Math.cos(u * 1.5) * 0.24;
      return {
        x: Math.cos(u) * (radius + across * Math.cos(u * 0.5)),
        y: Math.sin(u * 0.5) * 1.35 + across * Math.sin(u * 0.5),
        z: Math.sin(u) * (radius + across * Math.cos(u * 0.5)),
        size: index % 17 === 0 ? 2.2 : 1,
      };
    }

    if (type === 'knot') {
      const u = t * TAU * 2;
      const tubeAngle = golden;
      const radius = 1.42 + 0.44 * Math.cos(3 * u);
      const cx = radius * Math.cos(2 * u);
      const cy = radius * Math.sin(2 * u);
      const cz = 0.64 * Math.sin(3 * u);
      const tube = 0.22 + 0.08 * Math.sin(u * 7);
      return {
        x: cx + Math.cos(tubeAngle) * tube,
        y: cy + Math.sin(tubeAngle) * tube,
        z: cz + Math.sin(tubeAngle + u) * tube,
        size: index % 13 === 0 ? 2.35 : 1,
      };
    }

    const y = 1 - 2 * t;
    const radius = Math.sqrt(1 - y * y);
    const pulse = 1.52 + Math.sin(golden * 5) * 0.12;
    return {
      x: Math.cos(golden) * radius * pulse,
      y: y * pulse,
      z: Math.sin(golden) * radius * pulse,
      size: index % 19 === 0 ? 2.5 : 1,
    };
  });
}

function Scene({ world, spinning }: { world: World; spinning: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef<Point[]>(createGeometry(world.type));
  const colorRef = useRef(world);
  const spinningRef = useRef(spinning);
  const rotationRef = useRef({ x: -0.18, y: 0.42 });
  const pointerRef = useRef({ x: 0, y: 0, down: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    targetRef.current = createGeometry(world.type);
    colorRef.current = world;
  }, [world]);

  useEffect(() => { spinningRef.current = spinning; }, [spinning]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || navigator.userAgent.includes('jsdom')) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let current = createGeometry(world.type);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const density = Math.min(window.devicePixelRatio || 1, 1.75);
      width = Math.max(bounds.width, 1);
      height = Math.max(bounds.height, 1);
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      context.setTransform(density, 0, 0, density, 0, 0);
    };

    const render = () => {
      const target = targetRef.current;
      const palette = colorRef.current;
      const rotation = rotationRef.current;
      const pointer = pointerRef.current;
      if (spinningRef.current && !reduceMotion && !pointer.down) rotation.y += 0.0024;
      rotation.x += ((pointer.y * 0.18 - 0.16) - rotation.x) * (pointer.down ? 0 : 0.008);

      context.clearRect(0, 0, width, height);
      const wash = context.createRadialGradient(width * 0.55, height * 0.48, 20, width * 0.55, height * 0.48, width * 0.48);
      wash.addColorStop(0, `${palette.color}18`);
      wash.addColorStop(1, 'transparent');
      context.fillStyle = wash;
      context.fillRect(0, 0, width, height);

      if (current.length !== target.length) current = createGeometry(palette.type);
      const projected = current.map((point, index) => {
        const next = target[index];
        point.x += (next.x - point.x) * 0.055;
        point.y += (next.y - point.y) * 0.055;
        point.z += (next.z - point.z) * 0.055;
        point.size += (next.size - point.size) * 0.055;

        const cosY = Math.cos(rotation.y); const sinY = Math.sin(rotation.y);
        const x1 = point.x * cosY - point.z * sinY;
        const z1 = point.x * sinY + point.z * cosY;
        const cosX = Math.cos(rotation.x); const sinX = Math.sin(rotation.x);
        const y1 = point.y * cosX - z1 * sinX;
        const z2 = point.y * sinX + z1 * cosX;
        const perspective = Math.min(width, height) * 0.235 / (z2 + 4.6);
        return { x: width * 0.52 + x1 * perspective * 4.2, y: height * 0.49 + y1 * perspective * 4.2, z: z2, size: point.size };
      }).sort((a, b) => a.z - b.z);

      for (let index = 1; index < projected.length; index += 1) {
        const point = projected[index];
        const depth = Math.max(0.18, Math.min(1, (point.z + 2.2) / 4.4));
        context.globalAlpha = 0.24 + depth * 0.76;
        context.fillStyle = index % 9 === 0 ? palette.secondary : palette.color;
        context.beginPath();
        context.arc(point.x, point.y, Math.max(0.55, point.size * (0.7 + depth)), 0, TAU);
        context.fill();
      }
      context.globalAlpha = 1;
      frame = requestAnimationFrame(render);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    frame = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);

  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerRef.current = { ...pointerRef.current, down: true, lastX: event.clientX, lastY: event.clientY };
  };

  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointer = pointerRef.current;
    pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    if (pointer.down) {
      rotationRef.current.y += (event.clientX - pointer.lastX) * 0.009;
      rotationRef.current.x += (event.clientY - pointer.lastY) * 0.009;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    const amount = 0.12;
    if (event.key === 'ArrowLeft') rotationRef.current.y -= amount;
    else if (event.key === 'ArrowRight') rotationRef.current.y += amount;
    else if (event.key === 'ArrowUp') rotationRef.current.x -= amount;
    else if (event.key === 'ArrowDown') rotationRef.current.x += amount;
    else return;
    event.preventDefault();
  };

  return <canvas ref={canvasRef} tabIndex={0} aria-label={content.hero.sceneLabel} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => { pointerRef.current.down = false; }} onPointerCancel={() => { pointerRef.current.down = false; }} onKeyDown={onKeyDown} />;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeWorld, setActiveWorld] = useState(0);
  const [spinning, setSpinning] = useState(true);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const world = content.worlds[activeWorld];

  useEffect(() => { document.title = content.meta.title; }, []);

  const selectWorld = (index: number, returnToHero = false) => {
    setActiveWorld(index);
    if (returnToHero) document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email) setMessage(content.contact.emptyMessage);
    else if (!/^\S+@\S+\.\S+$/.test(email)) setMessage(content.contact.invalidMessage);
    else setMessage(content.contact.successMessage);
  };

  return <>
    <header className="site-header">
      <a className="brand" href="#top" aria-label={content.brand.homeLabel}><span>{content.brand.mark}</span>{content.brand.name}</a>
      <p className="location">{content.brand.location}</p>
      <nav className={menuOpen ? 'open' : ''} aria-label={content.navigation.ariaLabel}>
        {content.navigation.items.map((item) => <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
      </nav>
      <p className="status"><i />{content.brand.status}</p>
      <button className="menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? content.navigation.closeLabel : content.navigation.menuLabel}>
        <span /><span />
      </button>
    </header>

    <main>
      <section className="hero" id="top" style={{ '--accent': world.color } as CSSProperties}>
        <div className="hero-copy">
          <p className="eyebrow"><span>✦</span>{content.hero.eyebrow}</p>
          <h1><span>{content.hero.titleLead}</span><em>{content.hero.titleAccent}</em></h1>
          <p className="hero-body">{content.hero.body}</p>
          <a className="pill-link" href="#manifesto">{content.hero.cta}<span>↘</span></a>
        </div>

        <div className="scene-shell">
          <Scene world={world} spinning={spinning} />
          <div className="scene-corners" aria-hidden="true"><i /><i /><i /><i /></div>
          <p className="scene-hint"><span>↔</span>{content.hero.sceneHint}</p>
          <div className="scene-data"><span>{content.hero.specimenLabel} — {String(activeWorld + 1).padStart(2, '0')}</span><span>{content.hero.fpsLabel} ●</span></div>
          <button className="motion-toggle" type="button" onClick={() => setSpinning(!spinning)} aria-label={spinning ? content.hero.pauseLabel : content.hero.playLabel}>{spinning ? 'Ⅱ' : '▶'}</button>
        </div>

        <div className="world-panel">
          <p>{content.hero.modeLabel}</p>
          <div className="world-list">
            {content.worlds.map((item, index) => <button type="button" key={item.name} className={activeWorld === index ? 'active' : ''} aria-pressed={activeWorld === index} onClick={() => selectWorld(index)}>
              <span>{String(index + 1).padStart(2, '0')}</span><strong>{item.name}</strong><i style={{ background: item.color }} />
            </button>)}
          </div>
          <p className="world-description" aria-live="polite">{world.description}</p>
        </div>

        <p className="edition">{content.hero.edition}</p>
        <a className="scroll-cue" href="#manifesto"><i />{content.hero.scrollLabel}</a>
      </section>

      <section className="manifesto" id={content.manifesto.id}>
        <div className="section-label"><span>{content.manifesto.index}</span><p>{content.manifesto.eyebrow}</p></div>
        <div className="manifesto-grid">
          <h2>{content.manifesto.title}</h2>
          <div><p>{content.manifesto.body}</p><div className="stat"><strong>{content.manifesto.stat}</strong><span>{content.manifesto.statLabel}</span></div></div>
        </div>
        <div className="marquee" aria-label={content.manifesto.marquee.join(', ')}><div>{[...content.manifesto.marquee, ...content.manifesto.marquee].map((item, index) => <span key={`${item}-${index}`}>{item}<i>✦</i></span>)}</div></div>
      </section>

      <section className="experiments" id={content.work.id}>
        <div className="section-label light"><span>{content.work.index}</span><p>{content.work.eyebrow}</p></div>
        <div className="section-title"><h2>{content.work.title}</h2><span>{content.work.countLabel}</span></div>
        <div className="experiment-grid">
          {content.work.items.map((item, index) => <article key={item.number} className={`experiment-card card-${index + 1}`}>
            <button type="button" onClick={() => selectWorld(item.world, true)} aria-label={`${content.work.openLabel}: ${item.name}`}>
              <div className="mini-world" aria-hidden="true"><div><i /><i /><i /></div></div>
              <span className="card-number">{item.number}</span>
              <div className="card-copy"><h3>{item.name}</h3><p>{item.category}</p></div>
              <div className="card-foot"><span>{item.year}</span><i>↗</i></div>
            </button>
          </article>)}
        </div>
      </section>

      <section className="process" id={content.process.id}>
        <div className="section-label"><span>{content.process.index}</span><p>{content.process.eyebrow}</p></div>
        <div className="process-intro"><h2>{content.process.title}</h2><div className="orbit-mark" aria-hidden="true"><i /><span>A</span></div></div>
        <div className="process-list">
          {content.process.items.map((item) => <article key={item.number}><span>{item.number}</span><h3>{item.name}</h3><p>{item.body}</p><i>↘</i></article>)}
        </div>
      </section>

      <section className="contact" id={content.contact.id}>
        <div className="section-label light"><span>{content.contact.index}</span><p>{content.contact.eyebrow}</p></div>
        <div className="contact-grid">
          <div><h2>{content.contact.title}</h2><p>{content.contact.body}</p></div>
          <form onSubmit={submit} noValidate>
            <label htmlFor="dimension-email">{content.contact.emailLabel}</label>
            <div><input id="dimension-email" type="email" value={email} placeholder={content.contact.emailPlaceholder} onChange={(event) => setEmail(event.target.value)} /><button type="submit">{content.contact.submitLabel}<span>↗</span></button></div>
            <p aria-live="polite">{message}</p>
          </form>
        </div>
        <div className="direct"><span>{content.contact.directLabel}</span><a href={`mailto:${content.contact.email}`}>{content.contact.email} ↗</a></div>
      </section>
    </main>

    <footer><span>{content.footer.copyright}</span><span>{content.footer.note}</span><a href="#top">{content.footer.top}</a></footer>
  </>;
}

export default App;
