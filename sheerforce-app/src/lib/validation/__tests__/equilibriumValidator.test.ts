import { describe, it, expect } from 'vitest';
import { validateEquilibrium } from '../equilibriumValidator';
import type { Beam, Reaction } from '../../../types/beam';

describe('equilibriumValidator', () => {
  describe('validateEquilibrium', () => {
    it('should pass for simply supported beam with central point load', () => {
      const beam: Beam = {
        id: 'test-1',
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

      const reactions: Reaction[] = [
        { supportId: 's1', position: 0, verticalForce: 10, horizontalForce: 0, moment: 0 },
        { supportId: 's2', position: 10, verticalForce: 10, horizontalForce: 0, moment: 0 },
      ];

      const result = validateEquilibrium(beam, reactions);

      expect(result.isValid).toBe(true);
      expect(result.isVerticalEquilibrium).toBe(true);
      expect(result.isMomentEquilibrium).toBe(true);
      expect(Math.abs(result.sumVerticalForces)).toBeLessThan(1e-10);
      expect(Math.abs(result.sumMomentsAboutOrigin)).toBeLessThan(1e-10);
    });

    it('should fail for incorrect reactions', () => {
      const beam: Beam = {
        id: 'test-2',
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

      // Wrong reactions (should be 10 each, not 5 each)
      const reactions: Reaction[] = [
        { supportId: 's1', position: 0, verticalForce: 5, horizontalForce: 0, moment: 0 },
        { supportId: 's2', position: 10, verticalForce: 5, horizontalForce: 0, moment: 0 },
      ];

      const result = validateEquilibrium(beam, reactions);

      expect(result.isValid).toBe(false);
      expect(result.isVerticalEquilibrium).toBe(false);
      expect(result.messages.length).toBeGreaterThan(0);
    });

    it('should handle distributed loads correctly', () => {
      const beam: Beam = {
        id: 'test-3',
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

      const reactions: Reaction[] = [
        { supportId: 's1', position: 0, verticalForce: 50, horizontalForce: 0, moment: 0 },
        { supportId: 's2', position: 10, verticalForce: 50, horizontalForce: 0, moment: 0 },
      ];

      const result = validateEquilibrium(beam, reactions);

      expect(result.isValid).toBe(true);
      expect(Math.abs(result.sumVerticalForces)).toBeLessThan(1e-10);
      expect(Math.abs(result.sumMomentsAboutOrigin)).toBeLessThan(1e-10);
    });

    it('should handle moment loads', () => {
      const beam: Beam = {
        id: 'test-4',
        length: 10,
        units: 'metric',
        supports: [
          { id: 's1', position: 0, type: 'pin' },
          { id: 's2', position: 10, type: 'roller' },
        ],
        loads: [
          { id: 'l1', type: 'point', position: 5, magnitude: 10, angle: 0 },
          { id: 'l2', type: 'moment', position: 7, magnitude: 20, direction: 'clockwise' },
        ],
      };

      // With moment load: ΣM = R_B*10 - 10*5 - (-20) = 0
      // R_B*10 = 50 - 20 = 30, R_B = 3
      // R_A = 10 - 3 = 7
      const reactions: Reaction[] = [
        { supportId: 's1', position: 0, verticalForce: 7, horizontalForce: 0, moment: 0 },
        { supportId: 's2', position: 10, verticalForce: 3, horizontalForce: 0, moment: 0 },
      ];

      const result = validateEquilibrium(beam, reactions);

      expect(result.isValid).toBe(true);
      expect(Math.abs(result.sumVerticalForces)).toBeLessThan(1e-10);
      expect(Math.abs(result.sumMomentsAboutOrigin)).toBeLessThan(1e-10);
    });

    it('should use custom tolerance', () => {
      const beam: Beam = {
        id: 'test-5',
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

      // Slightly off reactions - errors will accumulate in moment equation
      const reactions: Reaction[] = [
        { supportId: 's1', position: 0, verticalForce: 10.00005, horizontalForce: 0, moment: 0 },
        { supportId: 's2', position: 10, verticalForce: 9.99995, horizontalForce: 0, moment: 0 },
      ];

      // Should pass with looser tolerance
      const result1 = validateEquilibrium(beam, reactions, 1e-3);
      expect(result1.isValid).toBe(true);

      // Should fail with stricter tolerance
      const result2 = validateEquilibrium(beam, reactions, 1e-5);
      expect(result2.isValid).toBe(false);
    });

    it('should generate appropriate error messages', () => {
      const beam: Beam = {
        id: 'test-6',
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

      const reactions: Reaction[] = [
        { supportId: 's1', position: 0, verticalForce: 8, horizontalForce: 0, moment: 0 },
        { supportId: 's2', position: 10, verticalForce: 8, horizontalForce: 0, moment: 0 },
      ];

      const result = validateEquilibrium(beam, reactions);

      expect(result.isValid).toBe(false);
      expect(result.messages.length).toBeGreaterThan(0);
      // Check that at least one message mentions equilibrium violation
      const hasEquilibriumMessage = result.messages.some(
        msg => msg.includes('equilibrium violated')
      );
      expect(hasEquilibriumMessage).toBe(true);
    });
  });
});
