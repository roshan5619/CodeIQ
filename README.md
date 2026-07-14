# CodeIQ

[![CI](https://github.com/roshan5619/CodeIQ/actions/workflows/ci.yml/badge.svg)](https://github.com/roshan5619/CodeIQ/actions/workflows/ci.yml)

**AI-powered code intelligence platform** — an AI senior engineer that reviews, coaches, and optimizes your code while you type.

CodeIQ combines a VS Code-style editor with continuous AI analysis: as you write, it computes time/space complexity per function, scores your code across eight quality dimensions, flags risky lines with confidence ratings, scans for security vulnerabilities, predicts whether hidden test cases would pass, and coaches you toward the optimal algorithm.

## Features

- **Live Code Analysis** — performance, quality, maintainability, readability, security and documentation scores, updated as you type
- **Complexity Analyzer** — Big-O time/space per function with the responsible loops/recursion highlighted, best/average/worst case, confidence
- **Optimization Coach** — concrete algorithm upgrades (O(n²) → O(n)), estimated speedup and memory tradeoffs
- **AI Bug Detector** — line-level findings with one-click fixes
- **Security Scanner** — SQLi, XSS, CSRF, RCE, command injection, hardcoded secrets, weak crypto
- **Hidden Test Prediction & Edge Case Generator** — hundreds of generated edge cases, runnable against your code
- **AI Refactor** — faster / cleaner / less memory / SOLID / production-ready, applied through a diff view
- **Documentation Generator** — README, API docs, comments, architecture summaries, flowcharts
- **Learning / Interview / Competitive modes** — teaching explanations with voice narration, step-by-step algorithm animation, progressive hint ladder, interview rating, acceptance prediction with TLE risk
- **Analytics Dashboard** — quality trends, bug density, language breakdown, AI-written weekly reports
- **GitHub Integration** — AI pull-request reviews with line-anchored comments, exportable as markdown
- **Complexity heatmap & code replay** — tint the costly lines; scrub back through this session's code history

**Languages:** Python, Java, JavaScript, TypeScript, C, C++, Go, Rust, Kotlin, Swift, PHP, Ruby, C#

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Monaco Editor · Zustand · Recharts · Prisma + SQLite · Anthropic Claude API

## Getting started

```bash
npm install
npx prisma migrate dev   # creates the local SQLite database
cp .env.example .env.local
# put your ANTHROPIC_API_KEY in .env.local
npm run dev
```

Open http://localhost:3000 and head to the **Workbench**.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Typecheck |
| `npx prisma studio` | Browse the local database |

## Configuration

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | SQLite file path in dev (`file:./prisma/dev.db`), Postgres URL in prod |
| `ANTHROPIC_API_KEY` | for AI features | Powers all analysis, refactoring and review |
| `CODEIQ_SECRET` | for GitHub integration | Encrypts stored tokens at rest |
