import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLang } from '../i18n';
import { External, LanguageSwitch, Logo } from './ui';

export default function Header() {
  const { c } = useLang();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add('menu-open');
    panel.current?.querySelector<HTMLElement>('a, button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
      // Keep keyboard focus inside the open menu.
      if (e.key === 'Tab' && panel.current) {
        const items = [toggle.current!, ...panel.current.querySelectorAll<HTMLElement>('a, button')];
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('menu-open');
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className={`site-header ${solid || open ? 'is-solid' : ''}`}>
      <a className="skip-link" href="#main">
        {c.ui.skip}
      </a>
      <div className="site-header__inner">
        <Logo />

        <nav className="site-nav" aria-label="Primary">
          <ul>
            {c.nav.map((n) => (
              <li key={n.href}>
                <External href={n.href} icon={false}>
                  {n.label}
                </External>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <LanguageSwitch className="hide-sm" />
          <External className="btn btn--primary btn--sm hide-sm" href={c.links.jobs} icon={false}>
            {c.ui.applyNow}
          </External>
          <button
            ref={toggle}
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            <span className="sr-only">{c.ui.menu}</span>
          </button>
        </div>
      </div>

      <div id="mobile-menu" ref={panel} className="mobile-menu" hidden={!open}>
        <nav aria-label="Mobile">
          <ul>
            {c.nav.map((n) => (
              <li key={n.href}>
                <External href={n.href} icon={false} onClick={() => setOpen(false)}>
                  {n.label}
                </External>
              </li>
            ))}
          </ul>
          <div className="mobile-menu__actions">
            <External className="btn btn--primary" href={c.links.jobs}>
              {c.ui.applyNow}
            </External>
            <LanguageSwitch />
          </div>
        </nav>
      </div>
    </header>
  );
}
