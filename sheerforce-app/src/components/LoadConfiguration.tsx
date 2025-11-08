import { useState } from 'react';
import type { Load, PointLoad, DistributedLoad, Beam } from '../types/beam';

interface LoadConfigurationProps {
  beam: Beam;
  onLoadsChange: (loads: Load[]) => void;
}

export function LoadConfiguration({ beam, onLoadsChange }: LoadConfigurationProps) {
  const [loadType, setLoadType] = useState<'point' | 'distributed'>('point');
  const [position, setPosition] = useState(beam.length / 2);
  const [magnitude, setMagnitude] = useState(10);
  const [startPosition, setStartPosition] = useState(0);
  const [endPosition, setEndPosition] = useState(beam.length);

  const handleAddLoad = (e: React.FormEvent) => {
    e.preventDefault();

    let newLoad: Load;

    if (loadType === 'point') {
      newLoad = {
        id: `load-${Date.now()}`,
        type: 'point',
        position: Math.min(Math.max(position, 0), beam.length),
        magnitude,
        angle: 0, // Vertical downward
      } as PointLoad;
    } else {
      newLoad = {
        id: `load-${Date.now()}`,
        type: 'distributed',
        startPosition: Math.min(Math.max(startPosition, 0), beam.length),
        endPosition: Math.min(Math.max(endPosition, 0), beam.length),
        startMagnitude: magnitude,
        endMagnitude: magnitude, // Uniform load
      } as DistributedLoad;
    }

    onLoadsChange([...beam.loads, newLoad]);
  };

  const handleRemoveLoad = (loadId: string) => {
    onLoadsChange(beam.loads.filter(l => l.id !== loadId));
  };

  const unitLabel = beam.units === 'metric' ? 'kN' : 'kips';
  const distributedUnitLabel = beam.units === 'metric' ? 'kN/m' : 'kips/ft';
  const lengthUnit = beam.units === 'metric' ? 'm' : 'ft';

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-1.5 rounded-md">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-800">Load Configuration</h2>
      </div>

      <form onSubmit={handleAddLoad} className="space-y-3 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Load Type
          </label>
          <select
            value={loadType}
            onChange={(e) => setLoadType(e.target.value as 'point' | 'distributed')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          >
            <option value="point">Point Load</option>
            <option value="distributed">Distributed Load (Uniform)</option>
          </select>
        </div>

        {loadType === 'point' ? (
          <>
            <div>
              <label htmlFor="position" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Position ({lengthUnit})
              </label>
              <input
                type="number"
                id="position"
                value={position}
                onChange={(e) => setPosition(parseFloat(e.target.value))}
                min="0"
                max={beam.length}
                step="0.1"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="magnitude" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Magnitude ({unitLabel})
              </label>
              <input
                type="number"
                id="magnitude"
                value={magnitude}
                onChange={(e) => setMagnitude(parseFloat(e.target.value))}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="startPos" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Start ({lengthUnit})
                </label>
                <input
                  type="number"
                  id="startPos"
                  value={startPosition}
                  onChange={(e) => setStartPosition(parseFloat(e.target.value))}
                  min="0"
                  max={beam.length}
                  step="0.1"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="endPos" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  End ({lengthUnit})
                </label>
                <input
                  type="number"
                  id="endPos"
                  value={endPosition}
                  onChange={(e) => setEndPosition(parseFloat(e.target.value))}
                  min="0"
                  max={beam.length}
                  step="0.1"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label htmlFor="distMag" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Magnitude ({distributedUnitLabel})
              </label>
              <input
                type="number"
                id="distMag"
                value={magnitude}
                onChange={(e) => setMagnitude(parseFloat(e.target.value))}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold text-sm shadow-md hover:shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Load</span>
          </div>
        </button>
      </form>

      {beam.loads.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <h3 className="text-sm font-bold text-gray-800">Applied Loads</h3>
          </div>
          <div className="space-y-2">
            {beam.loads.map((load, idx) => (
              <div
                key={load.id}
                className="flex items-center justify-between bg-purple-50 p-2.5 rounded-md border border-purple-200"
              >
                <div className="flex items-start gap-2 flex-1">
                  <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="text-xs">
                    {load.type === 'point' ? (
                      <div>
                        <p className="font-semibold text-purple-900">Point Load</p>
                        <p className="text-gray-700">
                          <span className="font-medium">{load.magnitude} {unitLabel}</span> at <span className="font-medium">{load.position} {lengthUnit}</span>
                        </p>
                      </div>
                    ) : load.type === 'distributed' ? (
                      <div>
                        <p className="font-semibold text-purple-900">Distributed Load</p>
                        <p className="text-gray-700">
                          <span className="font-medium">{load.startMagnitude} {distributedUnitLabel}</span> from <span className="font-medium">{load.startPosition}</span> to <span className="font-medium">{load.endPosition} {lengthUnit}</span>
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveLoad(load.id)}
                  className="ml-2 bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-800 px-2.5 py-1.5 rounded-md font-medium text-xs transition-all flex-shrink-0"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
