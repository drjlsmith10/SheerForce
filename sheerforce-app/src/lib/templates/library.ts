import type { BeamTemplate } from './types';
import type { Beam } from '../../types/beam';

/**
 * Template Library
 * Common beam configurations for quick start
 */

export const TEMPLATES: BeamTemplate[] = [
  // Simply Supported Templates
  {
    id: 'ss-central-point',
    name: 'Central Point Load',
    description: 'Simply supported beam with single centered point load - most common case',
    category: 'Simply Supported',
    beam: {
      id: 'beam-1',
      length: 10,
      units: 'metric',
      type: 'simply-supported',
      supports: [
        { id: 's1', position: 0, type: 'pin' },
        { id: 's2', position: 10, type: 'roller' }
      ],
      loads: [
        { id: 'l1', type: 'point', angle: 0, position: 5, magnitude: 20 }
      ]
    } as Beam,
    expectedResults: {
      maxMoment: 50,
      maxShear: 10
    }
  },
  {
    id: 'ss-udl',
    name: 'Uniformly Distributed Load',
    description: 'Simply supported beam with uniform distributed load across entire span',
    category: 'Simply Supported',
    beam: {
      id: 'beam-1',
      length: 10,
      units: 'metric',
      type: 'simply-supported',
      supports: [
        { id: 's1', position: 0, type: 'pin' },
        { id: 's2', position: 10, type: 'roller' }
      ],
      loads: [
        { id: 'l1', type: 'distributed', startPosition: 0, endPosition: 10, startMagnitude: 5, endMagnitude: 5 }
      ]
    } as Beam,
    expectedResults: {
      maxMoment: 62.5,
      maxShear: 25
    }
  },
  {
    id: 'ss-three-point',
    name: 'Three-Point Loading',
    description: 'Simply supported beam with two symmetrical point loads',
    category: 'Simply Supported',
    beam: {
      id: 'beam-1',
      length: 12,
      units: 'metric',
      type: 'simply-supported',
      supports: [
        { id: 's1', position: 0, type: 'pin' },
        { id: 's2', position: 12, type: 'roller' }
      ],
      loads: [
        { id: 'l1', type: 'point', angle: 0, position: 4, magnitude: 15 },
        { id: 'l2', type: 'point', angle: 0, position: 8, magnitude: 15 }
      ]
    } as Beam,
    expectedResults: {
      maxMoment: 60,
      maxShear: 15
    }
  },
  {
    id: 'ss-combined',
    name: 'Combined Loading',
    description: 'Simply supported beam with both point load and distributed load',
    category: 'Simply Supported',
    beam: {
      id: 'beam-1',
      length: 10,
      units: 'metric',
      type: 'simply-supported',
      supports: [
        { id: 's1', position: 0, type: 'pin' },
        { id: 's2', position: 10, type: 'roller' }
      ],
      loads: [
        { id: 'l1', type: 'distributed', startPosition: 0, endPosition: 10, startMagnitude: 3, endMagnitude: 3 },
        { id: 'l2', type: 'point', angle: 0, position: 5, magnitude: 10 }
      ]
    } as Beam,
    expectedResults: {
      maxMoment: 62.5,
      maxShear: 20
    }
  },
  {
    id: 'ss-offset-point',
    name: 'Offset Point Load',
    description: 'Simply supported beam with off-center point load',
    category: 'Simply Supported',
    beam: {
      id: 'beam-1',
      length: 10,
      units: 'metric',
      type: 'simply-supported',
      supports: [
        { id: 's1', position: 0, type: 'pin' },
        { id: 's2', position: 10, type: 'roller' }
      ],
      loads: [
        { id: 'l1', type: 'point', angle: 0, position: 3, magnitude: 20 }
      ]
    } as Beam,
    expectedResults: {
      maxMoment: 42,
      maxShear: 14
    }
  },
  {
    id: 'ss-partial-udl',
    name: 'Partial Distributed Load',
    description: 'Simply supported beam with distributed load over part of span',
    category: 'Simply Supported',
    beam: {
      id: 'beam-1',
      length: 10,
      units: 'metric',
      type: 'simply-supported',
      supports: [
        { id: 's1', position: 0, type: 'pin' },
        { id: 's2', position: 10, type: 'roller' }
      ],
      loads: [
        { id: 'l1', type: 'distributed', startPosition: 2, endPosition: 8, startMagnitude: 4, endMagnitude: 4 }
      ]
    } as Beam,
    expectedResults: {
      maxMoment: 30,
      maxShear: 12
    }
  },

  // Cantilever Templates
  {
    id: 'cant-end-point',
    name: 'End Point Load',
    description: 'Cantilever beam with point load at free end',
    category: 'Cantilever',
    beam: {
      id: 'beam-1',
      length: 8,
      units: 'metric',
      type: 'cantilever',
      supports: [
        { id: 's1', position: 0, type: 'fixed' }
      ],
      loads: [
        { id: 'l1', type: 'point', angle: 0, position: 8, magnitude: 15 }
      ]
    } as Beam,
    expectedResults: {
      maxMoment: 120,
      maxShear: 15
    }
  },
  {
    id: 'cant-udl',
    name: 'Uniformly Distributed Load',
    description: 'Cantilever beam with uniform distributed load across entire span',
    category: 'Cantilever',
    beam: {
      id: 'beam-1',
      length: 8,
      units: 'metric',
      type: 'cantilever',
      supports: [
        { id: 's1', position: 0, type: 'fixed' }
      ],
      loads: [
        { id: 'l1', type: 'distributed', startPosition: 0, endPosition: 8, startMagnitude: 5, endMagnitude: 5 }
      ]
    } as Beam,
    expectedResults: {
      maxMoment: 160,
      maxShear: 40
    }
  },
  {
    id: 'cant-mid-point',
    name: 'Mid-Span Point Load',
    description: 'Cantilever beam with point load at middle of span',
    category: 'Cantilever',
    beam: {
      id: 'beam-1',
      length: 8,
      units: 'metric',
      type: 'cantilever',
      supports: [
        { id: 's1', position: 0, type: 'fixed' }
      ],
      loads: [
        { id: 'l1', type: 'point', angle: 0, position: 4, magnitude: 15 }
      ]
    } as Beam,
    expectedResults: {
      maxMoment: 60,
      maxShear: 15
    }
  },
  {
    id: 'cant-combined',
    name: 'Combined Loading',
    description: 'Cantilever beam with both point load and distributed load',
    category: 'Cantilever',
    beam: {
      id: 'beam-1',
      length: 8,
      units: 'metric',
      type: 'cantilever',
      supports: [
        { id: 's1', position: 0, type: 'fixed' }
      ],
      loads: [
        { id: 'l1', type: 'distributed', startPosition: 0, endPosition: 8, startMagnitude: 3, endMagnitude: 3 },
        { id: 'l2', type: 'point', angle: 0, position: 8, magnitude: 10 }
      ]
    } as Beam,
    expectedResults: {
      maxMoment: 176,
      maxShear: 34
    }
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): BeamTemplate[] {
  return TEMPLATES.filter(t => t.category === category);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): BeamTemplate | undefined {
  return TEMPLATES.find(t => t.id === id);
}

/**
 * Get all categories
 */
export function getCategories(): string[] {
  return Array.from(new Set(TEMPLATES.map(t => t.category)));
}
