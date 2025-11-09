// Type definitions for beam analysis calculator

import type { EquilibriumCheck, DiagramClosureCheck, RelationshipCheck } from '../lib/validation/types';

export type SupportType = 'pin' | 'roller' | 'fixed';
export type LoadType = 'point' | 'distributed' | 'moment';

export interface Support {
  id: string;
  position: number; // Position along beam (meters or feet)
  type: SupportType;
}

export interface PointLoad {
  id: string;
  type: 'point';
  position: number; // Position along beam
  magnitude: number; // Force (N or lbs)
  angle: number; // Angle in degrees (0 = downward vertical)
}

export interface DistributedLoad {
  id: string;
  type: 'distributed';
  startPosition: number;
  endPosition: number;
  startMagnitude: number; // Force per unit length
  endMagnitude: number; // For linearly varying loads
}

export interface MomentLoad {
  id: string;
  type: 'moment';
  position: number;
  magnitude: number; // Moment (N·m or lb·ft)
  direction: 'clockwise' | 'counterclockwise';
}

export type Load = PointLoad | DistributedLoad | MomentLoad;

export interface Beam {
  id: string;
  length: number;
  supports: Support[];
  loads: Load[];
  units: 'metric' | 'imperial';
}

export interface Reaction {
  supportId: string;
  position: number;
  verticalForce: number;
  horizontalForce: number;
  moment: number;
}

export interface DiagramPoint {
  position: number;
  value: number;
}

export interface AnalysisResults {
  reactions: Reaction[];
  shearForce: DiagramPoint[];
  bendingMoment: DiagramPoint[];
  maxShear: { position: number; value: number };
  maxMoment: { position: number; value: number };
  validation?: {
    equilibrium?: EquilibriumCheck;
    diagramClosure?: DiagramClosureCheck;
    relationships?: RelationshipCheck;
  };
}

export interface BeamState extends Beam {
  name: string;
  createdAt: Date;
  modifiedAt: Date;
}
