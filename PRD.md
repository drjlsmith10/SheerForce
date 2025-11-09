# Product Requirements Document (PRD)
## SheerForce - Shear Force & Bending Moment Calculator

**Version:** 2.0
**Date:** 2025-11-09
**Status:** Active Development
**Core Principle:** Mathematical accuracy and calculation traceability above all else

---

## Executive Summary

SheerForce is a professional-grade web application for structural engineers to calculate and visualize shear force and bending moment diagrams. The application must prioritize **mathematical accuracy** and **calculation traceability** to serve both educational and professional use cases.

### Current State
- ✅ MVP Complete: Simply supported beams with point loads and distributed loads
- ✅ Real-time diagram visualization with Plotly.js
- ✅ Metric and Imperial unit support
- ❌ **CRITICAL GAP:** No validation or verification against known solutions
- ❌ **CRITICAL GAP:** No equilibrium checks or calculation traceability
- ❌ Limited beam type support (cantilever not implemented despite being Phase 1 priority)

---

## Core Principles

### 1. Mathematical Accuracy (CRITICAL)
- All calculations must be verified against known solutions
- Must match hand calculations to < 0.01% error tolerance
- Equilibrium equations must be satisfied and verified
- All fundamental relationships must be validated

### 2. Calculation Traceability (CRITICAL)
- Users must be able to verify every step of the calculation
- Show reaction calculations with equilibrium equations
- Display formulas being used
- Provide validation reports with equilibrium checks

### 3. Parity with Reference Implementations
- Results must match established calculators (SkyCiv, ClearCalcs, BeamGuru)
- Validate against textbook examples from LibreTexts PDF
- Maintain benchmark test suite with known solutions

---

## Priority Classification

### P0: Parity & Validation (CRITICAL - Must Fix Immediately)
Issues that affect mathematical correctness, accuracy, or the ability to verify calculations.

**Mathematical Validation:**
1. **No equilibrium validation** - Cannot verify ΣFy = 0, ΣM = 0
2. **No diagram closure checks** - Diagrams should return to expected boundary values
3. **No relationship verification** - Cannot verify dM/dx = V, dV/dx = -w
4. **No known solution validation** - No tests against Research.md Appendix A examples
5. **No benchmark comparison** - Cannot compare with SkyCiv/ClearCalcs/BeamGuru

**Calculation Traceability:**
6. **No step-by-step calculations shown** - Users cannot verify reaction calculations
7. **No critical points table** - Missing values at supports, load points, max/min locations
8. **No validation report** - No comprehensive check that calculations are correct

### P1: High Priority (Complete Core Functionality)
Critical features for Phase 1 completeness and professional use.

**Beam Type Parity:**
9. **Cantilever beams not implemented** - Listed as #1 priority in Research.md but missing
10. **Fixed support calculations incomplete** - Types defined but logic not implemented

**Feature Completeness:**
11. **Moment loads not in UI** - Type exists but cannot be added via interface
12. **No test suite** - Zero automated tests despite calculation criticality
13. **No engineering warnings** - No checks for unreasonable values, excessive deflection
14. **Missing max/min identification** - Only shows max absolute value, not positive/negative maxima separately

**Accuracy & Error Prevention:**
15. **Insufficient input validation** - Can create invalid configurations without warnings
16. **No statically determinate check** - Doesn't verify beam stability

### P2: Medium Priority (Enhanced Usability)
Important features for professional workflows and user experience.

**Professional Output:**
17. **PDF export not implemented** - jsPDF installed but not integrated
18. **No save/load functionality** - Cannot save beam configurations
19. **No export to CSV/data formats** - Cannot export raw data for external analysis

**User Experience:**
20. **No undo/redo** - Cannot revert changes
21. **No interactive diagrams** - Cannot hover for values or click for details
22. **No templates** - No quick-start common configurations
23. **Limited visual feedback** - No real-time validation indicators
24. **No keyboard shortcuts** - Inefficient for power users

**Additional Beam Types:**
25. **No overhanging beams** - Phase 2 feature per Research.md
26. **No propped cantilever** - Advanced feature

---

## Technical Requirements

### Validation Framework (P0)

#### Equilibrium Validation
```typescript
interface EquilibriumCheck {
  sumVerticalForces: number;      // Should be ~0
  sumMoments: number;              // Should be ~0 (about any point)
  tolerance: number;               // Default: 1e-6
  isValid: boolean;
  message: string;
}
```

**Implementation Requirements:**
- Calculate ΣFy = Σ(reactions) - Σ(applied loads)
- Calculate ΣM about reference point
- Display validation status to user
- Warn if equilibrium not satisfied within tolerance

#### Diagram Closure Validation
```typescript
interface DiagramClosure {
  shearClosureError: number;       // Deviation from expected value
  momentClosureError: number;      // Should be 0 at simple supports
  isValid: boolean;
  expectedValue: number;
  actualValue: number;
}
```

**Validation Rules:**
- Simply supported: M = 0 at both supports
- Cantilever free end: V = 0, M = 0
- Shear diagram: Sum of areas should equal zero for closed system

#### Relationship Verification
```typescript
interface RelationshipCheck {
  dMdx_equals_V: boolean;          // dM/dx = V(x)
  dVdx_equals_negW: boolean;       // dV/dx = -w(x)
  maxError: number;
  averageError: number;
}
```

**Implementation:**
- Numerical differentiation of moment diagram
- Compare with shear force values
- Report maximum deviation

#### Known Solution Tests
Must validate against all examples in Research.md Appendix A:

**Test Case 1: Cantilever with Point Load**
- Input: L=3ft, P=5lb at free end
- Expected: V=-5lb (constant), M=-5x, M_max=-15 ft-lb

**Test Case 2: Cantilever with UDL**
- Input: L=5m, w=20 kN/m
- Expected: V=-20x, M=-10x², M_max=-250 kN·m

**Test Case 3: Simply Supported Central Point Load**
- Input: L=10m, P=20kN at center
- Expected: R_A=R_B=10kN, M_max=50 kN·m at x=5m

### Calculation Traceability (P0)

#### Step-by-Step Reaction Calculations
Display to user:
```
Reaction Calculations:
─────────────────────

Step 1: Sum moments about Support A (x=0)
  ΣM_A = 0 (equilibrium equation)

  Moments from loads:
    • Point load at x=5.0m: -20.0 kN × 5.0m = -100.0 kN·m

  Moments from reactions:
    • Reaction at B (x=10.0m): +R_B × 10.0m

  Equation: -100.0 + R_B × 10.0 = 0
  Solving: R_B = 10.0 kN ↑

Step 2: Sum vertical forces
  ΣF_y = 0 (equilibrium equation)

  Applied loads: -20.0 kN (downward)
  Reactions: R_A + R_B

  Equation: R_A + 10.0 - 20.0 = 0
  Solving: R_A = 10.0 kN ↑

Equilibrium Check:
  ✓ ΣF_y = 10.0 + 10.0 - 20.0 = 0.000 kN
  ✓ ΣM_A = -100.0 + 10.0×10.0 = 0.000 kN·m
```

#### Critical Points Table
```typescript
interface CriticalPoint {
  position: number;
  description: string;          // "Support A", "Point Load", "Max Moment"
  shear: number;
  moment: number;
  isDiscontinuity: boolean;
}
```

**Required Critical Points:**
- All support locations
- All load application points (start/end of distributed loads)
- Points of zero shear (max/min moment locations)
- Maximum/minimum values for shear and moment
- Points of inflection

#### Validation Report
Display comprehensive validation:
```
Validation Report:
─────────────────────

Equilibrium Checks:
  ✓ Vertical force equilibrium: ΣF_y = 0.000 kN (tolerance: 0.001 kN)
  ✓ Moment equilibrium: ΣM = 0.000 kN·m (tolerance: 0.001 kN·m)

Boundary Conditions:
  ✓ Moment at Support A (x=0.0m): 0.000 kN·m (simply supported)
  ✓ Moment at Support B (x=10.0m): 0.000 kN·m (simply supported)

Diagram Closure:
  ✓ Shear diagram closure: 0.000 kN
  ✓ Moment diagram closure: 0.000 kN·m

Relationship Verification:
  ✓ dM/dx = V: Average error 0.02%, Max error 0.05%
  ✓ dV/dx = -w: Average error 0.01%, Max error 0.03%

Engineering Checks:
  ✓ All supports within beam length
  ✓ All loads within beam length
  ✓ Beam is statically determinate (reactions = 2)
  ℹ Maximum moment: 50.0 kN·m at x=5.0m
  ℹ Maximum shear: 10.0 kN at x=0.0m
```

### Cantilever Beam Implementation (P1)

#### Support Requirements
```typescript
interface CantileverBeam {
  supports: [FixedSupport];       // Exactly 1 fixed support
  fixedEnd: 'left' | 'right';     // Which end is fixed
}

interface FixedSupport {
  type: 'fixed';
  reactions: {
    verticalForce: number;
    horizontalForce: number;
    moment: number;              // Reaction moment at fixed end
  }
}
```

#### Calculation Method
**Boundary Conditions:**
- Fixed end: V = reaction, M = reaction moment
- Free end: V = 0, M = 0 (if no loads at tip)

**Sign Conventions (from Research.md):**
- Downward loads: negative
- Negative moment: tension on top (frown shape)

#### Validation Against Known Solutions
Must pass tests from Research.md Appendix A.1 and A.2.

### Test Suite (P1)

#### Unit Tests Required
```typescript
describe('Beam Analysis', () => {
  describe('Simply Supported Beams', () => {
    it('should calculate reactions for central point load')
    it('should calculate reactions for UDL')
    it('should calculate reactions for multiple point loads')
    it('should validate equilibrium for all cases')
  })

  describe('Cantilever Beams', () => {
    it('should calculate reactions for point load at free end')
    it('should calculate reactions for UDL')
    it('should match Research.md Example A.1')
    it('should match Research.md Example A.2')
  })

  describe('Validation', () => {
    it('should detect equilibrium violations')
    it('should verify diagram closure')
    it('should verify dM/dx = V relationship')
    it('should identify critical points correctly')
  })

  describe('Edge Cases', () => {
    it('should handle zero-length distributed loads')
    it('should handle loads at support locations')
    it('should handle multiple loads at same position')
    it('should prevent invalid beam configurations')
  })
})
```

#### Integration Tests
- Test against all Research.md Appendix A examples
- Compare results with reference values (< 0.01% error)
- Validate diagram shape and values

#### Benchmark Tests
- Compare with SkyCiv calculator results
- Compare with ClearCalcs results
- Document any intentional differences in approach

---

## User Interface Requirements

### Validation Display (P0)

#### Real-Time Validation Indicators
- Green checkmark: Equilibrium satisfied
- Yellow warning: Minor issues (e.g., values very close to limits)
- Red error: Critical issues (equilibrium violated, invalid configuration)

#### Expandable Calculation Details
```
📋 Calculation Details

▼ Reaction Calculations
  [Show step-by-step equilibrium equations]

▼ Equilibrium Verification
  ✓ ΣFy = 0.000 kN
  ✓ ΣM = 0.000 kN·m

▼ Critical Points
  [Table of shear and moment at key locations]

▼ Validation Report
  [Comprehensive validation checks]
```

### Critical Points Table (P0)
```
Position | Description        | Shear (kN) | Moment (kN·m)
---------|-------------------|------------|---------------
0.00 m   | Support A (Pin)   | +10.00     | 0.00
5.00 m   | Point Load        | -10.00↓    | +50.00 (MAX)
5.00 m   | Zero Shear Point  | 0.00       | +50.00
10.00 m  | Support B (Roller)| +10.00↑    | 0.00

Legend: ↓ = discontinuity (jump down), ↑ = discontinuity (jump up)
```

### Beam Type Selection (P1)
```
Beam Configuration:
  ○ Simply Supported (2 supports: pin + roller)
  ○ Cantilever (1 fixed support)
  ○ Overhanging (2+ supports with extension)
  ○ Fixed-Fixed [Coming Soon]
  ○ Continuous [Coming Soon]
```

### Moment Load Input (P1)
```
Load Type: [Point ▼]
           [Distributed]
           [Moment]     ← Add to UI

If Moment selected:
  Position: [___] m
  Magnitude: [___] kN·m
  Direction: ○ Clockwise  ○ Counterclockwise
```

### Engineering Warnings (P1)
```
⚠ Engineering Warnings:

  • Maximum moment (500 kN·m) is very high for typical beam
  • Consider checking material capacity

  • Deflection not calculated - consider L/360 serviceability check
```

---

## Success Criteria

### P0 (Parity & Validation) - MUST HAVE
- [ ] All equilibrium checks implemented and displayed
- [ ] Diagram closure validation working
- [ ] Relationship verification (dM/dx = V) implemented
- [ ] All Research.md Appendix A examples pass with < 0.01% error
- [ ] Step-by-step calculation display functional
- [ ] Critical points table generated correctly
- [ ] Comprehensive validation report shown to users
- [ ] Benchmark comparison with at least 2 reference calculators documented

### P1 (High Priority) - SHOULD HAVE
- [ ] Cantilever beams fully implemented and tested
- [ ] Moment loads can be added via UI
- [ ] Test suite with >90% coverage for calculation engine
- [ ] Engineering warning system functional
- [ ] Separate max positive and max negative values identified
- [ ] Input validation prevents invalid configurations
- [ ] Statically determinate check implemented

### P2 (Medium Priority) - NICE TO HAVE
- [ ] PDF export generates professional reports
- [ ] Save/load beam configurations
- [ ] Undo/redo functionality
- [ ] Interactive diagrams (hover, click)
- [ ] Template library for common cases
- [ ] Keyboard shortcuts for power users
- [ ] Overhanging beam support

---

## Implementation Phases

### Phase 1A: Parity & Validation (Immediate - Week 1-2)
**Goal:** Ensure mathematical correctness and establish trust

1. Implement equilibrium validation
2. Add diagram closure checks
3. Implement relationship verification
4. Create test suite with Research.md examples
5. Add step-by-step calculation display
6. Generate critical points table
7. Display validation report to users

### Phase 1B: Core Completion (Week 3-4)
**Goal:** Complete Phase 1 feature set per Research.md

1. Implement cantilever beam analysis
2. Add moment load UI controls
3. Expand test coverage to all beam types
4. Add engineering warning system
5. Improve error messages and validation

### Phase 2: Professional Features (Week 5-6)
**Goal:** Enable professional workflows

1. PDF export with calculation details
2. Save/load functionality
3. Enhanced diagrams (interactive, hover values)
4. Template library
5. Overhanging beam support

---

## Out of Scope (For This Release)

The following are explicitly out of scope for current development:
- Fixed-fixed beams (statically indeterminate)
- Continuous beams (>2 supports)
- Deflection calculations
- Stress analysis
- Moving loads
- Dynamic loads
- 3D visualization
- Multi-span beams
- Non-prismatic sections

---

## Risk Assessment

### High Risk
1. **Mathematical errors in validation logic** - Could give false confidence
   - Mitigation: Extensive testing, peer review of formulas

2. **Performance degradation with validation** - Too slow for real-time use
   - Mitigation: Optimize algorithms, use memoization

3. **User confusion with too much information** - Overwhelmed by validation details
   - Mitigation: Collapsible sections, progressive disclosure

### Medium Risk
1. **Test coverage gaps** - Missing edge cases
   - Mitigation: Comprehensive test plan, fuzzing

2. **Floating point precision issues** - Equilibrium never exactly zero
   - Mitigation: Appropriate tolerance values, clear communication

---

## Metrics for Success

### Accuracy Metrics
- **Equilibrium error:** < 0.001% of total load for all test cases
- **Known solution match:** < 0.01% deviation from Research.md examples
- **Benchmark parity:** < 0.1% difference from SkyCiv/ClearCalcs for same inputs

### Quality Metrics
- **Test coverage:** > 90% for calculation engine
- **Zero NaN values:** No calculations producing NaN
- **Validation pass rate:** 100% of valid configurations pass equilibrium checks

### User Experience Metrics
- **Calculation time:** < 100ms for simple beams (target maintained)
- **Time to verify:** Users can verify calculations in < 30 seconds
- **Error prevention:** Invalid configurations caught before calculation

---

## Appendix: Reference Equations

### Fundamental Relationships (from Research.md)
```
dM/dx = V(x)          [Slope of moment = shear force]
dV/dx = -w(x)         [Slope of shear = -load intensity]
d²M/dx² = -w(x)       [Curvature of moment = -load]
ΔM = ∫V(x)dx          [Area under shear = change in moment]
ΔV = ∫w(x)dx          [Area under load = change in shear]
```

### Equilibrium Equations
```
ΣF_y = 0              [Sum of vertical forces = 0]
ΣF_x = 0              [Sum of horizontal forces = 0]
ΣM = 0                [Sum of moments about any point = 0]
```

### Sign Conventions (from LibreTexts PDF)
- **Positive shear:** Upward on left face, downward on right face
- **Positive moment:** Beam "smiles" (concave up, tension on bottom)
- **Downward loads:** Negative (gravity)
- **Upward reactions:** Positive

---

## References
1. Research.md - Comprehensive requirements document
2. LibreTexts: "6.2: Shear/Moment Diagrams" PDF
3. SkyCiv Free Beam Calculator (benchmark)
4. ClearCalcs Beam Analysis (benchmark)
5. BeamGuru (benchmark)

---

**Document Owner:** Development Team
**Last Updated:** 2025-11-09
**Next Review:** After Phase 1A completion
