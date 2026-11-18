# 🎓 PrepPath AI • Elite Admissions & Academic Accelerator

[![CI Pipeline](https://github.com/jeetpsinha-max/highschoolpreppathai/actions/workflows/ci.yml/badge.svg)](https://github.com/jeetpsinha-max/highschoolpreppathai/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)
[![Gemini 2.5](https://img.shields.io/badge/Gemini%20Flash-AI%20Admissions-cyan.svg)](https://ai.google.dev)

**PrepPath AI** is an intelligent college admissions platform providing personalized university matching, essay rubric feedback, standardized test optimization, and high school extracurricular roadmap planning.

---

## 🌟 Key Capabilities

- **College Fit & Acceptance Probability Engine**: Multi-dimensional scoring evaluating GPA, rigor, SAT/ACT, leadership, and geographic profile.
- **AI Common App Essay Mentor**: Line-by-line stylistic, thematic, and voice evaluation with actionable improvements.
- **SAT/ACT Adaptive Drill Studio**: Topic-level weakness identification with step-by-step video/text solution generation.
- **Extracurricular Impact Matrix**: Evaluates tier 1-4 extracurricular activities for maximum admissions committee resonance.

---

## 🚀 Quick Start

```bash
npm ci            # install exact dependency versions
npm run dev       # web app on http://localhost:8080
npm run server    # Gemini API server on http://localhost:3002
```

### Quality checks (all run in CI)

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

### API server configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | — | Enables live Gemini answers (otherwise a fallback reply is returned) |
| `PORT` | `3002` | Port for `npm run server` |
| `ALLOWED_ORIGINS` | any | Comma-separated CORS allowlist, e.g. `https://app.example.com` |
| `RATE_LIMIT_MAX` | `100` | Requests allowed per IP per window |
| `RATE_LIMIT_WINDOW_MS` | `3600000` | Rate-limit window length (ms) |

`POST /api/gemini/ask` accepts `{ prompt, context?, systemInstruction? }` (8,000 characters combined max).

---

## 📜 License
MIT License.
