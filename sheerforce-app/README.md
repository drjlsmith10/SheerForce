# SheerForce - Shear Force & Bending Moment Calculator

A modern web application for calculating and visualizing shear force and bending moment diagrams for structural beams.

![Built with React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite)

## Features

- **Interactive Beam Configuration**: Define beam length and support types
- **Multiple Load Types**:
  - Point loads
  - Distributed loads (uniform and varying)
  - Moment loads
- **Real-time Calculations**: Instant calculation of reactions and diagrams
- **Interactive Diagrams**: Plotly.js-powered shear force and bending moment visualizations
- **Unit Support**: Metric (kN, m) and Imperial (kips, ft) units
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite 7
- **UI Styling**: Tailwind CSS
- **Charting**: Plotly.js
- **Math**: math.js
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd sheerforce-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deploying to Vercel

### Option 1: Vercel Dashboard (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Vite and configure the build settings
6. Click "Deploy"

### Option 2: Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to link your project

## Usage

1. **Configure Beam**: Enter beam length and select units
2. **Add Loads**: Add point loads or distributed loads to your beam
3. **Calculate**: Click "Calculate Diagrams" to generate results
4. **View Results**: See support reactions, shear force diagram, and bending moment diagram

## Project Structure

```
src/
├── components/           # React components
│   ├── BeamInput.tsx           # Beam configuration input
│   ├── LoadConfiguration.tsx   # Load management
│   └── DiagramDisplay.tsx      # Plotly diagram renderer
├── lib/                  # Core logic
│   └── beamAnalysis.ts         # Beam calculation algorithms
├── types/                # TypeScript definitions
│   └── beam.ts                 # Type definitions
├── App.tsx               # Main application
└── main.tsx              # Entry point
```

## Roadmap

### Phase 1 (MVP) ✅
- [x] Beam input (length, supports)
- [x] Point loads and distributed loads
- [x] Reaction calculations
- [x] Shear force diagram
- [x] Bending moment diagram

### Phase 2 (Enhancements)
- [ ] PDF export functionality
- [ ] Multiple support types (cantilever, continuous)
- [ ] Save/load calculations
- [ ] Share calculations via URL
- [ ] Dark mode

### Phase 3 (Advanced)
- [ ] Deflection calculations
- [ ] Multiple spans
- [ ] Material database
- [ ] Progressive Web App (PWA)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

See LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React + TypeScript + Vite + Plotly.js
