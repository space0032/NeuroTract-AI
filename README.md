# NeuroTract AI

> AI-Assisted Traffic Safety Platform — Psychometric Profiling × Computer Vision × Predictive Analytics

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ 
- **Python** 3.9+ (optional, for AI engine)

### Install & Run

```bash
# Install all dependencies
cd client && npm install
cd ../server && npm install

# Start backend (Terminal 1)
cd server && node src/index.js

# Start frontend (Terminal 2)
cd client && npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📁 Architecture

```
NeuroTract-AI/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/   # Navbar, CameraFeed, Charts, etc.
│       ├── pages/        # Landing, Questionnaire, LiveTracker, Dashboard
│       └── styles/       # Global design system (CSS)
├── server/          # Node.js + Express backend
│   └── src/
│       ├── routes/       # profile, detections, hazards, analytics
│       └── services/     # scoringEngine (Big Five → Risk Persona)
├── ai-engine/       # Python AI pipeline
│   ├── detector/         # YOLOv8 hazard detector
│   └── predictor/        # ML risk model (Random Forest)
└── package.json     # Monorepo root
```

## 🧠 Features

### 1. Psychometric Profiling (`/questionnaire`)
- 25-question Big Five personality assessment
- Reverse-scored Likert scale (1-5)
- Maps Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism → Driving Risk Persona
- Persona types: **Aggressive**, **Impulsive**, **Distracted**, **Balanced**, **Cautious**

### 2. Live Vehicle Tracker (`/tracker`)
- Real-time webcam feed with COCO-SSD (TensorFlow.js)
- In-browser AI vehicle detection with bounding boxes
- Color-coded class labels (car, truck, bus, motorcycle, bicycle, person)
- Live detection log with timestamps and confidence scores
- FPS counter and model status indicator

### 3. AI Hazard Detection Engine
- YOLOv8 dashcam video analysis (Python)
- Hazard event timestamp extraction
- Pre-computed demo events for offline use

### 4. Analytics Dashboard (`/dashboard`)
- Big Five Radar Chart (Chart.js)
- Detection distribution bar chart
- Trait-to-behavior correlation breakdown
- Recent detection history table

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Chart.js, TensorFlow.js |
| Backend | Node.js, Express, sql.js (SQLite) |
| AI Engine | Python, YOLOv8, FastAPI, scikit-learn |
| Styling | Vanilla CSS (Glassmorphism, Animations) |

## 📄 License

MIT