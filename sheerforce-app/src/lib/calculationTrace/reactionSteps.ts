import type { Beam, Reaction } from '../../types/beam';
import type { CalculationStep, ReactionCalculationTrace } from './types';
import { validateEquilibrium } from '../validation/equilibriumValidator';

/**
 * Generate step-by-step calculation trace for reaction calculations
 */
export function generateReactionSteps(
  beam: Beam,
  reactions: Reaction[]
): ReactionCalculationTrace {
  if (beam.supports.length === 2) {
    return generateSimplySupportedSteps(beam, reactions);
  } else if (beam.supports.length === 1 && beam.supports[0].type === 'fixed') {
    return generateCantileverSteps(beam, reactions);
  }

  return { steps: [], summary: 'Unknown beam configuration' };
}

/**
 * Generate calculation steps for simply supported beam
 */
function generateSimplySupportedSteps(
  beam: Beam,
  reactions: Reaction[]
): ReactionCalculationTrace {
  const steps: CalculationStep[] = [];
  const [support1, support2] = beam.supports;
  const [reaction1, reaction2] = reactions;
  const forceUnit = getForceUnit(beam.units);
  const lengthUnit = getLengthUnit(beam.units);

  // Step 1: Free body diagram
  steps.push({
    stepNumber: 1,
    title: 'Free Body Diagram',
    description: `Simply supported beam with ${support1.type} at x=${support1.position}${lengthUnit} and ${support2.type} at x=${support2.position}${lengthUnit}`,
    equations: [
      `Beam length: L = ${beam.length} ${lengthUnit}`,
      `Support A: ${support1.type} at x = ${support1.position} ${lengthUnit}`,
      `Support B: ${support2.type} at x = ${support2.position} ${lengthUnit}`,
    ],
  });

  // Step 2: List applied loads
  const loadDescriptions: string[] = [];
  beam.loads.forEach((load, idx) => {
    if (load.type === 'point') {
      loadDescriptions.push(
        `Load ${idx + 1}: Point load P = ${load.magnitude} ${forceUnit} at x = ${load.position} ${lengthUnit}`
      );
    } else if (load.type === 'distributed') {
      if (load.startMagnitude === load.endMagnitude) {
        loadDescriptions.push(
          `Load ${idx + 1}: Uniform distributed load w = ${load.startMagnitude} ${forceUnit}/${lengthUnit} from x = ${load.startPosition} to ${load.endPosition} ${lengthUnit}`
        );
      } else {
        loadDescriptions.push(
          `Load ${idx + 1}: Varying distributed load w = ${load.startMagnitude} to ${load.endMagnitude} ${forceUnit}/${lengthUnit} from x = ${load.startPosition} to ${load.endPosition} ${lengthUnit}`
        );
      }
    } else if (load.type === 'moment') {
      loadDescriptions.push(
        `Load ${idx + 1}: Applied moment M = ${load.magnitude} ${forceUnit}·${lengthUnit} ${load.direction} at x = ${load.position} ${lengthUnit}`
      );
    }
  });

  steps.push({
    stepNumber: 2,
    title: 'Applied Loads',
    description: 'List of all applied loads on the beam',
    equations: loadDescriptions.length > 0 ? loadDescriptions : ['No applied loads'],
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
        `  • Load ${idx + 1}: ${load.magnitude} × (${load.position} - ${support1.position}) = ${moment.toFixed(2)} ${forceUnit}·${lengthUnit}`
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
          `  • Load ${idx + 1}: ${avgMagnitude.toFixed(2)} × ${length.toFixed(2)} × (${centroid.toFixed(2)} - ${support1.position}) = ${moment.toFixed(2)} ${forceUnit}·${lengthUnit}`
        );
      } else {
        // Zero-length distributed load treated as point load
        const moment = load.startMagnitude * (load.startPosition - support1.position);
        totalMoment += moment;
        momentEquations.push(
          `  • Load ${idx + 1}: ${load.startMagnitude} × (${load.startPosition} - ${support1.position}) = ${moment.toFixed(2)} ${forceUnit}·${lengthUnit}`
        );
      }
    } else if (load.type === 'moment') {
      const moment = load.direction === 'clockwise' ? -load.magnitude : load.magnitude;
      totalMoment += moment;
      momentEquations.push(
        `  • Load ${idx + 1}: ${moment > 0 ? '+' : ''}${moment.toFixed(2)} ${forceUnit}·${lengthUnit}`
      );
    }
  });

  const distance = support2.position - support1.position;
  momentEquations.push('');
  momentEquations.push('Moments from reactions:');
  momentEquations.push(
    `  • Reaction at B: +R_B × ${distance.toFixed(2)} ${lengthUnit}`
  );
  momentEquations.push('');
  momentEquations.push(
    `Equation: ${totalMoment.toFixed(2)} + R_B × ${distance.toFixed(2)} = 0`
  );
  momentEquations.push(
    `Solving: R_B = -${totalMoment.toFixed(2)} / ${distance.toFixed(2)} = ${reaction2.verticalForce.toFixed(2)} ${forceUnit} ↑`
  );

  steps.push({
    stepNumber: 3,
    title: `Sum Moments about Support A (x=${support1.position}${lengthUnit})`,
    description: 'Calculate reaction at support B using moment equilibrium',
    equations: momentEquations,
    result: `R_B = ${reaction2.verticalForce.toFixed(2)} ${forceUnit}`,
  });

  // Step 4: Sum vertical forces
  let totalLoad = 0;
  const forceEquations: string[] = [
    `ΣF_y = 0 (equilibrium equation)`,
    '',
    'Applied loads:',
  ];

  beam.loads.forEach((load, idx) => {
    if (load.type === 'point') {
      totalLoad += load.magnitude;
      forceEquations.push(`  • Load ${idx + 1}: ${load.magnitude} ${forceUnit} (downward)`);
    } else if (load.type === 'distributed') {
      const length = load.endPosition - load.startPosition;
      if (length > 0) {
        const avgMagnitude = (load.startMagnitude + load.endMagnitude) / 2;
        const total = avgMagnitude * length;
        totalLoad += total;
        forceEquations.push(`  • Load ${idx + 1}: ${total.toFixed(2)} ${forceUnit} (downward)`);
      } else {
        totalLoad += load.startMagnitude;
        forceEquations.push(`  • Load ${idx + 1}: ${load.startMagnitude} ${forceUnit} (downward)`);
      }
    }
    // Moment loads don't affect vertical force equilibrium
  });

  forceEquations.push('');
  forceEquations.push('Reactions:');
  forceEquations.push(`  • R_A + R_B`);
  forceEquations.push('');
  forceEquations.push(
    `Equation: R_A + ${reaction2.verticalForce.toFixed(2)} - ${totalLoad.toFixed(2)} = 0`
  );
  forceEquations.push(
    `Solving: R_A = ${totalLoad.toFixed(2)} - ${reaction2.verticalForce.toFixed(2)} = ${reaction1.verticalForce.toFixed(2)} ${forceUnit} ↑`
  );

  steps.push({
    stepNumber: 4,
    title: 'Sum Vertical Forces',
    description: 'Calculate reaction at support A using force equilibrium',
    equations: forceEquations,
    result: `R_A = ${reaction1.verticalForce.toFixed(2)} ${forceUnit}`,
  });

  // Step 5: Equilibrium check
  const equilibriumCheck = validateEquilibrium(beam, reactions);
  const checkEquations: string[] = [
    `✓ ΣF_y = ${equilibriumCheck.sumVerticalForces.toFixed(6)} ${forceUnit} ${equilibriumCheck.isVerticalEquilibrium ? '(OK)' : '(FAIL)'}`,
    `✓ ΣM_A = ${equilibriumCheck.sumMomentsAboutOrigin.toFixed(6)} ${forceUnit}·${lengthUnit} ${equilibriumCheck.isMomentEquilibrium ? '(OK)' : '(FAIL)'}`,
  ];

  if (equilibriumCheck.messages.length > 0) {
    checkEquations.push('');
    checkEquations.push('Warnings:');
    equilibriumCheck.messages.forEach(msg => {
      checkEquations.push(`  ⚠ ${msg}`);
    });
  }

  steps.push({
    stepNumber: 5,
    title: 'Equilibrium Check',
    description: 'Verify that equilibrium equations are satisfied',
    equations: checkEquations,
    result: equilibriumCheck.isValid ? 'All checks passed ✓' : 'Equilibrium violated ✗',
  });

  const summary = `Reactions calculated for simply supported beam: ` +
    `R_A = ${reaction1.verticalForce.toFixed(2)} ${forceUnit}, ` +
    `R_B = ${reaction2.verticalForce.toFixed(2)} ${forceUnit}`;

  return { steps, summary };
}

/**
 * Generate calculation steps for cantilever beam
 */
function generateCantileverSteps(
  beam: Beam,
  reactions: Reaction[]
): ReactionCalculationTrace {
  const steps: CalculationStep[] = [];
  const support = beam.supports[0];
  const reaction = reactions[0];
  const forceUnit = getForceUnit(beam.units);
  const lengthUnit = getLengthUnit(beam.units);

  // Step 1: Free body diagram
  steps.push({
    stepNumber: 1,
    title: 'Free Body Diagram',
    description: `Cantilever beam with fixed support at x=${support.position}${lengthUnit}`,
    equations: [
      `Beam length: L = ${beam.length} ${lengthUnit}`,
      `Fixed support at x = ${support.position} ${lengthUnit}`,
      `Free end at x = ${support.position === 0 ? beam.length : 0} ${lengthUnit}`,
    ],
  });

  // Add load listing and calculations similar to simply supported
  // This will be completed when cantilever beams are fully implemented

  steps.push({
    stepNumber: 2,
    title: 'Cantilever Analysis',
    description: 'Fixed support provides vertical reaction, horizontal reaction, and moment',
    equations: [
      `Vertical reaction: R_y = ${reaction.verticalForce.toFixed(2)} ${forceUnit}`,
      `Horizontal reaction: R_x = ${reaction.horizontalForce.toFixed(2)} ${forceUnit}`,
      `Reaction moment: M_A = ${reaction.moment.toFixed(2)} ${forceUnit}·${lengthUnit}`,
    ],
    result: 'Cantilever reactions calculated',
  });

  const summary = `Cantilever beam reactions: ` +
    `R_y = ${reaction.verticalForce.toFixed(2)} ${forceUnit}, ` +
    `M = ${reaction.moment.toFixed(2)} ${forceUnit}·${lengthUnit}`;

  return { steps, summary };
}

function getForceUnit(units: 'metric' | 'imperial'): string {
  return units === 'metric' ? 'kN' : 'kips';
}

function getLengthUnit(units: 'metric' | 'imperial'): string {
  return units === 'metric' ? 'm' : 'ft';
}
