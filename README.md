<div align="center">
  <img src="https://img.shields.io/badge/NEXT.JS-0c0c0e?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TAILWIND-ccff00?style=for-the-badge&logo=tailwindcss&logoColor=black" />
  <img src="https://img.shields.io/badge/GEMINI%20AI-0c0c0e?style=for-the-badge&logo=google-gemini&logoColor=22c55e" />
  <img src="https://img.shields.io/badge/FIREBASE-111114?style=for-the-badge&logo=firebase&logoColor=ffca28" />

  <h1>🏟️ StadiumFlow</h1>
  <p><strong>Brutalist, AI-Powered Live Venue Command Center</strong></p>
</div>

<br />

StadiumFlow is a production-grade venue management system built to tackle massive crowd telemetry in real-time. Fusing **high-contrast brutalist design** with **live Firebase streams** and a **Gemini-powered spatial assistant**, StadiumFlow provides both attendees and venue managers with pinpoint awareness of gate status and crowd flow.

---

## 🔥 Features

- **Live Gate Telemetry Engine:** View real-time security checkpoint queue times natively synced via Firebase RTDB.
- **Dynamic Surge Forecast ("WhatIf Engine"):** Algorithmic predictions weighing current queue loads against projected crowd deployments to advise users whether to "Enter Now" or "Hold".
- **Gemini 2.5 AI Assistant:** A fully integrated contextual AI floating chat layer. It uses live telemetry parameters to answer any venue logic.
- **Automated Pathfinding:** Seamlessly bridges with Google Maps to output precise geographic entry points based on the optimal computed route.
- **Brutalist Spatial UI:** Designed with pure 0px border-radii, #0c0c0e deep space mapping, neon graph tokens (#ccff00 & #22c55e), and zero-layout-shift strict bounding rules.

## 🚀 Deployment (Google Cloud Run)

This repository is strictly configured to execute natively on **Google Cloud Run** with a hyper-optimized `standalone` build pipeline.

1. **Clone the repo**
   ```bash
   git clone https://github.com/Venky1209/stadiumflow.git
   cd stadiumflow
   ```

2. **Supply Environments (`.env.local`)**
   ```bash
   NEXT_PUBLIC_GEMINI_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_rtdb_url
   NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_maps_key
   ```

3. **Deploy via `gcloud` CLI**
   ```bash
   gcloud run deploy stadiumflow-app \
     --source . \
     --platform managed \
     --allow-unauthenticated \
     --region us-central1
   ```

## 🏗️ Local Development

StadiumFlow is locked onto Next.js 16+ Turbopack for maximum speed.

```bash
npm install
npm run dev
```

*Designed with obsession for performance, accessibility, and high-stakes environment scale.*
