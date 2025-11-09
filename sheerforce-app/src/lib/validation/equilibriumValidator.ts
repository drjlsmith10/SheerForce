import type { Beam, Reaction } from '../../types/beam';
import type { EquilibriumCheck } from './types';

const DEFAULT_TOLERANCE = 1e-6;

/**
 * Validates equilibrium equations for a beam
 * Checks: ΣFy = 0, ΣFx = 0, ΣM = 0
 */
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
