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
    <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-1.5 rounded-md">
          <svg
            className="text-white"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ display: 'block' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <h2 className="text-base font-bold text-gray-900">Beam Configuration</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="length" className="block text-sm font-semibold text-gray-700 mb-2">
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
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={units}
              onChange={(e) => setUnits(e.target.value as 'metric' | 'imperial')}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="metric">meters</option>
              <option value="imperial">feet</option>
            </select>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3">
          <div className="flex gap-2.5">
            <svg
              className="text-blue-600 flex-shrink-0"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 20 20"
              style={{ display: 'block', marginTop: '2px' }}
            >
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-blue-900 leading-relaxed">
              Creates a simply supported beam with <strong>pin</strong> and <strong>roller</strong> supports at the ends.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-sm shadow-md hover:shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ display: 'block' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Beam</span>
          </div>
        </button>
      </form>
    </div>
  );
}
