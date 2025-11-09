# Implementation Guide - Part 2
## SheerForce - P0 (Continued), P1, and P2 Tasks

**Version:** 1.0
**Date:** 2025-11-09
**Continuation of:** IMPLEMENTATION_GUIDE.md

---

## P0: PARITY & VALIDATION (Continued)

### 6. Generate Critical Points Table

**Priority:** P0.6 - CRITICAL
**Complexity:** Medium
**Estimated Effort:** 2 days

#### Technical Specification

Generate a table showing shear and moment values at all critical locations:
- Support positions
- Load application points (start/end of distributed loads, point loads)
- Points of zero shear (max/min moment)
- Maximum/minimum shear and moment locations
- Points of inflection

#### Code Implementation

**File:** `src/lib/criticalPoints/analyzer.ts`
```typescript
import type { Beam, Reaction, DiagramPoint } from '../../types/beam';

export interface CriticalPoint {
  position: number;
  description: string;
  category: 'support' | 'load' | 'zero_shear' | 'extremum' | 'inflection';
  shear: number;
  moment: number;
  isDiscontinuity: boolean;
  shearBefore?: number;  // For discontinuities
  shearAfter?: number;   // For discontinuities
}

export function identifyCriticalPoints(
  beam: Beam,
  reactions: Reaction[],
  shearForce: DiagramPoint[],
  bendingMoment: DiagramPoint[]
): CriticalPoint[] {
  const points: CriticalPoint[] = [];

  // Add support locations
  beam.supports.forEach(support => {
    const reaction = reactions.find(r => r.supportId === support.id);
    points.push({
      position: support.position,
      description: `Support ${support.id.toUpperCase()} (${support.type})`,
      category: 'support',
      shear: interpolateValue(shearForce, support.position),
      moment: interpolateValue(bendingMoment, support.position),
      isDiscontinuity: true,
      shearBefore: reaction ? interpolateBefore(shearForce, support.position) : undefined,
      shearAfter: reaction ? interpolateAfter(shearForce, support.position) : undefined,
    });
  });

  // Add load application points
  beam.loads.forEach((load, idx) => {
    if (load.type === 'point') {
      points.push({
        position: load.position,
        description: `Point Load ${idx + 1} (${load.magnitude} ${getForceUnit(beam.units)})`,
        category: 'load',
        shear: interpolateValue(shearForce, load.position),
        moment: interpolateValue(bendingMoment, load.position),
        isDiscontinuity: true,
        shearBefore: interpolateBefore(shearForce, load.position),
        shearAfter: interpolateAfter(shearForce, load.position),
      });
    } else if (load.type === 'distributed') {
      // Start of distributed load
      points.push({
        position: load.startPosition,
        description: `Start of UDL ${idx + 1}`,
        category: 'load',
        shear: interpolateValue(shearForce, load.startPosition),
        moment: interpolateValue(bendingMoment, load.startPosition),
        isDiscontinuity: false,
      });

      // End of distributed load
      points.push({
        position: load.endPosition,
        description: `End of UDL ${idx + 1}`,
        category: 'load',
        shear: interpolateValue(shearForce, load.endPosition),
        moment: interpolateValue(bendingMoment, load.endPosition),
        isDiscontinuity: false,
      });
    } else if (load.type === 'moment') {
      points.push({
        position: load.position,
        description: `Applied Moment ${idx + 1} (${load.magnitude} ${getMomentUnit(beam.units)})`,
        category: 'load',
        shear: interpolateValue(shearForce, load.position),
        moment: interpolateValue(bendingMoment, load.position),
        isDiscontinuity: true, // Moment diagram has discontinuity
      });
    }
  });

  // Find zero shear points (max/min moment)
  const zeroShearPoints = findZeroShearPoints(shearForce, bendingMoment);
  zeroShearPoints.forEach((point, idx) => {
    points.push({
      position: point.position,
      description: `Zero Shear Point ${idx + 1} (Max/Min Moment)`,
      category: 'zero_shear',
      shear: point.shear,
      moment: point.moment,
      isDiscontinuity: false,
    });
  });

  // Find maximum positive and negative shear
  const maxPosShear = findMaximum(shearForce, value => value > 0);
  const maxNegShear = findMaximum(shearForce, value => value < 0);

  if (maxPosShear) {
    points.push({
      position: maxPosShear.position,
      description: `Maximum Positive Shear (${maxPosShear.value.toFixed(2)} ${getForceUnit(beam.units)})`,
      category: 'extremum',
      shear: maxPosShear.value,
      moment: interpolateValue(bendingMoment, maxPosShear.position),
      isDiscontinuity: false,
    });
  }

  if (maxNegShear) {
    points.push({
      position: maxNegShear.position,
      description: `Maximum Negative Shear (${maxNegShear.value.toFixed(2)} ${getForceUnit(beam.units)})`,
      category: 'extremum',
      shear: maxNegShear.value,
      moment: interpolateValue(bendingMoment, maxNegShear.position),
      isDiscontinuity: false,
    });
  }

  // Find maximum positive and negative moment
  const maxPosMoment = findMaximum(bendingMoment, value => value > 0);
  const maxNegMoment = findMaximum(bendingMoment, value => value < 0);

  if (maxPosMoment) {
    points.push({
      position: maxPosMoment.position,
      description: `Maximum Positive Moment (${maxPosMoment.value.toFixed(2)} ${getMomentUnit(beam.units)})`,
      category: 'extremum',
      shear: interpolateValue(shearForce, maxPosMoment.position),
      moment: maxPosMoment.value,
      isDiscontinuity: false,
    });
  }

  if (maxNegMoment) {
    points.push({
      position: maxNegMoment.position,
      description: `Maximum Negative Moment (${maxNegMoment.value.toFixed(2)} ${getMomentUnit(beam.units)})`,
      category: 'extremum',
      shear: interpolateValue(shearForce, maxNegMoment.position),
      moment: maxNegMoment.value,
      isDiscontinuity: false,
    });
  }

  // Sort by position and remove duplicates
  return deduplicatePoints(points.sort((a, b) => a.position - b.position));
}

function findZeroShearPoints(
  shearForce: DiagramPoint[],
  bendingMoment: DiagramPoint[]
): Array<{ position: number; shear: number; moment: number }> {
  const zeroPoints: Array<{ position: number; shear: number; moment: number }> = [];

  for (let i = 1; i < shearForce.length; i++) {
    const prev = shearForce[i - 1];
    const curr = shearForce[i];

    // Check for sign change (zero crossing)
    if (prev.value * curr.value < 0) {
      // Linear interpolation to find zero position
      const t = Math.abs(prev.value) / (Math.abs(prev.value) + Math.abs(curr.value));
      const position = prev.position + t * (curr.position - prev.position);

      zeroPoints.push({
        position,
        shear: 0,
        moment: interpolateValue(bendingMoment, position),
      });
    } else if (Math.abs(curr.value) < 1e-6) {
      // Very close to zero
      zeroPoints.push({
        position: curr.position,
        shear: curr.value,
        moment: interpolateValue(bendingMoment, curr.position),
      });
    }
  }

  return zeroPoints;
}

function findMaximum(
  points: DiagramPoint[],
  filter: (value: number) => boolean
): DiagramPoint | null {
  const filtered = points.filter(p => filter(p.value));
  if (filtered.length === 0) return null;

  return filtered.reduce((max, p) =>
    Math.abs(p.value) > Math.abs(max.value) ? p : max
  );
}

function deduplicatePoints(points: CriticalPoint[]): CriticalPoint[] {
  const deduplicated: CriticalPoint[] = [];
  const positionTolerance = 0.01; // 1 cm or 0.01 units

  points.forEach(point => {
    const existing = deduplicated.find(
      p => Math.abs(p.position - point.position) < positionTolerance
    );

    if (!existing) {
      deduplicated.push(point);
    } else {
      // Merge descriptions if at same location
      existing.description += `, ${point.description}`;
      existing.isDiscontinuity = existing.isDiscontinuity || point.isDiscontinuity;
    }
  });

  return deduplicated;
}

function interpolateValue(points: DiagramPoint[], position: number): number {
  const before = points.filter(p => p.position <= position).pop();
  const after = points.find(p => p.position >= position);

  if (!before || !after) return points[0]?.value ?? 0;
  if (before.position === after.position) return before.value;

  const t = (position - before.position) / (after.position - before.position);
  return before.value + t * (after.value - before.value);
}

function interpolateBefore(points: DiagramPoint[], position: number): number {
  const idx = points.findIndex(p => p.position >= position);
  if (idx > 0) return points[idx - 1].value;
  return points[0]?.value ?? 0;
}

function interpolateAfter(points: DiagramPoint[], position: number): number {
  const point = points.find(p => p.position >= position);
  return point?.value ?? 0;
}

function getForceUnit(units: 'metric' | 'imperial'): string {
  return units === 'metric' ? 'kN' : 'kips';
}

function getMomentUnit(units: 'metric' | 'imperial'): string {
  return units === 'metric' ? 'kN·m' : 'kip-ft';
}
```

#### UI Component

**File:** `src/components/CriticalPointsTable.tsx`
```typescript
import React from 'react';
import type { CriticalPoint } from '../lib/criticalPoints/analyzer';

interface CriticalPointsTableProps {
  points: CriticalPoint[];
  units: 'metric' | 'imperial';
}

export function CriticalPointsTable({ points, units }: CriticalPointsTableProps) {
  const forceUnit = units === 'metric' ? 'kN' : 'kips';
  const momentUnit = units === 'metric' ? 'kN·m' : 'kip-ft';
  const lengthUnit = units === 'metric' ? 'm' : 'ft';

  return (
    <div className="critical-points-table">
      <h3 className="text-lg font-semibold mb-3">Critical Points</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Position ({lengthUnit})
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Description
              </th>
              <th className="border border-gray-300 px-4 py-2 text-right">
                Shear ({forceUnit})
              </th>
              <th className="border border-gray-300 px-4 py-2 text-right">
                Moment ({momentUnit})
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((point, idx) => (
              <tr
                key={idx}
                className={getCategoryClass(point.category)}
              >
                <td className="border border-gray-300 px-4 py-2 font-mono">
                  {point.position.toFixed(3)}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {point.description}
                  {point.isDiscontinuity && (
                    <span className="ml-2 text-xs text-orange-600">
                      {getDiscontinuitySymbol(point)}
                    </span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                  {point.isDiscontinuity && point.shearBefore !== undefined && point.shearAfter !== undefined ? (
                    <span>
                      {point.shearBefore.toFixed(2)} → {point.shearAfter.toFixed(2)}
                    </span>
                  ) : (
                    <span className={getValueClass(point.shear)}>
                      {point.shear >= 0 ? '+' : ''}{point.shear.toFixed(2)}
                    </span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                  <span className={getValueClass(point.moment)}>
                    {point.moment >= 0 ? '+' : ''}{point.moment.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-sm text-gray-600">
        <p><strong>Legend:</strong></p>
        <p>↓ = Discontinuity (jump down) | ↑ = Discontinuity (jump up)</p>
        <p>Green = Positive value | Red = Negative value</p>
      </div>
    </div>
  );
}

function getCategoryClass(category: string): string {
  const baseClass = 'hover:bg-gray-50';
  switch (category) {
    case 'support':
      return `${baseClass} bg-blue-50`;
    case 'extremum':
      return `${baseClass} bg-yellow-50 font-semibold`;
    case 'zero_shear':
      return `${baseClass} bg-green-50`;
    default:
      return baseClass;
  }
}

function getValueClass(value: number): string {
  if (value > 0) return 'text-green-700';
  if (value < 0) return 'text-red-700';
  return 'text-gray-700';
}

function getDiscontinuitySymbol(point: CriticalPoint): string {
  if (!point.shearBefore || !point.shearAfter) return '';

  const jump = point.shearAfter - point.shearBefore;
  if (jump > 0) return '↑';
  if (jump < 0) return '↓';
  return '';
}
```

#### Acceptance Criteria
- [ ] Identifies all critical points correctly
- [ ] Shows discontinuities with before/after values
- [ ] Highlights extrema (max/min)
- [ ] Integrated into results display
- [ ] Sorted by position

---

### 7. Create Comprehensive Validation Report Component

**Priority:** P0.7 - CRITICAL
**Complexity:** Medium
**Estimated Effort:** 2 days

#### UI Component

**File:** `src/components/ValidationReport.tsx`
```typescript
import React, { useState } from 'react';
import type { AnalysisResults } from '../types/beam';

interface ValidationReportProps {
  results: AnalysisResults;
}

export function ValidationReport({ results }: ValidationReportProps) {
  const [expanded, setExpanded] = useState(true);

  const equilibrium = results.validation?.equilibrium;
  const closure = results.validation?.diagramClosure;
  const relationships = results.validation?.relationships;

  const allValid = equilibrium?.isValid && closure?.isValid && relationships?.isValid;

  return (
    <div className="validation-report border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full px-4 py-3 flex items-center justify-between font-semibold ${
          allValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}
      >
        <span className="flex items-center gap-2">
          {allValid ? '✓' : '✗'} Validation Report
          {allValid && <span className="text-sm font-normal">(All checks passed)</span>}
        </span>
        <span>{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="p-4 space-y-4 bg-white">
          {/* Equilibrium Checks */}
          {equilibrium && (
            <section>
              <h4 className="font-semibold text-gray-700 mb-2">Equilibrium Checks</h4>
              <div className="space-y-1 text-sm">
                <div className={getCheckClass(equilibrium.isVerticalEquilibrium)}>
                  {equilibrium.isVerticalEquilibrium ? '✓' : '✗'} Vertical force equilibrium: ΣFy = {equilibrium.sumVerticalForces.toExponential(3)}
                  <span className="text-gray-500 ml-2">(tolerance: {equilibrium.tolerance.toExponential(2)})</span>
                </div>
                <div className={getCheckClass(equilibrium.isHorizontalEquilibrium)}>
                  {equilibrium.isHorizontalEquilibrium ? '✓' : '✗'} Horizontal force equilibrium: ΣFx = {equilibrium.sumHorizontalForces.toExponential(3)}
                </div>
                <div className={getCheckClass(equilibrium.isMomentEquilibrium)}>
                  {equilibrium.isMomentEquilibrium ? '✓' : '✗'} Moment equilibrium: ΣM = {equilibrium.sumMomentsAboutOrigin.toExponential(3)}
                </div>
              </div>
              {equilibrium.messages.length > 0 && (
                <div className="mt-2 text-sm text-red-600">
                  {equilibrium.messages.map((msg, idx) => (
                    <div key={idx}>⚠ {msg}</div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Diagram Closure Checks */}
          {closure && (
            <section>
              <h4 className="font-semibold text-gray-700 mb-2">Boundary Conditions</h4>
              <div className="space-y-1 text-sm">
                {closure.momentClosure.map((check, idx) => (
                  <div key={idx} className={getCheckClass(check.isValid)}>
                    {check.isValid ? '✓' : '✗'} {check.location}: M = {check.actualValue.toFixed(6)}
                    <span className="text-gray-500 ml-2">(expected: {check.expectedValue})</span>
                  </div>
                ))}
                {closure.shearClosure.map((check, idx) => (
                  <div key={idx} className={getCheckClass(check.isValid)}>
                    {check.isValid ? '✓' : '✗'} {check.location}: V = {check.actualValue.toFixed(6)}
                    <span className="text-gray-500 ml-2">(expected: {check.expectedValue})</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Relationship Verification */}
          {relationships && (
            <section>
              <h4 className="font-semibold text-gray-700 mb-2">Relationship Verification</h4>
              <div className="space-y-1 text-sm">
                <div className={getCheckClass(relationships.dMdx_equals_V.isValid)}>
                  {relationships.dMdx_equals_V.isValid ? '✓' : '✗'} dM/dx = V:
                  <span className="ml-2">
                    Avg error {(relationships.dMdx_equals_V.averageError * 100).toFixed(3)}%,
                    Max error {(relationships.dMdx_equals_V.maxError * 100).toFixed(3)}%
                  </span>
                </div>
                <div className={getCheckClass(relationships.dVdx_equals_negW.isValid)}>
                  {relationships.dVdx_equals_negW.isValid ? '✓' : '✗'} dV/dx = -w:
                  <span className="ml-2">
                    Avg error {(relationships.dVdx_equals_negW.averageError * 100).toFixed(3)}%,
                    Max error {(relationships.dVdx_equals_negW.maxError * 100).toFixed(3)}%
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Engineering Summary */}
          <section className="border-t pt-4">
            <h4 className="font-semibold text-gray-700 mb-2">Engineering Summary</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>ℹ Maximum shear: {results.maxShear.value.toFixed(2)} at x = {results.maxShear.position.toFixed(2)}</div>
              <div>ℹ Maximum moment: {results.maxMoment.value.toFixed(2)} at x = {results.maxMoment.position.toFixed(2)}</div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function getCheckClass(isValid: boolean): string {
  return isValid ? 'text-green-700' : 'text-red-700';
}
```

#### Acceptance Criteria
- [ ] Displays all validation checks
- [ ] Color-coded pass/fail indicators
- [ ] Collapsible sections
- [ ] Shows error messages clearly
- [ ] Integrated into main results display

---

### 8. Document Benchmark Comparison

**Priority:** P0.8 - CRITICAL
**Complexity:** Low (Manual)
**Estimated Effort:** 1 day

#### Create Benchmark Document

**File:** `BENCHMARKS.md`
```markdown
# Benchmark Comparison
## SheerForce vs Reference Calculators

**Date:** 2025-11-09
**Purpose:** Verify parity with established online calculators

---

## Test Case 1: Simply Supported Beam with Central Point Load

**Configuration:**
- Length: 10 m
- Point load: 20 kN at x = 5 m
- Supports: Pin at x = 0, Roller at x = 10 m

### Results Comparison

| Calculator | R_A (kN) | R_B (kN) | M_max (kN·m) | M_max location (m) |
|------------|----------|----------|--------------|-------------------|
| **SheerForce** | 10.00 | 10.00 | 50.00 | 5.00 |
| SkyCiv | 10.00 | 10.00 | 50.00 | 5.00 |
| ClearCalcs | 10.00 | 10.00 | 50.00 | 5.00 |
| **Difference** | 0.00% | 0.00% | 0.00% | 0.00% |

**Status:** ✓ PASS - Perfect agreement

---

## Test Case 2: Simply Supported with UDL

... [Add more test cases]

---

## Methodology

1. Create identical beam configuration in all calculators
2. Record all reaction and diagram values
3. Calculate percentage differences
4. Document any discrepancies > 0.1%

## Known Differences

None at this time. All tested configurations show <0.01% difference.

## Screenshots

See `/benchmarks/screenshots/` for visual comparisons.
```

#### Acceptance Criteria
- [ ] At least 5 test cases documented
- [ ] Comparison with SkyCiv and ClearCalcs
- [ ] All differences < 0.1%
- [ ] Screenshots included
- [ ] Methodology documented

---

## P1: HIGH PRIORITY TASKS

### 9. Implement Cantilever Beam Support

**Priority:** P1.1 - HIGH
**Complexity:** High
**Estimated Effort:** 3-4 days

#### Technical Specification

Add support for cantilever beams with one fixed support.

**Characteristics:**
- Exactly 1 fixed support
- Free end has V = 0, M = 0 (if no loads at tip)
- Fixed end has 3 reactions: vertical, horizontal, moment

#### Code Implementation

**Update:** `src/lib/beamAnalysis.ts`
```typescript
export function calculateReactions(beam: Beam): Reaction[] {
  if (beam.supports.length < 1) {
    throw new Error('Beam must have at least 1 support');
  }

  // Cantilever beam (1 fixed support)
  if (beam.supports.length === 1) {
    if (beam.supports[0].type !== 'fixed') {
      throw new Error('Cantilever beam must have a fixed support');
    }
    return calculateCantileverReactions(beam);
  }

  // Simply supported beam (2 supports)
  if (beam.supports.length === 2) {
    return calculateSimplySupportedReactions(beam);
  }

  throw new Error('Currently only cantilever and simply supported beams are implemented');
}

/**
 * Calculate reactions for a cantilever beam (1 fixed support)
 */
function calculateCantileverReactions(beam: Beam): Reaction[] {
  const support = beam.supports[0];

  // Calculate total vertical load
  let totalVerticalLoad = 0;
  let totalMomentAboutSupport = 0;

  beam.loads.forEach(load => {
    if (load.type === 'point') {
      const verticalComponent = load.magnitude * Math.cos(load.angle * Math.PI / 180);
      totalVerticalLoad += verticalComponent;
      totalMomentAboutSupport += verticalComponent * (load.position - support.position);
    } else if (load.type === 'distributed') {
      const length = load.endPosition - load.startPosition;

      if (length === 0) {
        totalVerticalLoad += load.startMagnitude;
        totalMomentAboutSupport += load.startMagnitude * (load.startPosition - support.position);
      } else {
        const avgMagnitude = (load.startMagnitude + load.endMagnitude) / 2;
        const totalLoad = avgMagnitude * length;
        const centroid = load.startPosition + length / 2;

        totalVerticalLoad += totalLoad;
        totalMomentAboutSupport += totalLoad * (centroid - support.position);
      }
    } else if (load.type === 'moment') {
      totalMomentAboutSupport += load.direction === 'clockwise' ? -load.magnitude : load.magnitude;
    }
  });

  // For cantilever, reaction equals total load
  // Reaction moment equals total moment about support
  return [
    {
      supportId: support.id,
      position: support.position,
      verticalForce: totalVerticalLoad,
      horizontalForce: 0, // Assuming no horizontal loads for now
      moment: totalMomentAboutSupport,
    },
  ];
}
```

**Update Shear/Moment Calculations:**

The existing `calculateShearForce` and `calculateBendingMoment` functions should work for cantilevers, but need to handle the reaction moment:

```typescript
export function calculateBendingMoment(beam: Beam, reactions: Reaction[]): DiagramPoint[] {
  const points: DiagramPoint[] = [];
  const numPoints = 100;
  const step = beam.length / (numPoints - 1);

  for (let i = 0; i < numPoints; i++) {
    const x = i * step;
    let moment = 0;

    // Add reaction moments (for fixed supports)
    reactions.forEach(reaction => {
      if (reaction.position <= x) {
        // Vertical force contribution
        moment += reaction.verticalForce * (x - reaction.position);
        // Fixed support moment contribution
        moment += reaction.moment;
      }
    });

    // Subtract moments from loads (existing code...)
    // ... rest of implementation
  }

  return points;
}
```

#### Validation Tests

**File:** `src/lib/__tests__/cantilever.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { analyzeBeam } from '../beamAnalysis';
import type { Beam } from '../../types/beam';

describe('Cantilever Beams', () => {
  describe('Point Load at Free End', () => {
    it('should match Research.md Appendix A.1', () => {
      const beam: Beam = {
        id: 'cantilever-1',
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

      // Expected reactions
      expect(results.reactions[0].verticalForce).toBeCloseTo(5, 4);
      expect(results.reactions[0].moment).toBeCloseTo(15, 4);

      // Expected constant shear
      results.shearForce.forEach(point => {
        expect(point.value).toBeCloseTo(-5, 4);
      });

      // Expected linear moment: M = -5x
      results.bendingMoment.forEach(point => {
        const expectedMoment = -5 * point.position;
        expect(point.value).toBeCloseTo(expectedMoment, 3);
      });

      // Validation should pass
      expect(results.validation?.equilibrium?.isValid).toBe(true);
    });
  });

  describe('Uniformly Distributed Load', () => {
    it('should match Research.md Appendix A.2', () => {
      const beam: Beam = {
        id: 'cantilever-2',
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

      // Expected reactions
      expect(results.reactions[0].verticalForce).toBeCloseTo(100, 2);
      expect(results.reactions[0].moment).toBeCloseTo(250, 2);

      // Expected shear: V = -20x
      // Expected moment: M = -10x²
      // (Test specific points as done in previous tests)
    });
  });
});
```

#### UI Updates

**Update:** `src/components/BeamInput.tsx`

Add beam type selector:
```typescript
export function BeamInput() {
  const [beamType, setBeamType] = useState<'simply-supported' | 'cantilever'>('simply-supported');

  return (
    <div className="beam-input">
      <div className="mb-4">
        <label className="block font-semibold mb-2">Beam Type</label>
        <select
          value={beamType}
          onChange={(e) => setBeamType(e.target.value as any)}
          className="border rounded px-3 py-2"
        >
          <option value="simply-supported">Simply Supported (2 supports)</option>
          <option value="cantilever">Cantilever (1 fixed support)</option>
        </select>
      </div>

      {beamType === 'simply-supported' && (
        // Existing simply supported UI
      )}

      {beamType === 'cantilever' && (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Cantilever beam has one fixed support. Specify which end is fixed.
          </p>
          <label className="block mb-2">
            <input
              type="radio"
              name="cantilever-end"
              value="left"
              defaultChecked
            />
            <span className="ml-2">Fixed at left end (x=0)</span>
          </label>
          <label className="block mb-2">
            <input
              type="radio"
              name="cantilever-end"
              value="right"
            />
            <span className="ml-2">Fixed at right end (x=L)</span>
          </label>
        </div>
      )}
    </div>
  );
}
```

#### Acceptance Criteria
- [ ] Cantilever reactions calculated correctly
- [ ] Both Research.md examples pass
- [ ] UI allows cantilever beam selection
- [ ] Validation checks work for cantilevers
- [ ] Free end boundary conditions verified
- [ ] Fixed end moment reaction displayed

---

### 10. Add Moment Load UI Controls

**Priority:** P1.2 - HIGH
**Complexity:** Low
**Estimated Effort:** 1 day

#### Update LoadConfiguration Component

**File:** `src/components/LoadConfiguration.tsx`

```typescript
function LoadForm({ onAdd }: { onAdd: (load: Load) => void }) {
  const [loadType, setLoadType] = useState<'point' | 'distributed' | 'moment'>('point');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ... existing code

    if (loadType === 'moment') {
      const momentLoad: MomentLoad = {
        id: generateId(),
        type: 'moment',
        position: parseFloat(position),
        magnitude: parseFloat(magnitude),
        direction: direction as 'clockwise' | 'counterclockwise',
      };
      onAdd(momentLoad);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block font-semibold mb-2">Load Type</label>
        <select
          value={loadType}
          onChange={(e) => setLoadType(e.target.value as any)}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="point">Point Load</option>
          <option value="distributed">Distributed Load (UDL)</option>
          <option value="moment">Applied Moment</option>
        </select>
      </div>

      {loadType === 'moment' && (
        <>
          <div>
            <label className="block mb-1">Position</label>
            <input
              type="number"
              step="0.1"
              required
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Magnitude (moment units)</label>
            <input
              type="number"
              step="0.1"
              required
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Direction</label>
            <select className="border rounded px-3 py-2 w-full">
              <option value="clockwise">Clockwise</option>
              <option value="counterclockwise">Counterclockwise</option>
            </select>
          </div>
        </>
      )}

      {/* Existing point and distributed load inputs */}
    </form>
  );
}
```

#### Acceptance Criteria
- [ ] Can add moment loads via UI
- [ ] Direction selection (CW/CCW) works
- [ ] Moment loads display in load list
- [ ] Can edit/delete moment loads
- [ ] Moment loads integrated into calculations

---

### 11-15: Testing, Warnings, Validation

See detailed specifications in main IMPLEMENTATION_GUIDE.md sections...

---

## P2: MEDIUM PRIORITY TASKS

### 16. Implement PDF Export

**Priority:** P2.1 - MEDIUM
**Complexity:** High
**Estimated Effort:** 3-4 days

#### Technical Specification

Use jsPDF to generate professional PDF reports with:
- Beam configuration
- Load diagram
- Shear force diagram
- Bending moment diagram
- Reaction calculations (step-by-step)
- Critical points table
- Validation report

#### Code Implementation

**File:** `src/lib/export/pdfGenerator.ts`
```typescript
import jsPDF from 'jspdf';
import type { Beam, AnalysisResults } from '../../types/beam';
import type { ReactionCalculationTrace } from '../calculationTrace/reactionSteps';
import type { CriticalPoint } from '../criticalPoints/analyzer';

export interface PDFOptions {
  includeCalculationSteps: boolean;
  includeCriticalPoints: boolean;
  includeValidation: boolean;
  projectName?: string;
  engineer?: string;
  company?: string;
}

export async function generatePDFReport(
  beam: Beam,
  results: AnalysisResults,
  trace: ReactionCalculationTrace,
  criticalPoints: CriticalPoint[],
  options: PDFOptions = {
    includeCalculationSteps: true,
    includeCriticalPoints: true,
    includeValidation: true,
  }
): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');

  let y = 20; // Current Y position

  // Header
  doc.setFontSize(20);
  doc.text('Beam Analysis Report', 105, y, { align: 'center' });
  y += 10;

  if (options.projectName) {
    doc.setFontSize(12);
    doc.text(`Project: ${options.projectName}`, 20, y);
    y += 6;
  }

  if (options.engineer) {
    doc.setFontSize(10);
    doc.text(`Engineer: ${options.engineer}`, 20, y);
    y += 5;
  }

  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y);
  y += 10;

  // Beam Configuration
  doc.setFontSize(14);
  doc.text('Beam Configuration', 20, y);
  y += 7;

  doc.setFontSize(10);
  doc.text(`Length: ${beam.length} ${getUnit(beam.units, 'length')}`, 25, y);
  y += 5;
  doc.text(`Units: ${beam.units === 'metric' ? 'Metric (kN, m)' : 'Imperial (kips, ft)'}`, 25, y);
  y += 8;

  // Supports
  doc.setFontSize(12);
  doc.text('Supports:', 20, y);
  y += 6;

  beam.supports.forEach((support, idx) => {
    doc.setFontSize(10);
    doc.text(`${idx + 1}. ${support.type.toUpperCase()} at x = ${support.position} ${getUnit(beam.units, 'length')}`, 25, y);
    y += 5;
  });
  y += 3;

  // Loads
  doc.setFontSize(12);
  doc.text('Loads:', 20, y);
  y += 6;

  beam.loads.forEach((load, idx) => {
    doc.setFontSize(10);
    if (load.type === 'point') {
      doc.text(
        `${idx + 1}. Point Load: ${load.magnitude} ${getUnit(beam.units, 'force')} at x = ${load.position} ${getUnit(beam.units, 'length')}`,
        25,
        y
      );
    } else if (load.type === 'distributed') {
      doc.text(
        `${idx + 1}. Distributed Load: ${load.startMagnitude} ${getUnit(beam.units, 'force')}/m from x = ${load.startPosition} to ${load.endPosition} ${getUnit(beam.units, 'length')}`,
        25,
        y
      );
    }
    y += 5;
  });
  y += 5;

  // Reactions
  doc.setFontSize(14);
  doc.text('Support Reactions', 20, y);
  y += 7;

  results.reactions.forEach((reaction, idx) => {
    doc.setFontSize(10);
    doc.text(`Support ${beam.supports[idx].id.toUpperCase()}:`, 25, y);
    y += 5;
    doc.text(`  Vertical: ${reaction.verticalForce.toFixed(2)} ${getUnit(beam.units, 'force')}`, 30, y);
    y += 5;
    if (reaction.moment !== 0) {
      doc.text(`  Moment: ${reaction.moment.toFixed(2)} ${getUnit(beam.units, 'moment')}`, 30, y);
      y += 5;
    }
  });
  y += 5;

  // Calculation Steps (if included)
  if (options.includeCalculationSteps && trace.steps.length > 0) {
    // Check if new page needed
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.text('Calculation Steps', 20, y);
    y += 7;

    trace.steps.forEach(step => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(11);
      doc.text(`Step ${step.stepNumber}: ${step.title}`, 20, y);
      y += 5;

      doc.setFontSize(9);
      step.equations.forEach(eq => {
        if (eq === '') {
          y += 3;
        } else {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(eq, 25, y);
          y += 4;
        }
      });
      y += 3;
    });
  }

  // TODO: Add diagram images (requires canvas rendering)
  // TODO: Add critical points table
  // TODO: Add validation report

  // Generate blob
  return doc.output('blob');
}

function getUnit(units: 'metric' | 'imperial', type: 'length' | 'force' | 'moment'): string {
  if (units === 'metric') {
    return type === 'length' ? 'm' : type === 'force' ? 'kN' : 'kN·m';
  } else {
    return type === 'length' ? 'ft' : type === 'force' ? 'kips' : 'kip-ft';
  }
}
```

#### UI Integration

**File:** `src/components/ExportButton.tsx`
```typescript
import React from 'react';
import { generatePDFReport } from '../lib/export/pdfGenerator';

export function ExportButton({ beam, results, trace, criticalPoints }) {
  const handleExport = async () => {
    const blob = await generatePDFReport(beam, results, trace, criticalPoints);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beam-analysis-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="btn btn-secondary flex items-center gap-2"
    >
      📄 Export PDF
    </button>
  );
}
```

#### Acceptance Criteria
- [ ] Generates PDF with all sections
- [ ] Includes diagrams (as images)
- [ ] Professional formatting
- [ ] Optional company header
- [ ] Downloads with appropriate filename

---

### 17-24: Additional P2 Tasks

See individual task specifications for:
- Save/Load functionality (LocalStorage + optional cloud)
- Undo/Redo (using state history)
- Interactive diagrams (Plotly event handlers)
- Template library (predefined configurations)
- Keyboard shortcuts
- Overhanging beam support
- Real-time validation indicators
- CSV export

---

## Implementation Timeline

### Week 1: P0 Foundation (Days 1-5)
- Days 1-2: Equilibrium + Diagram validation
- Days 3-4: Relationship verification + Test suite
- Day 5: Integration and testing

### Week 2: P0 Traceability (Days 6-10)
- Days 6-8: Step-by-step calculations + UI
- Days 9-10: Critical points + Validation report

### Week 3: P1 Core Features (Days 11-15)
- Days 11-13: Cantilever implementation
- Day 14: Moment loads + warnings
- Day 15: Enhanced testing

### Week 4: P2 Professional (Days 16-20)
- Days 16-18: PDF export
- Days 19-20: Save/load + templates

---

## Testing Strategy

### Unit Tests
- All calculation functions
- All validation functions
- Edge cases and error conditions

### Integration Tests
- Full beam analysis workflows
- UI component interactions
- Export functionality

### Validation Tests
- All Research.md examples
- Benchmark comparisons
- Edge cases from real use

### Performance Tests
- Calculation speed < 100ms
- UI responsiveness
- Large number of loads

---

## Success Metrics

### Code Quality
- [ ] Test coverage > 90%
- [ ] No ESLint errors
- [ ] TypeScript strict mode
- [ ] All validations documented

### Accuracy
- [ ] All known solutions pass
- [ ] Benchmark parity achieved
- [ ] Equilibrium always satisfied
- [ ] Relationships verified

### User Experience
- [ ] Calculation time < 100ms
- [ ] Clear error messages
- [ ] Professional output
- [ ] Intuitive workflow

---

**End of Implementation Guide Part 2**

For questions or clarifications, refer to:
- PRD.md - Product requirements
- Research.md - Engineering requirements
- IMPLEMENTATION_GUIDE.md - Part 1 (P0 details)
