import type { Beam, DiagramPoint } from '../../types/beam';
import type { DiagramClosureCheck } from './types';

/**
 * Validates that diagrams satisfy boundary conditions
 * - Simply supported: M = 0 at both supports
 * - Cantilever free end: V = 0, M = 0
 */
export function validateDiagramClosure(
  beam: Beam,
  _shearForce: DiagramPoint[],
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

  // Check free end conditions for cantilever (if implemented)
  // Will be added when cantilever support is implemented

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
