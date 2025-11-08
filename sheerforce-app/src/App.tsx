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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            SheerForce
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Professional Shear Force & Bending Moment Calculator
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Analyze beams with precision and visualize structural behavior
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Input */}
          <div className="space-y-6">
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
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Calculate Diagrams</span>
                </div>
              </button>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {results && (
              <>
                {/* Reactions Summary */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Support Reactions</h2>
                  </div>
                  <div className="space-y-3">
                    {results.reactions.map((reaction, idx) => (
                      <div key={reaction.supportId} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {idx + 1}
                          </div>
                          <p className="font-semibold text-gray-900">Support {idx + 1}</p>
                        </div>
                        <div className="ml-10 space-y-1">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Position:</span> {reaction.position.toFixed(2)} {unitLabel}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Reaction:</span> {reaction.verticalForce.toFixed(2)} {forceUnit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-5 border-t-2 border-gray-200 space-y-3">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Maximum Shear Force</p>
                      <p className="text-lg font-bold text-blue-700">
                        {Math.abs(results.maxShear.value).toFixed(2)} {forceUnit}
                      </p>
                      <p className="text-xs text-blue-600">
                        at x = {results.maxShear.position.toFixed(2)} {unitLabel}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <p className="text-sm font-semibold text-purple-900 mb-1">Maximum Bending Moment</p>
                      <p className="text-lg font-bold text-purple-700">
                        {Math.abs(results.maxMoment.value).toFixed(2)} {momentUnit}
                      </p>
                      <p className="text-xs text-purple-600">
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
        <div className="mt-12 text-center">
          <div className="inline-block bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">
              Built with <span className="font-semibold text-blue-600">React</span> + <span className="font-semibold text-blue-600">TypeScript</span> + <span className="font-semibold text-blue-600">Vite</span> + <span className="font-semibold text-blue-600">Plotly.js</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
