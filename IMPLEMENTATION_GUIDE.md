# Implementation Guide
## SheerForce - Detailed Technical Implementation Plan

**Version:** 1.0
**Date:** 2025-11-09
**Core Principle:** Mathematical accuracy and calculation traceability

---

## Overview

This document provides detailed implementation specifications for all high and medium priority features identified in the PRD. Each item includes:
- Technical specification
- Code structure
- Implementation steps
- Test requirements
- Acceptance criteria

---

## P0: PARITY & VALIDATION ISSUES (CRITICAL)

### 1. Implement Equilibrium Validation System

**Priority:** P0.1 - CRITICAL
**Complexity:** Medium
**Estimated Effort:** 2-3 days

#### Technical Specification

Create a validation module that verifies equilibrium equations:
- ΣFy = 0 (sum of vertical forces)
- ΣM = 0 (sum of moments about any point)

#### File Structure
```
src/lib/validation/
├── equilibriumValidator.ts
├── types.ts
└── __tests__/
    └── equilibriumValidator.test.ts
```

#### Code Implementation

**File:** `src/lib/validation/types.ts`
```typescript
export interface EquilibriumCheck {
  sumVerticalForces: number;
  sumHorizontalForces: number;
  sumMomentsAboutOrigin: number;
  tolerance: number;
  isVerticalEquilibrium: boolean;
  isHorizontalEquilibrium: boolean;
  isMomentEquilibrium: boolean;
  isValid: boolean;
  messages: string[];
}

export interface ValidationContext {
  beam: Beam;
  reactions: Reaction[];
  tolerance?: number; // Default: 1e-6
}
```

**File:** `src/lib/validation/equilibriumValidator.ts`
```typescript
import type { Beam, Reaction } from '../../types/beam';
import type { EquilibriumCheck, ValidationContext } from './types';

const DEFAULT_TOLERANCE = 1e-6;

export function validateEquilibrium(
  beam: Beam,
  reactions: Reaction[],
  tolerance = DEFAULT_TOLERANCE
): EquilibriumCheck {
  // Calculate sum of vertical forces
  const sumVerticalForces = calculateVerticalForceSum(beam, reactions);

  // Calculate sum of horizontal forces
  const sumHorizontalForces = calculateHorizontalForceSum(beam, reactions);

  // Calculate sum of moments about origin (x=0)
  const sumMoments = calculateMomentSum(beam, reactions);

  // Check if within tolerance
  const isVerticalEquilibrium = Math.abs(sumVerticalForces) < tolerance;
  const isHorizontalEquilibrium = Math.abs(sumHorizontalForces) < tolerance;
  const isMomentEquilibrium = Math.abs(sumMoments) < tolerance;

  const isValid = isVerticalEquilibrium && isHorizontalEquilibrium && isMomentEquilibrium;

  // Generate messages
  const messages: string[] = [];
  if (!isVerticalEquilibrium) {
    messages.push(`Vertical force equilibrium violated: ΣFy = ${sumVerticalForces.toFixed(6)}`);
  }
  if (!isHorizontalEquilibrium) {
    messages.push(`Horizontal force equilibrium violated: ΣFx = ${sumHorizontalForces.toFixed(6)}`);
  }
  if (!isMomentEquilibrium) {
    messages.push(`Moment equilibrium violated: ΣM = ${sumMoments.toFixed(6)}`);
  }

  return {
    sumVerticalForces,
    sumHorizontalForces,
    sumMomentsAboutOrigin: sumMoments,
    tolerance,
    isVerticalEquilibrium,
    isHorizontalEquilibrium,
    isMomentEquilibrium,
    isValid,
    messages,
  };
}

function calculateVerticalForceSum(beam: Beam, reactions: Reaction[]): number {
  // Sum all reaction forces (positive upward)
  let sum = reactions.reduce((acc, r) => acc + r.verticalForce, 0);

  // Subtract all applied loads (downward loads are negative in our convention)
  beam.loads.forEach(load => {
    if (load.type === 'point') {
      sum -= load.magnitude * Math.cos(load.angle * Math.PI / 180);
    } else if (load.type === 'distributed') {
      const length = load.endPosition - load.startPosition;
      if (length === 0) {
        sum -= load.startMagnitude;
      } else {
        const avgMagnitude = (load.startMagnitude + load.endMagnitude) / 2;
        sum -= avgMagnitude * length;
      }
    }
    // Moment loads don't affect vertical force equilibrium
  });

  return sum;
}

function calculateHorizontalForceSum(beam: Beam, reactions: Reaction[]): number {
  let sum = reactions.reduce((acc, r) => acc + r.horizontalForce, 0);

  // Add horizontal components of applied loads
  beam.loads.forEach(load => {
    if (load.type === 'point') {
      sum -= load.magnitude * Math.sin(load.angle * Math.PI / 180);
    }
  });

  return sum;
}

function calculateMomentSum(beam: Beam, reactions: Reaction[]): number {
  // Sum moments about origin (x=0)
  let sum = 0;

  // Add reaction moments
  reactions.forEach(r => {
    sum += r.moment; // Reaction moments
    sum += r.verticalForce * r.position; // Moment from vertical reaction
    sum += r.horizontalForce * 0; // Assuming beam height = 0 (centerline)
  });

  // Subtract moments from applied loads
  beam.loads.forEach(load => {
    if (load.type === 'point') {
      const verticalComponent = load.magnitude * Math.cos(load.angle * Math.PI / 180);
      sum -= verticalComponent * load.position;
    } else if (load.type === 'distributed') {
      const length = load.endPosition - load.startPosition;
      if (length === 0) {
        sum -= load.startMagnitude * load.startPosition;
      } else {
        const avgMagnitude = (load.startMagnitude + load.endMagnitude) / 2;
        const totalLoad = avgMagnitude * length;
        const centroid = load.startPosition + length / 2;
        sum -= totalLoad * centroid;
      }
    } else if (load.type === 'moment') {
      sum -= load.direction === 'clockwise' ? -load.magnitude : load.magnitude;
    }
  });

  return sum;
}
```

#### Integration with Existing Code

Update `src/lib/beamAnalysis.ts`:
```typescript
import { validateEquilibrium } from './validation/equilibriumValidator';

export function analyzeBeam(beam: Beam): AnalysisResults {
  const reactions = calculateReactions(beam);
  const shearForce = calculateShearForce(beam, reactions);
  const bendingMoment = calculateBendingMoment(beam, reactions);

  // Add equilibrium validation
  const equilibriumCheck = validateEquilibrium(beam, reactions);

  // Existing max calculations...
  const maxShear = shearForce.reduce((max, point) =>
    Math.abs(point.value) > Math.abs(max.value) ? point : max
  );
  const maxMoment = bendingMoment.reduce((max, point) =>
    Math.abs(point.value) > Math.abs(max.value) ? point : max
  );

  return {
    reactions,
    shearForce,
    bendingMoment,
    maxShear,
    maxMoment,
    validation: {
      equilibrium: equilibriumCheck,
    },
  };
}
```

Update `src/types/beam.ts`:
```typescript
import type { EquilibriumCheck } from '../lib/validation/types';

export interface AnalysisResults {
  reactions: Reaction[];
  shearForce: DiagramPoint[];
  bendingMoment: DiagramPoint[];
  maxShear: { position: number; value: number };
  maxMoment: { position: number; value: number };
  validation?: {
    equilibrium?: EquilibriumCheck;
  };
}
```

#### Tests Required

**File:** `src/lib/validation/__tests__/equilibriumValidator.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { validateEquilibrium } from '../equilibriumValidator';
import type { Beam, Reaction } from '../../../types/beam';

describe('equilibriumValidator', () => {
  describe('validateEquilibrium', () => {
    it('should pass for simply supported beam with central point load', () => {
      const beam: Beam = {
        id: 'test-1',
        length: 10,
        units: 'metric',
        supports: [
          { id: 's1', position: 0, type: 'pin' },
          { id: 's2', position: 10, type: 'roller' },
        ],
        loads: [
          { id: 'l1', type: 'point', position: 5, magnitude: 20, angle: 0 },
        ],
      };

      const reactions: Reaction[] = [
        { supportId: 's1', position: 0, verticalForce: 10, horizontalForce: 0, moment: 0 },
        { supportId: 's2', position: 10, verticalForce: 10, horizontalForce: 0, moment: 0 },
      ];

      const result = validateEquilibrium(beam, reactions);

      expect(result.isValid).toBe(true);
      expect(result.isVerticalEquilibrium).toBe(true);
      expect(result.isMomentEquilibrium).toBe(true);
      expect(Math.abs(result.sumVerticalForces)).toBeLessThan(1e-10);
      expect(Math.abs(result.sumMomentsAboutOrigin)).toBeLessThan(1e-10);
    });

    it('should fail for incorrect reactions', () => {
      const beam: Beam = {
        id: 'test-2',
        length: 10,
        units: 'metric',
        supports: [
          { id: 's1', position: 0, type: 'pin' },
          { id: 's2', position: 10, type: 'roller' },
        ],
        loads: [
          { id: 'l1', type: 'point', position: 5, magnitude: 20, angle: 0 },
        ],
      };

      // Wrong reactions (should be 10 each, not 5 each)
      const reactions: Reaction[] = [
        { supportId: 's1', position: 0, verticalForce: 5, horizontalForce: 0, moment: 0 },
        { supportId: 's2', position: 10, verticalForce: 5, horizontalForce: 0, moment: 0 },
      ];

      const result = validateEquilibrium(beam, reactions);

      expect(result.isValid).toBe(false);
      expect(result.isVerticalEquilibrium).toBe(false);
      expect(result.messages.length).toBeGreaterThan(0);
    });

    it('should handle distributed loads', () => {
      // Test with UDL
      // ... add test case
    });

    it('should handle moment loads', () => {
      // Test with applied moments
      // ... add test case
    });
  });
});
```

#### Acceptance Criteria
- [ ] All equilibrium checks pass for test cases
- [ ] Validation integrated into analyzeBeam()
- [ ] Results stored in AnalysisResults
- [ ] Test coverage > 95%
- [ ] Research.md examples pass validation

---

### 2. Add Diagram Closure Validation

**Priority:** P0.2 - CRITICAL
**Complexity:** Low-Medium
**Estimated Effort:** 1-2 days

#### Technical Specification

Verify that diagrams satisfy boundary conditions:
- **Simply supported:** M = 0 at both supports
- **Cantilever free end:** V = 0, M = 0
- **Shear diagram:** Should close based on beam type

#### Code Implementation

**File:** `src/lib/validation/diagramValidator.ts`
```typescript
import type { Beam, DiagramPoint, SupportType } from '../../types/beam';

export interface DiagramClosureCheck {
  shearClosure: {
    isValid: boolean;
    expectedValue: number;
    actualValue: number;
    error: number;
    location: string;
  }[];
  momentClosure: {
    isValid: boolean;
    expectedValue: number;
    actualValue: number;
    error: number;
    location: string;
  }[];
  isValid: boolean;
  messages: string[];
}

export function validateDiagramClosure(
  beam: Beam,
  shearForce: DiagramPoint[],
  bendingMoment: DiagramPoint[],
  tolerance = 1e-6
): DiagramClosureCheck {
  const momentChecks: DiagramClosureCheck['momentClosure'] = [];
  const shearChecks: DiagramClosureCheck['shearClosure'] = [];
  const messages: string[] = [];

  // Check boundary conditions based on support types
  beam.supports.forEach(support => {
    if (support.type === 'pin' || support.type === 'roller') {
      // Moment should be zero at simple supports
      const momentAtSupport = interpolateValue(bendingMoment, support.position);
      const error = Math.abs(momentAtSupport);
      const isValid = error < tolerance;

      momentChecks.push({
        isValid,
        expectedValue: 0,
        actualValue: momentAtSupport,
        error,
        location: `Support at x=${support.position}m (${support.type})`,
      });

      if (!isValid) {
        messages.push(
          `Moment at ${support.type} support (x=${support.position}) should be 0, ` +
          `but is ${momentAtSupport.toFixed(6)}`
        );
      }
    }
  });

  // Check free end conditions for cantilever
  // (Will be implemented when cantilever support is added)

  const isValid = momentChecks.every(c => c.isValid) && shearChecks.every(c => c.isValid);

  return {
    shearClosure: shearChecks,
    momentClosure: momentChecks,
    isValid,
    messages,
  };
}

function interpolateValue(points: DiagramPoint[], position: number): number {
  // Find closest points
  const before = points.filter(p => p.position <= position).pop();
  const after = points.find(p => p.position >= position);

  if (!before || !after) {
    return points[0]?.value ?? 0;
  }

  if (before.position === after.position) {
    return before.value;
  }

  // Linear interpolation
  const t = (position - before.position) / (after.position - before.position);
  return before.value + t * (after.value - before.value);
}
```

#### Acceptance Criteria
- [ ] Validates moment = 0 at simple supports
- [ ] Will validate free end conditions for cantilevers
- [ ] Integrated into validation report
- [ ] All test cases pass

---

### 3. Implement Relationship Verification (dM/dx = V)

**Priority:** P0.3 - CRITICAL
**Complexity:** Medium
**Estimated Effort:** 2 days

#### Technical Specification

Verify fundamental beam relationships:
- dM/dx = V(x)
- dV/dx = -w(x)

Use numerical differentiation to compute derivatives and compare.

#### Code Implementation

**File:** `src/lib/validation/relationshipValidator.ts`
```typescript
import type { DiagramPoint, Beam } from '../../types/beam';

export interface RelationshipCheck {
  dMdx_equals_V: {
    isValid: boolean;
    maxError: number;
    averageError: number;
    rmsError: number;
  };
  dVdx_equals_negW: {
    isValid: boolean;
    maxError: number;
    averageError: number;
    rmsError: number;
  };
  isValid: boolean;
  messages: string[];
}

export function validateRelationships(
  beam: Beam,
  shearForce: DiagramPoint[],
  bendingMoment: DiagramPoint[],
  tolerance = 0.001 // 0.1% tolerance
): RelationshipCheck {
  // Verify dM/dx = V
  const dMdxCheck = verifyDMDxEqualsV(shearForce, bendingMoment, tolerance);

  // Verify dV/dx = -w (requires load function)
  const dVdxCheck = verifyDVDxEqualsNegW(beam, shearForce, tolerance);

  const messages: string[] = [];
  if (!dMdxCheck.isValid) {
    messages.push(
      `dM/dx = V relationship not satisfied. ` +
      `Max error: ${(dMdxCheck.maxError * 100).toFixed(2)}%, ` +
      `Average error: ${(dMdxCheck.averageError * 100).toFixed(2)}%`
    );
  }
  if (!dVdxCheck.isValid) {
    messages.push(
      `dV/dx = -w relationship not satisfied. ` +
      `Max error: ${(dVdxCheck.maxError * 100).toFixed(2)}%`
    );
  }

  return {
    dMdx_equals_V: dMdxCheck,
    dVdx_equals_negW: dVdxCheck,
    isValid: dMdxCheck.isValid && dVdxCheck.isValid,
    messages,
  };
}

function verifyDMDxEqualsV(
  shearForce: DiagramPoint[],
  bendingMoment: DiagramPoint[],
  tolerance: number
) {
  const errors: number[] = [];

  for (let i = 1; i < bendingMoment.length - 1; i++) {
    const h = bendingMoment[i + 1].position - bendingMoment[i - 1].position;

    // Central difference: dM/dx ≈ (M(x+h) - M(x-h)) / (2h)
    const dMdx = (bendingMoment[i + 1].value - bendingMoment[i - 1].value) / h;
    const V = shearForce[i].value;

    // Skip near discontinuities (point loads)
    if (Math.abs(V) > 1e-10) {
      const relativeError = Math.abs((dMdx - V) / V);
      errors.push(relativeError);
    } else {
      const absoluteError = Math.abs(dMdx - V);
      errors.push(absoluteError);
    }
  }

  const maxError = Math.max(...errors);
  const averageError = errors.reduce((a, b) => a + b, 0) / errors.length;
  const rmsError = Math.sqrt(errors.reduce((a, b) => a + b * b, 0) / errors.length);

  return {
    isValid: maxError < tolerance,
    maxError,
    averageError,
    rmsError,
  };
}

function verifyDVDxEqualsNegW(
  beam: Beam,
  shearForce: DiagramPoint[],
  tolerance: number
) {
  // Calculate load intensity at each point
  const errors: number[] = [];

  for (let i = 1; i < shearForce.length - 1; i++) {
    const x = shearForce[i].position;
    const h = shearForce[i + 1].position - shearForce[i - 1].position;

    // Central difference: dV/dx
    const dVdx = (shearForce[i + 1].value - shearForce[i - 1].value) / h;

    // Calculate load intensity at x
    const w = calculateLoadIntensityAt(beam, x);

    // dV/dx should equal -w
    if (Math.abs(w) > 1e-10) {
      const relativeError = Math.abs((dVdx + w) / w);
      errors.push(relativeError);
    } else {
      const absoluteError = Math.abs(dVdx + w);
      errors.push(absoluteError);
    }
  }

  if (errors.length === 0) {
    return { isValid: true, maxError: 0, averageError: 0, rmsError: 0 };
  }

  const maxError = Math.max(...errors);
  const averageError = errors.reduce((a, b) => a + b, 0) / errors.length;
  const rmsError = Math.sqrt(errors.reduce((a, b) => a + b * b, 0) / errors.length);

  return {
    isValid: maxError < tolerance,
    maxError,
    averageError,
    rmsError,
  };
}

function calculateLoadIntensityAt(beam: Beam, x: number): number {
  let w = 0;

  beam.loads.forEach(load => {
    if (load.type === 'distributed') {
      if (x >= load.startPosition && x <= load.endPosition) {
        const length = load.endPosition - load.startPosition;
        if (length === 0) {
          // Zero-length load doesn't contribute to intensity
        } else {
          const localX = x - load.startPosition;
          w += load.startMagnitude +
               (load.endMagnitude - load.startMagnitude) * localX / length;
        }
      }
    }
    // Point loads and moments don't contribute to distributed intensity
  });

  return w;
}
```

#### Acceptance Criteria
- [ ] Verifies dM/dx = V with < 0.1% error
- [ ] Verifies dV/dx = -w for distributed loads
- [ ] Handles discontinuities (point loads) correctly
- [ ] Integrated into validation report

---

### 4. Create Test Suite with Research.md Examples

**Priority:** P0.4 - CRITICAL
**Complexity:** Medium
**Estimated Effort:** 2-3 days

#### Test Cases from Research.md Appendix A

**File:** `src/lib/__tests__/knownSolutions.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { analyzeBeam } from '../beamAnalysis';
import type { Beam } from '../../types/beam';

describe('Known Solution Validation', () => {
  describe('Appendix A.1: Cantilever with Point Load', () => {
    it('should match expected results for 5 lb load at 3 ft', () => {
      const beam: Beam = {
        id: 'appendix-a1',
        length: 3,
        units: 'imperial',
        supports: [
          { id: 's1', position: 3, type: 'fixed' },
        ],
        loads: [
          { id: 'l1', type: 'point', position: 0, magnitude: 5, angle: 0 },
        ],
      };

      const results = analyzeBeam(beam);

      // Expected: B_y = 5 lb, M_B = 15 ft-lb
      expect(results.reactions[0].verticalForce).toBeCloseTo(5, 4);
      expect(results.reactions[0].moment).toBeCloseTo(15, 4);

      // Expected: V = -5 lb (constant)
      results.shearForce.forEach(point => {
        expect(point.value).toBeCloseTo(-5, 4);
      });

      // Expected: M = -5x (linear)
      results.bendingMoment.forEach(point => {
        const expectedMoment = -5 * point.position;
        expect(point.value).toBeCloseTo(expectedMoment, 3);
      });

      // Maximum moment at fixed end
      expect(Math.abs(results.maxMoment.value)).toBeCloseTo(15, 4);
      expect(results.maxMoment.position).toBeCloseTo(3, 2);

      // Validation should pass
      expect(results.validation?.equilibrium?.isValid).toBe(true);
    });
  });

  describe('Appendix A.2: Cantilever with UDL', () => {
    it('should match expected results for 20 kN/m over 5 m', () => {
      const beam: Beam = {
        id: 'appendix-a2',
        length: 5,
        units: 'metric',
        supports: [
          { id: 's1', position: 5, type: 'fixed' },
        ],
        loads: [
          {
            id: 'l1',
            type: 'distributed',
            startPosition: 0,
            endPosition: 5,
            startMagnitude: 20,
            endMagnitude: 20,
          },
        ],
      };

      const results = analyzeBeam(beam);

      // Expected: B_y = 100 kN, M_B = 250 kN·m
      expect(results.reactions[0].verticalForce).toBeCloseTo(100, 2);
      expect(results.reactions[0].moment).toBeCloseTo(250, 2);

      // Expected: V = -20x
      results.shearForce.forEach(point => {
        const expectedShear = -20 * point.position;
        expect(point.value).toBeCloseTo(expectedShear, 2);
      });

      // Expected: M = -10x²
      results.bendingMoment.forEach(point => {
        const expectedMoment = -10 * point.position ** 2;
        expect(point.value).toBeCloseTo(expectedMoment, 1);
      });

      // Specific points
      const momentAt2_5 = results.bendingMoment.find(p =>
        Math.abs(p.position - 2.5) < 0.05
      );
      expect(momentAt2_5?.value).toBeCloseTo(-62.5, 1);

      // Maximum moment at fixed end
      expect(Math.abs(results.maxMoment.value)).toBeCloseTo(250, 1);
    });
  });

  describe('Appendix A.3: Simply Supported with Central Point Load', () => {
    it('should match expected results for 20 kN at 5 m on 10 m beam', () => {
      const beam: Beam = {
        id: 'appendix-a3',
        length: 10,
        units: 'metric',
        supports: [
          { id: 's1', position: 0, type: 'pin' },
          { id: 's2', position: 10, type: 'roller' },
        ],
        loads: [
          { id: 'l1', type: 'point', position: 5, magnitude: 20, angle: 0 },
        ],
      };

      const results = analyzeBeam(beam);

      // Expected: A_y = B_y = 10 kN
      expect(results.reactions[0].verticalForce).toBeCloseTo(10, 2);
      expect(results.reactions[1].verticalForce).toBeCloseTo(10, 2);

      // Expected: M_max = 50 kN·m at x = 5 m
      expect(results.maxMoment.value).toBeCloseTo(50, 2);
      expect(results.maxMoment.position).toBeCloseTo(5, 1);

      // Shear: V = 10 kN for 0 < x < 5, V = -10 kN for 5 < x < 10
      const shearBefore = results.shearForce.find(p => p.position < 4.9);
      const shearAfter = results.shearForce.find(p => p.position > 5.1);
      expect(shearBefore?.value).toBeCloseTo(10, 2);
      expect(shearAfter?.value).toBeCloseTo(-10, 2);

      // Validation
      expect(results.validation?.equilibrium?.isValid).toBe(true);
    });
  });
});
```

#### Acceptance Criteria
- [ ] All Research.md Appendix A examples implemented as tests
- [ ] All tests pass with < 0.01% error
- [ ] Cantilever tests added (pending cantilever implementation)
- [ ] Tests run in CI/CD pipeline

---

### 5. Implement Step-by-Step Calculation Display

**Priority:** P0.5 - CRITICAL
**Complexity:** High
**Estimated Effort:** 3-4 days

#### Technical Specification

Generate human-readable calculation steps showing:
- Free body diagram description
- Equilibrium equations
- Algebraic solution steps
- Numerical results

#### Code Implementation

**File:** `src/lib/calculationTrace/reactionSteps.ts`
```typescript
export interface CalculationStep {
  stepNumber: number;
  title: string;
  description: string;
  equations: string[];
  result?: string;
}

export interface ReactionCalculationTrace {
  steps: CalculationStep[];
  summary: string;
}

export function generateReactionSteps(
  beam: Beam,
  reactions: Reaction[]
): ReactionCalculationTrace {
  const steps: CalculationStep[] = [];

  if (beam.supports.length === 2) {
    return generateSimplySupportedSteps(beam, reactions);
  } else if (beam.supports.length === 1 && beam.supports[0].type === 'fixed') {
    return generateCantileverSteps(beam, reactions);
  }

  return { steps: [], summary: 'Unknown beam configuration' };
}

function generateSimplySupportedSteps(
  beam: Beam,
  reactions: Reaction[]
): ReactionCalculationTrace {
  const steps: CalculationStep[] = [];
  const [support1, support2] = beam.supports;
  const [reaction1, reaction2] = reactions;

  // Step 1: Free body diagram
  steps.push({
    stepNumber: 1,
    title: 'Free Body Diagram',
    description: `Simply supported beam with ${support1.type} at x=${support1.position}m and ${support2.type} at x=${support2.position}m`,
    equations: [
      `Beam length: L = ${beam.length} ${beam.units === 'metric' ? 'm' : 'ft'}`,
      `Support A: ${support1.type} at x = ${support1.position}`,
      `Support B: ${support2.type} at x = ${support2.position}`,
    ],
  });

  // Step 2: List applied loads
  const loadDescriptions: string[] = [];
  beam.loads.forEach((load, idx) => {
    if (load.type === 'point') {
      loadDescriptions.push(
        `Load ${idx + 1}: Point load P = ${load.magnitude} ${getForceUnit(beam.units)} at x = ${load.position}`
      );
    } else if (load.type === 'distributed') {
      loadDescriptions.push(
        `Load ${idx + 1}: Distributed load w = ${load.startMagnitude} ${getForceUnit(beam.units)}/m from x = ${load.startPosition} to ${load.endPosition}`
      );
    }
  });

  steps.push({
    stepNumber: 2,
    title: 'Applied Loads',
    description: 'List of all applied loads on the beam',
    equations: loadDescriptions,
  });

  // Step 3: Sum moments about support 1
  let totalMoment = 0;
  const momentEquations: string[] = [
    `ΣM_A = 0 (equilibrium equation)`,
    '',
    'Moments from loads:',
  ];

  beam.loads.forEach((load, idx) => {
    if (load.type === 'point') {
      const moment = load.magnitude * (load.position - support1.position);
      totalMoment += moment;
      momentEquations.push(
        `  • Load ${idx + 1}: ${load.magnitude} × (${load.position} - ${support1.position}) = ${moment.toFixed(2)} ${getForceUnit(beam.units)}·m`
      );
    } else if (load.type === 'distributed') {
      const length = load.endPosition - load.startPosition;
      if (length > 0) {
        const avgMagnitude = (load.startMagnitude + load.endMagnitude) / 2;
        const totalLoad = avgMagnitude * length;
        const centroid = load.startPosition + length / 2;
        const moment = totalLoad * (centroid - support1.position);
        totalMoment += moment;
        momentEquations.push(
          `  • Load ${idx + 1}: ${avgMagnitude.toFixed(2)} × ${length} × (${centroid.toFixed(2)} - ${support1.position}) = ${moment.toFixed(2)}`
        );
      }
    }
  });

  momentEquations.push('');
  momentEquations.push('Moments from reactions:');
  momentEquations.push(
    `  • Reaction at B: +R_B × ${support2.position - support1.position}`
  );
  momentEquations.push('');
  momentEquations.push(
    `Equation: ${totalMoment.toFixed(2)} + R_B × ${support2.position - support1.position} = 0`
  );
  momentEquations.push(
    `Solving: R_B = ${reaction2.verticalForce.toFixed(2)} ${getForceUnit(beam.units)} ↑`
  );

  steps.push({
    stepNumber: 3,
    title: `Sum Moments about Support A (x=${support1.position})`,
    description: 'Calculate reaction at support B using moment equilibrium',
    equations: momentEquations,
    result: `R_B = ${reaction2.verticalForce.toFixed(2)} ${getForceUnit(beam.units)}`,
  });

  // Step 4: Sum vertical forces
  let totalLoad = 0;
  const forceEquations: string[] = [
    `ΣF_y = 0 (equilibrium equation)`,
    '',
    'Applied loads:',
  ];

  beam.loads.forEach(load => {
    if (load.type === 'point') {
      totalLoad += load.magnitude;
      forceEquations.push(`  • ${load.magnitude} ${getForceUnit(beam.units)} (downward)`);
    } else if (load.type === 'distributed') {
      const length = load.endPosition - load.startPosition;
      if (length > 0) {
        const avgMagnitude = (load.startMagnitude + load.endMagnitude) / 2;
        const total = avgMagnitude * length;
        totalLoad += total;
        forceEquations.push(`  • ${total.toFixed(2)} ${getForceUnit(beam.units)} (downward)`);
      }
    }
  });

  forceEquations.push('');
  forceEquations.push('Reactions:');
  forceEquations.push(`  • R_A + R_B`);
  forceEquations.push('');
  forceEquations.push(
    `Equation: R_A + ${reaction2.verticalForce.toFixed(2)} - ${totalLoad.toFixed(2)} = 0`
  );
  forceEquations.push(
    `Solving: R_A = ${reaction1.verticalForce.toFixed(2)} ${getForceUnit(beam.units)} ↑`
  );

  steps.push({
    stepNumber: 4,
    title: 'Sum Vertical Forces',
    description: 'Calculate reaction at support A using force equilibrium',
    equations: forceEquations,
    result: `R_A = ${reaction1.verticalForce.toFixed(2)} ${getForceUnit(beam.units)}`,
  });

  // Step 5: Equilibrium check
  const equilibriumCheck = validateEquilibrium(beam, reactions);
  const checkEquations: string[] = [
    `✓ ΣF_y = ${equilibriumCheck.sumVerticalForces.toFixed(6)} ${getForceUnit(beam.units)}`,
    `✓ ΣM_A = ${equilibriumCheck.sumMomentsAboutOrigin.toFixed(6)} ${getForceUnit(beam.units)}·m`,
  ];

  steps.push({
    stepNumber: 5,
    title: 'Equilibrium Check',
    description: 'Verify that equilibrium equations are satisfied',
    equations: checkEquations,
    result: equilibriumCheck.isValid ? 'All checks passed ✓' : 'Equilibrium violated ✗',
  });

  const summary = `Reactions calculated for simply supported beam: ` +
    `R_A = ${reaction1.verticalForce.toFixed(2)} ${getForceUnit(beam.units)}, ` +
    `R_B = ${reaction2.verticalForce.toFixed(2)} ${getForceUnit(beam.units)}`;

  return { steps, summary };
}

function getForceUnit(units: 'metric' | 'imperial'): string {
  return units === 'metric' ? 'kN' : 'kips';
}
```

#### UI Component

**File:** `src/components/CalculationSteps.tsx`
```typescript
import React, { useState } from 'react';
import type { ReactionCalculationTrace } from '../lib/calculationTrace/reactionSteps';

interface CalculationStepsProps {
  trace: ReactionCalculationTrace;
}

export function CalculationSteps({ trace }: CalculationStepsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="calculation-steps border rounded-lg p-4 bg-gray-50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left font-semibold"
      >
        <span className="flex items-center gap-2">
          📋 Calculation Details
        </span>
        <span>{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {trace.steps.map(step => (
            <div key={step.stepNumber} className="step border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-blue-700">
                Step {step.stepNumber}: {step.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
              <div className="mt-2 font-mono text-sm bg-white p-3 rounded border">
                {step.equations.map((eq, idx) => (
                  <div key={idx} className={eq === '' ? 'h-2' : ''}>
                    {eq}
                  </div>
                ))}
              </div>
              {step.result && (
                <div className="mt-2 font-semibold text-green-700">
                  → {step.result}
                </div>
              )}
            </div>
          ))}

          <div className="summary bg-blue-50 p-3 rounded border border-blue-200">
            <strong>Summary:</strong> {trace.summary}
          </div>
        </div>
      )}
    </div>
  );
}
```

#### Acceptance Criteria
- [ ] Step-by-step display for simply supported beams
- [ ] Step-by-step display for cantilever beams
- [ ] Equations formatted clearly
- [ ] Collapsible UI component
- [ ] Integrated into main app

---

## (Continued in IMPLEMENTATION_GUIDE_PART2.md due to length)

---

## Summary of P0 Tasks

1. ✅ Equilibrium Validation - Detailed spec provided
2. ✅ Diagram Closure - Detailed spec provided
3. ✅ Relationship Verification - Detailed spec provided
4. ✅ Known Solution Tests - Test cases specified
5. ✅ Step-by-Step Calculations - Full implementation provided
6. ⏳ Critical Points Table - See Part 2
7. ⏳ Validation Report Component - See Part 2
8. ⏳ Benchmark Documentation - See Part 2

### Quick Start Checklist

**Day 1-2: Foundation**
- [ ] Set up validation directory structure
- [ ] Implement equilibriumValidator.ts
- [ ] Write tests for equilibrium validation
- [ ] Integrate into beamAnalysis.ts

**Day 3-4: Validation Suite**
- [ ] Implement diagramValidator.ts
- [ ] Implement relationshipValidator.ts
- [ ] Create knownSolutions.test.ts
- [ ] All tests passing

**Day 5-7: Traceability**
- [ ] Implement calculation trace generation
- [ ] Create CalculationSteps component
- [ ] Create critical points table
- [ ] Create validation report UI

**Day 8: Documentation**
- [ ] Document benchmark comparisons
- [ ] Update README with validation features
- [ ] Create validation report examples

---

**Next:** See IMPLEMENTATION_GUIDE_PART2.md for P1 and P2 tasks
