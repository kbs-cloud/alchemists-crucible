# 🧪 Alchemist's Crucible

Alchemist's Crucible is an elemental crafting deck-builder game integrated with the KBS Cloud platform. Apprentices combine cards representing basic elements in a magical cauldron, transmuting them to unlock recipes and create the legendary Philosopher's Stone.

## 🕹️ Game Overview

* **Genre**: Elemental Card Crafter / Strategy
* **Visuals**: Mystical wood/gold interface, interactive 3D cards, animated cauldron, bubbling liquid, and magical particle effects.

## ⚙️ Core Loops
1. **Draw Phase**: Draw 5 cards per turn representing basic elements (Fire, Water, Earth, Air).
2. **Synthesis**: Drag cards into the central "Crucible" to combine them (e.g., Fire + Earth = Lava; Water + Air = Mist).
3. **Defense & Crafting**: Use created compounds to feed the cauldron, unlock magical recipes, and defend against incoming "entropy" events that freeze or scorch cards.

## 🛠️ Technical Stack
- **Frontend**: React, TypeScript, Vite
- **Card Rendering**: CSS 3D flips & HTML5 Drag and Drop API
- **Particle System**: HTML5 Canvas for combining reactions and bubbling effects
- **Backend**: Express, SQLite (for lobby state, sessions, and achievements)

## 🚀 Getting Started

### Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

### Production Deployment
Run the deployment script to compile the frontend, install production node modules, configure the systemd service, and register the app in the KBS Cloud Hub catalog:
```bash
./deploy.sh
```

## 📄 License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
