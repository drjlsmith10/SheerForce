import { useState, useEffect } from 'react';
import type { Load, PointLoad, DistributedLoad, Beam } from '../types/beam';

interface LoadConfigurationProps {
  beam: Beam | null;
  onLoadsChange: (loads: Load[]) => void;
}

export function LoadConfiguration({ beam, onLoadsChange }: LoadConfigurationProps) {
  const [loadType, setLoadType] = useState<'point' | 'distributed'>('point');
  const [position, setPosition] = useState(beam ? beam.length / 2 : 5);
  const [magnitude, setMagnitude] = useState(10);
  const [startPosition, setStartPosition] = useState(0);
  const [endPosition, setEndPosition] = useState(beam ? beam.length : 10);
  const [editingLoadId, setEditingLoadId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (beam) {
      setPosition(beam.length / 2);
      setStartPosition(0);
      setEndPosition(beam.length);
    }
  }, [beam]);

  const handleAddLoad = (e: React.FormEvent) => {
    e.preventDefault();

    if (!beam || !validateForm()) return;

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

    if (beam) onLoadsChange([...beam.loads, newLoad]);
    setErrors({});
  };

  const handleRemoveLoad = (loadId: string) => {
    if (beam) onLoadsChange(beam.loads.filter(l => l.id !== loadId));
  };

  const handleEditLoad = (loadId: string) => {
    if (!beam) return;
    const load = beam.loads.find(l => l.id === loadId);
    if (!load) return;
    setEditingLoadId(loadId);
    if (load.type === 'point') {
      setLoadType('point');
      setPosition(load.position);
      setMagnitude(load.magnitude);
    } else if (load.type === 'distributed') {
      setLoadType('distributed');
      setStartPosition(load.startPosition);
      setEndPosition(load.endPosition);
      setMagnitude(load.startMagnitude);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!beam || !editingLoadId || !validateForm()) return;
    const updatedLoads = beam.loads.map(load => {
      if (load.id === editingLoadId) {
        if (loadType === 'point') {
          return {
            ...load,
            type: 'point' as const,
            position: Math.min(Math.max(position, 0), beam.length),
            magnitude,
          } as PointLoad;
        } else {
          return {
            ...load,
            type: 'distributed' as const,
            startPosition: Math.min(Math.max(startPosition, 0), beam.length),
            endPosition: Math.min(Math.max(endPosition, 0), beam.length),
            startMagnitude: magnitude,
            endMagnitude: magnitude,
          } as DistributedLoad;
        }
      }
      return load;
    });
    if (beam) onLoadsChange(updatedLoads);
    setEditingLoadId(null);
    setErrors({});
  };

  const handleCancelEdit = () => {
    setEditingLoadId(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (loadType === 'point') {
      if (position < 0 || position > (beam?.length || 10)) {
        newErrors.position = `Position must be between 0 and ${beam?.length || 10}`;
      }
      if (magnitude <= 0) {
        newErrors.magnitude = 'Magnitude must be positive';
      }
    } else {
      if (startPosition < 0 || startPosition > (beam?.length || 10)) {
        newErrors.startPosition = `Start position must be between 0 and ${beam?.length || 10}`;
      }
      if (endPosition < 0 || endPosition > (beam?.length || 10)) {
        newErrors.endPosition = `End position must be between 0 and ${beam?.length || 10}`;
      }
      if (startPosition >= endPosition) {
        newErrors.endPosition = 'End position must be greater than start position';
      }
      if (magnitude <= 0) {
        newErrors.magnitude = 'Magnitude must be positive';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const unitLabel = beam?.units === 'metric' ? 'kN' : 'kips';
  const distributedUnitLabel = beam?.units === 'metric' ? 'kN/m' : 'kips/ft';
  const lengthUnit = beam?.units === 'metric' ? 'm' : 'ft';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 md:p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg shadow-md">
          <svg
            className="text-white"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ display: 'block' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Load Configuration</h2>
      </div>

      {!beam && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-5">
          <p className="text-yellow-800">Create a beam first to add loads.</p>
        </div>
      )}
      <form onSubmit={editingLoadId ? handleSaveEdit : handleAddLoad} className="space-y-4 mb-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Load Type
          </label>
          <select
            value={loadType}
            onChange={(e) => setLoadType(e.target.value as 'point' | 'distributed')}
            disabled={!beam}
            className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              !beam ? 'bg-gray-100 text-gray-500' : 'border-gray-300 focus:ring-purple-500 focus:border-transparent bg-white'
            }`}
          >
            <option value="point">Point Load</option>
            <option value="distributed">Distributed Load (Uniform)</option>
          </select>
        </div>

        {loadType === 'point' ? (
          <>
            <div>
              <label htmlFor="position" className="block text-sm font-semibold text-gray-700 mb-2">
                Position ({lengthUnit})
              </label>
              <input
                type="number"
                id="position"
                value={position}
                onChange={(e) => setPosition(parseFloat(e.target.value) || 0)}
                min="0"
                max={beam?.length || 10}
                step="0.01"
                disabled={!beam}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  !beam ? 'bg-gray-100 text-gray-500' : errors.position ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500 focus:border-transparent'
                }`}
                placeholder="Position along beam"
              />
              {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
            </div>
            <div>
              <label htmlFor="magnitude" className="block text-sm font-semibold text-gray-700 mb-2">
                Magnitude ({unitLabel})
              </label>
              <input
                type="number"
                id="magnitude"
                value={magnitude}
                onChange={(e) => setMagnitude(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                disabled={!beam}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  !beam ? 'bg-gray-100 text-gray-500' : errors.magnitude ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500 focus:border-transparent'
                }`}
                placeholder="Force magnitude"
              />
              {errors.magnitude && <p className="text-red-500 text-xs mt-1">{errors.magnitude}</p>}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="startPos" className="block text-sm font-semibold text-gray-700 mb-2">
                  Start ({lengthUnit})
                </label>
                <input
                  type="number"
                  id="startPos"
                  value={startPosition}
                  onChange={(e) => setStartPosition(parseFloat(e.target.value) || 0)}
                  min="0"
                  max={beam?.length || 10}
                  step="0.01"
                  disabled={!beam}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    !beam ? 'bg-gray-100 text-gray-500' : errors.startPosition ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500 focus:border-transparent'
                  }`}
                  placeholder="Start position"
                />
                {errors.startPosition && <p className="text-red-500 text-xs mt-1">{errors.startPosition}</p>}
              </div>
              <div>
                <label htmlFor="endPos" className="block text-sm font-semibold text-gray-700 mb-2">
                  End ({lengthUnit})
                </label>
                <input
                  type="number"
                  id="endPos"
                  value={endPosition}
                  onChange={(e) => setEndPosition(parseFloat(e.target.value) || 0)}
                  min="0"
                  max={beam?.length || 10}
                  step="0.01"
                  disabled={!beam}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    !beam ? 'bg-gray-100 text-gray-500' : errors.endPosition ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500 focus:border-transparent'
                  }`}
                  placeholder="End position"
                />
                {errors.endPosition && <p className="text-red-500 text-xs mt-1">{errors.endPosition}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="distMag" className="block text-sm font-semibold text-gray-700 mb-2">
                Magnitude ({distributedUnitLabel})
              </label>
              <input
                type="number"
                id="distMag"
                value={magnitude}
                onChange={(e) => setMagnitude(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                disabled={!beam}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  !beam ? 'bg-gray-100 text-gray-500' : errors.magnitude ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500 focus:border-transparent'
                }`}
                placeholder="Load intensity"
              />
              {errors.magnitude && <p className="text-red-500 text-xs mt-1">{errors.magnitude}</p>}
            </div>
          </>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!beam}
            className={`flex-1 py-3 px-6 rounded-lg transition-all duration-200 font-semibold text-sm ${
              !beam ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 shadow hover:shadow-md'
            }`}
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
              <span>{editingLoadId ? 'Save Changes' : 'Add Load'}</span>
            </div>
          </button>
          {editingLoadId && beam && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-semibold text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {beam && beam.loads.length > 0 && (
        <div className="border-t border-gray-200 pt-5 mt-1">
          <div className="flex items-center gap-2 mb-3.5">
            <div className="bg-purple-100 p-1.5 rounded-md">
              <svg
                className="text-purple-600"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ display: 'block' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-900">Applied Loads ({beam.loads.length})</h3>
          </div>
          <div className="space-y-2.5">
            {beam.loads.map((load, idx) => (
              <div
                key={load.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between bg-purple-50 dark:bg-purple-900/20 p-3.5 rounded-lg border border-purple-200 dark:border-purple-700"
              >
                <div className="flex items-start gap-3 flex-1 mb-2 sm:mb-0">
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md">
                    {idx + 1}
                  </div>
                  <div className="text-sm">
                    {load.type === 'point' ? (
                      <div>
                        <p className="font-bold text-purple-900 mb-1">Point Load</p>
                        <p className="text-gray-700 leading-relaxed">
                          <strong>{load.magnitude} {unitLabel}</strong> at <strong>{load.position} {lengthUnit}</strong>
                        </p>
                      </div>
                    ) : load.type === 'distributed' ? (
                      <div>
                        <p className="font-bold text-purple-900 mb-1">Distributed Load</p>
                        <p className="text-gray-700 leading-relaxed">
                          <strong>{load.startMagnitude} {distributedUnitLabel}</strong> from <strong>{load.startPosition}</strong> to <strong>{load.endPosition} {lengthUnit}</strong>
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
                 <div className="flex gap-2 sm:ml-3 self-end sm:self-center">
                   <button
                     onClick={() => handleEditLoad(load.id)}
                     className="bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-800 px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-200 shadow-sm hover:shadow"
                   >
                     Edit
                   </button>
                   <button
                     onClick={() => handleRemoveLoad(load.id)}
                     className="bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-800 px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-200 shadow-sm hover:shadow"
                   >
                     Remove
                   </button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
