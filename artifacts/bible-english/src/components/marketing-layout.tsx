/**
 * MarketingLayout — sticky topnav + footer for the landing page and
 * supporting pages (Privacy, Terms, Support). Replaces the old sidebar
 * Layout now that the in-browser reading app has been removed.
 */
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { Show } from '@clerk/react';
import { useLanguage } from '../context/language-context';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

const NAV_LINKS = [
  { label: { en: 'Features',     pt: 'Recursos' },   href: '/#features' },
  { label: { en: 'How It Works', pt: 'Como Funciona' }, href: '/#how-it-works' },
  { label: { en: 'Pricing',      pt: 'Planos' },      href: '/pricing' },
  { label: { en: 'FAQ',          pt: 'Dúvidas' },     href: '/#faq' },
];

function AppStoreBadge({ store }: { store: 'ios' | 'android' }) {
  if (store === 'ios') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-foreground text-background rounded-lg text-xs font-semibold leading-none">
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
        App Store
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-foreground text-background rounded-lg text-xs font-semibold leading-none">
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.35.19.76.2 1.12.02l11.83-6.8-2.64-2.64L3.18 23.76zm16.24-9.9L16.5 12l2.95-1.88-2.9-1.66-1.9 1.1L3.18.24C2.82.06 2.41.07 2.06.26.73.98.73 2.68.73 2.68v18.64s0 1.7 1.33 2.42l11.31-9.88zm-4.56-8.64L3.06.44 14.86 7.22l.6 1.1-1.9 1.09 2.9 1.66 2.9-1.66z"/></svg>
      Google Play
    </span>
  );
}

export function DownloadButtons({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const downloadHref = `${basePath}/#download`;
  return (
    <div className="flex flex-wrap gap-3">
      <a href={downloadHref} className={`no-underline hover:opacity-80 transition-opacity ${size === 'md' ? 'scale-110 origin-left' : ''}`}>
        <AppStoreBadge store="ios" />
      </a>
      <a href={downloadHref} className={`no-underline hover:opacity-80 transition-opacity ${size === 'md' ? 'scale-110 origin-left' : ''}`}>
        <AppStoreBadge store="android" />
      </a>
    </div>
  );
}

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { lang, setLang } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const t = (obj: { en: string; pt: string }) => obj[lang] ?? obj.en;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ── Topnav ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex flex-col no-underline shrink-0 group">
            <span className="font-serif text-xl text-primary font-medium tracking-tight group-hover:text-primary/80 transition-colors leading-tight">
              BreadLight
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none hidden sm:block">
              {lang === 'pt' ? 'Aprenda Inglês' : 'Learn English'}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV_LINKS.map(link => {
              const isAnchor = link.href.startsWith('/#');
              const anchorId = isAnchor ? link.href.slice(2) : '';
              const resolvedHref = isAnchor ? `${basePath}/#${anchorId}` : link.href;
              return (
                <a
                  key={link.href}
                  href={resolvedHref}
                  onClick={e => {
                    if (isAnchor) {
                      const el = document.getElementById(anchorId);
                      if (el) {
                        e.preventDefault();
                        el.scrollIntoView({ behavior: 'smooth' });
                      }
                      // else: let the browser navigate to basePath/#id naturally
                    }
                  }}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors no-underline rounded-md hover:bg-muted"
                >
                  {t(link.label)}
                </a>
              );
            })}
          </nav>

          <div className="flex-1" />

          {/* Auth + Download */}
          <div className="hidden md:flex items-center gap-3">
            <Show when="signed-in">
              <Link
                href="/pricing"
                className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors no-underline rounded-md hover:bg-muted"
              >
                {lang === 'pt' ? 'Minha Conta' : 'My Account'}
              </Link>
            </Show>
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors no-underline rounded-md hover:bg-muted"
              >
                {lang === 'pt' ? 'Entrar' : 'Sign In'}
              </Link>
            </Show>
            <a
              href={`${basePath}/#download`}
              className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors no-underline"
            >
              {lang === 'pt' ? 'Baixar App' : 'Download App'}
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-background/98 backdrop-blur-md border-b border-border px-6 pb-5 pt-2 space-y-1">
            {NAV_LINKS.map(link => {
              const isAnchor = link.href.startsWith('/#');
              const anchorId = isAnchor ? link.href.slice(2) : '';
              const resolvedHref = isAnchor ? `${basePath}/#${anchorId}` : link.href;
              return (
                <a
                  key={link.href}
                  href={resolvedHref}
                  onClick={e => {
                    setMobileOpen(false);
                    if (isAnchor) {
                      const el = document.getElementById(anchorId);
                      if (el) {
                        e.preventDefault();
                        el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                  className="block px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-md no-underline transition-colors"
                >
                  {t(link.label)}
                </a>
              );
            })}
            <div className="pt-3 flex flex-col gap-2 border-t border-border mt-2">
              <Show when="signed-out">
                <Link href="/sign-in" className="block px-3 py-2.5 text-sm font-medium text-muted-foreground no-underline">
                  {lang === 'pt' ? 'Entrar' : 'Sign In'}
                </Link>
              </Show>
              <a href={`${basePath}/#download`} className="block px-4 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg text-center no-underline hover:bg-primary/90 transition-colors">
                {lang === 'pt' ? 'Baixar Grátis' : 'Download Free'}
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 pt-16">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card/60 mt-24">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <p className="font-serif text-2xl text-primary mb-1">BreadLight</p>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs leading-relaxed">
              {lang === 'pt'
                ? 'Leia a Bíblia em inglês. Aprenda cada palavra. Construa fluência real.'
                : 'Read the Bible in English. Learn every word. Build real fluency.'}
            </p>
            <DownloadButtons />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              {lang === 'pt' ? 'Produto' : 'Product'}
            </p>
            <ul className="space-y-2.5">
              <li>
                <a href={`${basePath}/#features`} className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">
                  {lang === 'pt' ? 'Recursos' : 'Features'}
                </a>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">
                  {lang === 'pt' ? 'Planos' : 'Pricing'}
                </Link>
              </li>
              <li>
                <a href={`${basePath}/#faq`} className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">
                  {lang === 'pt' ? 'Dúvidas' : 'FAQ'}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              {lang === 'pt' ? 'Legal & Suporte' : 'Legal & Support'}
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">
                  {lang === 'pt' ? 'Privacidade' : 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">
                  {lang === 'pt' ? 'Termos de Uso' : 'Terms of Service'}
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">
                  {lang === 'pt' ? 'Suporte' : 'Support'}
                </Link>
              </li>
              <li>
                <a href="mailto:hello@breadlight.app" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">
                  {lang === 'pt' ? 'Contato' : 'Contact'}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BreadLight. {lang === 'pt' ? 'Todos os direitos reservados.' : 'All rights reserved.'}
          </p>
          <div className="flex items-center gap-4">
            {(['pt', 'en'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-xs transition-colors ${lang === l ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {l === 'pt' ? 'Português' : 'English'}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
