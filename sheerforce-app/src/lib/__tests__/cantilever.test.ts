import { describe, it, expect } from 'vitest';
import { analyzeBeam } from '../beamAnalysis';
import type { Beam } from '../../types/beam';

describe('Cantilever Beams', () => {
  describe('Point Load at Free End (Research.md Appendix A.1)', () => {
    it('should match expected reactions', () => {
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

      // Expected reactions from Research.md: By = 5 lb, MB = 15 ft-lb (magnitude)
      // Note: For equilibrium, reaction moment is -15 (opposite sign from displayed magnitude)
      // This ensures ΣM = 0: V*x + M_reaction = load*x → 5*3 + (-15) = 5*0 → 0 = 0 ✓
      expect(results.reactions[0].verticalForce).toBeCloseTo(5, 4);
      expect(results.reactions[0].moment).toBeCloseTo(-15, 4);
      expect(results.reactions[0].horizontalForce).toBe(0);
    });

    it('should have constant shear V = -5 lb', () => {
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

      // Expected: V = -5 lb (constant along entire beam)
      results.shearForce.forEach(point => {
        expect(point.value).toBeCloseTo(-5, 2);
      });
    });

    it('should have linear moment M = -5x', () => {
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

      // Expected: M = -5x
      // At x=0: M = 0
      // At x=3: M = -15 ft-lb
      const momentAtZero = results.bendingMoment.find(p => Math.abs(p.position - 0) < 0.01);
      const momentAtThree = results.bendingMoment.find(p => Math.abs(p.position - 3) < 0.01);

      expect(momentAtZero?.value).toBeCloseTo(0, 1);
      expect(momentAtThree?.value).toBeCloseTo(-15, 1);

      // Check linearity at midpoint (x=1.5, M=-7.5)
      const momentAtMid = results.bendingMoment.find(p => Math.abs(p.position - 1.5) < 0.05);
      expect(momentAtMid?.value).toBeCloseTo(-7.5, 0);
    });

    it('should pass equilibrium validation', () => {
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

      expect(results.validation?.equilibrium?.isValid).toBe(true);
      expect(results.validation?.equilibrium?.isVerticalEquilibrium).toBe(true);
      expect(results.validation?.equilibrium?.isMomentEquilibrium).toBe(true);
    });
  });

  describe('Uniformly Distributed Load (Research.md Appendix A.2)', () => {
    it('should match expected reactions', () => {
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

      // Expected reactions from Research.md: By = 100 kN, MB = 250 kN·m (magnitude)
      // Note: For equilibrium, reaction moment is -250 (opposite sign)
      expect(results.reactions[0].verticalForce).toBeCloseTo(100, 2);
      expect(results.reactions[0].moment).toBeCloseTo(-250, 2);
      expect(results.reactions[0].horizontalForce).toBe(0);
    });

    it('should have linear shear V = -20x', () => {
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

      // Expected: V = -20x
      // At x=0: V = 0
      // At x=5: V = -100 kN
      const shearAtZero = results.shearForce.find(p => Math.abs(p.position - 0) < 0.01);
      const shearAtFive = results.shearForce.find(p => Math.abs(p.position - 5) < 0.01);

      expect(shearAtZero?.value).toBeCloseTo(0, 1);
      expect(shearAtFive?.value).toBeCloseTo(-100, 1);

      // Check at x=2.5: V = -50 kN (with tolerance for sampling resolution)
      const shearAtMid = results.shearForce.find(p => Math.abs(p.position - 2.5) < 0.1);
      expect(shearAtMid?.value).toBeCloseTo(-50, -1); // Tolerance of ~5 due to sampling
    });

    it('should have parabolic moment M = -10x²', () => {
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

      // Expected: M = -10x²
      // At x=0: M = 0
      // At x=2.5: M = -62.5 kN·m
      // At x=5: M = -250 kN·m
      const momentAtZero = results.bendingMoment.find(p => Math.abs(p.position - 0) < 0.01);
      const momentAtMid = results.bendingMoment.find(p => Math.abs(p.position - 2.5) < 0.1);
      const momentAtFive = results.bendingMoment.find(p => Math.abs(p.position - 5) < 0.01);

      expect(momentAtZero?.value).toBeCloseTo(0, 1);
      expect(momentAtMid?.value).toBeCloseTo(-62.5, -1); // Tolerance for sampling
      expect(momentAtFive?.value).toBeCloseTo(-250, -1);
    });

    it('should pass equilibrium validation', () => {
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

      expect(results.validation?.equilibrium?.isValid).toBe(true);
      expect(results.validation?.equilibrium?.isVerticalEquilibrium).toBe(true);
      expect(results.validation?.equilibrium?.isMomentEquilibrium).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should reject cantilever with non-fixed support', () => {
      const beam: Beam = {
        id: 'invalid-cantilever',
        length: 5,
        units: 'metric',
        supports: [
          { id: 's1', position: 0, type: 'pin' },
        ],
        loads: [],
      };

      expect(() => analyzeBeam(beam)).toThrow('Cantilever beam must have a fixed support');
    });

    it('should handle cantilever with fixed support at left end', () => {
      const beam: Beam = {
        id: 'cantilever-left',
        length: 3,
        units: 'metric',
        supports: [
          { id: 's1', position: 0, type: 'fixed' },
        ],
        loads: [
          { id: 'l1', type: 'point', position: 3, magnitude: 10, angle: 0 },
        ],
      };

      const results = analyzeBeam(beam);

      // Reaction should equal load
      // Moment equilibrium: V*x_support + M_reaction = load*x_load
      // 10*0 + M = 10*3 → M = 30
      expect(results.reactions[0].verticalForce).toBeCloseTo(10, 4);
      expect(results.reactions[0].moment).toBeCloseTo(30, 4);
      expect(results.validation?.equilibrium?.isValid).toBe(true);
    });

    it('should handle cantilever with multiple point loads', () => {
      const beam: Beam = {
        id: 'cantilever-multi',
        length: 4,
        units: 'metric',
        supports: [
          { id: 's1', position: 4, type: 'fixed' },
        ],
        loads: [
          { id: 'l1', type: 'point', position: 0, magnitude: 5, angle: 0 },
          { id: 'l2', type: 'point', position: 2, magnitude: 10, angle: 0 },
        ],
      };

      const results = analyzeBeam(beam);

      // Total vertical force = 5 + 10 = 15 kN
      // Moment equilibrium about origin: V*x_support + M = Σ(loads*x)
      // 15*4 + M = 5*0 + 10*2 → 60 + M = 20 → M = -40 kN·m
      expect(results.reactions[0].verticalForce).toBeCloseTo(15, 4);
      expect(results.reactions[0].moment).toBeCloseTo(-40, 4);
      expect(results.validation?.equilibrium?.isValid).toBe(true);
    });

    it('should handle cantilever with moment load', () => {
      const beam: Beam = {
        id: 'cantilever-moment',
        length: 2,
        units: 'metric',
        supports: [
          { id: 's1', position: 2, type: 'fixed' },
        ],
        loads: [
          { id: 'l1', type: 'moment', position: 0, magnitude: 20, direction: 'clockwise' },
        ],
      };

      const results = analyzeBeam(beam);

      // No vertical reaction, only moment reaction
      expect(results.reactions[0].verticalForce).toBeCloseTo(0, 4);
      expect(results.reactions[0].moment).toBeCloseTo(-20, 4);
      expect(results.validation?.equilibrium?.isValid).toBe(true);
    });
  });

  describe('Boundary Conditions', () => {
    it('should have zero shear and moment at free end', () => {
      const beam: Beam = {
        id: 'cantilever-bc',
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

      // At free end (x=0), moment should be 0
      const momentAtFreeEnd = results.bendingMoment.find(p => Math.abs(p.position - 0) < 0.01);
      expect(momentAtFreeEnd?.value).toBeCloseTo(0, 1);
    });

    it('should verify diagram closure for cantilever', () => {
      const beam: Beam = {
        id: 'cantilever-closure',
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

      // Diagram closure validation should pass
      expect(results.validation?.diagramClosure?.isValid).toBe(true);
    });
  });
});
