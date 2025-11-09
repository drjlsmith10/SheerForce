export interface CriticalPoint {
  position: number;
  description: string;
  shear: number;
  moment: number;
  isDiscontinuity: boolean;
  type: 'support' | 'load' | 'zero-shear' | 'max-moment' | 'min-moment' | 'max-shear' | 'min-shear';
}

export interface CriticalPointsAnalysis {
  points: CriticalPoint[];
  maxPositiveMoment?: CriticalPoint;
  maxNegativeMoment?: CriticalPoint;
  maxPositiveShear?: CriticalPoint;
  maxNegativeShear?: CriticalPoint;
}
