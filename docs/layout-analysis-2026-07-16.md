# Análise de Layout — BreadLight (16/07/2026)

**Escopo:** app mobile (`artifacts/mobile`) e web (`artifacts/bible-english`).
**Método:** dados medidos no código-fonte atual (frequência real de estilos), não impressão visual. Cada número abaixo é reproduzível com grep.

---

## O que já está BOM (não mexer)

| Área | Evidência |
|---|---|
| **Identidade tipográfica** | Só 2 famílias em uso, com papéis claros: Inter (UI, 255 usos em 4 pesos) + Lora (texto bíblico/serif, 28 usos). Nenhuma fonte "perdida". |
| **Unificação web ↔ mobile** | `bible-english/src/lib/atmospheres.ts` espelha *verbatim* as 10 atmosferas do mobile, e `reading-spaces.ts` espelha os 9 Reading Spaces. A divergência de identidade apontada na auditoria de 13/07 **foi resolvida** — os dois apps compartilham nomes e paleta. |
| **Temas dinâmicos** | Home usa `colors.space.gradient` (ambiente selecionado), e `daily.tsx` deriva a paleta do tema via `buildPalette(colors)` — os "gradientes fixos" da auditoria antiga foram em grande parte corrigidos. |
| **Estrutura de tela consistente** | Header + conteúdo + tab bar seguem o mesmo esqueleto em todas as abas. |

---

## Problemas encontrados (dados reais)

### 1. Tipografia sem escala — 20 tamanhos distintos 🔴
`fontSize` em uso: 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 26, 28, 30, 36, 38.

O sintoma mais visível é o **título de header variar por tela sem hierarquia intencional**:

| Tela | fontSize do título |
|---|---|
| Bookmarks, Search, Vocab | 26 |
| Devotional Plans, Journey, Notes | 22 |
| Settings | 20 |

Todas são telas de mesmo nível de navegação — deveriam ter o mesmo tamanho. E `fontSize: 7/8/9` (4 ocorrências) está abaixo do mínimo legível/acessível.

**Correção proposta:** escala tipográfica de 8 passos (ver `constants/design.ts` criado junto com esta análise): 11, 12, 13, 15, 17, 20, 24, 28. Migrar tela a tela — headers primeiro.

### 2. Border radius aritmético — 36 derivações ad-hoc 🟠
Existe um token (`colors.radius`), mas ele é constantemente "ajustado na unha":

```
21× colors.radius / 1.5      8× colors.radius / 2
 3× colors.radius - 2        2× colors.radius + 2
 1× colors.radius / 1.6      1× colors.radius - 4
```

`radius / 1.5` e `radius / 1.6` no mesmo app é o exemplo perfeito: mesma intenção, resultado diferente. **Correção:** variantes nomeadas `radius.sm / md / lg / pill` e proibir aritmética.

### 3. Espaçamento sem grade 🟠
`paddingHorizontal` em uso: 4, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 40 (12 valores). Os dois mais comuns (20× e 14×) nem pertencem à mesma grade. **Correção:** grade de 4px (4, 8, 12, 16, 20, 24, 32, 40) — os valores 9, 11, 14 e 18 são os únicos que precisam mudar (para 8, 12, 16 e 20), mudança visualmente imperceptível.

### 4. Sombras copiadas e coladas 🟡
`shadowColor: '#000'` + opacity/radius/offset duplicados em **6 arquivos**. Nenhum token de elevação. Em temas escuros, sombra preta pura some ou "suja" — um token permitiria ajustar por atmosfera. **Correção:** `elevation.low / mid / high` no design.ts.

### 5. Cores fora do sistema de temas 🟡
Hex hardcoded em componentes (fora de `constants/colors.ts`): `#FFFFFF` (8×), `#E8294B` (vermelho do coração, 4×), `#6B1E2A`, `#1B3A6B`, `#EFD79C`… O vermelho de "curtir" repetido 4× é o caso claro de token semântico faltando (`colors.heart`). Branco fixo sobre imagem é aceitável, mas merece nome (`colors.onImage`).

### 6. Acessibilidade — o maior gap numérico 🔴
**~393 elementos tocáveis** (`TouchableOpacity`/`Pressable`) no app e apenas **9 `accessibilityLabel`**. Praticamente todos os botões só-de-ícone (fechar, tocar áudio, favoritar, deletar…) são invisíveis para leitores de tela — num app cristão que quer alcançar todo mundo, incluir leitores cegos importa também na missão. **Correção:** passe único adicionando `accessibilityLabel` + `accessibilityRole="button"` aos touchables de ícone (usar as chaves i18n existentes). É trabalho mecânico, ~1 sessão.

### 7. Arquivos-god seguem crescendo 🟡
`chapter.tsx` (~1330 linhas) e `settings.tsx` (~1500) concentram leitura+áudio+notas+menus e config+pagamento+modais. Não é bug, mas é onde regressões de layout nascem — qualquer ajuste de estilo nesses arquivos exige varrer centenas de linhas de styles locais. **Correção gradual:** extrair o menu de ações do versículo, o sheet de explicação e os modais grandes de settings para componentes.

---

## Plano de execução sugerido (ordem de custo-benefício)

1. **`constants/design.ts`** (criado ✅ junto desta análise) — tokens de tipografia, espaçamento, radius e elevação, documentados, prontos pra importar.
2. **Headers das 7 telas** → mesmo token de título (1h de trabalho, maior ganho visual imediato).
3. **Passe de `accessibilityLabel`** nos touchables de ícone (mecânico, alto impacto de inclusão).
4. **Sombras → token de elevação** nos 6 arquivos.
5. **Radius nomeado** — substituir as 36 aritméticas por `sm/md/lg/pill`.
6. **Grade de espaçamento** — trocar 9→8, 11→12, 14→16, 18→20 ao tocar cada tela (oportunista, não big-bang).
7. **Token `colors.heart`** e limpeza dos hex avulsos.
8. Extração de componentes dos arquivos-god (contínuo).

> Itens 2–7 são seguros de fazer incrementalmente — nenhum exige redesign, só consolidam o que o app já faz no caso mais comum.
