import type { Beam, Reaction, AnalysisResults, DiagramPoint } from '../types/beam';
import { validateEquilibrium } from './validation/equilibriumValidator';
import { validateDiagramClosure } from './validation/diagramValidator';
import { validateRelationships } from './validation/relationshipValidator';
import { generateReactionSteps } from './calculationTrace/reactionSteps';
import { analyzeCriticalPoints } from './criticalPoints/analyzer';

/**
 * Calculate reactions at supports
 * Uses equilibrium equations: ΣFy = 0, ΣM = 0
 * Supports cantilever (1 fixed support) and simply supported (2 supports) beams
 */
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
 * Calculate reactions for a simply supported beam (2 supports)
 */
function calculateSimplySupportedReactions(beam: Beam): Reaction[] {
  const [support1, support2] = beam.supports;

  // Calculate total moment about first support
  let totalMoment = 0;

  beam.loads.forEach(load => {
    if (load.type === 'point') {
      totalMoment += load.magnitude * (load.position - support1.position);
    } else if (load.type === 'distributed') {
      const loadLength = load.endPosition - load.startPosition;

      // Guard against zero-length distributed loads
      if (loadLength === 0) {
        // Treat as point load at the position
        totalMoment += load.startMagnitude * (load.startPosition - support1.position);
      } else {
        const avgMagnitude = (load.startMagnitude + load.endMagnitude) / 2;
        const totalLoad = avgMagnitude * loadLength;
        const centroid = load.startPosition + loadLength / 2;
        totalMoment += totalLoad * (centroid - support1.position);
      }
    } else if (load.type === 'moment') {
      totalMoment += load.direction === 'clockwise' ? -load.magnitude : load.magnitude;
    }
  });

  // Calculate reaction at second support
  const distance = support2.position - support1.position;

  // Guard against division by zero (supports at same position)
  if (Math.abs(distance) < 1e-10) {
    throw new Error('Supports must not be at the same position');
  }

  const reaction2 = totalMoment / distance;

  // Calculate reaction at first support (ΣFy = 0)
  let totalVerticalLoad = 0;
  beam.loads.forEach(load => {
    if (load.type === 'point') {
      totalVerticalLoad += load.magnitude * Math.cos(load.angle * Math.PI / 180);
    } else if (load.type === 'distributed') {
      const loadLength = load.endPosition - load.startPosition;

      // Guard against zero-length distributed loads
      if (loadLength === 0) {
        // Treat as point load
        totalVerticalLoad += load.startMagnitude;
      } else {
        const avgMagnitude = (load.startMagnitude + load.endMagnitude) / 2;
        totalVerticalLoad += avgMagnitude * loadLength;
      }
    }
  });

  const reaction1 = totalVerticalLoad - reaction2;

  return [
    {
      supportId: support1.id,
      position: support1.position,
      verticalForce: reaction1,
      horizontalForce: 0,
      moment: 0,
    },
    {
      supportId: support2.id,
      position: support2.position,
      verticalForce: reaction2,
      horizontalForce: 0,
      moment: 0,
    },
  ];
}

/**
 * Calculate reactions for a cantilever beam (1 fixed support)
 * Fixed support provides vertical force, horizontal force, and moment reactions
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
        // Treat as point load
        totalVerticalLoad += load.startMagnitude;
        totalMomentAboutSupport += load.startMagnitude * (load.startPosition - support.position);
      } else {
        // Calculate total load and its centroid
        const avgMagnitude = (load.startMagnitude + load.endMagnitude) / 2;
        const totalLoad = avgMagnitude * length;
        const centroid = load.startPosition + length / 2;

        totalVerticalLoad += totalLoad;
        totalMomentAboutSupport += totalLoad * (centroid - support.position);
      }
    } else if (load.type === 'moment') {
      // Applied moment contributes to reaction moment
      totalMomentAboutSupport += load.direction === 'clockwise' ? -load.magnitude : load.magnitude;
    }
  });

  // For cantilever, reaction force equals total load
  // Reaction moment is calculated to satisfy moment equilibrium
  // ΣM = 0: reaction_moment + reaction_force * position - Σ(load_moments) = 0
  // Since totalMomentAboutSupport = Σ(load * distance from support),
  // and for equilibrium about origin: V*x_support + M_reaction - Σ(load*x_load) = 0
  // M_reaction = -V*x_support + Σ(load*x_load) = -totalMomentAboutSupport + totalVerticalLoad * support.position

  // Simplified: For moments about the support, M_reaction = -totalMomentAboutSupport
  // But for global equilibrium, we need: M_reaction = -(totalVerticalLoad * support.position - moment_from_loads_about_origin)

  // Calculate moments about origin (x=0) for equilibrium check
  let totalMomentAboutOrigin = 0;
  beam.loads.forEach(load => {
    if (load.type === 'point') {
      const verticalComponent = load.magnitude * Math.cos(load.angle * Math.PI / 180);
      totalMomentAboutOrigin += verticalComponent * load.position;
    } else if (load.type === 'distributed') {
      const length = load.endPosition - load.startPosition;
      if (length === 0) {
        totalMomentAboutOrigin += load.startMagnitude * load.startPosition;
      } else {
        const avgMagnitude = (load.startMagnitude + load.endMagnitude) / 2;
        const totalLoad = avgMagnitude * length;
        const centroid = load.startPosition + length / 2;
        totalMomentAboutOrigin += totalLoad * centroid;
      }
    } else if (load.type === 'moment') {
      totalMomentAboutOrigin += load.direction === 'clockwise' ? -load.magnitude : load.magnitude;
    }
  });

  // For equilibrium about origin: V_reaction * x_support + M_reaction = totalMomentAboutOrigin
  // M_reaction = totalMomentAboutOrigin - totalVerticalLoad * support.position
  const reactionMoment = totalMomentAboutOrigin - totalVerticalLoad * support.position;

  return [
    {
      supportId: support.id,
      position: support.position,
      verticalForce: totalVerticalLoad,
      horizontalForce: 0, // Assuming no horizontal loads for now
      moment: reactionMoment,
    },
  ];
}

/**
 * Calculate shear force diagram points
 */
export function calculateShearForce(beam: Beam, reactions: Reaction[]): DiagramPoint[] {
  const points: DiagramPoint[] = [];
  const numPoints = 100; // Resolution of the diagram

  // Guard against division by zero
  if (beam.length <= 0) {
    throw new Error('Beam length must be positive');
  }

  const step = beam.length / (numPoints - 1);

  for (let i = 0; i < numPoints; i++) {
    const x = i * step;
    let shear = 0;

    // Add reactions (upward = positive)
    // For cantilever beams, reactions at fixed supports are not included in internal shear
    reactions.forEach(reaction => {
      if (reaction.position <= x) {
        // Only add reaction if it's not from a fixed support (fixed supports are external)
        const support = beam.supports.find(s => s.id === reaction.supportId);
        if (support && support.type !== 'fixed') {
          shear += reaction.verticalForce;
        }
      }
    });

    // Subtract loads (downward = negative)
    beam.loads.forEach(load => {
      if (load.type === 'point') {
        if (load.position <= x) {
          shear -= load.magnitude * Math.cos(load.angle * Math.PI / 180);
        }
      } else if (load.type === 'distributed') {
        const loadLength = load.endPosition - load.startPosition;

        // Guard against zero-length distributed loads to prevent NaN
        if (loadLength === 0) {
          // Treat zero-length distributed load as a point load at the position
          if (load.startPosition <= x) {
            shear -= load.startMagnitude;
          }
        } else if (x >= load.startPosition && x <= load.endPosition) {
          const localX = x - load.startPosition;
          // For distributed load, calculate total load from start to x
          const magnitudeAtX = load.startMagnitude +
            (load.endMagnitude - load.startMagnitude) * localX / loadLength;
          const avgMagnitude = (load.startMagnitude + magnitudeAtX) / 2;
          shear -= avgMagnitude * localX;
        } else if (x > load.endPosition) {
          const avgMagnitude = (load.startMagnitude + load.endMagnitude) / 2;
          shear -= avgMagnitude * loadLength;
        }
      }
    });

    points.push({ position: x, value: shear });
  }

  return points;
}

/**
 * Calculate bending moment diagram points
 */
export function calculateBendingMoment(beam: Beam, reactions: Reaction[]): DiagramPoint[] {
  const points: DiagramPoint[] = [];
  const numPoints = 100;

  // Guard against division by zero
  if (beam.length <= 0) {
    throw new Error('Beam length must be positive');
  }

  const step = beam.length / (numPoints - 1);

  for (let i = 0; i < numPoints; i++) {
    const x = i * step;
    let moment = 0;

    // Add moments from reactions
    // For cantilever beams, reactions at fixed supports are not included in internal moment
    reactions.forEach(reaction => {
      const support = beam.supports.find(s => s.id === reaction.supportId);

      if (reaction.position <= x && support && support.type !== 'fixed') {
        // For non-fixed supports, add vertical force contribution
        moment += reaction.verticalForce * (x - reaction.position);
      }
    });

    // Subtract moments from loads
    beam.loads.forEach(load => {
      if (load.type === 'point') {
        if (load.position <= x) {
          moment -= load.magnitude * Math.cos(load.angle * Math.PI / 180) * (x - load.position);
        }
      } else if (load.type === 'distributed') {
        const distributedLoadLength = load.endPosition - load.startPosition;

        // Guard against zero-length distributed loads
        if (distributedLoadLength === 0) {
          // Treat as point load
          if (load.startPosition <= x) {
            moment -= load.startMagnitude * (x - load.startPosition);
          }
        } else if (x >= load.startPosition) {
          const end = Math.min(x, load.endPosition);
          const loadLength = end - load.startPosition;
          const avgMagnitude = (load.startMagnitude + load.endMagnitude) / 2;
          const totalLoad = avgMagnitude * loadLength;
          const centroid = load.startPosition + loadLength / 2;
          moment -= totalLoad * (x - centroid);
        }
      } else if (load.type === 'moment') {
        if (load.position <= x) {
          moment += load.direction === 'clockwise' ? -load.magnitude : load.magnitude;
        }
      }
    });

    points.push({ position: x, value: moment });
  }

  return points;
}

/**
 * Perform complete beam analysis
 */
export function analyzeBeam(beam: Beam): AnalysisResults {
  const reactions = calculateReactions(beam);
  const shearForce = calculateShearForce(beam, reactions);
  const bendingMoment = calculateBendingMoment(beam, reactions);

  // Find maximum values
  const maxShear = shearForce.reduce((max, point) =>
    Math.abs(point.value) > Math.abs(max.value) ? point : max
  );

  const maxMoment = bendingMoment.reduce((max, point) =>
    Math.abs(point.value) > Math.abs(max.value) ? point : max
  );

  // Run all validations
  const equilibrium = validateEquilibrium(beam, reactions);
  const diagramClosure = validateDiagramClosure(beam, shearForce, bendingMoment);
  const relationships = validateRelationships(beam, shearForce, bendingMoment);

  // Generate calculation trace
  const calculationTrace = generateReactionSteps(beam, reactions);

  // Analyze critical points
  const criticalPoints = analyzeCriticalPoints(beam, reactions, shearForce, bendingMoment);

  return {
    reactions,
    shearForce,
    bendingMoment,
    maxShear,
    maxMoment,
    validation: {
      equilibrium,
      diagramClosure,
      relationships,
    },
    calculationTrace,
    criticalPoints,
  };
}
