import type { Beam } from '../../types/beam';

export interface BeamTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Simply Supported' | 'Cantilever' | 'Combined';
  beam: Beam;
  expectedResults?: {
    maxMoment: number;
    maxShear: number;
  };
  thumbnail?: string;
}

export interface TemplateCategory {
  name: string;
  templates: BeamTemplate[];
}
