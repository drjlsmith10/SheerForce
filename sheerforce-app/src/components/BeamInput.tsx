import { useState } from 'react';
import type { Beam, Support } from '../types/beam';

interface BeamInputProps {
  onBeamChange: (beam: Beam) => void;
}

export function BeamInput({ onBeamChange }: BeamInputProps) {
  const [length, setLength] = useState(10);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a simply supported beam with default supports
    const supports: Support[] = [
      {
        id: 'support-1',
        position: 0,
        type: 'pin',
      },
      {
        id: 'support-2',
        position: length,
        type: 'roller',
      },
    ];

    const beam: Beam = {
      id: 'beam-1',
      length,
      supports,
      loads: [],
      units,
    };

    onBeamChange(beam);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Beam Configuration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">
            Beam Length
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              id="length"
              value={length}
              onChange={(e) => setLength(parseFloat(e.target.value))}
              min="0.1"
              step="0.1"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={units}
              onChange={(e) => setUnits(e.target.value as 'metric' | 'imperial')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="metric">meters</option>
              <option value="imperial">feet</option>
            </select>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800">
            This will create a simply supported beam with a pin support at the left end and a roller support at the right end.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Create Beam
        </button>
      </form>
    </div>
  );
}
