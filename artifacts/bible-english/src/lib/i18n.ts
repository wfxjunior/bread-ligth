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

  // ── Plan & Billing / Pricing — BreadLight Premium
  plan_free_plan_label:     { pt: 'Plano Gratuito',    en: 'Free Plan' },
  plan_premium_plan_label:  { pt: 'Plano Premium',     en: 'Premium Plan' },
  plan_current_plan_title:  { pt: 'Plano Atual',       en: 'Current Plan' },
  plan_free_desc:           { pt: 'Você está estudando a Bíblia e aprendendo inglês gratuitamente.', en: "You're studying the Bible and learning English for free." },
  plan_premium_desc_trialing: { pt: 'Seu teste grátis está ativo.', en: 'Your free trial is active.' },
  plan_premium_desc_active: { pt: 'Sua assinatura Premium está ativa.', en: 'Your Premium subscription is active.' },
  plan_premium_desc_canceling: { pt: 'Sua assinatura termina no fim do período atual.', en: 'Your subscription ends at the end of the current period.' },
  plan_trial_ends:          { pt: 'Teste grátis termina em',  en: 'Free trial ends' },
  plan_renews_on:           { pt: 'Renova em',                en: 'Renews on' },
  plan_ends_on:             { pt: 'Termina em',               en: 'Ends on' },
  plan_manage_billing:      { pt: 'Gerenciar Cobrança',       en: 'Manage Billing' },
  plan_loading:             { pt: 'Carregando plano...',      en: 'Loading plan...' },
  plan_error:               { pt: 'Não foi possível carregar seu plano. Tente novamente.', en: 'Could not load your plan. Please try again.' },
  plan_sign_in_to_manage:   { pt: 'Entre para ver e gerenciar seu plano.', en: 'Sign in to view and manage your plan.' },

  plan_upgrade_eyebrow:     { pt: 'Upgrade',                   en: 'Upgrade' },
  plan_upgrade_title:       { pt: 'BreadLight Premium',        en: 'BreadLight Premium' },
  plan_upgrade_subtitle:    { pt: 'Cancele quando quiser. Teste grátis de 7 dias.', en: 'Cancel anytime. 7-day free trial.' },
  plan_billed_monthly:      { pt: 'Mensal',                    en: 'Monthly' },
  plan_billed_yearly:       { pt: 'Anual',                     en: 'Yearly' },
  plan_per_month:           { pt: '/mês',                      en: '/month' },
  plan_per_year:            { pt: '/ano',                      en: '/year' },
  plan_yearly_save_badge:   { pt: 'Economize 33%',             en: 'Save 33%' },
  plan_trial_cta:           { pt: 'Iniciar teste grátis de 7 dias', en: 'Start your 7-day free trial' },
  plan_trial_disclaimer:    { pt: 'Sem cobrança por 7 dias. Cancele quando quiser.', en: "You won't be charged for 7 days. Cancel anytime." },
  plan_redirecting:         { pt: 'Redirecionando para o pagamento...', en: 'Redirecting to checkout...' },

  plan_feature_atmospheres: { pt: 'Todas as 10 atmosferas de leitura', en: 'All 10 reading atmospheres' },
  plan_feature_accents:     { pt: 'Todas as 5 cores de destaque',      en: 'All 5 accent colors' },
  plan_feature_mission:     { pt: 'Ajude a manter o BreadLight gratuito para outros', en: 'Help keep BreadLight free for others' },
  plan_feature_early_access: { pt: 'Acesso antecipado a novos recursos', en: 'Early access to new features' },
  plan_feature_priority_support: { pt: 'Suporte prioritário',      en: 'Priority support' },

  plan_always_free_title:   { pt: 'Sempre Gratuito',            en: 'Always Free, Forever' },
  plan_always_free_desc:    { pt: 'Toda a leitura da Bíblia, tradução de palavras, anotações, favoritos e vocabulário — sempre gratuitos.', en: 'All Bible reading, word translations, notes, favorites, and vocabulary — always free.' },
  plan_no_card_required:    { pt: 'Nenhum cartão necessário para começar', en: 'No credit card required to start' },
  plan_view_plans:          { pt: 'Ver Planos Premium',          en: 'View Premium Plans' },

  pricing_page_title:       { pt: 'Torne-se Premium',            en: 'Go Premium' },
  pricing_page_subtitle:    { pt: 'Desbloqueie todas as atmosferas de leitura e cores de destaque, e ajude o BreadLight a continuar gratuito para todos.', en: 'Unlock every reading atmosphere and accent color, and help keep BreadLight free for everyone.' },
  pricing_back_to_app:      { pt: 'Voltar ao aplicativo',        en: 'Back to app' },
  pricing_already_premium:  { pt: 'Você já é Premium! Obrigado por apoiar o BreadLight.', en: "You're already Premium! Thank you for supporting BreadLight." },
  pricing_manage_plan:      { pt: 'Gerenciar meu plano',         en: 'Manage my plan' },
  pricing_checkout_success: { pt: 'Bem-vindo ao Premium! Sua assinatura está ativa.', en: 'Welcome to Premium! Your subscription is active.' },
  pricing_checkout_cancel:  { pt: 'Pagamento cancelado. Você pode tentar novamente quando quiser.', en: 'Checkout canceled. You can try again anytime.' },
  pricing_sign_in_first:    { pt: 'Entre na sua conta para assinar o Premium.', en: 'Sign in to your account to subscribe to Premium.' },

  // ── Appearance — premium gating on atmospheres & accents
  appearance_premium_badge: { pt: 'Premium',                     en: 'Premium' },
  appearance_locked_title:  { pt: 'Recurso Premium',             en: 'Premium Feature' },
  appearance_locked_desc:   { pt: 'Assine o BreadLight Premium para desbloquear todas as atmosferas de leitura e cores de destaque.', en: 'Subscribe to BreadLight Premium to unlock every reading atmosphere and accent color.' },
  appearance_unlock_cta:    { pt: 'Desbloquear com Premium',     en: 'Unlock with Premium' },
} as const;

export type I18nKey = keyof typeof strings;

export function t(lang: Lang, key: I18nKey): string {
  const entry = strings[key];
  return entry ? entry[lang] ?? entry.pt : key;
}
