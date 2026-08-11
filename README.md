# 🎓 PrepPath AI — Private & Boarding School Admissions Platform

![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6.svg?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38BDF8.svg?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E.svg?logo=supabase)
![PWA](https://img.shields.io/badge/PWA-Ready-1D3557.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**PrepPath AI** is an end-to-end AI-powered discovery, SSAT test prep, and application management platform designed for middle and high school students applying to top private, boarding, magnet, and selective secondary schools (*The Peddie School, Phillips Andover, Phillips Exeter Academy, Choate Rosemary Hall, The Lawrenceville School*).

---

## 🌟 Core AI Tools & Feature Modules

### 🎯 1. Upper Level SSAT 2400-Point Practice Engine (`/ai-tools/ssat`)
- **Official 1500–2400 Score Scale:** Predicts section scaled scores (500–800 for Verbal, Math, Reading) and composite score with national percentile ranking estimations (1%–99%).
- **Authentic Question Bank:** Real SSAT synonyms, analogies (*Architect : Building :: Composer : Symphony*), algebra, geometry, and reading comprehension passages with detailed solution rationales.

### ✍️ 2. AI Admissions Essay Coach (`/ai-tools/essay-coach`)
- **Top School Prompts:** Pre-loaded prompt presets for Peddie, Andover, Exeter, Choate, and Lawrenceville.
- **4-Dimension Rubric Scoring:** Evaluates *Tone & Maturity (0-100)*, *School Alignment*, *Vocabulary Elevation*, and *Authenticity*.
- **Line-by-Line Revisions:** Suggests specific vocabulary upgrades with admissions rationale.

### 📊 3. Admissions Command Center & Tracker (`/ai-tools/application-tracker`)
- **Acceptance Odds Calculator:** Computes real-time acceptance probability % based on GPA, SSAT scores, and school category (Reach / Target / Safety).
- **Status Pipeline:** Tracks applications across *Not Started ➔ Essay Drafting ➔ Interview Completed ➔ Submitted ➔ Accepted*.

### 💰 4. Net Price & Financial Aid Estimator (`/ai-tools/financial-aid`)
- **Household Income Estimator Slider ($40k – $350k+):** Calculates estimated need-based grant aid ($), net out-of-pocket family cost ($), and tuition discount %.

### 🗺️ 5. Campus Visit Prep & Tour Guide (`/ai-tools/school-visit`)
- **Preset Campus Checklists:** Custom tour questions, Harkness classroom observation guides, and insider admissions pro-tips.

---

## 🏗️ Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Shadcn UI
- **Backend / Database:** Supabase (Auth, Postgres, Edge Functions)
- **Deployment:** Mobile PWA Ready (Service Workers & Web App Manifest)

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/jeetpsinha-max/highschoolpreppathai.git

# Install dependencies
cd preppath-repo
npm install

# Run dev server
npm run dev
```

---

## 📄 License
MIT License. Created by [Jeet Sinha](https://github.com/jeetpsinha-max).
