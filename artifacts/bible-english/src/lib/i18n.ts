// ── App-wide UI language (PT/EN) ─────────────────────────────────────────────
// Mirrors the pattern used by the sibling Expo app (artifacts/mobile/constants/i18n.ts):
// a flat table of { pt, en } string pairs keyed by a stable id, plus a t(lang, key) helper.
// This file only needs to grow as more of the app is wired to useLanguage() — see the
// language-context for the hook.

export type Lang = 'pt' | 'en';

const strings = {
  // ── App identity / sidebar
  app_name:            { pt: 'Bible English',                       en: 'Bible English' },
  app_tagline:         { pt: 'Aprenda Inglês Através da Bíblia',     en: 'Learn English Through The Bible' },
  plan_free_badge:     { pt: 'Plano Gratuito',                      en: 'Free Plan' },

  // ── Nav items
  nav_home:            { pt: 'Início',       en: 'Home' },
  nav_reader:          { pt: 'Leitura',      en: 'Reader' },
  nav_library:         { pt: 'Biblioteca',   en: 'Library' },
  nav_search:          { pt: 'Buscar',       en: 'Search' },
  nav_vocabulary:      { pt: 'Vocabulário',  en: 'Vocabulary' },
  nav_notes:           { pt: 'Anotações',    en: 'Notes' },
  nav_favorites:       { pt: 'Favoritos',    en: 'Favorites' },
  nav_devotionals:     { pt: 'Devocionais',  en: 'Devotionals' },
  nav_journey:         { pt: 'Jornada',      en: 'Journey' },
  nav_settings:        { pt: 'Configurações',en: 'Settings' },

  // ── Settings — tabs
  settings_tab_profile:      { pt: 'Perfil',              en: 'Profile' },
  settings_tab_appearance:   { pt: 'Aparência',           en: 'Appearance' },
  settings_tab_reading:      { pt: 'Leitura',             en: 'Reading' },
  settings_tab_language:     { pt: 'Idioma',              en: 'Language' },
  settings_tab_share:        { pt: 'Compartilhar & Convidar', en: 'Share & Invite' },
  settings_tab_devotionals:  { pt: 'Devocionais',         en: 'Devotionals' },
  settings_tab_plan:         { pt: 'Plano & Cobrança',    en: 'Plan & Billing' },

  // ── Settings — App Language section (the actual UI-language switcher)
  settings_app_language_title: { pt: 'Idioma do Aplicativo', en: 'App Language' },
  settings_app_language_desc:  { pt: 'Escolha o idioma da interface do BreadLight.', en: "Choose the language of BreadLight's interface." },
  app_language_pt:             { pt: 'Português', en: 'Português' },
  app_language_en:             { pt: 'English',   en: 'English' },

  // ── Auth — sidebar / profile
  auth_sign_in:         { pt: 'Entrar',                          en: 'Sign In' },
  auth_sign_up:         { pt: 'Criar conta',                     en: 'Sign Up' },
  auth_sign_out:        { pt: 'Sair',                            en: 'Sign Out' },
  auth_guest:           { pt: 'Visitante',                       en: 'Guest' },
  auth_sign_in_prompt:  { pt: 'Entre para salvar seu progresso', en: 'Sign in to save your progress' },
  auth_welcome_back_title:    { pt: 'Bem-vindo de volta',        en: 'Welcome back' },
  auth_welcome_back_subtitle: { pt: 'Entre para acessar sua conta', en: 'Sign in to access your account' },
  auth_create_account_title:    { pt: 'Crie sua conta',          en: 'Create your account' },
  auth_create_account_subtitle: { pt: 'Comece agora',            en: 'Get started today' },
  settings_profile_your_account: { pt: 'Sua Conta',              en: 'Your Account' },
  settings_profile_name:         { pt: 'Nome',                   en: 'Name' },
  settings_profile_email:        { pt: 'Email',                  en: 'Email' },
  settings_profile_member_since: { pt: 'Membro desde',           en: 'Member since' },
  settings_profile_signed_out_desc: { pt: 'Entre para sincronizar seu progresso entre dispositivos e desbloquear o Premium.', en: 'Sign in to sync your progress across devices and unlock Premium.' },
  settings_profile_change_photo: { pt: 'Alterar foto',           en: 'Change photo' },
} as const;

export type I18nKey = keyof typeof strings;

export function t(lang: Lang, key: I18nKey): string {
  const entry = strings[key];
  return entry ? entry[lang] ?? entry.pt : key;
}
