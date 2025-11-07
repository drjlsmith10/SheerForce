import { useState } from 'react';
import { Load, PointLoad, DistributedLoad, Beam } from '../types/beam';

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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Load Configuration</h2>

      <form onSubmit={handleAddLoad} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Load Type
          </label>
          <select
            value={loadType}
            onChange={(e) => setLoadType(e.target.value as 'point' | 'distributed')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="point">Point Load</option>
            <option value="distributed">Distributed Load</option>
          </select>
        </div>

        {loadType === 'point' ? (
          <>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="magnitude" className="block text-sm font-medium text-gray-700 mb-1">
                Magnitude ({unitLabel})
              </label>
              <input
                type="number"
                id="magnitude"
                value={magnitude}
                onChange={(e) => setMagnitude(parseFloat(e.target.value))}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="startPos" className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="endPos" className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="distMag" className="block text-sm font-medium text-gray-700 mb-1">
                Magnitude ({distributedUnitLabel})
              </label>
              <input
                type="number"
                id="distMag"
                value={magnitude}
                onChange={(e) => setMagnitude(parseFloat(e.target.value))}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
        >
          Add Load
        </button>
      </form>

      {beam.loads.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-800">Applied Loads</h3>
          <div className="space-y-2">
            {beam.loads.map((load) => (
              <div
                key={load.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200"
              >
                <div className="text-sm">
                  {load.type === 'point' ? (
                    <span>
                      <strong>Point Load:</strong> {load.magnitude} {unitLabel} at {load.position} {lengthUnit}
                    </span>
                  ) : load.type === 'distributed' ? (
                    <span>
                      <strong>Distributed Load:</strong> {load.startMagnitude} {distributedUnitLabel} from{' '}
                      {load.startPosition} to {load.endPosition} {lengthUnit}
                    </span>
                  ) : null}
                </div>
                <button
                  onClick={() => handleRemoveLoad(load.id)}
                  className="text-red-600 hover:text-red-800 font-medium text-sm"
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
