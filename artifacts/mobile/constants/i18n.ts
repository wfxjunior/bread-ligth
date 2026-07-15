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
  auth_welcome_back_title:    { pt: 'Bem-vindo de volta',        en: 'Welcome back' },
  auth_welcome_back_subtitle: { pt: 'Entre para acessar sua conta', en: 'Sign in to access your account' },
  auth_create_account_title:    { pt: 'Crie sua conta',          en: 'Create your account' },
  auth_create_account_subtitle: { pt: 'Comece agora',            en: 'Get started today' },
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
 auth_verify_title:     { pt: 'Verifique seu email',                en: 'Verify your email'                },
 auth_verify_subtitle:  { pt: 'Enviamos um código para o seu email.', en: 'We sent a code to your email.'  },
 auth_verify_code_placeholder: { pt: 'Código de verificação',       en: 'Verification code'                },
 auth_verify_button:    { pt: 'Verificar',                          en: 'Verify'                            },
 auth_resend_code:      { pt: 'Reenviar código',                    en: 'Resend code'                       },
 auth_start_over:       { pt: 'Recomeçar',                          en: 'Start over'                        },
 auth_sign_out:         { pt: 'Sair da conta',                      en: 'Sign out'                          },
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
  reading_space:          { pt: 'Espaço de Leitura', en: 'Reading Space'      },

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

  // ── Reading Space names — calm atmosphere presets
  space_clean:     { pt: 'Limpo',       en: 'Clean'      },
  space_warm:      { pt: 'Acolhedor',   en: 'Warm'       },
  space_cozy:      { pt: 'Aconchego',   en: 'Cozy'       },
  space_nature:    { pt: 'Natureza',    en: 'Nature'     },
  space_morning:   { pt: 'Manhã',       en: 'Morning'    },
  space_evening:   { pt: 'Anoitecer',   en: 'Evening'    },
  space_classic:   { pt: 'Clássico',    en: 'Classic'    },
  space_modern:    { pt: 'Moderno',     en: 'Modern'     },
  space_serenity:  { pt: 'Serenidade',  en: 'Serenity'   },

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

  // ── Audio / voice
  audio_voice:       { pt: 'Voz de Leitura',             en: 'Reading Voice'         },
  audio_voice_sub:   { pt: 'Escolha a voz usada para ler versículos e devocionais', en: 'Choose the voice used to read verses and devotionals' },
  voice_alloy:       { pt: 'Alloy',   en: 'Alloy'   },
  voice_echo:        { pt: 'Echo',    en: 'Echo'    },
  voice_fable:       { pt: 'Fable',   en: 'Fable'   },
  voice_onyx:        { pt: 'Onyx',    en: 'Onyx'    },
  voice_nova:        { pt: 'Nova',    en: 'Nova'    },
  voice_shimmer:     { pt: 'Shimmer', en: 'Shimmer' },

  // ── Reading language (verse/chapter audio)
  listen_in_portuguese: { pt: 'Ouvir em português', en: 'Listen in Portuguese' },
  lang_pill_en:          { pt: 'Inglês',            en: 'English'             },
  lang_pill_pt:          { pt: 'Português',          en: 'Portuguese'          },
  audio_language:        { pt: 'Idioma da leitura',  en: 'Reading language'    },
  audio_language_sub:    { pt: 'Em que idioma o versículo é lido em voz alta', en: 'Which language verses are read aloud in' },

  // ── Offline audio storage
  offline_audio:                  { pt: 'Áudio Offline',           en: 'Offline Audio' },
  offline_audio_sub:              { pt: 'Versículos e devocionais salvos no dispositivo para ouvir sem internet', en: 'Verses and devotionals saved on your device for offline listening' },
  offline_audio_empty:            { pt: 'Vazio',                   en: 'Empty' },
  offline_audio_clear:            { pt: 'Limpar áudio offline',    en: 'Clear offline audio' },
  offline_audio_clear_confirm_title: { pt: 'Limpar áudio offline?', en: 'Clear offline audio?' },
  offline_audio_clear_confirm_body:  {
    pt: 'Isso apaga todos os áudios salvos no dispositivo. Eles serão baixados novamente da próxima vez que você ouvir.',
    en: 'This deletes all audio saved on your device. It will be downloaded again the next time you listen.',
  },
  offline_audio_evicted: {
    pt: '{size} de áudios mais antigos foram removidos automaticamente para liberar espaço.',
    en: '{size} of older audio was automatically removed to free up space.',
  },
  offline_audio_cap: { pt: 'Limite de armazenamento', en: 'Storage limit' },
  offline_audio_cap_sub: {
    pt: 'Quanto espaço reservar no dispositivo para áudio offline',
    en: 'How much device space to reserve for offline audio',
  },
  prefetch_wifi_only:     { pt: 'Pré-carregar apenas no Wi-Fi', en: 'Prefetch on Wi-Fi only' },
  prefetch_wifi_only_sub: {
    pt: 'Não usar dados móveis para baixar os próximos versículos com antecedência',
    en: "Don't use cellular data to download upcoming verses ahead of time",
  },
  cancel: { pt: 'Cancelar', en: 'Cancel' },

  // ── Daily devotional completion
  daily_done_title:     { pt: 'Concluído hoje 🎉',                       en: 'Completed today 🎉'                    },
  daily_done_sub:        { pt: 'Volte amanhã para o próximo versículo',   en: 'Come back tomorrow for the next verse' },
  daily_done_share:      { pt: 'Convidar um amigo',                       en: 'Invite a friend'                       },
  daily_done_share_msg:  { pt: 'Acabei de ler meu devocional de hoje no Bread&Light — aprendendo inglês através da Bíblia. Vem comigo!',
                            en: 'I just finished today\'s devotional on Bread&Light — learning English through the Bible. Join me!' },

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
  plan_free:         { pt: 'Grátis', en: 'Free'   },
  plan_member:       { pt: 'Membro', en: 'Member' },

  // ── Premium (Settings card + paywall) ──────────────────────────────────────
  premium_card_sub:        { pt: 'Desbloqueie todas as atmosferas e cores de destaque', en: 'Unlock every reading atmosphere and accent color' },
  premium_card_cta:        { pt: 'Ver planos',          en: 'See plans'          },
  premium_active_sub:      { pt: 'Obrigado por apoiar o Bread&Light! 🙏', en: 'Thank you for supporting Bread&Light! 🙏' },
  premium_active_badge:    { pt: 'Premium ativo',       en: 'Premium active'     },
  premium_unlock_row_text: { pt: 'Desbloqueie todas as cores com o Premium', en: 'Unlock every color with Premium' },
  premium_unlock_cta:      { pt: 'Ver planos',          en: 'See plans'          },

  premium_back:             { pt: 'Configurações',       en: 'Settings'           },
  premium_eyebrow:          { pt: 'Upgrade',             en: 'Upgrade'            },
  premium_title:            { pt: 'Bread&Light Premium', en: 'Bread&Light Premium' },
  premium_subtitle:         { pt: 'Cancele quando quiser. Teste grátis de 7 dias.', en: 'Cancel anytime. 7-day free trial.' },
  premium_billed_monthly:   { pt: 'Mensal',              en: 'Monthly'            },
  premium_billed_yearly:    { pt: 'Anual',               en: 'Yearly'             },
  premium_per_month:        { pt: '/mês',                en: '/month'             },
  premium_per_year:         { pt: '/ano',                en: '/year'              },
  premium_yearly_save_badge:{ pt: '-33%',                en: '-33%'               },
  premium_loading:          { pt: 'Carregando preços…',  en: 'Loading prices…'    },
  premium_price_error:      { pt: 'Não foi possível carregar os preços agora.', en: 'Unable to load pricing right now.' },

  premium_feature_atmospheres:    { pt: 'Todas as 10 atmosferas de leitura', en: 'All 10 reading atmospheres' },
  premium_feature_accents:        { pt: 'Todas as 5 cores de destaque',      en: 'All 5 accent colors' },
  premium_feature_mission:        { pt: 'Ajude a manter o Bread&Light gratuito para outros', en: 'Help keep Bread&Light free for others' },
  premium_feature_early_access:   { pt: 'Acesso antecipado a novos recursos', en: 'Early access to new features' },
  premium_feature_priority_support:{ pt: 'Suporte prioritário',      en: 'Priority support' },

  premium_trial_cta:        { pt: 'Iniciar teste grátis de 7 dias', en: 'Start your 7-day free trial' },
  premium_trial_disclaimer: { pt: 'Sem cobrança por 7 dias. Cancele quando quiser.', en: "You won't be charged for 7 days. Cancel anytime." },
  premium_restore:          { pt: 'Restaurar compras',   en: 'Restore purchases'  },

  premium_already_title:    { pt: 'Plano Premium',       en: 'Premium Plan'       },
  premium_already_sub:      { pt: 'Você já é Premium! Obrigado por apoiar o Bread&Light.', en: "You're already Premium! Thank you for supporting Bread&Light." },

  premium_always_free_title:{ pt: 'Sempre Gratuito',     en: 'Always Free, Forever' },
  premium_always_free_desc: { pt: 'Toda a leitura da Bíblia, tradução de palavras, anotações, favoritos e vocabulário — sempre gratuitos.', en: 'All Bible reading, word translations, notes, favorites, and vocabulary — always free.' },
  premium_no_card_required: { pt: 'Nenhum cartão necessário para começar', en: 'No credit card required to start' },

  premium_compare_title:      { pt: 'Compare os planos',   en: 'Compare plans'      },
  premium_compare_free:       { pt: 'Grátis',              en: 'Free'               },
  premium_compare_premium:    { pt: 'Premium',             en: 'Premium'            },
  premium_compare_reading:    { pt: 'Leitura completa da Bíblia', en: 'Full Bible reading' },
  premium_compare_translation:{ pt: 'Tradução palavra por palavra', en: 'Word-by-word translation' },
  premium_compare_notes:      { pt: 'Anotações e favoritos', en: 'Notes and favorites' },
  premium_compare_vocab:      { pt: 'Vocabulário salvo',    en: 'Saved vocabulary'   },
  premium_compare_atmospheres:{ pt: '10 atmosferas de leitura', en: '10 reading atmospheres' },
  premium_compare_accents:    { pt: '5 cores de destaque',  en: '5 accent colors'    },
  premium_compare_early:      { pt: 'Acesso antecipado a novos recursos', en: 'Early access to new features' },
  premium_compare_support:    { pt: 'Suporte prioritário', en: 'Priority support'    },

  premium_coming_soon_title:         { pt: 'Em breve! 🌟', en: 'Coming soon! 🌟' },
  premium_coming_soon_purchase_body: { pt: 'As assinaturas Premium ainda estão sendo configuradas na loja do app. Fique ligado nas novidades!', en: 'Premium subscriptions are still being set up in the app store. Stay tuned for updates!' },
  premium_coming_soon_restore_body:  { pt: 'A restauração de compras ainda não está disponível — volte em breve.', en: 'Restoring purchases isn\u2019t available yet — check back soon.' },

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
  daily_mode_badge:     { pt: 'MODO DIÁRIO',         en: 'DAILY MODE'          },
  words_label:          { pt: 'palavras',            en: 'words'               },
  chapter_label:        { pt: 'Capítulo',            en: 'Chapter'             },
  devotional_modal_title: { pt: 'Devocional do Dia', en: 'Daily Devotional'    },
  tip_tap_words_definitions: { pt: 'Toque nas palavras para ver definições', en: 'Tap words to see definitions' },
  tip_tap_words_pt_reveal:   { pt: 'Toque nas palavras · PT revela a tradução', en: 'Tap words · PT reveals translation' },
  generating_reflection:     { pt: 'Gerando sua reflexão…', en: 'Generating your reflection…' },
  share_action:              { pt: 'Compartilhar', en: 'Share' },

  // ── Weekday / month labels for the daily devotional date header
  weekday_sun: { pt: 'Domingo', en: 'Sunday'    },
  weekday_mon: { pt: 'Segunda', en: 'Monday'    },
  weekday_tue: { pt: 'Terça',   en: 'Tuesday'   },
  weekday_wed: { pt: 'Quarta',  en: 'Wednesday' },
  weekday_thu: { pt: 'Quinta',  en: 'Thursday'  },
  weekday_fri: { pt: 'Sexta',   en: 'Friday'    },
  weekday_sat: { pt: 'Sábado',  en: 'Saturday'  },
  month_jan: { pt: 'Jan', en: 'Jan' },
  month_feb: { pt: 'Fev', en: 'Feb' },
  month_mar: { pt: 'Mar', en: 'Mar' },
  month_apr: { pt: 'Abr', en: 'Apr' },
  month_may: { pt: 'Mai', en: 'May' },
  month_jun: { pt: 'Jun', en: 'Jun' },
  month_jul: { pt: 'Jul', en: 'Jul' },
  month_aug: { pt: 'Ago', en: 'Aug' },
  month_sep: { pt: 'Set', en: 'Sep' },
  month_oct: { pt: 'Out', en: 'Oct' },
  month_nov: { pt: 'Nov', en: 'Nov' },
  month_dec: { pt: 'Dez', en: 'Dec' },

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

  // ── Home · Study card
  study_step_read:      { pt: 'Ler',       en: 'Read'    },
  study_step_listen:    { pt: 'Ouvir',     en: 'Listen'  },
  study_step_learn:     { pt: 'Aprender',  en: 'Learn'   },
  study_step_reflect:   { pt: 'Refletir',  en: 'Reflect' },
  study_chapter_title:  { pt: 'O Verbo se\nfez carne', en: 'The Word\nbecame flesh' },
  study_continue_reading: { pt: 'Continuar leitura', en: 'Continue Reading' },
  study_reflect_save:   { pt: 'Salvar reflexão', en: 'Save reflection' },
  study_reflect_saved:  { pt: 'Salvo',            en: 'Saved'           },
  study_reflect_placeholder: { pt: 'Escreva sua reflexão...', en: 'Write your reflection...' },
  study_reflect_prompt: { pt: 'O Verbo se fez carne e habitou entre nós. O que essa verdade muda na sua vida hoje?',
                           en: 'The Word became flesh and dwelt among us. What does this truth change in your life today?' },
  study_start_today:    { pt: 'Começar o Estudo de Hoje', en: "Start Today's Study" },

  // ── Home · personalized greeting (time-of-day, no exclamation marks)
  greeting_morning:   { pt: 'Bom dia',    en: 'Good morning'   },
  greeting_afternoon: { pt: 'Boa tarde',  en: 'Good afternoon' },
  greeting_evening:   { pt: 'Boa noite',  en: 'Good evening'   },
  today_label:        { pt: 'Hoje',       en: 'Today'          },

  // ── Full weekday / month names for the home header date line
  weekday_full_sun: { pt: 'Domingo',       en: 'Sunday'    },
  weekday_full_mon: { pt: 'Segunda-feira', en: 'Monday'    },
  weekday_full_tue: { pt: 'Terça-feira',   en: 'Tuesday'   },
  weekday_full_wed: { pt: 'Quarta-feira',  en: 'Wednesday' },
  weekday_full_thu: { pt: 'Quinta-feira',  en: 'Thursday'  },
  weekday_full_fri: { pt: 'Sexta-feira',   en: 'Friday'    },
  weekday_full_sat: { pt: 'Sábado',        en: 'Saturday'  },
  month_full_jan: { pt: 'janeiro',   en: 'January'   },
  month_full_feb: { pt: 'fevereiro', en: 'February'  },
  month_full_mar: { pt: 'março',     en: 'March'     },
  month_full_apr: { pt: 'abril',     en: 'April'     },
  month_full_may: { pt: 'maio',      en: 'May'       },
  month_full_jun: { pt: 'junho',     en: 'June'      },
  month_full_jul: { pt: 'julho',     en: 'July'      },
  month_full_aug: { pt: 'agosto',    en: 'August'    },
  month_full_sep: { pt: 'setembro',  en: 'September' },
  month_full_oct: { pt: 'outubro',   en: 'October'   },
  month_full_nov: { pt: 'novembro',  en: 'November'  },
  month_full_dec: { pt: 'dezembro',  en: 'December'  },

  // ── Vocabulary screen
  vocab_title:                { pt: 'Vocabulário', en: 'Vocabulary' },
  vocab_subtitle:              { pt: 'Palavras salvas durante a leitura', en: 'Words saved while reading' },
  vocab_filter_all:            { pt: 'Todas', en: 'All' },
  vocab_filter_learning:       { pt: 'Aprendendo', en: 'Learning' },
  vocab_filter_mastered:       { pt: 'Dominadas', en: 'Mastered' },
  vocab_empty_title:           { pt: 'Nenhuma palavra ainda', en: 'No words yet' },
  vocab_empty_filtered_title:  { pt: 'Nenhuma palavra nesta categoria', en: 'No words in this category' },
  vocab_empty_sub:             { pt: 'Toque em palavras em inglês durante a leitura para salvar no vocabulário', en: 'Tap English words while reading to save them to your vocabulary' },
  vocab_empty_filtered_sub:    { pt: 'Altere o filtro para ver outras palavras', en: 'Change the filter to see other words' },

  // ── Bookmarks screen
  bookmarks_title:          { pt: 'Favoritos', en: 'Favorites' },
  bookmark_count_singular:  { pt: 'versículo salvo', en: 'saved verse' },
  bookmark_count_plural:    { pt: 'versículos salvos', en: 'saved verses' },
  bookmarks_empty_title:    { pt: 'Sem favoritos ainda', en: 'No favorites yet' },
  bookmarks_empty_sub:      { pt: 'Toque no ícone de marcador ao lado de um versículo durante a leitura para salvá-lo aqui', en: 'Tap the bookmark icon next to a verse while reading to save it here' },
  read_chapter:             { pt: 'Ler capítulo', en: 'Read chapter' },

  // ── Search screen
  search_title:             { pt: 'Buscar', en: 'Search' },
  search_placeholder:       { pt: 'Buscar em inglês ou português...', en: 'Search in English or Portuguese...' },
  search_intro_title:       { pt: 'Buscar na Bíblia', en: 'Search the Bible' },
  search_intro_sub:         { pt: 'Digite uma palavra ou frase em inglês ou português para encontrar versículos', en: 'Type a word or phrase in English or Portuguese to find verses' },
  search_recent:            { pt: 'Buscas recentes', en: 'Recent searches' },
  search_clear:             { pt: 'Limpar', en: 'Clear' },
  search_popular:           { pt: 'Buscas populares', en: 'Popular searches' },
  search_featured:          { pt: 'Passagens em destaque', en: 'Featured passages' },
  search_min_chars:         { pt: 'Digite pelo menos 3 caracteres para buscar', en: 'Type at least 3 characters to search' },
  search_no_results_title:  { pt: 'Sem resultados', en: 'No results' },
  search_no_results_for:    { pt: 'Nenhum versículo encontrado para', en: 'No verse found for' },
  search_result_singular:   { pt: 'resultado', en: 'result' },
  search_result_plural:     { pt: 'resultados', en: 'results' },

  // ── Not-found screen
  not_found_page_title: { pt: 'Ops!', en: 'Oops!' },
  not_found_title:      { pt: 'Esta tela não existe.', en: "This screen doesn't exist." },
  not_found_link:       { pt: 'Ir para a tela inicial!', en: 'Go to home screen!' },

  // ── Error fallback
  error_fallback_title:         { pt: 'Algo deu errado', en: 'Something went wrong' },
  error_fallback_message:       { pt: 'Recarregue o aplicativo para continuar.', en: 'Please reload the app to continue.' },
  error_fallback_retry:         { pt: 'Tentar novamente', en: 'Try Again' },
  error_fallback_view_details:  { pt: 'Ver detalhes do erro', en: 'View error details' },
  error_fallback_details_title: { pt: 'Detalhes do Erro', en: 'Error Details' },
  error_fallback_close_details: { pt: 'Fechar detalhes do erro', en: 'Close error details' },

  // ── Settings drawer
  drawer_login_sub: { pt: 'Sincronize seu progresso', en: 'Sync your progress' },

  // ── Word modal
  word_modal_translation_label: { pt: 'Tradução em Português', en: 'Portuguese Translation' },
  word_modal_example_prefix:    { pt: 'Ex:', en: 'Ex:' },
  word_modal_already_saved:     { pt: 'Já salvo no vocabulário', en: 'Already saved to vocabulary' },
  word_modal_save:              { pt: 'Salvar no vocabulário', en: 'Save to vocabulary' },
  word_modal_not_found:         { pt: 'Palavra não encontrada no dicionário.', en: 'Word not found in dictionary.' },

  // ── Flash card
  flashcard_hint_en:       { pt: 'Inglês · Toque para ver', en: 'English · Tap to reveal' },
  flashcard_mastered:      { pt: 'Dominada', en: 'Mastered' },
  flashcard_master_action: { pt: 'Dominar', en: 'Master' },

  // ── Progress modal
  progress_modal_title:    { pt: 'Seu progresso', en: 'Your progress' },
  progress_modal_subtitle: { pt: 'Um retrato do seu estudo até agora', en: 'A snapshot of your study so far' },
  progress_modal_footer:   { pt: 'Continue lendo para manter sua constância viva.', en: 'Keep reading to keep your streak alive.' },

  // ── Settings — avatar & vocabulary management
  avatar_permission_title:    { pt: 'Permissão necessária', en: 'Permission needed' },
  avatar_permission_body:     { pt: 'Precisamos de acesso à galeria para alterar sua foto.', en: 'We need access to your photo library to change your picture.' },
  clear_vocab_confirm_title:  { pt: 'Limpar Vocabulário', en: 'Clear Vocabulary' },
  clear_vocab_confirm_body:   { pt: 'Remover todas as palavras salvas? Esta ação não pode ser desfeita.', en: 'Remove all saved words? This action cannot be undone.' },
  clear_vocab_confirm_action: { pt: 'Limpar', en: 'Clear' },
  word_count_singular:        { pt: 'palavra salva', en: 'saved word' },
  word_count_plural:          { pt: 'palavras salvas', en: 'saved words' },

  // ── Home screen
  home_daily_verse_badge:   { pt: 'Versículo do dia', en: 'Verse of the day' },
  open_action:              { pt: 'Abrir', en: 'Open' },
  continue_label:           { pt: 'Continuar', en: 'Continue' },
  library_section_title:    { pt: 'BIBLIOTECA', en: 'LIBRARY' },
  book_count_singular:      { pt: 'livro', en: 'book' },
  book_count_plural:        { pt: 'livros', en: 'books' },
  library_view_grid_a11y:   { pt: 'Visualização em grade', en: 'Grid view' },
  library_view_list_a11y:   { pt: 'Visualização em lista', en: 'List view' },
  library_search_placeholder: { pt: 'Buscar um livro...', en: 'Search for a book...' },
  library_search_no_results:  { pt: 'Nenhum livro encontrado', en: 'No book found' },
  library_search_clear_a11y:  { pt: 'Limpar busca', en: 'Clear search' },
  library_favorites_title:    { pt: 'Favoritos', en: 'Favorites' },
  library_favorite_add_a11y:  { pt: 'Adicionar aos favoritos', en: 'Add to favorites' },
  library_favorite_remove_a11y: { pt: 'Remover dos favoritos', en: 'Remove from favorites' },
  library_filter_all:         { pt: 'Todos', en: 'All' },
  library_filter_az:          { pt: 'A-Z', en: 'A-Z' },
  study_section_title:      { pt: 'ESTUDO', en: 'STUDY' },
  progress_section_title:   { pt: 'PROGRESSO', en: 'PROGRESS' },
  vocab_section_title:      { pt: 'VOCABULÁRIO', en: 'VOCABULARY' },
  notes_section_title:      { pt: 'ANOTAÇÕES', en: 'NOTES' },
  review_vocabulary_btn:    { pt: 'Revisar Vocabulário', en: 'Review Vocabulary' },
  open_notes_btn:           { pt: 'Abrir Anotações', en: 'Open Notes' },
  note_sample_text:         { pt: 'Jesus é apresentado como eterno, Deus, e a fonte de tudo.', en: 'Jesus is presented as eternal, God, and the source of everything.' },
  testament_old:            { pt: 'Antigo Testamento', en: 'Old Testament' },
  testament_new:            { pt: 'Novo Testamento', en: 'New Testament' },
  testament_old_caps:       { pt: 'ANTIGO TESTAMENTO', en: 'OLD TESTAMENT' },
  testament_new_caps:       { pt: 'NOVO TESTAMENTO', en: 'NEW TESTAMENT' },
  chapter_abbr:             { pt: 'Cap.', en: 'Ch.' },
  chapter_abbr_lower:       { pt: 'cap.', en: 'ch.' },
  of_word:                  { pt: 'de', en: 'of' },
  chapter_count_singular:   { pt: 'capítulo', en: 'chapter' },
  chapter_count_plural:     { pt: 'capítulos', en: 'chapters' },
  progress_streak_suffix:   { pt: ' dias seguidos', en: '-day streak' },
  progress_words_word:      { pt: 'palavras', en: 'words' },
  progress_verses_word:     { pt: 'versículos', en: 'verses' },

  // ── Chapter reader screen
  book_picker_title:        { pt: 'Escolher Livro',   en: 'Choose Book' },
  tap_words_hint:            { pt: 'toque nas palavras', en: 'tap the words' },
  chapter_unavailable_title: { pt: 'Capítulo não disponível', en: 'Chapter not available' },
  chapter_unavailable_sub:   { pt: 'Este capítulo ainda não foi adicionado', en: "This chapter hasn't been added yet" },
  nav_previous:              { pt: 'Anterior', en: 'Previous' },
  nav_next:                  { pt: 'Próximo',  en: 'Next' },
  verse_singular:            { pt: 'versículo',  en: 'verse'  },
  verse_plural:              { pt: 'versículos', en: 'verses' },
  action_explain:            { pt: 'Explicar', en: 'Explain'  },
  action_mark:               { pt: 'Marcar',   en: 'Mark'     },
  action_save:               { pt: 'Salvar',   en: 'Save'     },
  action_note:               { pt: 'Nota',     en: 'Note'     },
  action_practice:           { pt: 'Praticar', en: 'Practice' },
  note_placeholder:          { pt: 'Escreva sua reflexão aqui…', en: 'Write your reflection here…' },
  note_save_button:          { pt: 'Salvar nota', en: 'Save note' },
  explain_sheet_title:       { pt: 'Explicação',            en: 'Explanation' },
  explain_generating:        { pt: 'Gerando explicação…',   en: 'Generating explanation…' },
  explain_error_default:     { pt: 'Erro ao carregar.',     en: 'Error loading.' },
  explain_error_network:     { pt: 'Sem conexão. Tente novamente.', en: 'No connection. Try again.' },
} as const;

export type I18nKey = keyof typeof strings;

export function t(lang: Lang, key: I18nKey): string {
  const entry = strings[key];
  return entry ? entry[lang] ?? entry.pt : key;
}
