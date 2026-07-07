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
  tab_settings:      { pt: 'Config.',     en: 'Settings'  },

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
  drawer_nav_language:   { pt: 'Idioma',       en: 'Language'     },
  drawer_nav_audio:      { pt: 'Áudio',        en: 'Audio'        },
  drawer_nav_data:       { pt: 'Dados',        en: 'Data'         },

  // ── Settings screen title
  settings_title:    { pt: 'Configurações', en: 'Settings' },

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
  reading_theme:         { pt: 'Tema de Leitura',  en: 'Reading Theme'       },
  reading_theme_sub:     { pt: 'Pergaminho, Oxford…', en: 'Parchment, Oxford…' },
  accent_color:          { pt: 'Cor de Destaque',  en: 'Accent Color'        },
  reading_bg:            { pt: 'Fundo da Leitura', en: 'Reading Background'  },

  // ── Reading theme names
  theme_classic:   { pt: 'Pergaminho',  en: 'Parchment'  },
  theme_oxford:    { pt: 'Oxford',      en: 'Oxford'     },
  theme_scholar:   { pt: 'Estudioso',   en: 'Scholar'    },
  theme_night:     { pt: 'Noturno',     en: 'Night'      },
  theme_notebook:  { pt: 'Caderno',     en: 'Notebook'   },

  // ── Background template names (already in BACKGROUND_TEMPLATES — kept here for fallback)
  bg_none:         { pt: 'Padrão',    en: 'Default'  },
  bg_golf:         { pt: 'Golfe',     en: 'Golf'     },
  bg_soccer:       { pt: 'Soccer',    en: 'Soccer'   },
  bg_business:     { pt: 'Business',  en: 'Business' },
  bg_sky:          { pt: 'Sky',       en: 'Sky'      },
  bg_forest:       { pt: 'Forest',    en: 'Forest'   },
  bg_sunset:       { pt: 'Sunset',    en: 'Sunset'   },
  bg_car:          { pt: 'Drive',     en: 'Drive'    },

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
} as const;

export type I18nKey = keyof typeof strings;

export function t(lang: Lang, key: I18nKey): string {
  const entry = strings[key];
  return entry ? entry[lang] ?? entry.pt : key;
}
