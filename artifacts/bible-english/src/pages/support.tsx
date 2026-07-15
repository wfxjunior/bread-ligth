import { useState } from 'react';
import { Mail, MessageSquare, BookOpen, ExternalLink } from 'lucide-react';
import { MarketingLayout } from '../components/marketing-layout';
import { useLanguage } from '../context/language-context';

export default function SupportPage() {
  const { lang } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const text = {
    title:       { en: 'Support',           pt: 'Suporte' },
    subtitle:    { en: 'We\'re here to help. Reach out anytime and we\'ll respond within one business day.', pt: 'Estamos aqui para ajudar. Entre em contato a qualquer momento e responderemos em até um dia útil.' },
    email_cta:   { en: 'Email us directly', pt: 'Envie-nos um email' },
    email_desc:  { en: 'For billing, account, or urgent issues:', pt: 'Para cobrança, conta ou problemas urgentes:' },
    faq_cta:     { en: 'Browse the FAQ',    pt: 'Consultar as Dúvidas' },
    faq_desc:    { en: 'Quick answers to the most common questions.', pt: 'Respostas rápidas para as perguntas mais comuns.' },
    form_title:  { en: 'Send us a message', pt: 'Envie-nos uma mensagem' },
    name_label:  { en: 'Your name',         pt: 'Seu nome' },
    email_label: { en: 'Your email',        pt: 'Seu email' },
    msg_label:   { en: 'Message',           pt: 'Mensagem' },
    msg_ph:      { en: 'Describe your issue or question…', pt: 'Descreva seu problema ou pergunta…' },
    send:        { en: 'Send message',      pt: 'Enviar mensagem' },
    thanks:      { en: 'Thanks! We\'ll get back to you within one business day.', pt: 'Obrigado! Responderemos em até um dia útil.' },
  };
  const t = (k: keyof typeof text) => text[k][lang];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production, wire to a form submission service (e.g. Formspree, Resend)
    setSubmitted(true);
  }

  return (
    <MarketingLayout>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl text-primary mb-3">{t('title')}</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">{t('subtitle')}</p>
        </div>

        {/* Quick options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
          <a
            href="mailto:support@breadlight.app"
            className="flex items-start gap-4 bg-card border border-border rounded-2xl p-6 no-underline hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/12 transition-colors">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">{t('email_cta')}</p>
              <p className="text-sm text-muted-foreground mb-2">{t('email_desc')}</p>
              <span className="text-sm text-primary font-medium inline-flex items-center gap-1">
                support@breadlight.app <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </a>

          <a
            href="/#faq"
            className="flex items-start gap-4 bg-card border border-border rounded-2xl p-6 no-underline hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/12 transition-colors">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">{t('faq_cta')}</p>
              <p className="text-sm text-muted-foreground">{t('faq_desc')}</p>
            </div>
          </a>
        </div>

        {/* Contact form */}
        <div className="max-w-xl mx-auto bg-card border border-border rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-serif text-xl text-foreground">{t('form_title')}</h2>
          </div>

          {submitted ? (
            <div className="bg-secondary/10 border border-secondary/20 rounded-xl px-5 py-4 text-sm text-secondary font-medium">
              {t('thanks')}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{t('name_label')}</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{t('email_label')}</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{t('msg_label')}</label>
                <textarea
                  rows={5}
                  required
                  placeholder={t('msg_ph')}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors resize-none placeholder:text-muted-foreground/60"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                {t('send')}
              </button>
            </form>
          )}
        </div>
      </div>
    </MarketingLayout>
  );
}
