# 🐞 BugCatcher PRD v2.0 — Vibe Coder Edition

> **Versão:** 2.0 | **Data:** Fevereiro 2026 | **Owner:** Felipe — ProductLab / MERX | **Target ICP:** Vibe Coders & Solo Builders

---

## 1. Contexto & Reposicionamento

### 1.1. O Problema Real (Revisitado)

O BugCatcher nasceu para resolver um problema duplo que todo vibe coder enfrenta diariamente: você constrói e valida produtos sozinho, sem QA, e seus clientes beta não sabem descrever o que quebraram. O resultado é horas perdidas tentando reproduzir algo que você não viu acontecer.

> **O ciclo de dor do solo builder**
> Você lança um feature → cliente encontra um bug → você recebe uma mensagem como "não funcionou" ou "ficou travado" → você passa 2 horas tentando reproduzir → desiste ou reproduz por acidente. Isso se repete dezenas de vezes por semana durante a fase de validação.

### 1.2. Posicionamento Revisado

> *"O QA do vibe coder. Capture seus próprios bugs e os dos seus clientes — sem precisar de um time de QA, sem complexidade, sem custo de Sentry."*

Esse posicionamento é deliberadamente diferente do mercado atual:

- **Sentry / LogRocket:** Complexos, voltados para times de engenharia, over-engineered para um solo builder
- **Hotjar / FullStory:** Monitoramento de UX, não diagnóstico de bug
- **Jam.dev:** Voltado para times de produto colaborativos, não para dev solo
- **BugCatcher 2.0:** Simples de instalar, dupla função (dev + cliente), triagem por IA que economiza horas do founder

### 1.3. Dois Modos de Uso — O Diferencial Central

| 🔧 Modo Dev (Interno) | 👤 Modo Cliente (Externo) |
|---|---|
| Você mesmo testando durante o build. Reports com máxima profundidade técnica: console errors, network calls, stack traces, estado da aplicação. | Seu usuário beta reportando. Interface simplificada, captura automática de contexto sem intimidar, formulário em linguagem natural. |

---

## 2. ICP & Segmento-Alvo

### 2.1. Perfil do Cliente Ideal

O BugCatcher 2.0 é construído especificamente para:

- Vibe coders e indie hackers que lançam produtos sozinhos ou em duplas
- PMs ou founders técnicos que constroem MVPs sem time de engenharia
- Builders em plataformas no-code/low-code que precisam capturar bugs dos seus clientes (Bubble, Webflow, Glide, FlutterFlow)
- Desenvolvedores solo que gerenciam múltiplos micro-SaaS em paralelo

> **Exemplo de ICP Primário**
> Felipe, CEO de uma micro-consultoria de produto, está validando o AgroMonitor com 15 usuários beta. Não tem QA. Recebe bugs via WhatsApp. Perde 2–3h/semana só em reprodução. Usa o BugCatcher instalado em todos os seus produtos ativos.

### 2.2. Dores Prioritárias por Frequência

| # | Dor | Impacto no Solo Builder |
|---|---|---|
| 01 | Clientes descrevem bugs vagamente ("não funcionou") | Impossível reproduzir sem estar lá na hora |
| 02 | Sem QA = sem processo de teste estruturado | Bugs chegam em produção por falta de cobertura |
| 03 | Múltiplos produtos simultâneos | Contexto de qual projeto, versão, user é perdido |
| 04 | Reprodução manual consome horas por semana | Tempo roubado do build |
| 05 | Sem rastreabilidade do histórico de bugs | Mesmos bugs reaparecem sem diagnóstico de causa raiz |
| 06 | Stack trace existe mas ninguém olha | Erros de console são ignorados porque o usuário não os vê |

---

## 3. Requisitos Funcionais

### 3.1. Widget Frontend — Refatoração Completa

#### 3.1.1. Modo Dev vs. Modo Cliente

O widget deve detectar automaticamente o modo de operação baseado na presença de um flag de configuração na instanciação:

- `devMode: true` → habilita captura técnica profunda, shortcut de teclado (`Ctrl+Shift+B`), painel com mais dados
- `devMode: false` (padrão) → interface simplificada para o usuário final, sem jargão técnico

#### 3.1.2. Telemetria Aprimorada — Modo Dev

Quando operando em Dev Mode, o widget deve capturar e enviar:

- **Console Interceptor:** Captura todos os logs de `console.error`, `console.warn` e `console.log` dos últimos 60 segundos em um buffer circular
- **Network Requests Log:** Interceptação de `XMLHttpRequest` e `fetch` para registrar URL, método, status code, payload (truncado em 2KB), tempo de resposta e erros de rede
- **JavaScript Error Tracker:** `window.onerror` e `window.addEventListener("unhandledrejection")` para captura de erros não tratados com stack trace completo
- **DOM Mutation Observer:** Registro de mudanças significativas no DOM (elementos removidos/adicionados com `id` ou `data-*` relevantes)
- **Performance Metrics:** `window.performance.getEntriesByType("navigation")` e `"resource"` para LCP, FID, CLS aproximados
- **Local Storage Snapshot:** Estado atual das chaves relevantes de `localStorage` e `sessionStorage` — nunca capturar tokens ou passwords
- **Redux / Zustand State Snapshot (opcional):** Se o dev configurar um `stateGetter` callback, o estado da aplicação é capturado no momento do report

#### 3.1.3. Telemetria Base — Modo Cliente

Captura automática e sem fricção que não intimida o usuário não-técnico:

- URL exata no momento do report
- User Agent, OS, browser versão, viewport (largura × altura)
- Timestamp com timezone
- Session ID do Microsoft Clarity (se presente) com deeplink direto
- Screenshot da tela atual via `html2canvas` — 1 captura no momento exato do clique
- Visual Timeline: buffer das últimas 5 capturas (reduzido de 10 para performance)
- rrweb events dos últimos 45 segundos

#### 3.1.4. Formulário do Report — UX Revisada

O formulário atual é genérico. Precisa ser reformulado por modo:

- **Modo Dev:** Campo de título, descrição livre, seletor de severidade manual, checkbox "marcar como crítico para deploy"
- **Modo Cliente:** Apenas uma pergunta — *"O que você tentava fazer quando isso aconteceu?"* — sem campos técnicos. Opcionalmente: selector visual de emoção (😕 🤯 😡) para severidade intuitiva

> **Princípio de UX para Modo Cliente**
> O usuário beta não deve sentir que está "preenchendo um formulário técnico". A experiência deve parecer mandar uma mensagem de voz — só que com todo o contexto capturado automaticamente por baixo dos panos.

---

### 3.2. Upload de Assets — Arquitetura Revisada

O envio de screenshots em base64 via POST é um ponto crítico de falha. A solução exige uma arquitetura de dois passos:

1. Widget solicita URL pré-assinada ao backend (`/api/presign`) para cada asset antes de enviar o report
2. Widget faz upload direto para **R2 (Cloudflare)** ou **S3** via URL pré-assinada — fora do payload principal
3. Widget envia o report com referências (keys) dos assets já armazenados, não os dados binários
4. Backend processa o report referenciando os assets por URL permanente

**Benefícios:** elimina timeouts, reduz payload de ~3MB para <10KB, permite retry de assets independentemente do report.

---

### 3.3. Backend — Novos Endpoints

| Endpoint | Método | Responsabilidade |
|---|---|---|
| `/api/presign` | POST | Gera URL pré-assinada para upload direto de screenshots/vídeos para R2/S3 |
| `/api/report` | POST | Recebe report (sem assets binários), valida `projectKey`, dispara AI triage em background |
| `/api/report/:id` | GET | Retorna report completo com status da triagem de IA e assets resolvidos |
| `/api/projects` | GET/POST | CRUD de projetos com suporte a configuração de modo (dev/client) por projeto |
| `/api/health` | GET | Health check do serviço + status da fila de processamento de IA |
| `/api/webhook/:projectKey` | POST | Envio de report para Slack, Linear, Jira ou ClickUp após triagem |

---

### 3.4. AI Triage — Aprimoramento do Prompt e Output

#### 3.4.1. Contexto adicional para o LLM

O prompt atual envia descrição + logs + screenshots. Para o novo escopo, o contexto deve ser expandido:

- **Console errors:** Lista formatada de erros capturados com timestamp relativo ao momento do report
- **Network failures:** Requisições com status 4xx/5xx ou que falharam com network error
- **Performance context:** Se métricas foram capturadas, incluir no contexto (ex: *"LCP de 8.2s no momento do bug"*)
- **App state:** Se `stateGetter` foi configurado, incluir snapshot do estado no prompt
- **Histórico do projeto:** Últimos 5 bugs do mesmo projeto como contexto de padrões recorrentes

#### 3.4.2. Output estruturado expandido

O JSON retornado pela IA deve ser expandido com os seguintes campos adicionais:

```json
{
  "summary": "...",
  "stepsToReproduce": ["..."],
  "severity": "BAIXA | MÉDIA | ALTA | CRÍTICA",
  "replayInsights": "...",
  "rootCause": "Hipótese de causa raiz (ex: race condition entre auth e render)",
  "affectedComponent": "Componente ou rota provável",
  "isRecurring": true,
  "suggestedFix": "Sugestão de código ou abordagem",
  "relatedBugIds": ["bug_id_1", "bug_id_2"],
  "devTimeEstimate": "LOW | MEDIUM | HIGH"
}
```

#### 3.4.3. Retry e Resiliência

O processamento atual não tem gerenciamento de falhas. Implementar:

- **Fila com Inngest** (ou similar): job de triagem com retry automático — 3 tentativas com backoff exponencial
- **Status granular:** `PENDING` → `PROCESSING` → `COMPLETED` | `FAILED_AI`
- **Fallback sem IA:** Se a triagem falhar após retries, o report fica disponível com os dados brutos e label *"Triagem manual necessária"*

---

## 4. Modelo de Dados — Schema Revisado

### 4.1. Migração para PostgreSQL

O `db.json` é suficiente para o MVP mas precisa ser substituído antes da validação com usuários reais. A migração para PostgreSQL via Prisma já está arquitetada — o principal trabalho é conectar e provisionar. **Neon.tech** ou **Supabase** são as opções mais rápidas para um solo builder (free tier generoso).

### 4.2. Campos Adicionais no Schema

| Model | Campo Novo | Descrição |
|---|---|---|
| `Project` | `mode` | Enum `DEV \| CLIENT \| DUAL` — define o modo padrão do widget |
| `Project` | `webhookUrl` | URL para envio automático pós-triagem (Slack/Linear/Jira) |
| `Project` | `captureConfig` | JSON com flags: `captureConsole`, `captureNetwork`, `captureState`, `screenshotInterval` |
| `Report` | `consoleErrors` | JSON array com erros de console capturados |
| `Report` | `networkLog` | JSON array com requests/responses relevantes |
| `Report` | `appStateSnapshot` | JSON com estado da aplicação no momento do bug (opcional) |
| `Report` | `performanceMetrics` | JSON com LCP, FID, CLS, TTFB capturados |
| `Report` | `rootCause` | Hipótese de causa raiz gerada pela IA |
| `Report` | `suggestedFix` | Sugestão de correção gerada pela IA |
| `Report` | `devTimeEstimate` | Enum `LOW \| MEDIUM \| HIGH` para estimativa de correção |
| `Report` | `isRecurring` | Boolean — bug com padrão recorrente no projeto |
| `Report` | `relatedBugIds` | Array de IDs de bugs relacionados no mesmo projeto |
| `Report` | `assetKeys` | Array de keys no R2/S3 (substitui base64 inline) |
| `Report` | `mode` | Enum `DEV \| CLIENT` — registra em qual modo o report foi criado |

---

## 5. Dashboard — Funcionalidades Prioritárias

### 5.1. Visão Geral por Projeto

Para o solo builder, clareza imediata sobre o que precisa de atenção:

- **Heat score por projeto:** índice calculado de urgência (bugs críticos abertos × tempo médio sem resolução)
- **Separação visual por modo:** aba *Dev Reports* e *Client Reports* em cada projeto
- **Filtro por componente afetado:** quando a IA identifica o componente, é possível filtrar por ele
- **Bug recorrente destacado:** badge visual em bugs com `isRecurring = true`

### 5.2. Bug Detail Page — Redesign

Layout em três blocos:

- **Bloco 1 — Diagnóstico da IA:** `rootCause`, `suggestedFix`, `devTimeEstimate`, severity em destaque no topo
- **Bloco 2 — Timeline Visual:** sequência de screenshots + replay de eventos em ordem cronológica
- **Bloco 3 — Dados Técnicos:** console errors, network log, performance metrics, app state — em abas colapsáveis para não poluir

### 5.3. Quick Actions

- Criar ticket no Linear/Jira com 1 clique (usando os dados da triagem de IA como corpo do ticket)
- Copiar *Steps to Reproduce* formatados para colar em qualquer ferramenta
- Marcar como *"Não consigo reproduzir"* — para rastrear bugs e identificar padrões
- Atribuir a mim mesmo / marcar como em progresso

---

## 6. Mapa de Mudanças — O Que Construir

### 6.1. Status de Cada Componente

| Feature / Componente | Status Atual | Ação Necessária | Prioridade |
|---|---|---|---|
| Widget — Modo Dev/Cliente | Inexistente | Criar flag `devMode` com configuração na instanciação | **P0 — Crítico** |
| Console Interceptor | Inexistente | Adicionar captura de `console.error/warn` com buffer circular | **P0 — Crítico** |
| Network Request Log | Inexistente | Interceptar XHR/fetch, logar status, URL, tempo de resposta | **P0 — Crítico** |
| JS Error Tracker | Inexistente | `window.onerror` + `unhandledrejection` → buffer | **P0 — Crítico** |
| Upload via URL Pré-assinada | Inexistente | Substituir base64 inline por upload direto R2/S3 | **P0 — Crítico** |
| Migração PostgreSQL | Parcial (schema pronto) | Conectar Prisma ao Neon ou Supabase, remover `db.json` | **P0 — Crítico** |
| AI Triage — Output expandido | Parcial | Adicionar `rootCause`, `suggestedFix`, `isRecurring`, `relatedBugIds` | P1 — Alto |
| Fila de processamento (Inngest) | Inexistente | Substituir background async por job resiliente com retry | P1 — Alto |
| Formulário UX por modo | Inexistente | Redesenhar modal para Dev vs. Cliente | P1 — Alto |
| Performance Metrics (web-vitals) | Inexistente | Capturar LCP/CLS/FID no momento do report | P1 — Alto |
| Dashboard — Bug Detail expandido | Básico | Adicionar blocos de diagnóstico IA, timeline e dados técnicos | P1 — Alto |
| App State Snapshot (opcional) | Inexistente | Callback `stateGetter` configurável pelo dev | P2 — Médio |
| Webhook pós-triagem | Inexistente | Envio automático para Slack/Linear após triagem completa | P2 — Médio |
| DOM Mutation Observer | Inexistente | Registrar mudanças DOM significativas | P2 — Médio |
| Bug recorrente detection | Inexistente | Comparar embeddings ou keywords entre bugs do projeto | P2 — Médio |
| Visual Timeline — Otimização | Existente (10 frames) | Reduzir para 5 frames, otimizar compressão | P2 — Médio |
| rrweb integration | Existente | Manter, ajustar buffer de 60s → 45s | P3 — Baixo |
| Microsoft Clarity Session | Existente | Manter sem alterações | P3 — Baixo |

---

## 7. Roadmap de Execução

### Sprint 1 — Fundação (Semana 1–2)
**Objetivo:** Resolver os bloqueadores técnicos críticos antes de qualquer feature nova.

1. Migrar banco de dados: conectar Prisma ao Neon.tech (free tier), remover `db.json`, testar CRUD completo
2. Refatorar upload de assets: implementar `/api/presign` + upload direto R2 via `@aws-sdk/client-s3`
3. Adicionar Console Interceptor no `widget.js`: buffer circular de 60 eventos
4. Adicionar Network Request Log no widget: interceptar XHR/fetch com wrapper
5. Adicionar JS Error Tracker: `window.onerror` + `unhandledrejection`

### Sprint 2 — Modo Dev (Semana 3–4)
**Objetivo:** Tornar o BugCatcher uma ferramenta poderosa para o próprio dev usar durante o build.

1. Implementar flag `devMode` na instanciação do widget
2. Criar formulário diferenciado para Dev Mode (shortcut `Ctrl+Shift+B`, severidade manual)
3. Expandir output da IA: adicionar `rootCause`, `suggestedFix`, `devTimeEstimate`
4. Implementar fila de processamento com Inngest (retry automático)
5. Captura de Performance Metrics (web-vitals library)

### Sprint 3 — Experiência Cliente (Semana 5–6)
**Objetivo:** Tornar o report de cliente tão simples que qualquer usuário consiga usar sem instrução.

1. Redesenhar modal do Modo Cliente (pergunta única, emotion selector)
2. Reduzir Visual Timeline para 5 frames com compressão otimizada
3. Dashboard Bug Detail: implementar os 3 blocos (diagnóstico IA, timeline, dados técnicos)
4. Quick Actions: copiar Steps to Reproduce, marcar status

### Sprint 4 — Integrações & Lançamento (Semana 7–8)
**Objetivo:** Fechar o ciclo com integrações que tornam o BugCatcher o hub central de bugs.

1. Webhook pós-triagem: Slack (obrigatório), Linear (prioritário), Jira (nice-to-have)
2. App State Snapshot: documentação e callback `stateGetter`
3. Bug recorrente detection: algoritmo simples de keyword matching entre bugs do projeto
4. Landing page e onboarding de 2 minutos
5. Publicar no Product Hunt e comunidades de indie hackers

---

## 8. Modelo de Monetização

### 8.1. Estratégia para Vibe Coders

O ICP é sensível ao preço mas paga por ferramentas que economizam tempo real:

- **Free tier generoso:** 1 projeto, 50 reports/mês — suficiente para validação de um produto solo
- **Sem cartão no onboarding:** reduz fricção máxima para o indie hacker que quer testar antes de pagar
- **Pricing simples:** uma linha de preço, sem tiers complexos

### 8.2. Planos

| | 🆓 Free | 🚀 Builder — $9/mês | 🏢 Studio — $29/mês |
|---|---|---|---|
| Projetos | 1 | 5 | Ilimitados |
| Reports/mês | 50 | 500 | Ilimitados |
| Triagem IA | Básica | Completa | Completa |
| Visual Timeline | ✅ | ✅ | ✅ |
| Dev Mode + Client Mode | ❌ | ✅ | ✅ |
| Console / Network logs | ❌ | ✅ | ✅ |
| Webhooks | ❌ | Slack | Slack + Linear + Jira |
| App State Snapshot | ❌ | ❌ | ✅ |
| Bug recorrente detection | ❌ | ❌ | ✅ |
| Histórico | 7 dias | 90 dias | Ilimitado |

---

## 9. Métricas de Sucesso

### 9.1. KPIs de Produto (3 meses pós-lançamento)

| Métrica | Mês 1 | Mês 2 | Mês 3 |
|---|---|---|---|
| Projetos ativos (widgets instalados) | 10 | 30 | 80 |
| Reports processados / mês | 100 | 500 | 2.000 |
| Taxa de triagem IA bem-sucedida | >85% | >90% | >95% |
| Usuários pagantes (Builder+) | 2 | 8 | 20 |
| MRR | $18 | $72 | $200 |
| Tempo médio de reprodução economizado | não medido | 60 min/semana | 60+ min/semana |

---

## 10. Riscos & Mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Widget pesado impacta performance do app do cliente | **Alta** | Lazy load de rrweb e html2canvas, ativação apenas após trigger manual |
| CSP (Content Security Policy) bloqueia o widget | Média | Documentar headers necessários, oferecer versão self-hosted do script |
| Custo de OpenAI escala antes da receita | Média | Cache de resultados similares, tier free usa modelo menor (GPT-4o-mini) |
| LGPD/GDPR: captura de dados sem consentimento | **Alta** | Exigir banner de consentimento explícito, documentar dados capturados, oferecer modo anonimizado |
| Concorrente (Jam.dev) lança feature similar com IA | Média | Focar no ICP solo builder que Jam.dev não atende — são enterprise-first |

---

## Resumo Executivo

O BugCatcher 2.0 é um reposicionamento cirúrgico: mesmo produto, ICP mais específico, proposta de valor mais honesta. O vibe coder sem QA é o cliente ideal porque sente a dor todo dia, não tem alternativa simples, e paga por ferramentas que economizam tempo real.

Os bloqueadores técnicos — upload de assets via URL pré-assinada, migração para PostgreSQL, fila de retry — precisam ser resolvidos **antes de qualquer feature nova**. Sem isso, a confiabilidade do produto torna qualquer distribuição prematura.

A sequência correta é: **fundação → Dev Mode → Client UX → integrações → lançamento.**