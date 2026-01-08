# 2048 Game (Vue 3 + TypeScript)

A web-based implementation of the classic 2048 puzzle game built with Vue 3, TypeScript, and Vite.

## 🎮 Features

- **Full 2048 Gameplay**: Classic 4×4 board with tile merging mechanics
- **Keyboard Controls**: Use arrow keys to move tiles
- **Touch Support**: Swipe gestures for mobile devices
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Visual Polish**: Smooth animations and 2048-style colors
- **Score Tracking**: Best score saved in localStorage
- **Game States**: Win/lose detection with status messages

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Then open http://localhost:5173 in your browser.

### Build for Production
```bash
npm run build
```

### Type Checking
```bash
npm run type-check
```

### Preview Production Build
```bash
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/           # Vue components
│   ├── GameBoard.vue    # 4×4 game board
│   ├── GameHeader.vue   # Score and controls
│   └── Tile.vue         # Individual tile
├── composables/         # Vue composables
│   ├── useGameState.ts  # Game state management
│   └── useSwipe.ts      # Touch gesture handling
├── utils/               # Utility functions
│   ├── gameHelpers.ts   # Core game logic
│   └── constants.ts     # Game constants
├── types/               # TypeScript definitions
│   └── game.types.ts    # Game-related types
└── styles/              # Global styles
```

## 🎯 How to Play

1. **Goal**: Combine tiles to reach the 2048 tile!
2. **Controls**:
   - Desktop: Use arrow keys (↑, ↓, ←, →)
   - Mobile: Swipe in any direction or use on-screen buttons
3. **Game Rules**:
   - Tiles with the same number merge when they touch
   - Each move generates a new tile (2 or 4)
   - Game ends when no more moves are possible

## 📱 Responsive Design

- Desktop: Full game with keyboard controls
- Tablet: Optimized layout with touch support
- Mobile: Compact layout with on-screen direction buttons

## 🛠️ Technology Stack

- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Vite** for build tooling
- **CSS3** with animations and flexbox/grid

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and build
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Original 2048 game by Gabriele Cirulli
- Vue.js team for the amazing framework
- Vite team for the fast build tool