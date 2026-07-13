# Auditoria BreadLight — Produto, UX, UI, Arquitetura e Técnica

**Data:** 13 de julho de 2026
**Escopo:** App mobile (Expo/React Native, `artifacts/mobile`), site web (`artifacts/bible-english`) e API server (`artifacts/api-server`).
**Natureza deste documento:** auditoria apenas — nenhum código foi alterado. Serve de base para uma decisão de priorização antes de qualquer implementação.

> Nota metodológica: cada afirmação abaixo foi verificada lendo o código-fonte atual (não apenas a memória de sessões anteriores). Onde uma suspeita não pôde ser confirmada por teste ponta-a-ponta (por uma interrupção de faturamento durante esta sessão), isso é sinalizado explicitamente.

---

## Resumo executivo

O BreadLight já tem uma base sólida e, em vários pontos, mais avançada do que o documento de briefing presume — o sistema de "Ambientes de Leitura" e a estante de couro já existem no mobile (não são cards genéricos, não têm temas de golfe/futebol/carros). O maior gap real não é visual: é que **o produto ainda não entrega uma experiência de "aprender idioma" mensurável** (sem repetição espaçada, sem progresso, sem streak) e que **o motor de voz depende de um workaround** (chat completions com modalidade de áudio, não uma API de TTS dedicada) que limita naturalidade e controle de prosódia. Também existe uma divergência real de identidade visual entre mobile e web (dois sistemas de atmosfera com nomes e paletas diferentes), e dois bugs ativos relatados hoje pelo usuário na leitura contínua e no menu de ações do versículo.

---

## FASE 1 — Auditoria Completa do Produto

### Mobile (`artifacts/mobile`)

| Tela | Propósito | Estado atual |
|---|---|---|
| `app/(tabs)/index.tsx` (Home) | Saudação, versículo do dia, card de Estudo (accordion), estante de livros | Funcional. Mistura de idiomas no código-fonte (`WEEKDAYS_PT` ao lado de rótulos em inglês), contagem de "125k" curtidas fixa (mock), estilo de destaque do "Reading Space" duplicado em vários pontos do arquivo |
| `app/chapter.tsx` | Leitura de capítulo bilíngue, áudio, anotações, modo foco | Robusto, mas é o maior arquivo do app (~1300 linhas) concentrando leitura + áudio + notas + menu de ações + explicação IA. Números mágicos no posicionamento do menu popup |
| `app/daily.tsx` | Devocional diário com reflexão gerada por IA e prática de pronúncia | Paleta do player de áudio fixa no código (não usa o tema atual) |
| `app/bookmarks.tsx` | Lista de versículos salvos | Sem busca ou filtro por livro |
| `app/vocab.tsx` | Dicionário pessoal de palavras salvas | Componente de flashcard existe mas não está conectado a nenhuma lógica de revisão real |
| `app/search.tsx` | Busca bíblica por palavra-chave/tópicos | Rótulo de contagem de resultados fixo em português mesmo com app em inglês; busca não cobre metadados de livro/capítulo |
| `app/(tabs)/settings.tsx` | Configuração (atmosfera, vozes, idioma, doação, embaixador, suporte) | Arquivo grande (~1500 linhas) misturando UI de configuração com lógica de pagamento e múltiplos modais grandes |
| `app/auth.tsx` | Login/cadastro com tema "mapa do tesouro" | **Login Google/Apple não funcional (placeholders)**; envio de formulário é um `setTimeout` simulado — não autentica de fato |

**Componentes centrais:** `AudioPlayer`, `BookshelfLibrary`, `VerseRow`, `WordModal`, `SpaceBackground`.

### Pontos fortes
- Arquitetura de áudio unificada (uma única fila global compartilhada entre telas) já é um padrão maduro, raro em apps desse porte.
- Cache de TTS em disco + fallback para `expo-speech` é uma solução de engenharia real para conectividade instável, não um placeholder.
- Sistema de temas (10 atmosferas) e estante de livros com couro fotorreal já atingem boa parte da "Fase 6/7/8" pedida no briefing.

### Fraquezas / débito técnico
- **Autenticação social é decorativa** — bloqueador para qualquer feature que dependa de conta real (sincronizar progresso entre dispositivos, por exemplo).
- Arquivos-god (`chapter.tsx`, `settings.tsx`) misturam responsabilidades e dificultam manutenção seguras.
- Diversos textos fixos em um único idioma independente do idioma selecionado (ver Fase 3).
- Acessibilidade: a maioria dos ícones tocáveis (Feather/MaterialCommunityIcons) não tem rótulo acessível; nenhuma tela foi auditada para contraste WCAG.
- Feature de "Embaixador"/assinatura tem UI pronta mas lógica de fato é um alerta "Em breve".

---

## FASE 2 — Auditoria da Experiência de Aprendizado de Idiomas

O app oferece leitura bilíngue de qualidade, mas **hoje não é, na prática, um app de aprendizado de idiomas — é um app de leitura bilíngue com ferramentas de apoio**. Distinção importante porque muda a priorização:

| Recurso | Ajuda a aprender o idioma? | Motivo |
|---|---|---|
| Leitura bilíngue (EN/PT) | Parcialmente | Bom para compreensão, mas não força produção/recuperação ativa da língua |
| Vocabulário (`vocab.tsx`, `WordModal`) | Não, hoje | "Aprendendo/Dominada" é um toggle manual — sem repetição espaçada (SRS), sem agendamento de revisão. Dicionário é estático (`constants/wordDictionary.ts`), não expande com uso |
| Pronúncia (`PronunciationPractice`) | Sim, parcialmente | Usa transcrição real via `gpt-4o-mini-transcribe` e calcula uma métrica de clareza/ritmo — é a peça mais "aprendizado ativo" que existe hoje, mas o feedback não é numérico nem evolutivo (não guarda histórico de progresso de pronúncia) |
| Explicar versículo (IA) | Sim, como suporte à compreensão | Não pratica produção da língua, apenas explica em linguagem simples |
| Estudo (Home) | Parcialmente | Hoje fixo em João 1 — não escala nem se adapta ao nível do usuário |
| Nível de inglês (`LevelPillSelector`) | Não, hoje | É salvo mas nada no app se adapta a ele (nenhum conteúdo é filtrado/ajustado por nível) |

**Recomendação de direção (não implementação):** a alavanca de maior impacto de aprendizado não é visual — é fechar o loop de repetição espaçada no vocabulário e fazer o "Nível" selecionado realmente influenciar dificuldade/conteúdo.

---

## FASE 3 — Auditoria do Sistema de Idiomas

Confirmado: existem **dois conceitos de idioma completamente separados e não óbvios para o usuário**, e isso já gerou o bug relatado nesta mesma sessão (áudio saindo em inglês mesmo com o app em português):

1. `LanguageContext` — idioma da interface (PT/EN), persistido em `@breadlight:lang`.
2. `AudioContext.readingLanguage` — idioma em que o texto é lido em voz alta, persistido separadamente em `@bibliaeN:readingLanguage`.

Não existe hoje um terceiro conceito de "idioma que estou aprendendo" distinto de "idioma nativo" — o app assume implicitamente que o usuário fala português e está aprendendo inglês. **Não há qualquer estrutura, nem placeholder, para espanhol, francês, alemão, italiano, japonês, coreano, grego bíblico ou hebraico bíblico** — nem nos tipos (`Atmosphere`/`AccentColor`/`ReadingLanguage` são todos union types fechados de 2 valores), nem na UI, nem no armazenamento de texto (cada versículo só tem campos `.en` e `.pt`).

No site web (`bible-english`), a interface já é estruturalmente diferente: os modos são "Somente inglês / Bilíngue / Modo Estudo" — um paradigma de exibição, não de idioma nativo do usuário. Não há troca real de "idioma nativo" no web hoje (tarefa #12, já proposta, cobre trazer o toggle PT/EN do mobile para o web).

**Conclusão:** oferecer múltiplos idiomas de aprendizado no futuro exigiria uma reestruturação de dados (versículos por idioma, não campos fixos `.en`/`.pt`) — é viável, mas é uma mudança de arquitetura, não um ajuste de UI.

---

## FASE 4 — Auditoria da Experiência de Voz (Crítico)

Esta é a área com o gap técnico mais concreto encontrado na auditoria.

**Como funciona hoje:** o endpoint `/api/tts` (`artifacts/api-server/src/routes/tts.ts`) **não usa a API de TTS dedicada da OpenAI**. Por uma limitação confirmada no próprio código (comentário no arquivo): o proxy de AI Integrations do Replit não suporta `POST /audio/speech`, então o áudio é gerado via `chat.completions.create` com `model: "gpt-audio"` e `modalities: ["text", "audio"]` — um workaround. Isso explica diretamente os sintomas descritos no briefing (ritmo/entonação não naturais): esse caminho tem menos controle de prosódia do que uma API de TTS dedicada, porque tecnicamente é um modelo de conversação "narrando" texto, não um sintetizador de fala otimizado.

### Comparativo de alternativas

| Provedor | Naturalidade/Emoção | Ritmo para narração bíblica | Latência | Custo relativo | Complexidade de integração |
|---|---|---|---|---|---|
| **ElevenLabs** | Muito alta — controle fino de estilo/pausas, vozes com timbre "narrador" | Excelente para textos longos e devocionais (foi desenhado para audiobooks) | Baixa (streaming) | Médio-alto por caractere | **Já existe um conector Replit para ElevenLabs, hoje não configurado** — integração de baixo atrito |
| OpenAI TTS dedicado (`tts-1`/`tts-1-hd`/`gpt-4o-mini-tts`) | Boa, mas ainda genérica em cadência longa | Boa | Baixa | Baixo | Mesmo bloqueio atual (proxy não expõe `/audio/speech`) — precisaria de chave OpenAI própria (fora do AI Integrations) ou de suporte adicionado ao proxy |
| Azure Neural Voices | Alta, com SSML fino (pausas, ênfase) | Muito boa — SSML permite controlar pausas entre versículos | Baixa | Médio | Sem conector nativo hoje — exigiria integração custom |
| Google Cloud TTS | Alta (WaveNet/Neural2) | Boa | Baixa | Médio | Sem conector nativo hoje |
| Amazon Polly | Média-alta (Neural) | Boa, menos expressiva que as acima para tom devocional | Baixa | Baixo | Sem conector nativo hoje |

**Recomendação de direção:** ElevenLabs é a opção de menor atrito técnico (conector já disponível) e a mais alinhada ao objetivo de "soar como um narrador humano e caloroso" pedido no briefing. Uma migração seria: manter a mesma arquitetura de fila/cache já existente no `AudioContext` (ela é agnóstica de provedor), trocar apenas a chamada do servidor e o cache de voz. Isso é uma mudança de médio porte, não trivial, mas bem isolada.

### Bugs de áudio já ativos hoje (relatados nesta sessão, ainda não confirmados por teste automatizado devido a uma interrupção de faturamento)
- **Leitura automática para após o primeiro versículo:** suspeita levantada no código — o efeito em `app/chapter.tsx` que decide avançar de capítulo (linhas ~257-266) compara `audio.queueKey === chapterQueueKey`, e `chapterQueueKey` inclui o idioma de leitura; isso pode gerar uma condição de corrida quando o idioma é alternado ou quando o estado `idle` é observado num momento intermediário. **Não confirmado por teste real ainda — é a próxima ação recomendada antes de qualquer mudança de voz maior.**
- **Menu de ações do versículo (Explicar/Marcar/Salvar/Nota/Praticar) não fecha ao tocar fora:** confirmado por leitura de código — o componente é um `Animated.View` sem `Pressable`/overlay de fundo; hoje só fecha ao rolar a lista ou reselecionar o mesmo versículo, não há handler de toque-fora.

---

## FASE 5 — Auditoria do Player de Áudio

| Recurso pedido | Status |
|---|---|
| Play/Pause/Resume | ✅ Implementado |
| Seek (arrastar na barra) | ✅ Implementado (`seekToRatio`) |
| Velocidade de reprodução | ✅ Implementado (0.5x–2.0x) |
| Repetir versículo | ❌ Ausente |
| Repetir capítulo | ❌ Ausente (para no fim da fila) |
| Continuar ouvindo (entre capítulos) | ✅ Implementado (mergeado recentemente) — ver bug acima |
| Sincronizar destaque do versículo com a leitura | ⚠️ Parcial — o contexto sabe qual item está tocando (`currentIndex`), mas não há highlight visual consistente amarrado a isso na UI de leitura |
| Lembrar posição de reprodução | ❌ Ausente — reinicia ao fechar o app |
| Compartilhar versículo a partir do player | ❌ Ausente |
| Áudio em segundo plano / tela bloqueada | ❌ Ausente — `staysActiveInBackground: false` está explicitamente configurado; nenhuma integração com controles de tela de bloqueio/Bluetooth (já existe tarefa proposta #8 para isso) |

---

## FASE 6 — Auditoria dos Ambientes de Leitura

**Importante: esta fase do briefing já está resolvida no mobile, mas não no web.**

O sistema atual de "Ambientes de Leitura" no mobile (`constants/colors.ts`, `ThemeContext.tsx`) tem 10 presets, todos apropriados para leitura — nenhum tema de golfe, futebol, carros ou estilo de vida: Pergaminho, Aconchego, Clássico, Escuro, Noite, Biblioteca, Manhã, Minimalista, Sépia e Foco. Existe inclusive um mapa de migração (`LEGACY_TEMPLATE_TO_SPACE`) que converte automaticamente contas antigas que tinham os temas de hobby para os novos ambientes calmos — ou seja, esse problema já foi identificado e corrigido numa iteração anterior.

**Gaps reais:**
- Aplicação inconsistente: a estante (Home) usa um gradiente de madeira fixo no código, não o ambiente selecionado; o devocional diário (`daily.tsx`) usa a cor de destaque mas não o gradiente completo do ambiente.
- **O site web não tem nenhum sistema equivalente** de ambientes de leitura vindo do mobile — ele tem o seu próprio sistema de temas ("Classic Parchment", "Oxford Paper", "Scholar", "Night Study", "Study Notebook"), com nomes e paleta diferentes dos 10 do mobile. Isso é uma divergência de identidade de marca entre as duas plataformas (tarefa #5 tratou de "trazer" a atmosfera para o web, mas os nomes/paletas não foram unificados com o mobile).

---

## FASE 7 — Auditoria da Biblioteca Bíblica

A estante (`BookshelfLibrary.tsx`) **já não é um grid de cards genérico** — já é volumes de couro com textura fotográfica, cores por categoria (10 tons de couro diferentes), tipografia dourada, marcadores em relevo com glifos temáticos, lombada com sombra e uma fita de marcador vermelha no livro atual. Isso atinge boa parte do objetivo "estante pessoal premium, colecionável" do briefing.

**O que falta para o objetivo completo:**
- Bordas de página douradas (gilded page edges) — não existem hoje.
- No site web, não existe nenhum tratamento equivalente — a biblioteca lá ainda usa elementos de UI genéricos, sem o conceito de couro/estante.

---

## FASE 8 — Sistema de Capas de Livro

Componentes presentes hoje na capa de cada livro (mobile): couro fotográfico tingido por categoria, tipografia dourada em relevo com sombra de texto, marca d'água de algarismo romano, lombada com costura, fita de marcador (só no livro atual). **Ausente:** bordas de página douradas, e o conceito ainda não existe no web. Não há, hoje, geração de textura por categoria (é uma única textura reutilizada com tingimento) — decisão de custo/benefício já tomada numa sessão anterior, funciona bem visualmente.

---

## FASE 9 — Auditoria do Design System

**BreadLight já tem uma identidade visual reconhecível** (tipografia serifada Lora + Inter, paleta terrosa/dourada, motivo de couro e pergaminho) — isso é uma base real, não precisa ser inventada do zero. O problema não é falta de identidade, é **aplicação inconsistente da identidade que já existe**:

- Tipografia: fontes majoritariamente centralizadas (Inter/Lora), mas tamanhos e pesos de cabeçalho variam tela a tela sem uma escala (ex.: cabeçalho de 26px em uma tela, 22px em outra, sem justificativa de hierarquia).
- Espaçamento: não há uma escala central — cada arquivo define seus próprios números (`padding: 20`, `PAD: 16`, etc.).
- Border radius: existe um token central (`colors.radius`), mas é frequentemente ajustado ad-hoc (`colors.radius - 2`, `colors.radius + 2`) em vez de ter variantes nomeadas (sm/md/lg).
- Sombras: hardcoded em telas individuais (`shadowColor: '#000'` repetido) em vez de um token de elevação.
- **Divergência entre plataformas:** o web tem seu próprio sistema de nomes de tema, diferente do mobile (ver Fase 6) — do ponto de vista de marca, hoje existem duas identidades de "atmosfera" coexistindo.

---

## FASE 10 — Auditoria da Experiência da Home

A Home hoje tem: saudação dinâmica, card do versículo do dia (expansível, com curtida e seletor de tamanho de texto), card de Estudo em accordion (Ler/Ouvir/Focar/Refletir — hoje fixo em João 1), e a estante de livros.

**O que falta para reforçar o hábito diário:**
- Nenhum indicador de sequência/streak de leitura.
- Nenhum "continuar de onde parei" — o progresso de leitura (`readingProgress` no `BibleContext`) existe nos dados mas não aparece como uma ação na Home.
- Nenhuma entrada de busca na Home (busca é uma aba separada).
- Card de Estudo é estático (sempre João 1) — não gira nem se adapta.

---

## FASE 11 — Roadmap de Produto

### Melhorias Rápidas (baixa complexidade, alto valor imediato)
1. Corrigir o bug de leitura automática parando após o primeiro versículo (crítico — reportado hoje).
2. Adicionar overlay de toque-fora para fechar o menu de ações do versículo (crítico — reportado hoje).
3. Adicionar "Continuar de onde parei" na Home usando dados de `readingProgress` já existentes.
4. Unificar nomes/paleta de ambientes de leitura entre mobile e web.
5. Corrigir textos fixos em um único idioma independente da seleção (contagem de busca, rótulos remanescentes).

### Melhorias Médias (esforço moderado, impacto estrutural)
6. Repetir versículo / repetir capítulo no player.
7. Lembrar posição de reprodução entre sessões.
8. Áudio em segundo plano / tela bloqueada (já proposto como tarefa #8).
9. Repetição espaçada (SRS) real no vocabulário, substituindo o toggle manual "Aprendendo/Dominada".
10. Fazer o "Nível" de inglês selecionado realmente influenciar conteúdo/dificuldade.
11. Criar escala central de espaçamento e tipografia (tokens) e migrar as telas mais divergentes.

### Melhorias Grandes (arquitetura, múltiplos sprints)
12. Migrar o motor de voz para ElevenLabs (conector já disponível) — arquitetura de fila/cache atual pode ser reaproveitada.
13. Reestruturar o armazenamento de texto bíblico para suportar mais de dois idiomas (hoje é `.en`/`.pt` fixos).
14. Autenticação real (hoje é decorativa) — pré-requisito para sincronizar progresso entre dispositivos.
15. Card de Estudo dinâmico (não fixo em João 1), adaptado a nível/progresso do usuário.

### Visão de Futuro
16. Suporte a idiomas adicionais (espanhol, francês, alemão, grego/hebraico bíblico) — depende diretamente do item 13.
17. Sistema de progresso gamificado (streak, marcos) ancorado em dados reais de leitura/prática já coletados.
18. Sincronização de conta entre mobile e web (depende do item 14).

---

## Próximos passos

Este documento é apenas a auditoria — nenhuma alteração de código foi feita. Aguardando sua decisão sobre por onde começar (ex.: os dois bugs críticos primeiro, ou uma das frentes maiores do roadmap).
