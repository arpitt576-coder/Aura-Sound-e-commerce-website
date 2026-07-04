# Aura Sound — Architectural Audio Configurator & Showcase

Aura Sound is a premium, immersive audio showcase designed for discriminating audiophiles. This application blends clean, high-contrast display design with tactile, interactive engineering dashboards to showcase a bespoke collection of ultra-fidelity sound devices.

## 🚀 Live Web Application Preview
Experience the interactive configurator and calibration suite live:
*   **Live Production / Share View:** [Aura Sound Live Showcase](https://ais-pre-hwwno64la34aznmh4rebxs-421249390192.asia-southeast1.run.app)
*   **Development Instance:** [Aura Sound Dev Sandbox](https://ais-dev-hwwno64la34aznmh4rebxs-421249390192.asia-southeast1.run.app)

## 🌌 The Design Philosophy
Built around a **Cosmic Slate Theme**, Aura Sound utilizes deep charcoal backdrops, responsive glowing orbs, and precision typography pairing (sleek modern headings matched with JetBrains Mono data labels). Micro-interactions, soft radial gradients, and fluid motion transitions enrich the visual journey without cluttering the screen.

---

## 🛠️ Key Features

### 1. Dynamic 3D Configurator (`Aura One`)
*   **Bespoke Finishes:** Customize the physical components in real-time with curated finishes (e.g., *Carbon Obsidian*, *Silver Beryllium*, *Brushed Champagne*).
*   **Exploded Assembly View:** Slide the headphone casing apart dynamically to reveal the internal physical mechanics, driver placement, and luxury aluminum pivot joints.
*   **Engineering Spotlights:** Direct hot-spot triggers detailing the custom-tailored acoustic enclosures and dynamic beryllium driver architecture.

### 2. Interactive Specification Matrix & PDF Export
*   **Comparative Selector:** Toggle models (*Aura One*, *Aura Buds*, *Aura Studio*) directly on the dashboard to narrow down acoustic specs side-by-side.
*   **Bespoke PDF Generation:** Compile a beautiful, high-contrast, dual-column engineering summary sheet directly in the browser using the integrated `jsPDF` engine. Includes verified laboratory parameters, prices, and tags.

### 3. Parametric Calibration Lab (DSP Signature)
*   **Parametric Sliders:** Customize decibel gains for low-frequency rumble, mid-presence warmth, and high-frequency detail.
*   **Environment Simulation:** Simulate active ambient sound isolation or natural room echo in real-time.

---

## 💻 Tech Stack
*   **Framework & Bundling:** React 18, Vite, TypeScript
*   **Styling:** Tailwind CSS (Custom Theme & Ambient Glow Overlays)
*   **Animation Engine:** `motion` (from `motion/react`)
*   **PDF Generation:** `jsPDF`
*   **Icons:** `lucide-react`

---

## 📥 Local Setup & Execution

### Installation
Deploy the app and install dependencies:
```bash
npm install
```

### Development Server
Run the local Vite dev server on port `3000`:
```bash
npm run dev
```

### Production Build
Build the application for production:
```bash
npm run build
```
