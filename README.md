# ✦ ALTER EGO · Multiverse Personality Engine

> *"Discover the version of you that lives in another universe. Answer a few questions. Meet the person you could have been."*

**ALTER EGO** is a production-quality, responsive web application that guides users through an 8-question psychological and philosophical quiz, deterministically computing their alternate-universe identity across six cosmic archetypes. Users can explore their character lore, download a high-resolution ID card, copy and share results, and converse across the quantum fold with an AI incarnation of their Alter Ego.

---

## ✦ Key Features

### 1. Dreamy Futuristic Visual Aesthetic
* **Cosmic Void Theme**: Deep midnight palette (`#05030e`) illuminated by floating, animated radial nebulae in violet, cyan, and rose.
* **Living Starfield Canvas**: Dynamic background featuring 140+ twinkling stars, celestial stardust drift, and occasional shooting stars.
* **Frosted Glassmorphism**: Translucent panels (`backdrop-filter: blur(24px)`), neon glowing borders, and crisp typography (`Plus Jakarta Sans`, `Inter`, and `Space Grotesk`).
* **Tactile Celestial Audio**: Synthetic harmonic chimes generated in real-time via the Web Audio API with an instant mute toggle.
* **Fully Responsive**: Flawless layout across smartphones, tablets, laptops, and ultra-wide displays.

### 2. Calibrated 8-Question Multi-Step Quiz
* Multi-step quiz with animated progress bar and step counters (`01 / 08`).
* Four selectable answers per question with keyboard shortcuts (`1`, `2`, `3`, `4`, `Enter`, `Backspace`).
* Preserves user choices when navigating backward or refreshing the browser.

### 3. Deterministic Personality Scoring Engine
Six deeply characterized archetypes mapped through a rigorous mathematical matrix:
1. **THE DREAM CHASER** (`#c084fc`) — Creative, imaginative, emotional
2. **THE ARCHITECT** (`#38bdf8`) — Analytical, strategic, thoughtful
3. **THE EXPLORER** (`#34d399`) — Adventurous, curious, independent
4. **THE CATALYST** (`#fb7185`) — Energetic, ambitious, influential
5. **THE GUARDIAN** (`#a78bfa`) — Empathetic, loyal, dependable
6. **THE VISIONARY** (`#2dd4bf`) — Innovative, unconventional, future-oriented

*Zero random assignments*. Tied scores are broken deterministically through a stable choice hash.

### 4. Comprehensive Alter Ego Dossier
Every result provides:
* **Unique Universe Code** (e.g., `Universe #448-Epsilon`)
* **Generated Character Name & Title** (e.g., `Cipher Thorne · Grand Strategist of the Monolith`)
* **Signature Quote**
* **"In another universe, you..."** narrative lore
* **Core Strength, Hidden Trait, Superpower, Weakness, and Aesthetic**
* **6-Archetype Visual Resonance Breakdown** showing exact points and percentages.
* **Full Browser Refresh Persistence**: Refreshing the browser directly restores the complete result and active chat history without loss of state.
* **Universal Home Navigation**: Aesthetic Home buttons on Quiz, Result, and Action bars allow navigating back to the landing page at any time without deleting the saved result.

### 5. Interactive Alter Ego AI ("ASK YOUR ALTER EGO")
* **Strict 6-Question Limit per Alter Ego**: Live indicator badge (`Questions remaining: 6/6`, `5/6`, etc.) decrements with each valid question.
* **Duplicate & Empty Question Protection**: Empty questions and identical repeated questions do not count against the 6-question quota.
* **Persistent Counter & Lockout**: Counter survives page refreshes. When all 6 questions are used, inputs are disabled and the lock notice is displayed:
  > *"You've used all 6 questions for this alter ego. Create another alter ego to start a new conversation."*
* **Automatic Counter Reset**: Generating a new Alter Ego automatically resets the counter to `6/6` and unlocks the input.
* **Intelligent Persona Engine**: Responses directly use the current Alter Ego's Archetype, Character Name, Personality Traits, Core Strength, Weakness, Hidden Trait, and the user's specific question topic (covering worlds, advice, regrets, relationships, philosophy, superpowers, daily life, and more).
* **Secure Backend API**: [`server.py`](file:///C:/Users/linti/alter-ego/server.py) proxies requests to Google Gemini API (`GEMINI_API_KEY` or `GOOGLE_API_KEY`) and OpenAI API (`OPENAI_API_KEY`).
* **Zero exposed keys**: Keys are read securely server-side.
* **Graceful Local Fallback**: When offline or without API keys, a rich contextual neural persona engine responds dynamically in the authentic voice of the generated character and archetype.

### 6. Production-Ready Utility Actions
* **RETAKE QUIZ**: Resets the state and recalibrates from question 1.
* **SAVE MY ALTER EGO**: Persists your identity to `localStorage` with feedback toasts.
* **COPY RESULT**: Formats a clean textual summary with fallback clipboard support.
* **SHARE RESULT**: Uses the native Web Share API (`navigator.share`) with link copying fallback.
* **DOWNLOAD CARD**: Generates an ultra-crisp, high-DPI collector card PNG via an HTML5 canvas renderer without external server dependencies.
* **Landing Page Persistence**: Displays **"YOUR LAST ALTER EGO"** banner on future visits with a one-click **VIEW PROFILE** button.

---

## ✦ Quick Start

### Option A: Using Windows Launcher
Simply double-click:
```bat
run.bat
```
This automatically starts the server and opens `http://127.0.0.1:8000` in your default browser.

### Option B: Using Python
```bash
cd C:\Users\linti\alter-ego
python server.py
```
Then visit [http://127.0.0.1:8000](http://127.0.0.1:8000).

*(Optional)* To enable live Gemini AI generation:
```bash
set GEMINI_API_KEY=your_gemini_api_key_here
python server.py
```

---

## ✦ Project Architecture

```
alter-ego/
├── index.html            # Main SPA structure, accessible markup, ARIA tags
├── styles.css            # Cosmic design tokens, glassmorphism, responsive CSS
├── server.py             # Python HTTP server & secure AI proxy (/api/chat)
├── run.bat               # Windows double-click launcher
├── test_suite.py         # Automated API & asset test suite
├── test_scoring.py       # Scoring engine consistency verification
├── test_e2e_cdp.py       # Automated Chrome CDP end-to-end acceptance tests
├── js/
│   ├── app.js            # Master application controller, canvas starfield, view switcher
│   ├── personalityEngine.js # Scoring matrix, archetypes, questions, name generator
│   ├── aiPersona.js      # Persona chat controller & intelligent offline fallback
│   ├── cardGenerator.js  # High-DPI HTML5 canvas collector card PNG synthesizer
│   ├── soundEffects.js   # Real-time Web Audio API celestial synthesizer
│   └── storage.js        # LocalStorage persistence & migration manager
└── README.md             # Complete documentation
```

---

## ✦ Testing & Quality Assurance

Run the automated test suites anytime:

```bash
# Test server static serving and /api/chat endpoint
python test_suite.py

# Test scoring determinism and question specifications
python test_scoring.py

# Run complete Chrome headless end-to-end test
python test_e2e_cdp.py
```
