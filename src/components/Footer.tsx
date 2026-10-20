import { useLang } from '../i18n';
import { External, LanguageSwitch, Logo } from './ui';

export default function Footer() {
  const { c } = useLang();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Logo />
            {/* Concept-only: keeps the concept from being mistaken for the official site. */}
            <p className="site-footer__notice">
              {c.ui.conceptNotice}{' '}
              <External href={c.links.home} icon={false}>
                careers.un.org
              </External>
            </p>
            <ul className="social">
              {c.footer.social.map((s) => (
                <li key={s.name}>
                  <External href={s.href}>{s.name}</External>
                </li>
              ))}
            </ul>
            <LanguageSwitch className="site-footer__lang" />
          </div>
          <nav className="site-footer__col" aria-label="Footer">
            <ul>
              <li>
                <External href={c.links.unHome} icon={false}>
                  {c.footer.welcome}
                </External>
              </li>
              {c.nav.map((n) => (
                <li key={n.href}>
                  <External href={n.href} icon={false}>
                    {n.label}
                  </External>
                </li>
              ))}
              <li>
                <External href={c.links.contact} icon={false}>
                  {c.footer.contactUs}
                </External>
              </li>
            </ul>
          </nav>
        </div>
        <div className="site-footer__bottom">
          <ul className="site-footer__legal">
            {c.footer.legal.map((l) => (
              <li key={l.label}>
                <External href={l.href} icon={false}>
                  {l.label}
                </External>
              </li>
            ))}
          </ul>
          <p>
            <a href="/CREDITS.md">{c.ui.credits}</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
