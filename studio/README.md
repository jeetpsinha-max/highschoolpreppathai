<div align="center">
  <h1>🎬 PrepPath Studio</h1>
  <p><strong>Automated Viral Instagram Reels Creation Engine</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/HTML5-Canvas_4K-E34F26" alt="HTML5 Canvas" />
    <img src="https://img.shields.io/badge/AI-Gemini_2.0_Flash_Omni-orange" alt="Gemini API" />
    <img src="https://img.shields.io/badge/Web_Audio-API-blueviolet" alt="Web Audio" />
  </p>
</div>

---

## 🌟 About PrepPath Studio

**PrepPath Studio** is an integrated workspace within the PrepPath AI ecosystem. It is a cutting-edge video generation tool designed to create high-impact, 15-second viral video reels tailored for high school athletes, programs, and notable alumni. 

Built to maximize social media reach, it dynamically constructs videos using advanced web technologies directly in the browser.

---

## 🚀 Key Features

- 🧠 **Gemini 2.0 Flash Omni API**: Automatically scripts, paces, and coordinates video transitions based on minimal user prompts or athlete stats.
- 🎨 **HTML5 Canvas 4K Rendering**: Crystal clear, high-resolution video frames rendered efficiently in the browser without relying on heavy backend processing.
- 🎵 **Audio Visualizer Spectrums**: Real-time reactive audio bars and spectrums generated via the Web Audio API, perfectly synced to the reel's background track.
- 🌌 **3D Parallax Effects**: Dynamic, multi-layered visual effects that give depth and motion to static images and text.
- 📈 **Instagram Virality Prediction Engine**: An AI-driven heuristic system that evaluates the generated content's pacing, visual hooks, and audio energy to score its likelihood of going viral.

---

## 🛠️ Quick Setup

PrepPath Studio relies on the main application's environment but can be run and developed independently.

### 1. Install Dependencies

If you haven't already from the root:
```bash
cd studio
npm install
```

### 2. Environment Config

Ensure your `.env` contains the required Gemini API keys, as Studio heavily relies on the Omni model for generation:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Start Studio Dev Server

```bash
npm run dev
```

---

## 🎨 How it Works

1. **Input**: User provides basic stats (e.g., "Jahan Dotson, 1000 receiving yards, highlight URL").
2. **AI Processing**: Gemini 2.0 Flash Omni API analyzes the input and outputs a structured JSON timeline of transitions, text overlays, and audio cues.
3. **Rendering Loop**: HTML5 `requestAnimationFrame` continuously draws 4K frames to the `<canvas>` element, layering the 3D parallax background, the media, and the audio spectrum.
4. **Export**: The MediaRecorder API captures the canvas stream and outputs a high-quality `.mp4` or `.webm` file ready for Instagram upload.

---

## 📄 Credits

Built as part of **PrepPath AI** by Jeet Sinha.
