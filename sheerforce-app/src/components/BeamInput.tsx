import { useState } from 'react';
import type { Beam, Support, Load, PointLoad, MaterialProperties, CrossSection } from '../types/beam';

const predefinedMaterials: MaterialProperties[] = [
  { name: 'A36 Steel', type: 'steel', modulusOfElasticity: 200e9, yieldStrength: 250e6, density: 7850 },
  { name: 'A572 Grade 50 Steel', type: 'steel', modulusOfElasticity: 200e9, yieldStrength: 345e6, density: 7850 },
  { name: 'A992 Steel', type: 'steel', modulusOfElasticity: 200e9, yieldStrength: 345e6, density: 7850 },
  { name: 'Stainless Steel 304', type: 'steel', modulusOfElasticity: 193e9, yieldStrength: 215e6, density: 8000 },
  { name: 'Concrete (C20)', type: 'concrete', modulusOfElasticity: 25e9, density: 2400 },
  { name: 'Concrete (C25)', type: 'concrete', modulusOfElasticity: 28e9, density: 2400 },
  { name: 'Concrete (C30)', type: 'concrete', modulusOfElasticity: 30e9, density: 2400 },
  { name: 'Concrete (C35)', type: 'concrete', modulusOfElasticity: 32e9, density: 2400 },
  { name: 'Douglas Fir Wood', type: 'wood', modulusOfElasticity: 13e9, density: 480 },
  { name: 'Southern Pine Wood', type: 'wood', modulusOfElasticity: 12e9, density: 500 },
  { name: 'Oak Wood', type: 'wood', modulusOfElasticity: 11e9, density: 600 },
  { name: 'Aluminum 6061-T6', type: 'aluminum', modulusOfElasticity: 69e9, yieldStrength: 276e6, density: 2700 },
  { name: 'Aluminum 7075-T6', type: 'aluminum', modulusOfElasticity: 72e9, yieldStrength: 503e6, density: 2810 },
];

const predefinedCrossSections: { type: CrossSection['type'], dimensions: { [key: string]: number }, label: string }[] = [
  // I-beams (W shapes)
  { type: 'I-beam', dimensions: { height: 0.254, width: 0.152, webThickness: 0.0064, flangeThickness: 0.0095 }, label: 'W 10x22' },
  { type: 'I-beam', dimensions: { height: 0.305, width: 0.152, webThickness: 0.0076, flangeThickness: 0.0114 }, label: 'W 12x26' },
  { type: 'I-beam', dimensions: { height: 0.356, width: 0.178, webThickness: 0.0089, flangeThickness: 0.0133 }, label: 'W 14x34' },
  { type: 'I-beam', dimensions: { height: 0.406, width: 0.178, webThickness: 0.0102, flangeThickness: 0.0152 }, label: 'W 16x40' },
  { type: 'I-beam', dimensions: { height: 0.457, width: 0.191, webThickness: 0.0114, flangeThickness: 0.0171 }, label: 'W 18x50' },
  // Rectangular
  { type: 'rectangular', dimensions: { height: 0.3, width: 0.15 }, label: '300x150 mm Rectangular' },
  { type: 'rectangular', dimensions: { height: 0.4, width: 0.2 }, label: '400x200 mm Rectangular' },
  { type: 'rectangular', dimensions: { height: 0.5, width: 0.25 }, label: '500x250 mm Rectangular' },
  // Circular
  { type: 'circular', dimensions: { diameter: 0.2 }, label: '200 mm Diameter' },
  { type: 'circular', dimensions: { diameter: 0.3 }, label: '300 mm Diameter' },
  { type: 'circular', dimensions: { diameter: 0.4 }, label: '400 mm Diameter' },
  // T-beams
  { type: 'T-beam', dimensions: { height: 0.4, width: 0.2, webThickness: 0.01, flangeThickness: 0.015 }, label: 'T-beam 400x200' },
  { type: 'T-beam', dimensions: { height: 0.5, width: 0.25, webThickness: 0.012, flangeThickness: 0.018 }, label: 'T-beam 500x250' },
];

interface BeamInputProps {
  onBeamChange: (beam: Beam) => void;
}

export function BeamInput({ onBeamChange }: BeamInputProps) {
  const [length, setLength] = useState(10);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [material, setMaterial] = useState<MaterialProperties>(predefinedMaterials[0]);
  const [crossSection, setCrossSection] = useState<CrossSection>(predefinedCrossSections[0]);
  const [supports, setSupports] = useState<Support[]>([
    { id: 'support-1', position: 0, type: 'pin' },
    { id: 'support-2', position: 10, type: 'roller' }
  ]);
  const [newSupportType, setNewSupportType] = useState<'pin' | 'roller' | 'fixed'>('roller');
  const [newSupportPosition, setNewSupportPosition] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const beam: Beam = {
      id: 'beam-1',
      length,
      supports: supports.map(s => ({ ...s, position: Math.min(Math.max(s.position, 0), length) })),
      loads: [],
      units,
      material,
      crossSection,
    };

    onBeamChange(beam);
  };

  const handleAddSupport = () => {
    const newSupport: Support = {
      id: `support-${Date.now()}`,
      position: Math.min(Math.max(newSupportPosition, 0), length),
      type: newSupportType,
    };
    setSupports([...supports, newSupport]);
  };

  const handleRemoveSupport = (id: string) => {
    setSupports(supports.filter(s => s.id !== id));
  };

  const loadExample = () => {
    const supports: Support[] = [
      {
        id: 'support-1',
        position: 0,
        type: 'pin',
      },
      {
        id: 'support-2',
        position: 10,
        type: 'roller',
      },
    ];

    const loads: Load[] = [
      {
        id: 'load-1',
        type: 'point',
        position: 5,
        magnitude: 20,
        angle: 0,
      } as PointLoad,
    ];

    const beam: Beam = {
      id: 'beam-example',
      length: 10,
      supports,
      loads,
      units: 'metric',
      material: predefinedMaterials[0],
      crossSection: predefinedCrossSections[0],
    };

    onBeamChange(beam);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 md:p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-lg shadow-md">
          <svg
            className="text-white"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ display: 'block' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Beam Configuration</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="length" className="block text-sm font-semibold text-gray-700 mb-2">
              Beam Length
            </label>
            <input
              type="number"
              id="length"
              value={length}
              onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
              min="0.01"
              step="0.01"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter beam length"
            />
          </div>
          <div>
            <label htmlFor="units" className="block text-sm font-semibold text-gray-700 mb-2">
              Units
            </label>
            <select
              id="units"
              value={units}
              onChange={(e) => setUnits(e.target.value as 'metric' | 'imperial')}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
            >
              <option value="metric">Metric (m, kN)</option>
              <option value="imperial">Imperial (ft, kips)</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="material" className="block text-sm font-semibold text-gray-700 mb-2">
            Beam Material
          </label>
          <select
            id="material"
            value={material.name}
            onChange={(e) => setMaterial(predefinedMaterials.find(m => m.name === e.target.value) || predefinedMaterials[0])}
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
          >
            {predefinedMaterials.map(m => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="crossSection" className="block text-sm font-semibold text-gray-700 mb-2">
            Cross-Section
          </label>
          <select
            id="crossSection"
            value={crossSection.label || ''}
            onChange={(e) => setCrossSection(predefinedCrossSections.find(c => c.label === e.target.value) || predefinedCrossSections[0])}
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
          >
            {predefinedCrossSections.map(c => (
              <option key={c.label} value={c.label}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Supports Configuration</h4>
          <div className="space-y-3">
            <div className="flex gap-2">
              <select
                value={newSupportType}
                onChange={(e) => setNewSupportType(e.target.value as 'pin' | 'roller' | 'fixed')}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
              >
                <option value="pin">Pin</option>
                <option value="roller">Roller</option>
                <option value="fixed">Fixed</option>
              </select>
              <input
                type="number"
                value={newSupportPosition}
                onChange={(e) => setNewSupportPosition(parseFloat(e.target.value) || 0)}
                min="0"
                max={length}
                step="0.01"
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
                placeholder="Position"
              />
              <button
                type="button"
                onClick={handleAddSupport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Add Support
              </button>
            </div>
            <p className="text-xs text-blue-700">
              Suggested: For simply supported beams, place pin at 0 and roller at {length}.
            </p>
            {supports.length > 0 && (
              <div className="space-y-1">
                {supports.map((support, idx) => (
                  <div key={support.id} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="text-sm">Support {idx + 1}: {support.type} at {support.position}</span>
                    <button
                      onClick={() => handleRemoveSupport(support.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-sm shadow hover:shadow-md"
        >
          <div className="flex items-center justify-center gap-2">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ display: 'block' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Beam ({supports.length} supports)</span>
          </div>
        </button>

        <button
          type="button"
          onClick={loadExample}
          className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-all duration-200 font-semibold text-sm shadow hover:shadow-md mt-3"
        >
          <div className="flex items-center justify-center gap-2">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ display: 'block' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Load Example Beam</span>
          </div>
        </button>
      </form>
    </div>
  );
}
