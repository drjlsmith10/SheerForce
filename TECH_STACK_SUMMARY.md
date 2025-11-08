# Technology Stack - Quick Reference

## Recommended Approach: React + Vite + Vercel

### Core Stack
- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **UI Framework:** Tailwind CSS + shadcn/ui
- **Charting:** Plotly.js (basic bundle)
- **PDF Generation:** jsPDF (client-side)
- **Math Library:** math.js
- **Hosting:** Vercel (free tier)

### Why This Stack?
- **Cost:** $0/month (free hosting)
- **Performance:** <3s load time, instant calculations
- **Developer Experience:** Best-in-class tooling
- **Scalability:** Handles thousands of users
- **Bundle Size:** ~350KB (gzipped)

### Quick Start Commands

```bash
# Create new Vite + React project
npm create vite@latest sheerforce-app -- --template react-ts

# Install dependencies
cd sheerforce-app
npm install

# Add required libraries
npm install mathjs plotly.js-basic-dist-min jspdf html2canvas

# Add UI dependencies
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
npx vercel
```

### Project Structure

```
src/
├── components/
│   ├── BeamInput.tsx          # Beam configuration form
│   ├── LoadConfiguration.tsx   # Add/edit loads
│   ├── DiagramDisplay.tsx      # Plotly charts
│   └── PDFReport.tsx           # PDF export
├── lib/
│   ├── beamAnalysis.ts         # Core calculations
│   └── diagramGenerator.ts     # Chart data generation
├── hooks/
│   ├── useBeamCalculator.ts    # Calculation logic
│   └── usePDFGenerator.ts      # PDF generation
├── types/
│   └── beam.ts                 # TypeScript types
├── App.tsx
└── main.tsx
```

### Key Features to Implement

**Phase 1 (MVP - 2-3 weeks):**
- [ ] Beam input (length, supports)
- [ ] Point loads and distributed loads
- [ ] Reaction calculations
- [ ] Shear force diagram
- [ ] Bending moment diagram
- [ ] PDF export

**Phase 2 (Enhancement - 1-2 weeks):**
- [ ] Multiple load types
- [ ] Cantilever beams
- [ ] Unit conversion
- [ ] Save/share calculations
- [ ] Dark mode

**Phase 3 (Advanced - 2-3 weeks):**
- [ ] Multiple spans
- [ ] Deflection calculations
- [ ] Material database
- [ ] Mobile PWA

### Performance Targets
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s
- Initial bundle size: <150KB (gzipped)
- Calculation time: <100ms

### Cost Breakdown

**Free Tier (Sufficient for most use cases):**
- Hosting: Vercel - $0/month
- Bandwidth: 100GB/month - $0
- SSL Certificate: Included - $0
- CDN: Global - $0
- Builds: Unlimited - $0

**Expected costs stay at $0/month until:**
- 100,000+ users/month
- >100GB bandwidth usage

### Alternative Approaches

**If you need different priorities:**

1. **Vanilla JS** (Smallest bundle)
   - ~150KB total size
   - Fastest performance
   - More development time

2. **Vue.js + PWA** (Offline-first)
   - Works offline after first visit
   - Installable as app
   - ~320KB bundle

3. **Serverless Hybrid** (Server-side features)
   - Data persistence
   - Complex calculations
   - $0-10/month cost

### Development Timeline

**Week 1-3:** MVP Development
**Week 4:** Testing & Polish
**Week 5:** Deployment & Documentation
**Week 6+:** Feature enhancements

### Resources

**Full Analysis:** See `TECHNOLOGY_STACK_ANALYSIS.md` for detailed comparison

**Key Documentation:**
- React: https://react.dev
- Vite: https://vitejs.dev
- Plotly.js: https://plotly.com/javascript/
- math.js: https://mathjs.org
- Vercel Docs: https://vercel.com/docs

### Next Steps

1. ✅ Review technology analysis
2. ⬜ Set up development environment
3. ⬜ Create Vite + React project
4. ⬜ Install dependencies
5. ⬜ Start MVP development
6. ⬜ Deploy to Vercel

---

For detailed analysis of all approaches, costs, and trade-offs, see the full **TECHNOLOGY_STACK_ANALYSIS.md** document.
