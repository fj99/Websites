import { FormEvent, useEffect, useState } from 'react';
import { content } from './content';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [annual, setAnnual] = useState(true);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { document.title = content.meta.title; }, []);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setMessage(!email ? content.cta.required : !/^\S+@\S+\.\S+$/.test(email) ? content.cta.invalid : content.cta.success);
  };
  return <>
    <header className="site-header"><a className="brand" href="#top" aria-label={content.brand.homeLabel}><span>{content.brand.mark}</span>{content.brand.name}</a>
      <button className="menu" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={content.navigation.menuLabel}><i/><i/></button>
      <nav className={menuOpen ? 'open' : ''}>{content.navigation.items.map(item => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}<a className="login" href="#cta">{content.navigation.login}</a><a className="button small" href="#cta">{content.navigation.cta}</a></nav>
    </header>
    <main id="top">
      <section className="hero"><div className="aurora"/><div className="hero-copy"><p className="eyebrow"><span/> {content.hero.eyebrow}</p><h1>{content.hero.title}</h1><p className="lede">{content.hero.body}</p><div className="actions"><a className="button" href="#cta">{content.hero.primary}</a><a className="text-link" href="#product">{content.hero.secondary} <b>↗</b></a></div><small>{content.hero.proof}</small></div>
        <div className="dashboard-wrap" aria-label={content.hero.previewLabel}><div className="dashboard"><div className="dash-top"><div><i/><i/><i/></div><span>{content.dashboard.label}</span><b>{content.dashboard.period}</b></div><div className="dash-body"><aside><span className="active">◫</span><span>⌁</span><span>◌</span><span>◇</span></aside><div className="dash-main"><p>{content.dashboard.metric}</p><div className="metric"><strong>{content.dashboard.value}</strong><em>{content.dashboard.change}</em></div><div className="chart" role="img" aria-label={content.dashboard.chartLabel}><svg viewBox="0 0 600 160" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9b7cff" stopOpacity=".45"/><stop offset="1" stopColor="#9b7cff" stopOpacity="0"/></linearGradient></defs><path d="M0 140 C80 135,90 85,160 105 S250 125,300 75 S390 65,430 80 S510 25,600 15 L600 160 L0 160Z" fill="url(#fill)"/><path d="M0 140 C80 135,90 85,160 105 S250 125,300 75 S390 65,430 80 S510 25,600 15" fill="none" stroke="#a98cff" strokeWidth="4"/></svg></div><div className="task-list">{content.dashboard.tasks.map(task => <div className="task" key={task.name}><span>{task.name}<small>{task.status}</small></span><div><i style={{width:task.progress}}/></div><b>{task.progress}</b></div>)}</div></div></div></div></div>
      </section>
      <section className="logos" aria-label={content.logos.label}><p>{content.logos.label}</p><div>{content.logos.items.map(logo => <span key={logo}>{logo}</span>)}</div></section>
      <section className="features section" id={content.features.id}><p className="eyebrow">{content.features.eyebrow}</p><h2>{content.features.title}</h2><div className="bento">{content.features.items.map(item => <article className={`feature ${item.accent}`} key={item.number}><span>{item.number}</span><div className="orb"/><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></section>
      <section className="solutions section" id={content.solutions.id}><div className="solution-copy"><p className="eyebrow">{content.solutions.eyebrow}</p><h2>{content.solutions.title}</h2><p>{content.solutions.body}</p><div className="stats">{content.solutions.stats.map(stat => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div></div><blockquote>“{content.solutions.quote}”<footer><b>{content.solutions.author}</b><span>{content.solutions.role}</span></footer></blockquote></section>
      <section className="pricing section" id={content.pricing.id}><p className="eyebrow">{content.pricing.eyebrow}</p><h2>{content.pricing.title}</h2><div className="billing"><button className={!annual ? 'active' : ''} onClick={() => setAnnual(false)}>{content.pricing.monthly}</button><button className={annual ? 'active' : ''} onClick={() => setAnnual(true)}>{content.pricing.annual} <span>{content.pricing.save}</span></button></div><div className="plans">{content.pricing.plans.map(plan => <article className={plan.featured ? 'plan featured' : 'plan'} key={plan.name}>{plan.badge && <em>{plan.badge}</em>}<h3>{plan.name}</h3><p>{plan.description}</p><div className="price"><sup>{content.pricing.currency}</sup><strong>{annual ? plan.annual : plan.monthly}</strong><span>{annual ? content.pricing.periodAnnual : content.pricing.periodMonthly}</span></div><ul>{plan.features.map(feature => <li key={feature}>✓ {feature}</li>)}</ul><a className="button" href="#cta">{plan.cta}</a></article>)}</div></section>
      <section className="cta" id="cta"><div><p className="eyebrow">{content.brand.name}</p><h2>{content.cta.title}</h2><p>{content.cta.body}</p></div><form onSubmit={submit} noValidate><label htmlFor="saas-email">{content.cta.fieldLabel}</label><div><input id="saas-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={content.cta.placeholder}/><button className="button">{content.cta.button}</button></div><p className={message === content.cta.success ? 'success' : 'form-message'} aria-live="polite">{message || content.cta.privacy}</p></form></section>
    </main>
    <footer className="footer"><a className="brand" href="#top"><span>{content.brand.mark}</span>{content.brand.name}</a><p>{content.footer.tagline}</p><div>{content.footer.links.map(link => <a href={link.href} key={link.label}>{link.label}</a>)}</div><small>{content.footer.copyright}</small></footer>
  </>;
}
