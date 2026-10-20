import { Component, useEffect, useRef, type ReactNode, type AnchorHTMLAttributes } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { useLang } from '../i18n';

type ExternalProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; icon?: boolean };

/** Link that leaves the concept site. Opens in a new tab and says where it goes. */
export function External({ href, children, icon = true, ...rest }: ExternalProps) {
  const { c } = useLang();
  let host = '';
  try {
    host = new URL(href).hostname.replace(/^www\./, '');
  } catch {
    /* relative URL */
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
      {icon && <ArrowUpRight className="ext-icon" aria-hidden="true" size={16} strokeWidth={2} />}
      <span className="sr-only"> {c.ui.opensInNewTab(host || href)}</span>
    </a>
  );
}

/** Static Earth image used when WebGL is unavailable or a 3D scene fails. */
export function StaticEarth({ className = '' }: { className?: string }) {
  return (
    <div className={`static-earth ${className}`}>
      <img src="/images/blue-marble-1280.webp" alt="" decoding="async" />
    </div>
  );
}

type BoundaryProps = { fallback: ReactNode; children: ReactNode };

export class SceneBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn('3D scene unavailable, showing static fallback.', error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Official UN logo (reverse/white version from careers.un.org, used unmodified) with the
 * "Careers" descriptor set beside it as in the official lockup, plus the concept tag.
 */
export function Logo() {
  const { c } = useLang();
  return (
    <a className="wordmark" href="#top" aria-label={c.brand.label}>
      <img className="wordmark__logo" src={c.brand.logo} alt="" width={118} height={36} />
      <span className="wordmark__divider" aria-hidden="true" />
      <span className="wordmark__text" aria-hidden="true">
        {c.brand.descriptor}
      </span>
      <span className="wordmark__tag" aria-hidden="true">
        {c.ui.concept}
      </span>
    </a>
  );
}

/** English / Français switch, as on careers.un.org. */
export function LanguageSwitch({ className = '' }: { className?: string }) {
  const { lang, setLang, c } = useLang();
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label="Language / Langue">
      {(Object.keys(c.ui.languages) as (keyof typeof c.ui.languages)[]).map((l) => (
        <button key={l} type="button" lang={l} aria-pressed={lang === l} onClick={() => setLang(l)}>
          {c.ui.languages[l]}
        </button>
      ))}
    </div>
  );
}

/** Modal dialog built on the native <dialog> element (focus trapping and Escape come for free). */
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const { c } = useLang();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="dialog-title"
      onClose={onClose}
      onClick={(e) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog__inner">
        <header className="dialog__head">
          <h2 id="dialog-title">{title}</h2>
          <button className="dialog__close" type="button" onClick={onClose} aria-label={c.ui.close}>
            <X aria-hidden="true" size={22} />
          </button>
        </header>
        <div className="dialog__body">{children}</div>
      </div>
    </dialog>
  );
}
