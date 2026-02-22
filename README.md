# BugCatcher v2.0 🐞

O **BugCatcher** é uma plataforma inovadora de report de bugs hiper-contextualizados, projetada tanto para desenvolvedores ("Dev Mode") quanto para usuários leigos ("Client Mode"). Diferente dos sistemas tradicionais que apenas capturam um formulário ou uma foto estática, o BugCatcher grava silenciosamente os **segundos finais antes do erro**, capturando a tela, logs de rede, console e até mesmo o estado global da aplicação.

Atualmente, o projeto está na versão **Local MVP (Vibe Coder Edition)**, operando com infraestrutura 100% local (sem dependência imediata de bancos SQL serverless ou buckets S3 web), focando na agilidade e testabilidade completa em ambiente de desenvolvimento.

---

## 🏗 Arquitetura e Estrutura do Projeto

O projeto é construído em cima de uma stack moderna e robusta, priorizando performance e integrações com IA:

- **Framework Core:** Next.js (App Router) + React
- **Linguagem:** TypeScript (Backend & Dashboard) / JavaScript Vanilla (Widget Client-Side)
- **Estilização:** Tailwind CSS (Dashboard UI)
- **Banco de Dados Local:** Arquivo JSON persistente (`src/lib/db.json` & `db.ts`) simulando uma interface Prisma.
- **Armazenamento de Imagens Local:** As capturas da Timeline são salvas no disco físico (`public/uploads`) via API dedicada.
- **Motor de Replay DOM:** `rrweb` (Geração de snapshot contínuo do DOM para Replay Nativo)
- **Motor Visual (Timeline):** `html2canvas-pro` (Captura visual de telas em alta fidelidade com suporte a CSS Nível 4, ex: `oklch`, `lab`).
- **Cérebro de IA:** Integração com a API da OpenAI (`gpt-4o` com Vision) executando triage automático em background.

### Organização de Pastas (Highlights)
- `/public/widget.js`: O núcleo client-side. O script que é injetado nas aplicações alvo. Ele escuta cliques, faz os recortes visuais, captura exceptions e intercepta o console/rede.
- `/public/uploads/`: Diretório que atua como o \`S3 bucket\` local. Guarda as capturas de tela geradas durante o reporte.
- `/src/lib/db.ts`: Engine customizada para interagir com o `db.json`, padronizando as chamadas de banco de dados e preparando para uma eventual migração para PostgreSQL Prisma.
- `/src/lib/ai.ts`: Serviço que consome a telemetria bruta e as imagens do BugCatcher e formata um prompt gigantesco para o `GPT-4o` gerar diagnóstico (Root Cause, Fix, Steps to Reproduce).
- `/src/app/api/report/route.ts`: Endpoint principal que recebe o payload massivo do `widget.js`, salva no banco e dispara o processamento de IA em background.
- `/src/app/api/upload/route.ts`: Endpoint que recebe strings Base64 do widget e as converte em arquivos JPEG reais no disco para economia de tráfego no payload principal.
- `/src/app/(dashboard)/`: Interface administrativa completa do Backoffice onde os relatórios são visualizados em ricos painéis e timelines interativas.

---

## 🚀 Funcionalidades Principais

### 1. The "Widget" (Captura Silenciosa e Event-Driven)
O `widget.js` é uma obra de engenharia isolada que roda no navegador do usuário.
- **Visual Capture Event-Driven:** O widget **tira uma foto 1:1 de altíssima qualidade da tela toda vez que o usuário clica**. Através do processo de `onclone`, o widget injeta uma "mira vermelha" escondida do usuário, mas visível na captura, apontando exatamente o alvo do clique `(X, Y)`.
- **Buffer Contínuo:** Ele gera pequenos clipes stop-motion da sua UI (armazenando no máximo de 5 a 10 ultimas fotos) e varre a sujeira periodicamente de forma leve usando `sessionStorage`.
- **Telemetria de Baixo Nível:** Intercepta `fetch`, `XMLHttpRequest` (pegando tempos, erros e status 404+), `console.error/warn/log` e Erros não-tratados (Exceptions), montando uma caixa-preta perfeita.

### 2. Backoffice Dashboard
O Dashboard processa e exibe a "explosão" de dados vindos do widget em três pilares analíticos:
- **AI Triage Insights:** Uma análise automatizada com inteligência artificial, informando a possível "causa raiz", o código sugerido para "resolução", a gravidade e o tempo de desenvolvimento estimado. Ele também conta com uma "narrativa do usuário", explicando passo a passo o que a IA está vendo as imagens da Timeline.
- **Timeline e Replay Visual:** Uma tira em "Stop-Motion" contendo os frames dos cliques cruciais (com os alvos vermelhos nativos), bem como o **Replay Nativo do rrweb** para assistir a renderização em fita K7 exata do DOM.
- **Raw Telemetry Logs:** Abas exclusivas para explorar console logs empilhados com trace, requisições de rede falhas e estado da aplicação (`window.BugCatcherStateGetter`).

### 3. Integrações Smart
- **Clarity Tracker:** Coleta a sessão do Microsoft Clarity via cookie e faz o append inteligente do link direto do vídeo do replay da tela na dashboard.
- **Suporte a Dev/Client Mode:** No modo desenvolvedor (`data-dev-mode="true"`), o widget entrega uma payload bruta violenta com toda a rede interceptada, JS Error Catch e seletor de severidade. No `client_mode`, foca-se em coletar os recursos visuais brutos e ocultar formulários técnicos da visão do QA/User final.

---

## 🛠 Como Rodar (Ambiente Dev)

1. Garanta que você colocou a chave da OpenAI (`OPENAI_API_KEY`) no arquivo `.env`.
2. Rode o servidor Next.js localmente:
   \`\`\`bash
   npm run dev
   \`\`\`
3. Acesse `http://localhost:3000` para ver os botões de simulação e erro na home.
4. Para testar o dashboard, entre em `http://localhost:3000/dashboard`.
5. Acione o widget na tela com **Ctrl+Shift+B** (ou clique no botão redondo do canto inferior direito).

---

> *"The AI doesn't need to guess anymore. We gave it eyes."*
