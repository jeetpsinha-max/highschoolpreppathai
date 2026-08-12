<div align="center">
  <img src="https://via.placeholder.com/150" alt="PrepPath AI Logo" width="120" height="120" />
  <h1>PrepPath AI</h1>
  <p><strong>The premier AI-powered high school discovery, application, essay coaching, and sports ranking platform.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-19-blue" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-Ready-blue" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-Fast-blueviolet" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-Styled-38B2AC" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-DB-green" alt="Supabase" />
    <img src="https://img.shields.io/badge/Gemini_2.0_Omni-AI-orange" alt="Gemini 2.0 Omni" />
    <img src="https://img.shields.io/badge/PWA-Enabled-success" alt="PWA" />
  </p>
</div>

---

## 🌟 Overview

**Highschool PrepPath AI** is an all-in-one platform built to empower students and parents navigating the competitive private and boarding high school admissions landscape. From intelligent school matching to comprehensive essay coaching, real-time interview prep, and an industry-first high school sports ranking engine—PrepPath AI is your ultimate admissions companion.

Additionally, the platform features **PrepPath Studio**, a built-in automated viral Instagram Reels creation tool designed for schools and athletes to showcase their highlights in stunning 4K HTML5 Canvas rendering.

---

## 🚀 Core Platform Features

- 🏆 **Sports Rankings Engine**: Discover the top 50 private/boarding high schools across 13 athletic conferences (NEPSAC, MAPL, ISL, Founders, Lakes Region, etc.). Includes composite scoring, detailed conference breakdowns, and verified notable alumni tracking (NFL, NBA, NHL, and Olympians like Gabby Thomas & Jahan Dotson).
- 📝 **AI Admissions Essay Coach**: Multi-turn, contextual AI guidance for application essays. Receive real-time feedback, grammar correction, and structural scoring to craft the perfect personal statement.
- 🎯 **AI School Matcher**: A highly personalized discovery engine matching students against 1,750+ schools based on academic interests, sports preferences, location, and budget constraints.
- 🎙️ **Interview Coach**: Interactive AI interview simulations. Practice answering real private school admissions questions with voice & text evaluation and actionable feedback.
- 📚 **Upper Level SSAT Prep Engine**: Targeted practice questions, timed diagnostic tests, detailed explanations, and score prediction to boost standardized test performance.
- 💰 **Net Price Estimator & Financial Aid Advisor**: Transparent tuition breakdowns, expected family contribution (EFC) estimation, and strategic financial planning for private high school affordability.
- 🎬 **PrepPath Studio (Integrated)**: Generate 15-second viral video reels in a snap. Powered by the Gemini 2.0 Flash Omni API, HTML5 4K Canvas rendering, audio visualizer spectrums, 3D parallax effects, and an advanced Instagram virality prediction engine.

---

## 💻 Tech Stack

| Category | Technology |
| --- | --- |
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS, Framer Motion |
| **Backend & DB** | Supabase (PostgreSQL, Auth, Storage) |
| **AI Integration** | Google Gemini 2.0 Omni API |
| **Media Engine** | HTML5 Canvas 4K, Web Audio API |
| **PWA & Mobile** | Vite PWA Plugin, Workbox |

---

## 📁 Repository Structure

```text
preppath-repo/
├── .github/              # CI/CD Workflows
├── src/                  # Core Web Application Platform
│   ├── components/       # Shared UI components
│   ├── pages/            # Next-gen routing pages
│   ├── hooks/            # Custom React Hooks
│   ├── lib/              # Utility functions and API clients
│   └── styles/           # Global styles and Tailwind configuration
├── studio/               # PrepPath Studio - Automated Viral Video Creator
│   ├── src/              # Studio-specific source code
│   └── README.md         # Dedicated Studio documentation
├── public/               # Static assets (images, icons, manifest.json)
├── supabase/             # Supabase edge functions, migrations, and types
├── package.json          # Workspace and dependencies
└── README.md             # This file
```

---

## 🛠️ Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm or yarn
- Supabase CLI (optional, for local DB development)

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/preppath-repo.git
cd preppath-repo
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory and populate it with your specific keys:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Development Server

Start the Vite development server:

```bash
npm run dev
```

Navigate to `http://localhost:5173` to view the app in your browser.

### 4. Build for Production

To create a production-ready optimized build:

```bash
npm run build
```

---

## 📱 PWA & Mobile Support

PrepPath AI is fully Progressive Web App (PWA) compliant. It can be installed directly to user devices (iOS, Android, Windows, Mac) bypassing traditional app stores. Features include:
- Offline fallback pages.
- Native-like app shell and performance.
- Push notifications for interview reminders and admissions deadlines.

---

## 📄 License & Credits

**PrepPath AI** & **PrepPath Studio**

Created and maintained by **Jeet Sinha** / PrepPath AI.

All rights reserved. Contact for licensing inquiries.
