# P2-P3: The Professional Engineer's Companion
**Vision Document**
**Date:** 2025-11-09
**Philosophy:** Technology married with the humanities

---

## The Vision: From Calculator to Companion

We're not building a calculator. We're building a **trusted companion** for structural engineers. Every feature should feel like it was designed by someone who's been in the trenches, who understands the workflow, who knows what it feels like to verify a calculation at 2 AM before a deadline.

---

## Design Principles

### 1. Invisible Complexity
The user should never feel the weight of the engineering behind this tool. Like picking up a well-balanced hammer, everything should feel *right*.

### 2. Workflow Integration
Engineers don't work in isolation. They need to:
- Document their work (PDF reports)
- Iterate on designs (save/load)
- Share data (CSV export)
- Work efficiently (keyboard shortcuts)
- Explore interactively (hover, click, zoom)

### 3. Trust Through Transparency
Every calculation must be verifiable. The PDF isn't just a pretty picture - it's a complete audit trail.

---

## P2 Features: Professional Workflows

### P2.1: PDF Export - The Documentation Engine
**Priority:** CRITICAL
**Why it Matters:** Engineers need defensible documentation. This isn't optional.

**The Experience:**
```
User clicks "Export PDF" →
  Beautiful report generates in < 2 seconds →
    Professional header with company logo (optional) →
      Complete beam configuration →
        Step-by-step calculations (LaTeX-quality typography) →
          High-resolution diagrams →
            Critical points table →
              Validation report →
                Engineer's stamp section →
                  Ready to attach to submittal package
```

**Implementation Strategy:**
- Use jsPDF + html2canvas for diagram rendering
- Modular sections (can enable/disable parts)
- Professional typography (proper spacing, alignment)
- Include project metadata (name, engineer, date, revision)
- Generate diagrams at 300 DPI for print quality
- Add QR code linking to web version (future: verification)

**Files to Create:**
```
src/lib/export/
├── pdfGenerator.ts          # Core PDF generation
├── diagramRenderer.ts       # Render Plotly to canvas
├── pdfSections/
│   ├── header.ts            # Professional header
│   ├── configuration.ts     # Beam config section
│   ├── calculations.ts      # Step-by-step math
│   ├── diagrams.ts          # Shear/moment diagrams
│   ├── criticalPoints.ts    # Table section
│   └── validation.ts        # Validation report
└── types.ts                 # Export options interface

src/components/
└── ExportButton.tsx         # UI component with options modal
```

---

### P2.2: Save/Load System - Workflow Continuity
**Priority:** HIGH
**Why it Matters:** Engineers iterate. Losing work is unacceptable.

**The Experience:**
```
User modifies beam →
  Auto-saves to browser (every change) →
    User can explicitly save as "Project Alpha v2" →
      Browser remembers recent projects →
        One-click restore →
          Exactly where they left off →
            Export to .json for sharing/backup
```

**Implementation Strategy:**
- LocalStorage for auto-save (current state)
- Named save slots (user-managed projects)
- Export/import .json files
- Revision history (last 10 auto-saves)
- Keyboard shortcut: Cmd/Ctrl+S for quick save

**Files to Create:**
```
src/lib/storage/
├── localStorage.ts          # Browser storage interface
├── projectManager.ts        # Named projects CRUD
├── autoSave.ts              # Auto-save logic
└── types.ts                 # Project metadata

src/components/
├── SaveLoadPanel.tsx        # Main UI
├── ProjectList.tsx          # Recent projects
└── ImportExportButtons.tsx  # JSON file I/O
```

**Data Structure:**
```typescript
interface SavedProject {
  id: string;
  name: string;
  description?: string;
  beam: Beam;
  metadata: {
    created: Date;
    modified: Date;
    version: string;
    engineer?: string;
    company?: string;
  };
}
```

---

### P2.3: Interactive Diagrams - Exploration, Not Just Viewing
**Priority:** MEDIUM-HIGH
**Why it Matters:** Static diagrams hide insights. Let users explore.

**The Experience:**
```
User hovers over diagram →
  Tooltip shows exact value at that point →
    User clicks on point →
      Jump to critical points table (if applicable) →
        User can zoom/pan to focus on region →
          Values update in real-time
```

**Implementation Strategy:**
- Leverage Plotly's built-in interactivity
- Custom hover templates with rich formatting
- Click handlers for critical points
- Synchronized cursors across shear/moment diagrams
- Optional: Annotations for max/min values

**Enhancement to Existing:**
```typescript
// In DiagramDisplay.tsx
const layout = {
  hovermode: 'x unified',  // Unified hover across traces
  hoverlabel: {
    bgcolor: 'white',
    bordercolor: 'black',
    font: { family: 'monospace', size: 12 }
  }
};

const config = {
  displayModeBar: true,
  modeBarButtonsToAdd: ['drawline', 'drawopenpath'],
  toImageButtonOptions: {
    format: 'png',
    filename: 'shear_moment_diagram',
    height: 800,
    width: 1200,
    scale: 2  // 2x resolution
  }
};
```

---

### P2.4: Template Library - Zero to Productive
**Priority:** MEDIUM
**Why it Matters:** Common cases should take seconds, not minutes.

**The Templates:**
1. **Simply Supported + Central Point Load** (most common)
2. **Simply Supported + UDL**
3. **Cantilever + End Load**
4. **Cantilever + UDL**
5. **Simply Supported + Multiple Point Loads** (3-point loading)
6. **Simply Supported + Combined Loading** (UDL + point load)

**The Experience:**
```
User clicks "New from Template" →
  Modal shows visual previews of common cases →
    User selects "Simply Supported + UDL" →
      Beam pre-configured with placeholder values →
        User adjusts dimensions/loads →
          Calculate →
            Done in 30 seconds
```

**Implementation:**
```typescript
// src/lib/templates/library.ts
export const TEMPLATES: BeamTemplate[] = [
  {
    id: 'ss-central-point',
    name: 'Simply Supported - Central Point Load',
    description: 'Most common case: beam with pin and roller, single centered load',
    thumbnail: '/templates/ss-central-point.svg',
    category: 'Simply Supported',
    beam: {
      length: 10,
      units: 'metric',
      supports: [
        { id: 's1', position: 0, type: 'pin' },
        { id: 's2', position: 10, type: 'roller' }
      ],
      loads: [
        { id: 'l1', type: 'point', position: 5, magnitude: 20, angle: 0 }
      ]
    },
    expectedResults: {
      maxMoment: 50,
      maxShear: 10
    }
  },
  // ... more templates
];
```

---

### P2.5: CSV Export - Data Portability
**Priority:** MEDIUM
**Why it Matters:** Engineers use Excel, MATLAB, Python. Give them the data.

**Export Options:**
1. **Shear Force Diagram** (position, value)
2. **Bending Moment Diagram** (position, value)
3. **Critical Points** (position, description, shear, moment)
4. **Reactions** (support, Fy, Fx, M)

**Files to Create:**
```
src/lib/export/
└── csvExporter.ts           # CSV generation utilities

src/components/
└── ExportMenu.tsx           # Dropdown: PDF, CSV (Shear), CSV (Moment), CSV (All)
```

---

### P2.6: Undo/Redo - Professional Polish
**Priority:** MEDIUM
**Why it Matters:** Mistakes happen. Don't punish users for exploring.

**Implementation Strategy:**
- History stack (max 50 states)
- Cmd/Ctrl+Z for undo
- Cmd/Ctrl+Shift+Z for redo
- Show history timeline (optional advanced feature)

**Files to Create:**
```
src/hooks/
└── useBeamHistory.ts        # Custom hook managing history stack

src/components/
└── HistoryControls.tsx      # Undo/redo buttons + timeline
```

---

### P2.7: Keyboard Shortcuts - Power User Efficiency
**Priority:** LOW-MEDIUM
**Why it Matters:** Proficient users shouldn't reach for the mouse.

**Shortcuts:**
```
Cmd/Ctrl+S       → Save project
Cmd/Ctrl+Z       → Undo
Cmd/Ctrl+Shift+Z → Redo
Cmd/Ctrl+E       → Export PDF
Cmd/Ctrl+N       → New beam
Cmd/Ctrl+O       → Open project
Cmd/Ctrl+P       → Print preview
Cmd/Ctrl+K       → Quick add load
Cmd/Ctrl+D       → Duplicate last load
Cmd/Ctrl+/       → Show keyboard shortcuts
```

**Implementation:**
```typescript
// src/hooks/useKeyboardShortcuts.ts
export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 's') {
        e.preventDefault();
        handlers.onSave();
      }
      // ... more shortcuts
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
```

---

## P3 Features: Delightful Polish

### P3.1: Advanced Beam Types
- **Overhanging beams** (supports not at ends)
- **Propped cantilever** (cantilever + roller support)
- Foundation for future: continuous beams

### P3.2: Enhanced Visualizations
- **Animated load application** (show effect of adding load)
- **3D perspective view** (optional, just for aesthetics)
- **Dark mode** (for late-night calculations)

### P3.3: Collaboration Features
- **Share link** (generate URL with beam config)
- **Comments/annotations** on diagrams
- **Comparison mode** (side-by-side different designs)

### P3.4: Educational Mode
- **Tutorial overlay** (first-time user guidance)
- **Explain this step** button (AI-powered explanations)
- **Common mistakes detector** (warnings for typical errors)

---

## Implementation Timeline

### Phase 1: Core Professional Features (Week 4)
**Days 16-17:** PDF Export
- Implement core PDF generation
- Add all sections (config, calcs, diagrams)
- Test with various beam types
- Polish typography and layout

**Day 18:** PDF Polish + CSV Export
- Add project metadata to PDF header
- Implement CSV export for all diagram types
- Add export menu dropdown

**Day 19:** Save/Load System
- LocalStorage interface
- Named project management
- Auto-save logic
- Import/export JSON

**Day 20:** Interactive Diagrams + Templates
- Enhanced Plotly configuration
- Template library
- Template selector UI

### Phase 2: Polish & Power Features (Week 5 - Optional)
**Days 21-22:** Undo/Redo + Keyboard Shortcuts
**Days 23-24:** Advanced beam types (overhanging)
**Day 25:** Testing, refinement, documentation

---

## Success Criteria

### Quantitative
- [ ] PDF generates in < 2 seconds
- [ ] Save/load operations < 100ms
- [ ] All keyboard shortcuts functional
- [ ] 6+ templates available
- [ ] CSV export matches calculation precision
- [ ] Undo/redo handles 50+ state changes

### Qualitative
- [ ] Engineers say "This feels professional"
- [ ] PDF reports acceptable for submittal packages
- [ ] Workflow feels seamless (no friction)
- [ ] Interactive features feel natural, not gimmicky
- [ ] Templates actually save time (user testing)

---

## Risk Mitigation

### High Risk
**PDF quality not meeting professional standards**
- Mitigation: Test with real engineers, iterate on layout
- Fallback: Provide LaTeX export option

**Browser storage limits (LocalStorage ~5MB)**
- Mitigation: Implement compression for saved projects
- Fallback: Cloud storage option (future P3+)

### Medium Risk
**Performance degradation with complex diagrams**
- Mitigation: Canvas rendering optimizations, lazy loading
- Monitor: Performance testing with 100+ load cases

**Keyboard shortcuts conflict with browser**
- Mitigation: Detect platform, adjust shortcuts accordingly
- Fallback: User-customizable shortcuts (P3)

---

## The North Star

At the end of P2, an engineer should be able to:

1. **Open SheerForce** (or resume from auto-save)
2. **Select a template** (or start from scratch)
3. **Configure their beam** (with real-time validation)
4. **Explore the results** (interactive diagrams)
5. **Export a professional PDF** (ready for submittal)
6. **Save their work** (named project)
7. **Return tomorrow** (exactly where they left off)

...and feel like the tool was designed *for them*, by someone who *gets it*.

---

## Execution Philosophy

**Move fast, but with precision.**
- Each feature must feel complete, not bolted on
- Test with real scenarios (bridge beam, floor joist, cantilever roof)
- Get feedback from engineers (if possible)
- Iterate on UX until it feels inevitable

**Code like a craftsman:**
- Beautiful code that future maintainers will admire
- Comments that explain the "why", not the "what"
- Tests that document expected behavior
- Types that prevent impossible states

**Ship with confidence:**
- Every feature has tests
- Every calculation has validation
- Every export is verified
- Every save is reliable

---

## Let's Build Something Insanely Great

The user doesn't know it yet, but they're about to have a tool that feels like it was custom-made for their workflow. That's the magic we're creating.

Let's execute.
