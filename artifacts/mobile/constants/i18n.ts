// ── Bread&Light · UI string translations ──────────────────────────────────────
export type Lang = 'pt' | 'en';

const strings = {
  // ── App identity
  app_name:          { pt: 'Bread&Light', en: 'Bread&Light' },
  free_forever:      { pt: 'Gratuito para sempre 🙏', en: 'Free forever 🙏' },
  version_label:     { pt: 'Versão', en: 'Version' },

  // ── Tab bar
  tab_home:          { pt: 'Início',      en: 'Home'      },
  tab_vocab:         { pt: 'Vocabulário', en: 'Vocab.'    },
  tab_search:        { pt: 'Buscar',      en: 'Search'    },
  tab_bookmarks:     { pt: 'Favoritos',   en: 'Favorites' },
  tab_settings:      { pt: 'Você',        en: 'You'       },

  // ── Drawer
  drawer_stat_favorites: { pt: 'Favoritos', en: 'Favorites' },
  drawer_stat_words:     { pt: 'Palavras',  en: 'Words'     },
  drawer_stat_mastered:  { pt: 'Dominadas', en: 'Mastered'  },
  drawer_nav_appearance: { pt: 'Aparência',    en: 'Appearance'   },
  drawer_nav_learning:   { pt: 'Aprendizado',  en: 'Learning'     },
  drawer_nav_share:      { pt: 'Compartilhar', en: 'Share'        },
  drawer_nav_support:    { pt: 'Apoio',        en: 'Support'      },
  drawer_nav_about:      { pt: 'Sobre',        en: 'About'        },
  drawer_sections_label: { pt: 'SEÇÕES',       en: 'SECTIONS'     },

  // Auth screen
  auth_tagline:          { pt: 'Aprenda inglês através da Bíblia.',  en: 'Learn English through the Bible.' },
  auth_google:           { pt: 'Continuar com Google',               en: 'Continue with Google'             },
  auth_apple:            { pt: 'Continuar com Apple',                en: 'Continue with Apple'              },
  auth_or:               { pt: 'ou entre com email',                 en: 'or sign in with email'            },
  auth_email_placeholder:{ pt: 'Email',                              en: 'Email'                            },
  auth_password_placeholder:{ pt: 'Senha',                           en: 'Password'                         },
  auth_confirm_password: { pt: 'Confirmar senha',                    en: 'Confirm password'                 },
  auth_login:            { pt: 'Entrar',                             en: 'Sign In'                          },
  auth_register:         { pt: 'Criar conta',                        en: 'Create Account'                   },
  auth_forgot:           { pt: 'Esqueci a senha',                    en: 'Forgot password'                  },
  auth_skip:             { pt: 'Continuar sem conta',                en: 'Continue without account'         },
  auth_sync_badge:       { pt: 'Sync gratuito · Premium separado',   en: 'Free sync · Premium separate'     },
  drawer_nav_language:   { pt: 'Idioma',       en: 'Language'     },
  drawer_nav_audio:      { pt: 'Áudio',        en: 'Audio'        },
  drawer_nav_data:       { pt: 'Dados',        en: 'Data'         },

  // ── Settings screen title
  settings_title:    { pt: 'Você',          en: 'You'      },

  // ── Section headers
  section_language:    { pt: 'IDIOMA',         en: 'LANGUAGE'    },
  section_appearance:  { pt: 'APARÊNCIA',      en: 'APPEARANCE'  },
  section_learning:    { pt: 'APRENDIZADO',    en: 'LEARNING'    },
  section_audio:       { pt: 'ÁUDIO',          en: 'AUDIO'       },
  section_share:       { pt: 'COMPARTILHAR',   en: 'SHARE'       },
  section_support:     { pt: 'APOIO',          en: 'SUPPORT'     },
  section_data:        { pt: 'DADOS',          en: 'DATA'        },
  section_about:       { pt: 'SOBRE',          en: 'ABOUT'       },

  // ── Language selector
  app_language:          { pt: 'Idioma do App', en: 'App Language' },
  app_language_pt:       { pt: 'Português', en: 'Portuguese' },
  app_language_en:       { pt: 'Inglês',    en: 'English'    },

  // ── Appearance labels
  reading_atmosphere:     { pt: 'Atmosfera de Leitura',  en: 'Reading Atmosphere' },
  reading_atmosphere_sub: { pt: 'Uma paleta e material para cada momento de estudo', en: 'A palette and material for every study moment' },
  accent_color:           { pt: 'Cor de Destaque',  en: 'Accent Color'        },

  // ── Reading atmosphere names + descriptions
  atmosphere_parchment:       { pt: 'Pergaminho',   en: 'Parchment' },
  atmosphere_parchment_desc: { pt: 'Papel de manuscrito antigo', en: 'Ancient manuscript paper' },
  atmosphere_cozy:            { pt: 'Aconchego',    en: 'Cozy' },
  atmosphere_cozy_desc:      { pt: 'Bege quente, tons suaves', en: 'Warm beige, soft tones' },
  atmosphere_classic:         { pt: 'Clássico',     en: 'Classic' },
  atmosphere_classic_desc:   { pt: 'Papel de Bíblia tradicional', en: 'Traditional Bible paper' },
  atmosphere_dark:            { pt: 'Escuro',       en: 'Dark' },
  atmosphere_dark_desc:      { pt: 'Carvão e ouro antigo', en: 'Charcoal and antique gold' },
  atmosphere_night:           { pt: 'Noturno',      en: 'Night' },
  atmosphere_night_desc:     { pt: 'Azul profundo, ideal à noite', en: 'Deep blue, ideal at night' },
  atmosphere_library:         { pt: 'Biblioteca',   en: 'Library' },
  atmosphere_library_desc:  { pt: 'Nogueira e sombras suaves', en: 'Walnut and soft shadows' },
  atmosphere_morning:         { pt: 'Manhã',        en: 'Morning' },
  atmosphere_morning_desc:  { pt: 'Creme suave, luz natural', en: 'Soft cream, natural light' },
  atmosphere_minimal:         { pt: 'Minimalista',  en: 'Minimal' },
  atmosphere_minimal_desc:  { pt: 'Branco puro, máximo espaço', en: 'Pure white, maximum whitespace' },
  atmosphere_sepia:           { pt: 'Sépia',        en: 'Sepia' },
  atmosphere_sepia_desc:    { pt: 'Inspirado em livros antigos', en: 'Inspired by old books' },
  atmosphere_focus:           { pt: 'Foco',         en: 'Focus' },
  atmosphere_focus_desc:    { pt: 'Cinza neutro, menos distração', en: 'Neutral gray, less distraction' },

  // ── Learning labels
  english_level:     { pt: 'Nível de Inglês',          en: 'English Level'         },
  english_level_sub: { pt: 'Adapta o conteúdo ao seu ritmo', en: 'Adapts content to your pace' },
  display_mode:      { pt: 'Modo de Exibição',          en: 'Display Mode'          },
  ipa:               { pt: 'Pronúncia (IPA)',            en: 'Pronunciation (IPA)'   },
  ipa_sub:           { pt: 'Mostrar fonética ao tocar palavra', en: 'Show phonetics on word tap' },
  auto_translate:    { pt: 'Tradução automática',        en: 'Auto Translate'        },
  auto_tr_sub:       { pt: 'Traduzir palavras ao tocar', en: 'Translate words on tap' },
  vocab_reminder:    { pt: 'Lembrete de vocabulário',    en: 'Vocabulary Reminder'   },
  vocab_rem_sub:     { pt: 'Revisar palavras diariamente', en: 'Review words daily'  },

  // ── Level names
  level_beginner:    { pt: 'Iniciante',     en: 'Beginner'     },
  level_inter:       { pt: 'Intermediário', en: 'Intermediate' },
  level_advanced:    { pt: 'Avançado',      en: 'Advanced'     },

  // ── Display mode names
  mode_bilingual:    { pt: 'Bilíngue',  en: 'Bilingual'  },
  mode_english:      { pt: 'Inglês',    en: 'English'    },
  mode_portuguese:   { pt: 'Português', en: 'Portuguese' },

  // ── Audio labels
  playback_speed:    { pt: 'Velocidade de Reprodução', en: 'Playback Speed' },

  // ── Share labels
  share_verse:       { pt: 'Compartilhar versículo',    en: 'Share verse'           },
  share_verse_sub:   { pt: 'Enviar como imagem ou texto', en: 'Send as image or text' },
  invite_friend:     { pt: 'Convidar um amigo',         en: 'Invite a friend'       },
  invite_sub:        { pt: '30 dias grátis de Premium', en: '30 free days of Premium' },

  // ── Support labels
  donate:            { pt: 'Fazer uma doação',              en: 'Make a donation'       },
  donate_sub:        { pt: 'Apoie o desenvolvimento',       en: 'Support development'   },
  ambassador:        { pt: 'Ser Embaixador',                en: 'Become Ambassador'     },
  ambassador_sub:    { pt: 'Plano mensal com benefícios',   en: 'Monthly plan w/ perks' },

  // ── Data labels
  clear_vocab:       { pt: 'Limpar vocabulário',      en: 'Clear vocabulary'    },
  clear_vocab_sub:   { pt: 'Apagar todas as palavras salvas', en: 'Delete all saved words' },
  reset_bookmarks:   { pt: 'Limpar favoritos',        en: 'Clear favorites'     },
  reset_bm_sub:      { pt: 'Apagar todos os versículos favoritos', en: 'Delete all bookmarked verses' },

  // ── About labels
  support_label:     { pt: 'Suporte',           en: 'Support'       },
  support_sub:       { pt: 'Reporte um problema', en: 'Report an issue' },
  privacy:           { pt: 'Privacidade',        en: 'Privacy'       },
  terms:             { pt: 'Termos de Uso',      en: 'Terms of Use'  },

  // ── Plan badges
  plan_free:         { pt: 'Free',   en: 'Free'   },
  plan_member:       { pt: 'Member', en: 'Member' },

  // ── Home screen
  home_brand:        { pt: 'Bread&Light', en: 'Bread&Light' },

  // ── Daily screen
  show_pt_translation:  { pt: 'Ver tradução em PT',  en: 'Show PT translation' },
  hide_pt_translation:  { pt: 'Ocultar tradução',    en: 'Hide translation'    },
  read_devotional:      { pt: 'Ler Devocional',      en: 'Read Devotional'     },
  mark_done:            { pt: 'Marcar como concluído', en: 'Mark as complete'  },
  completed_today:      { pt: 'Concluído hoje 🎉',   en: 'Completed today 🎉'  },
  come_back_tomorrow:   { pt: 'Volte amanhã para o próximo versículo', en: 'Come back tomorrow for the next verse' },
  daily_tip_study:      { pt: 'Toque nas palavras em inglês para ver o significado', en: 'Tap English words to see their meaning' },

  // ── Unified voice / audio player
  listen_in_english:    { pt: 'Ouvir em inglês', en: 'Listen in English' },
  listen_devotional:    { pt: 'Ouvir devocional', en: 'Listen to devotional' },
  audio_unavailable:    { pt: 'Áudio indisponível no momento.', en: 'Audio unavailable right now.' },

  // ── Pronunciation practice
  practice_title:            { pt: 'Praticar Pronúncia',  en: 'Practice Pronunciation' },
  practice_hint:             { pt: 'Toque no microfone e leia o versículo em voz alta.', en: 'Tap the mic and read the verse aloud.' },
  practice_start:            { pt: 'Começar a gravar',    en: 'Start recording' },
  practice_recording:        { pt: 'Gravando… toque para parar', en: 'Recording… tap to stop' },
  practice_stop:             { pt: 'Parar',               en: 'Stop' },
  practice_transcribing:     { pt: 'Ouvindo sua leitura…', en: 'Listening to your reading…' },
  practice_unsupported:      { pt: 'Prática de pronúncia indisponível no momento. Tente novamente mais tarde.', en: 'Pronunciation practice is unavailable right now. Please try again later.' },
  practice_error:            { pt: 'Não foi possível processar o áudio. Tente novamente.', en: "Couldn't process the audio. Please try again." },
  practice_try_again:        { pt: 'Tentar novamente',    en: 'Try again' },
  practice_mic_denied:       { pt: 'Precisamos de acesso ao microfone para praticar a pronúncia.', en: 'We need microphone access to practice pronunciation.' },
  practice_clarity_great:         { pt: 'Excelente clareza! Quase todas as palavras foram reconhecidas. 🙌', en: 'Wonderful clarity! Almost every word came through. 🙌' },
  practice_clarity_good:          { pt: 'Bom progresso — a maior parte do versículo ficou clara.', en: 'Good progress — most of the verse came through clearly.' },
  practice_clarity_keep_practicing: { pt: 'Continue praticando — tente falar um pouco mais devagar e com calma.', en: "Keep practicing — try speaking a little slower and calmer." },
  practice_rhythm_great:          { pt: 'Seu ritmo de leitura está natural e tranquilo.', en: 'Your reading rhythm feels natural and unhurried.' },
  practice_rhythm_good:           { pt: 'Ritmo tranquilo — com mais prática ficará ainda mais natural.', en: 'A calm pace — with more practice it will feel even more natural.' },
  practice_rhythm_keep_practicing:{ pt: 'Experimente fazer pequenas pausas entre as frases ao ler.', en: 'Try pausing gently between phrases as you read.' },

  // ── Vocabulary audio
  listen_word:          { pt: 'Ouvir palavra', en: 'Listen to word' },
} as const;

export type I18nKey = keyof typeof strings;

export function t(lang: Lang, key: I18nKey): string {
  const entry = strings[key];
  return entry ? entry[lang] ?? entry.pt : key;
}
