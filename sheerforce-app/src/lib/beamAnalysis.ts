import { Beam, Load, Reaction, AnalysisResults, DiagramPoint } from '../types/beam';
import { create, all } from 'mathjs';

const math = create(all);

/**
 * Calculate reactions at supports for a simply supported beam
 * Uses equilibrium equations: ΣFy = 0, ΣM = 0
 */
export function calculateReactions(beam: Beam): Reaction[] {
  if (beam.supports.length < 2) {
    throw new Error('Beam must have at least 2 supports');
  }

  // For now, handle simply supported beam (2 supports)
  if (beam.supports.length === 2) {
    return calculateSimplySupportedReactions(beam);
  }

  throw new Error('Currently only simply supported beams are implemented');
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
      const avgMagnitude = (load.startMagnitude + load.endMagnitude) / 2;
      const totalLoad = avgMagnitude * loadLength;
      const centroid = load.startPosition + loadLength / 2;
      totalMoment += totalLoad * (centroid - support1.position);
    } else if (load.type === 'moment') {
      totalMoment += load.direction === 'clockwise' ? -load.magnitude : load.magnitude;
    }
  });

  // Calculate reaction at second support
  const distance = support2.position - support1.position;
  const reaction2 = totalMoment / distance;

  // Calculate reaction at first support (ΣFy = 0)
  let totalVerticalLoad = 0;
  beam.loads.forEach(load => {
    if (load.type === 'point') {
      totalVerticalLoad += load.magnitude * Math.cos(load.angle * Math.PI / 180);
    } else if (load.type === 'distributed') {
      const loadLength = load.endPosition - load.startPosition;
      const avgMagnitude = (load.startMagnitude + load.endMagnitude) / 2;
      totalVerticalLoad += avgMagnitude * loadLength;
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
 * Calculate shear force diagram points
 */
export function calculateShearForce(beam: Beam, reactions: Reaction[]): DiagramPoint[] {
  const points: DiagramPoint[] = [];
  const numPoints = 100; // Resolution of the diagram
  const step = beam.length / (numPoints - 1);

  for (let i = 0; i < numPoints; i++) {
    const x = i * step;
    let shear = 0;

    // Add reactions (upward = positive)
    reactions.forEach(reaction => {
      if (reaction.position <= x) {
        shear += reaction.verticalForce;
      }
    });

    // Subtract loads (downward = negative)
    beam.loads.forEach(load => {
      if (load.type === 'point') {
        if (load.position <= x) {
          shear -= load.magnitude * Math.cos(load.angle * Math.PI / 180);
        }
      } else if (load.type === 'distributed') {
        if (x >= load.startPosition && x <= load.endPosition) {
          const localX = x - load.startPosition;
          const magnitude = load.startMagnitude +
            (load.endMagnitude - load.startMagnitude) * localX / (load.endPosition - load.startPosition);
          shear -= magnitude * localX;
        } else if (x > load.endPosition) {
          const loadLength = load.endPosition - load.startPosition;
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
  const step = beam.length / (numPoints - 1);

  for (let i = 0; i < numPoints; i++) {
    const x = i * step;
    let moment = 0;

    // Add moments from reactions
    reactions.forEach(reaction => {
      if (reaction.position <= x) {
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
        if (x >= load.startPosition) {
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

  return {
    reactions,
    shearForce,
    bendingMoment,
    maxShear,
    maxMoment,
  };
}
