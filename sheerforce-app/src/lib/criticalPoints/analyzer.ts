import type { Beam, DiagramPoint, Reaction } from '../../types/beam';
import type { CriticalPoint, CriticalPointsAnalysis } from './types';

/**
 * Analyze beam to identify all critical points
 */
export function analyzeCriticalPoints(
  beam: Beam,
  _reactions: Reaction[],
  shearForce: DiagramPoint[],
  bendingMoment: DiagramPoint[]
): CriticalPointsAnalysis {
  const points: CriticalPoint[] = [];

  // Add support locations
  beam.supports.forEach((support) => {
    const shear = interpolateValue(shearForce, support.position);
    const moment = interpolateValue(bendingMoment, support.position);

    points.push({
      position: support.position,
      description: `Support (${support.type})`,
      shear,
      moment,
      isDiscontinuity: true,
      type: 'support',
    });
  });

  // Add load application points
  beam.loads.forEach((load) => {
    if (load.type === 'point') {
      const shear = interpolateValue(shearForce, load.position);
      const moment = interpolateValue(bendingMoment, load.position);

      points.push({
        position: load.position,
        description: `Point Load (${load.magnitude} kN)`,
        shear,
        moment,
        isDiscontinuity: true,
        type: 'load',
      });
    } else if (load.type === 'distributed') {
      // Add start and end points of distributed load
      const shearStart = interpolateValue(shearForce, load.startPosition);
      const momentStart = interpolateValue(bendingMoment, load.startPosition);

      points.push({
        position: load.startPosition,
        description: `Distributed Load Start`,
        shear: shearStart,
        moment: momentStart,
        isDiscontinuity: false,
        type: 'load',
      });

      if (load.endPosition !== load.startPosition) {
        const shearEnd = interpolateValue(shearForce, load.endPosition);
        const momentEnd = interpolateValue(bendingMoment, load.endPosition);

        points.push({
          position: load.endPosition,
          description: `Distributed Load End`,
          shear: shearEnd,
          moment: momentEnd,
          isDiscontinuity: false,
          type: 'load',
        });
      }
    } else if (load.type === 'moment') {
      const shear = interpolateValue(shearForce, load.position);
      const moment = interpolateValue(bendingMoment, load.position);

      points.push({
        position: load.position,
        description: `Applied Moment (${load.magnitude} kN·m)`,
        shear,
        moment,
        isDiscontinuity: true,
        type: 'load',
      });
    }
  });

  // Find zero shear points (these are potential max/min moment locations)
  const zeroShearPoints = findZeroShearPoints(shearForce, bendingMoment);
  points.push(...zeroShearPoints);

  // Find extrema
  const maxPositiveMoment = findMaxPositiveMoment(bendingMoment);
  const maxNegativeMoment = findMaxNegativeMoment(bendingMoment);
  const maxPositiveShear = findMaxPositiveShear(shearForce);
  const maxNegativeShear = findMaxNegativeShear(shearForce);

  // Add extrema points if not already in list
  if (maxPositiveMoment && !points.some(p => Math.abs(p.position - maxPositiveMoment.position) < 0.001)) {
    const shear = interpolateValue(shearForce, maxPositiveMoment.position);
    points.push({
      position: maxPositiveMoment.position,
      description: 'Maximum Positive Moment',
      shear,
      moment: maxPositiveMoment.moment,
      isDiscontinuity: false,
      type: 'max-moment',
    });
  }

  if (maxNegativeMoment && !points.some(p => Math.abs(p.position - maxNegativeMoment.position) < 0.001)) {
    const shear = interpolateValue(shearForce, maxNegativeMoment.position);
    points.push({
      position: maxNegativeMoment.position,
      description: 'Maximum Negative Moment',
      shear,
      moment: maxNegativeMoment.moment,
      isDiscontinuity: false,
      type: 'min-moment',
    });
  }

  // Sort points by position
  points.sort((a, b) => a.position - b.position);

  return {
    points,
    maxPositiveMoment,
    maxNegativeMoment,
    maxPositiveShear,
    maxNegativeShear,
  };
}

/**
 * Find points where shear force crosses zero
 */
function findZeroShearPoints(
  shearForce: DiagramPoint[],
  bendingMoment: DiagramPoint[]
): CriticalPoint[] {
  const zeroPoints: CriticalPoint[] = [];
  const tolerance = 0.01; // Consider values within 0.01 as zero

  for (let i = 1; i < shearForce.length; i++) {
    const prevShear = shearForce[i - 1].value;
    const currShear = shearForce[i].value;

    // Check if shear crosses zero (sign change)
    if ((prevShear > tolerance && currShear < -tolerance) ||
        (prevShear < -tolerance && currShear > tolerance)) {
      // Linear interpolation to find exact zero crossing
      const dx = shearForce[i].position - shearForce[i - 1].position;
      const fraction = Math.abs(prevShear) / (Math.abs(prevShear) + Math.abs(currShear));
      const position = shearForce[i - 1].position + fraction * dx;
      const moment = interpolateValue(bendingMoment, position);

      zeroPoints.push({
        position,
        description: 'Zero Shear Point',
        shear: 0,
        moment,
        isDiscontinuity: false,
        type: 'zero-shear',
      });
    }
  }

  return zeroPoints;
}

/**
 * Find maximum positive moment
 */
function findMaxPositiveMoment(bendingMoment: DiagramPoint[]): CriticalPoint | undefined {
  let max: DiagramPoint | undefined;

  for (const point of bendingMoment) {
    if (point.value > 0 && (!max || point.value > max.value)) {
      max = point;
    }
  }

  if (!max) return undefined;

  return {
    position: max.position,
    description: 'Maximum Positive Moment',
    shear: 0, // Will be filled in by caller
    moment: max.value,
    isDiscontinuity: false,
    type: 'max-moment',
  };
}

/**
 * Find maximum negative moment
 */
function findMaxNegativeMoment(bendingMoment: DiagramPoint[]): CriticalPoint | undefined {
  let min: DiagramPoint | undefined;

  for (const point of bendingMoment) {
    if (point.value < 0 && (!min || point.value < min.value)) {
      min = point;
    }
  }

  if (!min) return undefined;

  return {
    position: min.position,
    description: 'Maximum Negative Moment',
    shear: 0, // Will be filled in by caller
    moment: min.value,
    isDiscontinuity: false,
    type: 'min-moment',
  };
}

/**
 * Find maximum positive shear
 */
function findMaxPositiveShear(shearForce: DiagramPoint[]): CriticalPoint | undefined {
  let max: DiagramPoint | undefined;

  for (const point of shearForce) {
    if (point.value > 0 && (!max || point.value > max.value)) {
      max = point;
    }
  }

  if (!max) return undefined;

  return {
    position: max.position,
    description: 'Maximum Positive Shear',
    shear: max.value,
    moment: 0, // Will be filled in by caller
    isDiscontinuity: false,
    type: 'max-shear',
  };
}

/**
 * Find maximum negative shear
 */
function findMaxNegativeShear(shearForce: DiagramPoint[]): CriticalPoint | undefined {
  let min: DiagramPoint | undefined;

  for (const point of shearForce) {
    if (point.value < 0 && (!min || point.value < min.value)) {
      min = point;
    }
  }

  if (!min) return undefined;

  return {
    position: min.position,
    description: 'Maximum Negative Shear',
    shear: min.value,
    moment: 0, // Will be filled in by caller
    isDiscontinuity: false,
    type: 'min-shear',
  };
}

/**
 * Interpolate value at a specific position
 */
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
