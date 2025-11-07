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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            SheerForce
          </h1>
          <p className="text-lg text-gray-600">
            Shear Force & Bending Moment Diagram Calculator
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
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-md"
              >
                Calculate Diagrams
              </button>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {results && (
              <>
                {/* Reactions Summary */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Support Reactions</h2>
                  <div className="space-y-3">
                    {results.reactions.map((reaction, idx) => (
                      <div key={reaction.supportId} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                        <p className="font-medium text-gray-900">Support {idx + 1}</p>
                        <p className="text-sm text-gray-600">
                          Position: {reaction.position.toFixed(2)} {unitLabel}
                        </p>
                        <p className="text-sm text-gray-600">
                          Vertical Force: {reaction.verticalForce.toFixed(2)} {forceUnit}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Max Shear:</strong> {Math.abs(results.maxShear.value).toFixed(2)} {forceUnit} at{' '}
                      {results.maxShear.position.toFixed(2)} {unitLabel}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Max Moment:</strong> {Math.abs(results.maxMoment.value).toFixed(2)} {momentUnit} at{' '}
                      {results.maxMoment.position.toFixed(2)} {unitLabel}
                    </p>
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
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Built with React + TypeScript + Vite + Plotly.js</p>
        </div>
      </div>
    </div>
  );
}

export default App;
