import { analyzeBeam } from './src/lib/beamAnalysis.ts';

const beam = {
  id: 'test',
  length: 3,
  units: 'imperial',
  supports: [{ id: 's1', position: 3, type: 'fixed' }],
  loads: [{ id: 'l1', type: 'point', position: 0, magnitude: 5, angle: 0 }]
};

const results = analyzeBeam(beam);
console.log('Reactions:', results.reactions);
console.log('First 5 shear points:', results.shearForce.slice(0, 5));
console.log('Last 5 shear points:', results.shearForce.slice(-5));
console.log('First 5 moment points:', results.bendingMoment.slice(0, 5));
console.log('Last 5 moment points:', results.bendingMoment.slice(-5));
