/**
 * Landing page — replaces the in-browser reading app as the site root (/).
 * All calls-to-action drive toward downloading the mobile app or viewing pricing.
 * No mock data, no study features — purely marketing and informational.
 */
import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  BookOpen, Headphones, Brain, Calendar, Feather, Palette,
  ChevronDown, Check, Crown, Smartphone, Star,
} from 'lucide-react';
import { MarketingLayout, DownloadButtons } from '../components/marketing-layout';
import { useLanguage } from '../context/language-context';
import { useBillingPlan } from '../hooks/use-billing';

// ── Animations ────────────────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
};

// ── Phone Mockup ──────────────────────────────────────────────────────────────
function PhoneMockup({ screen }: { screen: 'reader' | 'vocab' | 'devotional' }) {
  return (
    <div
      className="relative mx-auto w-[200px] shrink-0"
      style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.12))' }}
    >
      {/* Phone shell */}
      <div className="relative rounded-[2.5rem] border-[4px] border-foreground/10 bg-card overflow-hidden" style={{ height: 380 }}>
        {/* Status bar */}
        <div className="h-8 bg-muted/60 flex items-center justify-between px-5">
          <span className="text-[9px] font-semibold text-muted-foreground">9:41</span>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-1 bg-muted-foreground/60 rounded-full" style={{ height: 6 + i * 2 }} />
            ))}
          </div>
        </div>

        {/* Screen content */}
        {screen === 'reader' && <ReaderScreen />}
        {screen === 'vocab' && <VocabScreen />}
        {screen === 'devotional' && <DevotionalScreen />}
      </div>
    </div>
  );
}

function ReaderScreen() {
  return (
    <div className="px-4 py-3 flex flex-col gap-2 h-full bg-background">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60">John 3</span>
        <div className="flex gap-1">
          {['EN', 'PT'].map(l => (
            <span key={l} className="text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">{l}</span>
          ))}
        </div>
      </div>
      {[
        { num: 16, en: 'For God so loved the world, that he gave his only begotten Son…', pt: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito…' },
        { num: 17, en: 'For God sent not his Son into the world to condemn the world…', pt: 'Porque Deus enviou o seu Filho ao mundo, não para condenar o mundo…' },
      ].map(v => (
        <div key={v.num} className="border-b border-border/40 pb-2 last:border-0">
          <span className="text-[8px] text-muted-foreground font-mono">{v.num}</span>
          <p className="text-[10px] font-serif text-foreground leading-snug mt-0.5">{v.en}</p>
          <p className="text-[9px] text-muted-foreground leading-snug mt-0.5">{v.pt}</p>
        </div>
      ))}
      <div className="mt-auto pt-2 border-t border-border/30 flex items-center justify-between">
        <span className="text-[8px] text-muted-foreground">Tap any word</span>
        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-2.5 h-2.5 text-primary" />
        </div>
      </div>
    </div>
  );
}

function VocabScreen() {
  const words = [
    { word: 'begotten', pt: 'unigênito', level: 'New' },
    { word: 'condemn', pt: 'condenar', level: 'Learning' },
    { word: 'eternal',  pt: 'eterno',   level: 'Mastered' },
  ];
  return (
    <div className="px-4 py-3 bg-background h-full flex flex-col">
      <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-3">Vocabulary</p>
      <div className="flex gap-3 mb-3">
        {[{ l: '12', s: 'Words' }, { l: '5', s: 'Mastered' }, { l: '4', s: 'New' }].map(s => (
          <div key={s.s} className="flex-1 bg-card border border-border rounded-lg p-2 text-center">
            <p className="font-serif text-sm text-primary">{s.l}</p>
            <p className="text-[8px] text-muted-foreground mt-0.5">{s.s}</p>
          </div>
        ))}
      </div>
      <div className="space-y-1.5 flex-1">
        {words.map(w => (
          <div key={w.word} className="flex items-center gap-2 bg-card border border-border/60 rounded-lg px-2.5 py-2">
            <div className="flex-1">
              <p className="text-[10px] font-serif text-foreground">{w.word}</p>
              <p className="text-[9px] text-muted-foreground">{w.pt}</p>
            </div>
            <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${w.level === 'Mastered' ? 'bg-primary/10 text-primary' : w.level === 'Learning' ? 'bg-secondary/10 text-secondary' : 'bg-muted text-muted-foreground'}`}>
              {w.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DevotionalScreen() {
  return (
    <div className="px-4 py-3 bg-background h-full flex flex-col">
      <p className="text-[9px] font-bold uppercase tracking-widest text-secondary/70 mb-2">Today's Devotional</p>
      <div className="bg-card border border-border/60 rounded-xl p-3 mb-3">
        <p className="text-[9px] font-bold text-primary mb-1">Psalms 23:1</p>
        <p className="text-[10px] font-serif text-foreground leading-snug">
          "The Lord is my shepherd; I shall not want."
        </p>
        <p className="text-[9px] text-muted-foreground mt-1 leading-snug">
          O Senhor é o meu pastor; nada me faltará.
        </p>
      </div>
      <div className="space-y-1.5 flex-1">
        {[{ ref: 'John 1:1', done: true }, { ref: 'Romans 8:28', done: true }, { ref: 'John 3:16', done: false }].map(v => (
          <div key={v.ref} className="flex items-center gap-2 py-1 border-b border-border/30 last:border-0">
            <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center shrink-0 ${v.done ? 'bg-secondary border-secondary' : 'border-border'}`}>
              {v.done && <Check className="w-2 h-2 text-white" />}
            </div>
            <span className={`text-[9px] font-medium ${v.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{v.ref}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection({ lang }: { lang: 'pt' | 'en' }) {
  const text = {
    eyebrow:  { en: 'Free on iOS & Android',                   pt: 'Gratuito no iOS e Android' },
    h1a:      { en: 'Learn English',                           pt: 'Aprenda Inglês' },
    h1b:      { en: 'Through the Bible.',                      pt: 'Através da Bíblia.' },
    sub:      { en: 'Read the Bible in English, understand every word in Portuguese, and build real fluency — one verse at a time.',
                pt: 'Leia a Bíblia em inglês, entenda cada palavra em português, e construa fluência real — um versículo de cada vez.' },
    dl:       { en: 'Download free',                           pt: 'Baixar grátis' },
    sub2:     { en: 'No credit card required. Free forever.',  pt: 'Sem cartão de crédito. Gratuito para sempre.' },
  };
  const t = (k: keyof typeof text) => text[k][lang];

  return (
    <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-28">
      {/* Subtle radial gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, hsl(var(--primary)/0.07), transparent)' }} />

      <div className="relative max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
        {/* Text */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div {...fadeUp} transition={{ duration: 0.55, ease: [0.22,1,0.36,1] }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold uppercase tracking-widest mb-6">
              <Smartphone className="w-3 h-3" /> {t('eyebrow')}
            </span>
          </motion.div>

          <motion.h1
            className="font-serif text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.05] tracking-tight mb-6"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22,1,0.36,1], delay: 0.05 }}
          >
            {t('h1a')}<br />
            <span className="text-primary">{t('h1b')}</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22,1,0.36,1], delay: 0.12 }}
          >
            {t('sub')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22,1,0.36,1], delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center lg:items-start gap-4"
          >
            <DownloadButtons size="md" />
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors no-underline self-center"
            >
              {lang === 'pt' ? 'Ver planos Premium →' : 'View Premium plans →'}
            </Link>
          </motion.div>

          <motion.p
            className="mt-5 text-xs text-muted-foreground/70 lg:text-left text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            {t('sub2')}
          </motion.p>
        </div>

        {/* Phone mockup */}
        <motion.div
          className="shrink-0"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.22,1,0.36,1], delay: 0.15 }}
        >
          <PhoneMockup screen="reader" />
        </motion.div>
      </div>
    </section>
  );
}

// ── Social Proof Strip ────────────────────────────────────────────────────────
function SocialProofStrip({ lang }: { lang: 'pt' | 'en' }) {
  return (
    <div className="border-y border-border bg-muted/30 py-5">
      <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
        {[
          { n: '66', label: lang === 'pt' ? 'Livros da Bíblia' : 'Books of the Bible' },
          { n: '31,000+', label: lang === 'pt' ? 'Versículos disponíveis' : 'Verses available' },
          { n: '10', label: lang === 'pt' ? 'Atmosferas de leitura' : 'Reading atmospheres' },
          { n: '100%', label: lang === 'pt' ? 'Gratuito para começar' : 'Free to get started' },
        ].map(s => (
          <div key={s.n} className="flex flex-col items-center">
            <span className="font-serif text-2xl text-primary">{s.n}</span>
            <span className="text-xs text-muted-foreground mt-0.5">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: BookOpen,
    key: 'bilingual',
    en: { title: 'Bilingual Reading', desc: 'Every verse shown in English and Portuguese side by side — so you always understand what you\'re reading, even as you learn.' },
    pt: { title: 'Leitura Bilíngue', desc: 'Cada versículo em inglês e português lado a lado — para você sempre entender o que lê, mesmo enquanto aprende.' },
  },
  {
    icon: Headphones,
    key: 'audio',
    en: { title: 'Audio Pronunciation', desc: 'Hear every verse read aloud in clear, natural English. Perfect your pronunciation by listening to the text you\'re studying.' },
    pt: { title: 'Pronúncia em Áudio', desc: 'Ouça cada versículo em inglês natural e claro. Melhore sua pronúncia ouvindo o texto que está estudando.' },
  },
  {
    icon: Brain,
    key: 'vocab',
    en: { title: 'Vocabulary Builder', desc: 'Tap any word for an instant translation and grammar note. Save it to your personal vocabulary list and track your mastery over time.' },
    pt: { title: 'Construtor de Vocabulário', desc: 'Toque em qualquer palavra para ver tradução e nota gramatical. Salve na sua lista e acompanhe seu domínio ao longo do tempo.' },
  },
  {
    icon: Calendar,
    key: 'devotionals',
    en: { title: 'Daily Devotionals', desc: 'Follow guided study plans with curated passages. Build a daily reading habit that keeps you consistent and moving forward.' },
    pt: { title: 'Devocionais Diários', desc: 'Siga planos de estudo com passagens selecionadas. Construa um hábito diário de leitura que mantém você consistente.' },
  },
  {
    icon: Feather,
    key: 'notes',
    en: { title: 'Study Notes', desc: 'Capture your thoughts and reflections as you read. Every note is linked to a verse so you can always find it again.' },
    pt: { title: 'Anotações de Estudo', desc: 'Registre seus pensamentos enquanto lê. Cada anotação fica vinculada a um versículo para fácil consulta posterior.' },
  },
  {
    icon: Palette,
    key: 'atmospheres',
    en: { title: 'Reading Atmospheres', desc: '10 beautiful themes — from warm parchment to midnight — to create the perfect reading environment for any moment.' },
    pt: { title: 'Atmosferas de Leitura', desc: '10 temas belos — do pergaminho quente ao meia-noite — para criar o ambiente perfeito de leitura para cada momento.' },
  },
];

function FeaturesSection({ lang }: { lang: 'pt' | 'en' }) {
  return (
    <section id="features" className="py-20 md:py-28 max-w-6xl mx-auto px-6">
      <motion.div {...fadeUp} className="text-center mb-14">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-3">
          {lang === 'pt' ? 'O que você vai encontrar' : 'What you\'ll find inside'}
        </p>
        <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
          {lang === 'pt' ? 'Tudo para aprender inglês de verdade' : 'Everything to build real English fluency'}
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          {lang === 'pt'
            ? 'Ferramentas cuidadosamente construídas para cada etapa da sua jornada de aprendizado.'
            : 'Thoughtfully built tools for every step of your learning journey.'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          const copy = lang === 'pt' ? f.pt : f.en;
          return (
            <motion.div
              key={f.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease: [0.22,1,0.36,1], delay: i * 0.06 }}
              className="bg-card border border-border rounded-2xl p-7 hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary/12 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-xl text-foreground mb-2">{copy.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{copy.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ── How It Works ─────────────────────────────────────────────────────────────
function HowItWorksSection({ lang }: { lang: 'pt' | 'en' }) {
  const steps = lang === 'pt'
    ? [
        { n: '01', title: 'Baixe gratuitamente', desc: 'Disponível no iOS e Android. Nenhuma conta necessária para começar — abra e leia imediatamente.', icon: Smartphone },
        { n: '02', title: 'Escolha uma passagem', desc: 'Comece com João 1, siga um plano devocional, ou explore todos os 66 livros da Bíblia no seu ritmo.', icon: BookOpen },
        { n: '03', title: 'Aprenda enquanto lê', desc: 'Toque nas palavras para ver traduções, salve vocabulário, faça anotações — a fluência cresce a cada sessão.', icon: Brain },
      ]
    : [
        { n: '01', title: 'Download the free app', desc: 'Available on iOS and Android. No account needed to start — open and read immediately.', icon: Smartphone },
        { n: '02', title: 'Choose a passage', desc: 'Start with John 1, follow a devotional plan, or explore all 66 books of the Bible at your own pace.', icon: BookOpen },
        { n: '03', title: 'Learn as you read', desc: 'Tap words for translations, save vocabulary, write notes — fluency grows with every session.', icon: Brain },
      ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-card/40 border-y border-border">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div {...fadeUp} className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-3">
            {lang === 'pt' ? 'Como funciona' : 'How it works'}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">
            {lang === 'pt' ? 'Três passos para começar' : 'Three steps to get started'}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line on desktop */}
          <div className="hidden md:block absolute top-10 left-[16.67%] right-[16.67%] h-[1px] bg-border/70" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, ease: [0.22,1,0.36,1], delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative w-20 h-20 rounded-full bg-background border-2 border-border flex items-center justify-center mb-6 z-10">
                  <Icon className="w-8 h-8 text-primary" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-serif text-xl text-foreground mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Screenshots ───────────────────────────────────────────────────────────────
function ScreenshotsSection({ lang }: { lang: 'pt' | 'en' }) {
  const screens = [
    { key: 'reader'     as const, en: { title: 'Bilingual Reader', desc: 'Read any passage in English with Portuguese translation always visible beneath each verse.' }, pt: { title: 'Leitura Bilíngue', desc: 'Leia qualquer passagem em inglês com a tradução portuguesa sempre visível abaixo de cada versículo.' } },
    { key: 'vocab'      as const, en: { title: 'Vocabulary Tracker', desc: 'See every word you\'ve saved, track your mastery level, and review at any time.' }, pt: { title: 'Vocabulário', desc: 'Veja cada palavra salva, acompanhe seu nível de domínio e revise quando quiser.' } },
    { key: 'devotional' as const, en: { title: 'Daily Devotionals', desc: 'Follow curated plans, check off verses as you complete them, and build a lasting daily habit.' }, pt: { title: 'Devocionais Diários', desc: 'Siga planos selecionados, marque versículos concluídos, e construa um hábito diário duradouro.' } },
  ];

  return (
    <section className="py-20 md:py-28 max-w-6xl mx-auto px-6">
      <motion.div {...fadeUp} className="text-center mb-14">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-3">
          {lang === 'pt' ? 'O aplicativo' : 'The app'}
        </p>
        <h2 className="font-serif text-4xl md:text-5xl text-foreground">
          {lang === 'pt' ? 'Veja o BreadLight em ação' : 'See BreadLight in action'}
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
        {screens.map((s, i) => {
          const copy = lang === 'pt' ? s.pt : s.en;
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: [0.22,1,0.36,1], delay: i * 0.1 }}
              className="flex flex-col items-center text-center gap-5"
            >
              <PhoneMockup screen={s.key} />
              <div>
                <h3 className="font-serif text-xl text-foreground mb-2">{copy.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{copy.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: { en: '"I\'ve tried so many English apps, but BreadLight is the only one that makes me want to come back every day. Reading the Bible in English has been such a meaningful way to learn."', pt: '"Tentei tantos aplicativos de inglês, mas o BreadLight é o único que me faz voltar todo dia. Ler a Bíblia em inglês foi uma forma muito especial de aprender."' },
    name: 'Ana P.',
    note: { en: 'Early User · São Paulo', pt: 'Usuária inicial · São Paulo' },
  },
  {
    quote: { en: '"The bilingual mode is genius. I never feel lost because the Portuguese is always right there. My English vocabulary has grown so much just from John 1."', pt: '"O modo bilíngue é genial. Nunca me sinto perdida porque o português está sempre ali. Meu vocabulário em inglês cresceu muito só com João 1."' },
    name: 'Marcos L.',
    note: { en: 'Early User · Belo Horizonte', pt: 'Usuário inicial · Belo Horizonte' },
  },
  {
    quote: { en: '"Finally, an app that respects my faith and helps me learn. The reading atmospheres are beautiful, and the devotional plans keep me consistent."', pt: '"Finalmente um aplicativo que respeita minha fé e me ajuda a aprender. As atmosferas de leitura são lindas, e os planos devocionais me mantêm consistente."' },
    name: 'Juliana R.',
    note: { en: 'Early User · Curitiba', pt: 'Usuária inicial · Curitiba' },
  },
];

function TestimonialsSection({ lang }: { lang: 'pt' | 'en' }) {
  return (
    <section className="py-20 md:py-28 bg-primary/3 border-y border-primary/8">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div {...fadeUp} className="text-center mb-12">
          <div className="flex justify-center gap-0.5 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />)}
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">
            {lang === 'pt' ? 'Nossos primeiros leitores adoram' : 'Our early readers love it'}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease: [0.22,1,0.36,1], delay: i * 0.08 }}
              className="bg-card border border-border rounded-2xl p-7 relative"
            >
              <span className="absolute top-5 right-6 font-serif text-5xl text-primary/10 leading-none select-none">"</span>
              <p className="font-serif text-[1.05rem] leading-relaxed text-foreground mb-6 relative z-10">
                {lang === 'pt' ? t.quote.pt : t.quote.en}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif font-medium text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{lang === 'pt' ? t.note.pt : t.note.en}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing Teaser ────────────────────────────────────────────────────────────
function PricingTeaserSection({ lang }: { lang: 'pt' | 'en' }) {
  const { data: planData } = useBillingPlan();
  const monthlyPrice = planData?.prices?.find(p => p.interval === 'month');

  const freeFeatures = lang === 'pt'
    ? ['Leitura bilíngue completa', 'Vocabulário e anotações', 'Devocionais diários', 'Atmosfera padrão de leitura']
    : ['Full bilingual reading', 'Vocabulary & notes', 'Daily devotionals', 'Default reading atmosphere'];

  const premiumFeatures = lang === 'pt'
    ? ['Todas as 10 atmosferas de leitura', 'Todas as 5 cores de destaque', 'Acesso antecipado a novos recursos', 'Apoie o BreadLight para todos', 'Suporte prioritário']
    : ['All 10 reading atmospheres', 'All 5 accent colors', 'Early access to new features', 'Help keep BreadLight free for all', 'Priority support'];

  return (
    <section id="pricing" className="py-20 md:py-28 max-w-6xl mx-auto px-6">
      <motion.div {...fadeUp} className="text-center mb-14">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-3">
          {lang === 'pt' ? 'Planos' : 'Pricing'}
        </p>
        <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
          {lang === 'pt' ? 'Gratuito para aprender. Premium para ir além.' : 'Free to learn. Premium to go further.'}
        </h2>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          {lang === 'pt'
            ? 'Comece gratuitamente agora. Faça upgrade quando quiser para desbloquear tudo.'
            : 'Start free today. Upgrade whenever you want to unlock everything.'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
          className="bg-card border border-border rounded-2xl p-8"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            {lang === 'pt' ? 'Gratuito' : 'Free'}
          </p>
          <p className="font-serif text-4xl text-foreground mb-1">$0</p>
          <p className="text-sm text-muted-foreground mb-6">{lang === 'pt' ? 'Para sempre' : 'Forever'}</p>
          <ul className="space-y-3 mb-8">
            {freeFeatures.map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                <div className="w-4 h-4 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-muted-foreground" />
                </div>
                {f}
              </li>
            ))}
          </ul>
          <a href="#download" className="w-full block py-3 text-sm font-semibold text-center border border-border rounded-xl hover:bg-muted transition-colors no-underline text-foreground">
            {lang === 'pt' ? 'Baixar grátis' : 'Download free'}
          </a>
        </motion.div>

        {/* Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22,1,0.36,1], delay: 0.08 }}
          className="relative bg-card border-2 border-primary/30 rounded-2xl p-8 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Premium</p>
              <Crown className="w-3 h-3 text-primary" />
            </div>
            {monthlyPrice ? (
              <p className="font-serif text-4xl text-primary mb-1">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: monthlyPrice.currency.toUpperCase(), minimumFractionDigits: 2 }).format(monthlyPrice.unitAmount / 100)}
                <span className="text-base text-muted-foreground font-sans ml-1">{lang === 'pt' ? '/mês' : '/month'}</span>
              </p>
            ) : (
              <p className="font-serif text-4xl text-primary mb-1">—</p>
            )}
            <p className="text-sm text-secondary mb-6">{lang === 'pt' ? '7 dias grátis para testar' : '7-day free trial'}</p>
            <ul className="space-y-3 mb-8">
              {premiumFeatures.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                  <div className="w-4 h-4 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-secondary" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/pricing" className="w-full block py-3 text-sm font-semibold text-center bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors no-underline">
              {lang === 'pt' ? 'Começar teste grátis' : 'Start free trial'}
            </Link>
            <p className="text-xs text-center text-muted-foreground mt-3">
              {lang === 'pt' ? 'Cancele quando quiser.' : 'Cancel anytime.'}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    en: { q: 'Is BreadLight really free?', a: 'Yes. All Bible reading, bilingual translations, vocabulary tools, study notes, and daily devotionals are free forever. The only paid features are the Premium reading atmospheres, accent colors, and early access to new features.' },
    pt: { q: 'O BreadLight é realmente gratuito?', a: 'Sim. Toda leitura da Bíblia, traduções bilíngues, ferramentas de vocabulário, anotações e devocionais são gratuitos para sempre. Os únicos recursos pagos são as atmosferas de leitura Premium, cores de destaque e acesso antecipado a novos recursos.' },
  },
  {
    en: { q: 'What Bible translation does BreadLight use?', a: 'BreadLight uses the King James Version (KJV) in English, which is in the public domain and is recognized for its literary beauty and precision — ideal for language learning. Portuguese context uses the Almeida Revisada Corrigida for reference.' },
    pt: { q: 'Qual tradução da Bíblia o BreadLight usa?', a: 'O BreadLight usa a King James Version (KJV) em inglês, que é de domínio público e reconhecida por sua beleza literária e precisão — ideal para aprendizado de idiomas. O contexto em português usa a Almeida Revisada Corrigida como referência.' },
  },
  {
    en: { q: 'Do I need to know English to start?', a: 'Not at all. BreadLight is designed specifically for Portuguese speakers who are learning English. Every verse is shown with a Portuguese translation so you always understand what you\'re reading.' },
    pt: { q: 'Preciso saber inglês para começar?', a: 'De jeito nenhum. O BreadLight foi feito especificamente para falantes de português que estão aprendendo inglês. Cada versículo é exibido com tradução em português para que você sempre entenda o que está lendo.' },
  },
  {
    en: { q: 'How do I subscribe to Premium?', a: 'You can subscribe from the app (iOS or Android) or from this website via the Pricing page. Your Premium subscription works across all your devices.' },
    pt: { q: 'Como faço para assinar o Premium?', a: 'Você pode assinar pelo aplicativo (iOS ou Android) ou por este site, na página de Planos. Sua assinatura Premium funciona em todos os seus dispositivos.' },
  },
  {
    en: { q: 'Can I cancel my subscription at any time?', a: 'Yes. You can cancel anytime from the app or from the Pricing page. You\'ll keep Premium access until the end of your current billing period.' },
    pt: { q: 'Posso cancelar minha assinatura a qualquer momento?', a: 'Sim. Você pode cancelar quando quiser pelo aplicativo ou pela página de Planos. Você mantém o acesso Premium até o fim do período atual de cobrança.' },
  },
  {
    en: { q: 'Is there a web version of the app?', a: 'The full Bible reading and learning experience lives in the mobile app (iOS and Android). This website lets you learn about BreadLight, manage your subscription, and sign in to your account.' },
    pt: { q: 'Existe uma versão web do aplicativo?', a: 'A experiência completa de leitura e aprendizado está no aplicativo móvel (iOS e Android). Este site permite conhecer o BreadLight, gerenciar sua assinatura e fazer login na sua conta.' },
  },
];

function FaqSection({ lang }: { lang: 'pt' | 'en' }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 md:py-28 bg-card/40 border-y border-border">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div {...fadeUp} className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-3">FAQ</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">
            {lang === 'pt' ? 'Perguntas frequentes' : 'Frequently asked questions'}
          </h2>
        </motion.div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const copy = lang === 'pt' ? item.pt : item.en;
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: [0.22,1,0.36,1], delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/30 transition-colors gap-4"
                >
                  <span className="font-medium text-foreground text-sm leading-snug">{copy.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 border-t border-border/50">
                    <p className="text-sm text-muted-foreground leading-relaxed pt-4">{copy.a}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Download CTA ──────────────────────────────────────────────────────────────
function DownloadSection({ lang }: { lang: 'pt' | 'en' }) {
  return (
    <section id="download" className="py-20 md:py-32 max-w-6xl mx-auto px-6">
      <motion.div
        {...fadeUp}
        className="relative bg-gradient-to-br from-primary/8 via-card to-secondary/5 border border-primary/15 rounded-3xl p-10 md:p-16 text-center overflow-hidden"
      >
        <span className="absolute -top-6 -left-4 font-serif text-[14rem] text-primary/4 leading-none select-none pointer-events-none">"</span>
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4 max-w-2xl mx-auto leading-tight">
            {lang === 'pt'
              ? 'Comece sua jornada hoje. É gratuito.'
              : 'Start your journey today. It\'s free.'}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            {lang === 'pt'
              ? 'Junte-se a leitores que estão aprendendo inglês através da Bíblia — um versículo de cada vez.'
              : 'Join readers who are learning English through the Bible — one verse at a time.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-5">
            <DownloadButtons size="md" />
          </div>
          <p className="text-xs text-muted-foreground/70">
            {lang === 'pt' ? 'iOS e Android · Gratuito · Sem anúncios' : 'iOS & Android · Free · No ads'}
          </p>
        </div>
      </motion.div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { lang } = useLanguage();

  return (
    <MarketingLayout>
      <HeroSection lang={lang} />
      <SocialProofStrip lang={lang} />
      <FeaturesSection lang={lang} />
      <HowItWorksSection lang={lang} />
      <ScreenshotsSection lang={lang} />
      <TestimonialsSection lang={lang} />
      <PricingTeaserSection lang={lang} />
      <FaqSection lang={lang} />
      <DownloadSection lang={lang} />
    </MarketingLayout>
  );
}
