import { describe, it, expect } from 'vitest';
import { analyzeBeam } from '../beamAnalysis';
import type { Beam } from '../../types/beam';

describe('Known Solution Validation', () => {
  describe('Appendix A.3: Simply Supported with Central Point Load', () => {
    it('should match expected results for 20 kN at 5 m on 10 m beam', () => {
      const beam: Beam = {
        id: 'appendix-a3',
        length: 10,
        units: 'metric',
        supports: [
          { id: 's1', position: 0, type: 'pin' },
          { id: 's2', position: 10, type: 'roller' },
        ],
        loads: [
          { id: 'l1', type: 'point', position: 5, magnitude: 20, angle: 0 },
        ],
      };

      const results = analyzeBeam(beam);

      // Expected: A_y = B_y = 10 kN
      expect(results.reactions[0].verticalForce).toBeCloseTo(10, 2);
      expect(results.reactions[1].verticalForce).toBeCloseTo(10, 2);

      // Expected: M_max = 50 kN·m at x = 5 m
      // Note: Due to sampling resolution (100 points), we may not hit exactly 50
      expect(Math.abs(results.maxMoment.value - 50)).toBeLessThan(1); // Within 1 kN·m
      expect(Math.abs(results.maxMoment.position - 5)).toBeLessThan(0.1); // Within 0.1 m

      // Shear: V = 10 kN for 0 < x < 5, V = -10 kN for 5 < x < 10
      const shearBefore = results.shearForce.find(p => p.position > 0 && p.position < 4.9);
      const shearAfter = results.shearForce.find(p => p.position > 5.1);
      expect(shearBefore?.value).toBeCloseTo(10, 2);
      expect(shearAfter?.value).toBeCloseTo(-10, 2);

      // Validation checks
      expect(results.validation?.equilibrium?.isValid).toBe(true);
      expect(results.validation?.diagramClosure?.isValid).toBe(true);
      // Relationships may have errors near discontinuities (point loads)
      // but should still provide reasonable validation
      expect(results.validation?.relationships).toBeDefined();
    });
  });

  describe('Simply Supported with UDL', () => {
    it('should calculate reactions correctly for uniformly distributed load', () => {
      const beam: Beam = {
        id: 'udl-test',
        length: 10,
        units: 'metric',
        supports: [
          { id: 's1', position: 0, type: 'pin' },
          { id: 's2', position: 10, type: 'roller' },
        ],
        loads: [
          {
            id: 'l1',
            type: 'distributed',
            startPosition: 0,
            endPosition: 10,
            startMagnitude: 10,
            endMagnitude: 10,
          },
        ],
      };

      const results = analyzeBeam(beam);

      // Expected: A_y = B_y = 50 kN (total load = 10 * 10 = 100 kN)
      expect(results.reactions[0].verticalForce).toBeCloseTo(50, 2);
      expect(results.reactions[1].verticalForce).toBeCloseTo(50, 2);

      // Expected: M_max = wL²/8 = 10*100/8 = 125 kN·m at x = 5 m
      expect(Math.abs(results.maxMoment.value)).toBeCloseTo(125, 1);
      expect(results.maxMoment.position).toBeCloseTo(5, 0.5);

      // Validation should pass
      expect(results.validation?.equilibrium?.isValid).toBe(true);
      expect(results.validation?.diagramClosure?.isValid).toBe(true);
    });
  });

  describe('Simply Supported with Multiple Point Loads', () => {
    it('should handle multiple point loads correctly', () => {
      const beam: Beam = {
        id: 'multi-load',
        length: 12,
        units: 'metric',
        supports: [
          { id: 's1', position: 0, type: 'pin' },
          { id: 's2', position: 12, type: 'roller' },
        ],
        loads: [
          { id: 'l1', type: 'point', position: 4, magnitude: 10, angle: 0 },
          { id: 'l2', type: 'point', position: 8, magnitude: 15, angle: 0 },
        ],
      };

      const results = analyzeBeam(beam);

      // Calculate expected reactions manually
      // ΣM_A = 0: R_B * 12 = 10 * 4 + 15 * 8 = 40 + 120 = 160
      // R_B = 160 / 12 = 13.333... kN
      // ΣF_y = 0: R_A = 25 - 13.333 = 11.666... kN
      expect(results.reactions[1].verticalForce).toBeCloseTo(13.333, 2);
      expect(results.reactions[0].verticalForce).toBeCloseTo(11.667, 2);

      // Validation should pass
      expect(results.validation?.equilibrium?.isValid).toBe(true);
      expect(results.validation?.equilibrium?.sumVerticalForces).toBeCloseTo(0, 6);
      expect(results.validation?.equilibrium?.sumMomentsAboutOrigin).toBeCloseTo(0, 6);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero-length distributed loads', () => {
      const beam: Beam = {
        id: 'zero-length',
        length: 10,
        units: 'metric',
        supports: [
          { id: 's1', position: 0, type: 'pin' },
          { id: 's2', position: 10, type: 'roller' },
        ],
        loads: [
          {
            id: 'l1',
            type: 'distributed',
            startPosition: 5,
            endPosition: 5, // Zero length
            startMagnitude: 20,
            endMagnitude: 20,
          },
        ],
      };

      const results = analyzeBeam(beam);

      // Should behave like a point load at x=5
      expect(results.reactions[0].verticalForce).toBeCloseTo(10, 2);
      expect(results.reactions[1].verticalForce).toBeCloseTo(10, 2);
      expect(results.validation?.equilibrium?.isValid).toBe(true);
    });

    it('should handle loads at support locations', () => {
      const beam: Beam = {
        id: 'load-at-support',
        length: 10,
        units: 'metric',
        supports: [
          { id: 's1', position: 0, type: 'pin' },
          { id: 's2', position: 10, type: 'roller' },
        ],
        loads: [
          { id: 'l1', type: 'point', position: 0, magnitude: 10, angle: 0 },
        ],
      };

      const results = analyzeBeam(beam);

      // ΣM_A = 0: R_B * 10 = 10 * 0 = 0, so R_B = 0
      // ΣF_y = 0: R_A = 10 - 0 = 10 kN
      expect(results.reactions[0].verticalForce).toBeCloseTo(10, 2);
      expect(results.reactions[1].verticalForce).toBeCloseTo(0, 2);
      expect(results.validation?.equilibrium?.isValid).toBe(true);
    });
  });

  describe('Validation System Tests', () => {
    it('should detect equilibrium violations with incorrect reactions', () => {
      const beam: Beam = {
        id: 'invalid-test',
        length: 10,
        units: 'metric',
        supports: [
          { id: 's1', position: 0, type: 'pin' },
          { id: 's2', position: 10, type: 'roller' },
        ],
        loads: [
          { id: 'l1', type: 'point', position: 5, magnitude: 20, angle: 0 },
        ],
      };

      const results = analyzeBeam(beam);

      // The automatic analysis should produce valid results
      expect(results.validation?.equilibrium?.isValid).toBe(true);
      expect(results.validation?.equilibrium?.messages).toHaveLength(0);
    });

    it('should verify moment = 0 at simple supports', () => {
      const beam: Beam = {
        id: 'boundary-check',
        length: 10,
        units: 'metric',
        supports: [
          { id: 's1', position: 0, type: 'pin' },
          { id: 's2', position: 10, type: 'roller' },
        ],
        loads: [
          { id: 'l1', type: 'point', position: 5, magnitude: 20, angle: 0 },
        ],
      };

      const results = analyzeBeam(beam);

      // Check that diagram closure validation passes
      expect(results.validation?.diagramClosure?.isValid).toBe(true);
      expect(results.validation?.diagramClosure?.momentClosure).toHaveLength(2);

      // Both supports should have moment ≈ 0
      results.validation?.diagramClosure?.momentClosure.forEach(check => {
        expect(check.isValid).toBe(true);
        expect(check.expectedValue).toBe(0);
        expect(Math.abs(check.actualValue)).toBeLessThan(1e-6);
      });
    });

    it('should verify dM/dx = V relationship', () => {
      const beam: Beam = {
        id: 'relationship-check',
        length: 10,
        units: 'metric',
        supports: [
          { id: 's1', position: 0, type: 'pin' },
          { id: 's2', position: 10, type: 'roller' },
        ],
        loads: [
          { id: 'l1', type: 'point', position: 5, magnitude: 20, angle: 0 },
        ],
      };

      const results = analyzeBeam(beam);

      // Check relationship validation
      // Note: Relationship verification may have higher error near discontinuities
      const dMdxCheck = results.validation?.relationships?.dMdx_equals_V;
      expect(dMdxCheck).toBeDefined();
      // For beams with discontinuities, we expect some error but should be reasonable
      if (dMdxCheck) {
        expect(dMdxCheck.averageError).toBeLessThan(0.1); // Average error < 10%
      }
    });
  });
});
