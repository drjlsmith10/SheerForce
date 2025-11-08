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
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-5">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Beam Configuration</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="length" className="block text-sm font-semibold text-gray-700 mb-2">
            Beam Length
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              id="length"
              value={length}
              onChange={(e) => setLength(parseFloat(e.target.value))}
              min="0.1"
              step="0.1"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <select
              value={units}
              onChange={(e) => setUnits(e.target.value as 'metric' | 'imperial')}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
            >
              <option value="metric">meters</option>
              <option value="imperial">feet</option>
            </select>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-blue-900 leading-relaxed">
              Creates a simply supported beam with a <span className="font-semibold">pin support</span> at the left end and a <span className="font-semibold">roller support</span> at the right end.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Beam</span>
          </div>
        </button>
      </form>
    </div>
  );
}
