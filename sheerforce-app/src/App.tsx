import { useState } from 'react';
import type { Beam, Load, AnalysisResults } from './types/beam';
import { BeamInput } from './components/BeamInput';
import { LoadConfiguration } from './components/LoadConfiguration';
import { DiagramDisplay } from './components/DiagramDisplay';
import { CalculationSteps } from './components/CalculationSteps';
import { CriticalPointsTable } from './components/CriticalPointsTable';
import { ValidationReport } from './components/ValidationReport';
import { EngineeringWarnings } from './components/EngineeringWarnings';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center justify-center gap-3 mb-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
              <svg
                className="text-white"
                width="28"
                height="28"
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              SheerForce
            </h1>
          </div>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Professional Shear Force & Bending Moment Calculator
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 mb-6 md:mb-8">
          {/* Left Column - Input */}
          <div className="space-y-5">
            <BeamInput onBeamChange={handleBeamChange} />

            {beam && (
              <LoadConfiguration
                beam={beam}
                onLoadsChange={handleLoadsChange}
              />
            )}

            {beam && (
              <EngineeringWarnings beam={beam} results={results} />
            )}

            {beam && beam.loads.length > 0 && (
              <button
                onClick={handleCalculate}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-bold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-center gap-2.5">
                  <svg
                    width="20"
                    height="20"
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
                <div className="bg-white rounded-xl shadow-lg p-5 md:p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2 rounded-lg shadow-md">
                      <svg
                        className="text-white"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ display: 'block' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Support Reactions</h2>
                  </div>
                  <div className="space-y-3">
                    {results.reactions.map((reaction, idx) => (
                      <div key={reaction.supportId} className="bg-gradient-to-r from-gray-50 to-slate-50 p-3.5 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                              {idx + 1}
                            </div>
                            <span className="text-sm font-bold text-gray-900">Support {idx + 1}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600 mb-1">
                              Position: {reaction.position.toFixed(2)} {unitLabel}
                            </p>
                            <p className="text-base font-bold text-gray-900">
                              {reaction.verticalForce.toFixed(2)} {forceUnit}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-5 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <p className="text-xs font-bold text-blue-900 mb-1.5 uppercase tracking-wide">Max Shear</p>
                      <p className="text-2xl font-bold text-blue-700 mb-1">
                        {Math.abs(results.maxShear.value).toFixed(2)} <span className="text-base">{forceUnit}</span>
                      </p>
                      <p className="text-xs text-blue-600">
                        at x = {results.maxShear.position.toFixed(2)} {unitLabel}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <p className="text-xs font-bold text-purple-900 mb-1.5 uppercase tracking-wide">Max Moment</p>
                      <p className="text-2xl font-bold text-purple-700 mb-1">
                        {Math.abs(results.maxMoment.value).toFixed(2)} <span className="text-base">{momentUnit}</span>
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
          <div className="space-y-6 animate-fadeIn">
            <DiagramDisplay
              title="Shear Force Diagram"
              data={results.shearForce}
              xAxisLabel={`Position (${unitLabel})`}
              yAxisLabel={`Shear Force (${forceUnit})`}
              color="#3b82f6"
            />
            <DiagramDisplay
              title="Bending Moment Diagram"
              data={results.bendingMoment}
              xAxisLabel={`Position (${unitLabel})`}
              yAxisLabel={`Bending Moment (${momentUnit})`}
              color="#8b5cf6"
            />

            {/* Validation Report */}
            {results.validation && (
              <ValidationReport results={results} units={beam?.units || 'metric'} />
            )}

            {/* Calculation Steps */}
            {results.calculationTrace && (
              <CalculationSteps trace={results.calculationTrace} />
            )}

            {/* Critical Points Table */}
            {results.criticalPoints && (
              <CriticalPointsTable analysis={results.criticalPoints} units={beam?.units || 'metric'} />
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 md:mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" style={{ display: 'block' }}>
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Built with React + TypeScript + Vite + Plotly.js</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
