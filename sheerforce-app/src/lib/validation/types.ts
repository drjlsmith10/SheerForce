// Type definitions for validation results

import type { Beam, Reaction } from '../../types/beam';

export interface EquilibriumCheck {
  sumVerticalForces: number;
  sumHorizontalForces: number;
  sumMomentsAboutOrigin: number;
  tolerance: number;
  isVerticalEquilibrium: boolean;
  isHorizontalEquilibrium: boolean;
  isMomentEquilibrium: boolean;
  isValid: boolean;
  messages: string[];
}

export interface ValidationContext {
  beam: Beam;
  reactions: Reaction[];
  tolerance?: number; // Default: 1e-6
}

export interface DiagramClosureCheck {
  shearClosure: {
    isValid: boolean;
    expectedValue: number;
    actualValue: number;
    error: number;
    location: string;
  }[];
  momentClosure: {
    isValid: boolean;
    expectedValue: number;
    actualValue: number;
    error: number;
    location: string;
  }[];
  isValid: boolean;
  messages: string[];
}

export interface RelationshipCheck {
  dMdx_equals_V: {
    isValid: boolean;
    maxError: number;
    averageError: number;
    rmsError: number;
  };
  dVdx_equals_negW: {
    isValid: boolean;
    maxError: number;
    averageError: number;
    rmsError: number;
  };
  isValid: boolean;
  messages: string[];
}
