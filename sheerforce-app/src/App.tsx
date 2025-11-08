import { useState } from 'react';
import type { Beam, Load, AnalysisResults } from './types/beam';
import { BeamInput } from './components/BeamInput';
import { LoadConfiguration } from './components/LoadConfiguration';
import { DiagramDisplay } from './components/DiagramDisplay';
import { analyzeBeam } from './lib/beamAnalysis';

function App() {
  const [beam, setBeam] = useState<Beam | null>(null);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBeamChange = (newBeam: Beam) => {
    setBeam(newBeam);
    setError(null);
    // Clear results when beam changes
    setResults(null);
  };

  const handleLoadsChange = (loads: Load[]) => {
    if (!beam) return;
    const updatedBeam = { ...beam, loads };
    setBeam(updatedBeam);
    setError(null);
  };

  const handleCalculate = () => {
    if (!beam) return;

    try {
      if (beam.loads.length === 0) {
        setError('Please add at least one load to the beam');
        return;
      }

      const analysisResults = analyzeBeam(beam);
      setResults(analysisResults);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during calculation');
      setResults(null);
    }
  };

  const unitLabel = beam?.units === 'metric' ? 'm' : 'ft';
  const forceUnit = beam?.units === 'metric' ? 'kN' : 'kips';
  const momentUnit = beam?.units === 'metric' ? 'kN·m' : 'kip·ft';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-lg shadow-md">
              <svg
                className="text-white"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ display: 'block' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              SheerForce
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            Professional Shear Force & Bending Moment Calculator
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* Left Column - Input */}
          <div className="space-y-5">
            <BeamInput onBeamChange={handleBeamChange} />

            {beam && (
              <LoadConfiguration
                beam={beam}
                onLoadsChange={handleLoadsChange}
              />
            )}

            {beam && beam.loads.length > 0 && (
              <button
                onClick={handleCalculate}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-bold text-base shadow-md hover:shadow-lg"
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Calculate Diagrams</span>
                </div>
              </button>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-2.5">
                  <svg
                    className="text-red-500 flex-shrink-0"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    style={{ display: 'block', marginTop: '2px' }}
                  >
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-800 font-semibold">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-5">
            {results && (
              <>
                {/* Reactions Summary */}
                <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-1.5 rounded-md">
                      <svg
                        className="text-white"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ display: 'block' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h2 className="text-base font-bold text-gray-900">Support Reactions</h2>
                  </div>
                  <div className="space-y-2.5">
                    {results.reactions.map((reaction, idx) => (
                      <div key={reaction.supportId} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                              {idx + 1}
                            </div>
                            <span className="text-sm font-bold text-gray-900">Support {idx + 1}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600 mb-0.5">
                              Position: {reaction.position.toFixed(2)} {unitLabel}
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {reaction.verticalForce.toFixed(2)} {forceUnit}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-xs font-bold text-blue-900 mb-1">Max Shear</p>
                      <p className="text-lg font-bold text-blue-700">
                        {Math.abs(results.maxShear.value).toFixed(2)} {forceUnit}
                      </p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        at x = {results.maxShear.position.toFixed(2)} {unitLabel}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <p className="text-xs font-bold text-purple-900 mb-1">Max Moment</p>
                      <p className="text-lg font-bold text-purple-700">
                        {Math.abs(results.maxMoment.value).toFixed(2)} {momentUnit}
                      </p>
                      <p className="text-xs text-purple-600 mt-0.5">
                        at x = {results.maxMoment.position.toFixed(2)} {unitLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Diagrams - Full Width */}
        {results && (
          <div className="space-y-6">
            <DiagramDisplay
              title="Shear Force Diagram"
              data={results.shearForce}
              yAxisLabel={`Shear Force (${forceUnit})`}
              color="#3b82f6"
            />
            <DiagramDisplay
              title="Bending Moment Diagram"
              data={results.bendingMoment}
              yAxisLabel={`Bending Moment (${momentUnit})`}
              color="#8b5cf6"
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Built with React + TypeScript + Vite + Plotly.js
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
