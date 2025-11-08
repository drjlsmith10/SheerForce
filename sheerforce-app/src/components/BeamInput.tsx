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
    <div className="bg-white rounded-xl shadow-lg p-5 md:p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
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
        <div>
          <label htmlFor="length" className="block text-sm font-semibold text-gray-700 mb-2">
            Beam Length
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="number"
              id="length"
              value={length}
              onChange={(e) => setLength(parseFloat(e.target.value))}
              min="0.1"
              step="0.1"
              className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter beam length"
            />
            <select
              value={units}
              onChange={(e) => setUnits(e.target.value as 'metric' | 'imperial')}
              className="sm:w-32 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
            >
              <option value="metric">meters</option>
              <option value="imperial">feet</option>
            </select>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-3.5">
          <div className="flex gap-3">
            <svg
              className="text-blue-600 flex-shrink-0"
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 20 20"
              style={{ display: 'block', marginTop: '1px' }}
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
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
            <span>Create Beam</span>
          </div>
        </button>
      </form>
    </div>
  );
}
