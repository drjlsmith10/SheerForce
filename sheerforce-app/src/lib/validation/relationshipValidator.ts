import type { DiagramPoint, Beam } from '../../types/beam';
import type { RelationshipCheck } from './types';

/**
 * Verifies fundamental beam relationships:
 * - dM/dx = V(x)
 * - dV/dx = -w(x)
 */
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
