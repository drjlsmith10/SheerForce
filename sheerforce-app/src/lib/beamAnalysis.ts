import type { Beam, Reaction, AnalysisResults, DiagramPoint } from '../types/beam';

/**
 * Calculate moment of inertia for the cross-section
 */
function calculateMomentOfInertia(crossSection: Beam['crossSection']): number {
  const { type, dimensions } = crossSection;
  switch (type) {
    case 'rectangular': {
      return (dimensions.width * Math.pow(dimensions.height, 3)) / 12;
    }
    case 'circular': {
      return (Math.PI * Math.pow(dimensions.diameter, 4)) / 64;
    }
    case 'I-beam': {
      // Approximate I for I-beam: I = (b*h^3 - b_web*h_web^3)/12
      const b = dimensions.width;
      const h = dimensions.height;
      const b_web = dimensions.webThickness;
      const h_web = dimensions.height - 2 * dimensions.flangeThickness;
      return (b * Math.pow(h, 3) - b_web * Math.pow(h_web, 3)) / 12;
    }
    case 'T-beam': {
      // Similar approximation
      const b_t = dimensions.width;
      const h_t = dimensions.height;
      const b_web_t = dimensions.webThickness;
      const h_web_t = dimensions.height - dimensions.flangeThickness;
      return (b_t * Math.pow(h_t, 3) - b_web_t * Math.pow(h_web_t, 3)) / 12;
    }
    default: {
      return 1; // Default
    }
  }
}

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
        const a = load.startPosition;
        const b = load.endPosition;
        const w1 = load.startMagnitude;
        const w2 = load.endMagnitude;
        const loadLength = b - a;

        if (loadLength === 0) {
          if (a <= x) {
            shear -= w1;
          }
        } else if (x >= b) {
          const avg = (w1 + w2) / 2;
          shear -= avg * loadLength;
        } else if (x >= a) {
          const remainingLength = b - x;
          const w_at_x = w1 + (w2 - w1) * (x - a) / loadLength;
          const avg_remaining = (w_at_x + w2) / 2;
          shear -= avg_remaining * remainingLength;
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
 * Calculate deflection using integration of moment-curvature
 */
function calculateDeflection(beam: Beam, bendingMoment: DiagramPoint[]): DiagramPoint[] {
  const E = beam.material.modulusOfElasticity;
  const I = calculateMomentOfInertia(beam.crossSection);
  const EI = E * I;

  const points: DiagramPoint[] = [];
  const numPoints = bendingMoment.length;

  // Integrate M/EI twice to get deflection
  // y'' = M/EI
  // y' = integral y'' dx
  // y = integral y' dx

  // Use numerical integration (trapezoidal rule)
  const curvature: number[] = bendingMoment.map(p => p.value / EI);
  const slope: number[] = [];
  const deflection: number[] = [];

  // Integrate curvature to get slope
  slope[0] = 0; // Assume slope = 0 at x=0 for simply supported
  for (let i = 1; i < numPoints; i++) {
    const dx = bendingMoment[i].position - bendingMoment[i-1].position;
    slope[i] = slope[i-1] + (curvature[i-1] + curvature[i]) / 2 * dx;
  }

  // Apply boundary condition: slope = 0 at supports
  const supportPositions = beam.supports.map(s => s.position);
  // For simply supported, set slope = 0 at both supports
  if (supportPositions.length >= 2) {
    const idx1 = Math.round(supportPositions[0] / beam.length * (numPoints - 1));
    const idx2 = Math.round(supportPositions[1] / beam.length * (numPoints - 1));
    const slope_correction = (slope[idx2] - slope[idx1]) / (supportPositions[1] - supportPositions[0]);
    for (let i = 0; i < numPoints; i++) {
      slope[i] -= slope_correction * (bendingMoment[i].position - supportPositions[0]);
    }
  }

  // Integrate slope to get deflection
  deflection[0] = 0; // Deflection = 0 at x=0
  for (let i = 1; i < numPoints; i++) {
    const dx = bendingMoment[i].position - bendingMoment[i-1].position;
    deflection[i] = deflection[i-1] + (slope[i-1] + slope[i]) / 2 * dx;
  }

  // Apply boundary condition: deflection = 0 at supports
  if (supportPositions.length >= 2) {
    const idx1 = Math.round(supportPositions[0] / beam.length * (numPoints - 1));
    const idx2 = Math.round(supportPositions[1] / beam.length * (numPoints - 1));
    const deflection_correction = (deflection[idx2] - deflection[idx1]) / (supportPositions[1] - supportPositions[0]);
    for (let i = 0; i < numPoints; i++) {
      deflection[i] -= deflection_correction * (bendingMoment[i].position - supportPositions[0]);
    }
  }

  for (let i = 0; i < numPoints; i++) {
    points.push({ position: bendingMoment[i].position, value: deflection[i] });
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
  const deflection = calculateDeflection(beam, bendingMoment);

  // Find maximum values
  const maxShear = shearForce.reduce((max, point) =>
    Math.abs(point.value) > Math.abs(max.value) ? point : max
  );

  const maxMoment = bendingMoment.reduce((max, point) =>
    Math.abs(point.value) > Math.abs(max.value) ? point : max
  );

  const maxDeflection = deflection.reduce((max, point) =>
    Math.abs(point.value) > Math.abs(max.value) ? point : max
  );

  return {
    reactions,
    shearForce,
    bendingMoment,
    deflection,
    maxShear,
    maxMoment,
    maxDeflection,
  };
}
