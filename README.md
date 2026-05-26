# Smart 311 Triage

A single-page Next.js prototype that takes unstructured citizen complaints (natural language) and uses AI (OpenAI GPT-4o-mini) to parse them into structured municipal service tickets with department routing, priority assignment, and a friendly citizen-facing confirmation — all in real time.

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4** (utility-first styling)
- **Framer Motion** (micro-interactions and layout animations)
- **Lucide React** (icon system)
- **Vercel AI SDK v6** (structured AI output via `generateObject`)
- **Zod** (schema validation for AI responses)
- **OpenAI GPT-4o-mini** (LLM for natural language parsing)

## Architecture

```
src/
  app/
    layout.tsx          → Root layout, metadata, hydration suppression
    globals.css         → Tailwind imports + CSS custom properties (light/dark mode)
    page.tsx            → Main UI component (input, loading state, results dashboard)
    api/
      triage/
        route.ts        → API route: AI-powered complaint parsing + mock fallback
```

## How It Works

1. **User types a complaint** in a textarea (any natural language)
2. **Frontend sends POST** to `/api/triage` with the complaint text
3. **API route checks** for an OpenAI API key:
   - If key exists → calls GPT-4o-mini with a structured Zod schema
   - If no key → falls back to keyword-matching mock responses
4. **AI returns structured JSON** matching the Zod schema:
   - `citizenResponse`: warm, jargon-free confirmation message
   - `tickets[]`: array of structured tickets (department, issue, priority, location, ETA)
5. **Frontend animates in** a two-column results dashboard

## Key Technical Decisions

### Structured AI Output (not free-text parsing)

Uses `generateObject` from the Vercel AI SDK with a Zod schema. This forces the LLM to return valid, typed JSON — no regex parsing, no prompt-and-pray. The schema defines ticket structure, priority enums, and field descriptions that guide the model.

### Graceful Degradation

If the API key is missing or the AI call fails, the system falls back to a keyword-matching mock that still produces realistic output. The prototype always works.

### Minimalist Design System

Stark contrast, purposeful whitespace, subtle 1px borders. Inspired by Teenage Engineering / Apple hardware UI. No color noise — priority is communicated through small badges, not loud backgrounds.

### Micro-interactions

- Scanning line animation during loading (Framer Motion)
- Staggered card reveals on results
- Layout shift animation when transitioning between states
- Button press scale feedback

## The AI Prompt Engineering

The system prompt instructs the model to:

- Split multi-issue complaints into separate tickets
- Assign correct municipal departments (Sanitation, Public Works, Water, Parks, etc.)
- Set priority based on safety risk (Urgent → High → Normal → Low)
- Extract location info from natural language
- Write citizen responses that are warm and human, never bureaucratic

## Getting Started

```bash
npm install
```

Create a `.env.local` file in the project root:

```
OPENAI_API_KEY=your-api-key-here
```

Get your key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Example Inputs to Demo

- "There's a massive pothole on Oak St and the streetlight above it is out"
- "Someone dumped a couch on the corner of 3rd and Main"
- "Fire hydrant has been spraying water for 2 hours on Elm Ave and my basement is flooding"
- "The park on Cedar Lane is completely overgrown and there's graffiti on the playground equipment"

Each produces different departments, priorities, and contextual citizen responses — all generated dynamically by the AI.

## What Makes This Notable

- **Full-stack AI integration** — not just calling an API, but using structured output with schema validation
- **Production patterns** — error handling, graceful fallbacks, environment-based configuration
- **Design engineering** — high-fidelity UI with motion design, not just functional code
- **Real-world domain modeling** — municipal service routing with priority triage logic
- **Modern stack** — Next.js App Router, React 19, Tailwind v4, TypeScript throughout
