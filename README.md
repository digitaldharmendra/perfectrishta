# 👑 PerfectRishta - Premium Matrimonial Platform

PerfectRishta is an elite, high-end matrimonial platform named and branded to redefine luxury matchmaking (inspired by top platforms like Jeevansathi and Shaadi). This repository contains the complete fully functional web application engineered with a **Dark Luxury Mode** theme (Deep Royal Burgundy & Champagne Gold) and rich, responsive client-side Single Page Application (SPA) logic.

---

## 🌟 Visual Theme & Design Systems
The platform is styled using a curated, high-end royal concierge aesthetic:
- **Core Burgundy / Crimson (`#6b1426` / `#a31d3f`)**: Representing deep, elegant, traditional romantic values.
- **Champagne Gold (`#d4af37` / `#f3e5ab`)**: Representing sovereign luxury, elite trust, and champagne celebrations.
- **Lux Slate (`#121216` / `#1b1b22`)**: The high-contrast dark foundation supporting seamless glassmorphism and subtle gold borders.
- **Glassmorphic Card Elements**: Translucent containers with custom border-lights and floating dropshadow overlays.
- **Premium Animations**: Micro-animations on buttons, pulsing gold matchmaking metrics, and smooth scroll category selectors.

---

## 🚀 Key Features

### 1. Luxury Landing Page
- Rich premium hero banners with AI-generated branding.
- Dynamic faith categories scrolling segment (Hindu, Muslim, Sikh, Christian, NRI, etc.).
- Success stories of matched couples in premium gold-gilded card frames.

### 2. Multi-Step Onboarding Wizard
- Collects name, height, age, education, annual package (in INR), and diet details.
- Captures partner preferences (age range, religion, community, budget, and habits).
- Updates matchmaking metrics immediately.

### 3. Match Discovery Dashboard
- Displays premium candidate profile cards in double-column grids.
- Features dynamic compatibility percentage overlays (`👑 96% Match`) calculated instantly using a custom-engineered multi-variate mathematical engine.
- Supports comprehensive text filters (names, professions, location searches) and faith filtering categories.

### 4. Interactive Secure Communications
- Instant mock typing responses synced to load 2 seconds after messages are posted.
- Preset conversational suggestion chips.
- **🛡️ Secure Voice Call Simulation**: Masks real cellular numbers through a private proxy connection displaying pulsing active call timers and protection verification cards.

---

## 🛠️ Technology Stack
1. **Frontend Core**: Semantic HTML5 and Vanilla CSS3 for rich custom styling layouts.
2. **State & Interactions**: Vanilla JavaScript (ES6) powering a client-side reactive router, compatibility calculation modules, messaging states, and secure checkout frameworks.
3. **Seed Database**: Configured mock profiles covering diverse communities, educations, and income brackets.

---

## 💻 Running the Web Application
Because the project is built purely as a premium client-side SPA, you can open and run it directly:

1. Clone or download the repository.
2. Double-click the **`index.html`** file in your local workspace to launch it instantly in any default web browser.
3. Alternatively, launch a lightweight development server inside the directory:
   ```bash
   npm run dev
   ```

---

## 📱 Mobile Companion App Scaffolding
The project also includes a scaffolded Expo React Native companion app designed with the same shared logic inside `perfectrishta-mobile/`:
- **`App.tsx`**: Navigation container wrapping stack screens (`Onboarding` ➔ `MatchGrid` ➔ `Chat`).
- **`src/theme/globalStyles.ts`**: CSS-in-JS style variables reflecting burgundy and gold palettes.
- **`src/state/compatibilityEngine.ts`**: Multi-criteria matching scoring functions identical to the web platform.
- **`src/screens/ChatScreen.tsx`**: Private messaging window with interactive call simulations and number masking protocols.
