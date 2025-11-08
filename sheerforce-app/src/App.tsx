import { useState } from 'react';
import type { Beam, Load, AnalysisResults } from './types/beam';
import { BeamInput } from './components/BeamInput';
import { LoadConfiguration } from './components/LoadConfiguration';
import { DiagramDisplay } from './components/DiagramDisplay';
import { BeamVisualization } from './components/BeamVisualization';
import { analyzeBeam } from './lib/beamAnalysis';
import jsPDF from 'jspdf';

function App() {
  const [beam, setBeam] = useState<Beam | null>(null);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  const handleBeamChange = (newBeam: Beam) => {
    setBeam(newBeam);
    setError(null);
    // Clear results when beam changes
    setResults(null);
  };

  const handleUnitsChange = (newUnits: 'metric' | 'imperial') => {
    if (!beam) return;
    const updatedBeam = { ...beam, units: newUnits };
    setBeam(updatedBeam);
    setResults(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const exportToPDF = async () => {
    if (!beam || !results) return;

    const pdf = new jsPDF();
    let yPosition = 20;

    // Title
    pdf.setFontSize(20);
    pdf.text('SheerForce Analysis Report', 20, yPosition);
    yPosition += 20;

    // Beam Info
    pdf.setFontSize(14);
    pdf.text(`Beam Length: ${beam.length} ${beam.units === 'metric' ? 'm' : 'ft'}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Material: ${beam.material.name}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Cross-Section: ${beam.crossSection.label}`, 20, yPosition);
    yPosition += 20;

    // Supports
    pdf.text('Supports:', 20, yPosition);
    yPosition += 10;
    beam.supports.forEach((support, idx) => {
      pdf.text(`Support ${idx + 1}: ${support.type} at ${support.position} ${beam.units === 'metric' ? 'm' : 'ft'}`, 30, yPosition);
      yPosition += 8;
    });
    yPosition += 10;

    // Loads
    pdf.text('Loads:', 20, yPosition);
    yPosition += 10;
    beam.loads.forEach((load, idx) => {
      let desc = '';
      if (load.type === 'point') {
        desc = `Point: ${load.magnitude} ${beam.units === 'metric' ? 'kN' : 'kips'} at ${load.position} ${beam.units === 'metric' ? 'm' : 'ft'}`;
      } else if (load.type === 'distributed') {
        desc = `Distributed: ${load.startMagnitude} to ${load.endMagnitude} ${beam.units === 'metric' ? 'kN/m' : 'kips/ft'} from ${load.startPosition} to ${load.endPosition} ${beam.units === 'metric' ? 'm' : 'ft'}`;
      } else if (load.type === 'moment') {
        desc = `Moment: ${load.magnitude} ${beam.units === 'metric' ? 'kN·m' : 'kip·ft'} at ${load.position} ${beam.units === 'metric' ? 'm' : 'ft'}`;
      }
      pdf.text(`Load ${idx + 1}: ${desc}`, 30, yPosition);
      yPosition += 8;
    });
    yPosition += 10;

    // Reactions
    pdf.text('Support Reactions:', 20, yPosition);
    yPosition += 10;
    results.reactions.forEach((reaction, idx) => {
      pdf.text(`Support ${idx + 1}: V = ${reaction.verticalForce.toFixed(2)} ${forceUnit}`, 30, yPosition);
      yPosition += 8;
    });
    yPosition += 10;

    // Max values
    pdf.text(`Max Shear: ${Math.abs(results.maxShear.value).toFixed(2)} ${forceUnit} at x = ${results.maxShear.position.toFixed(2)} ${unitLabel}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Max Moment: ${Math.abs(results.maxMoment.value).toFixed(2)} ${momentUnit} at x = ${results.maxMoment.position.toFixed(2)} ${unitLabel}`, 20, yPosition);
    yPosition += 10;
    if (results.maxDeflection) {
      pdf.text(`Max Deflection: ${(Math.abs(results.maxDeflection.value) * 1000).toFixed(2)} mm at x = ${results.maxDeflection.position.toFixed(2)} ${unitLabel}`, 20, yPosition);
      yPosition += 10;
    }

    // Diagrams - capture canvas
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // For diagrams, we can add text description since capturing canvas is complex
    pdf.text('Diagrams: See attached plots in the application.', 20, yPosition);

    pdf.save('sheerforce-analysis.pdf');
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
    <div className="min-h-screen bg-slate-200 dark:bg-slate-900 p-8 md:p-12 lg:p-16">
      <div className="container mx-auto" style={{ maxWidth: '80%' }}>
        {/* Header */}
        <header className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center justify-center gap-3 mb-3">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
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
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-4">
            Professional Shear Force & Bending Moment Calculator
          </p>
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={toggleDarkMode}
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            {beam && (
              <select
                value={beam.units}
                onChange={(e) => handleUnitsChange(e.target.value as 'metric' | 'imperial')}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="metric">Metric (kN, m)</option>
                <option value="imperial">Imperial (kips, ft)</option>
              </select>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 md:gap-6 mb-6 md:mb-8">
          {/* Left Column - Input */}
          <div className="space-y-5">
            <BeamInput onBeamChange={handleBeamChange} />

            {beam && <BeamVisualization beam={beam} />}

            <LoadConfiguration
              beam={beam}
              onLoadsChange={handleLoadsChange}
            />

            {beam && (
              <div className="flex gap-4">
                <button
                  onClick={handleCalculate}
                  disabled={beam.loads.length === 0}
                  className={`flex-1 py-3.5 px-6 rounded-lg font-bold text-base transition-all duration-200 ${
                    beam.loads.length === 0
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow hover:shadow-md'
                  }`}
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
                {results && (
                  <button
                    onClick={exportToPDF}
                    className="px-6 py-3.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-base transition-all duration-200 shadow hover:shadow-md"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Export PDF</span>
                    </div>
                  </button>
                )}
              </div>
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
            {!results && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 md:p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Analysis Results</h2>
                <p className="text-gray-600">Add loads and calculate to see shear force and bending moment diagrams.</p>
              </div>
            )}
            {results && (
              <>
                {/* Reactions Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 md:p-6 border border-gray-100 dark:border-gray-700">
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
                      <div key={reaction.supportId} className="bg-gray-50 dark:bg-gray-700 p-3.5 rounded-lg border border-gray-200 dark:border-gray-600">
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

                   <div className="mt-5 pt-5 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                     <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                       <p className="text-xs font-bold text-blue-900 mb-1.5 uppercase tracking-wide">Max Shear</p>
                       <p className="text-2xl font-bold text-blue-700 mb-1">
                         {Math.abs(results.maxShear.value).toFixed(2)} <span className="text-base">{forceUnit}</span>
                       </p>
                       <p className="text-xs text-blue-600">
                         at x = {results.maxShear.position.toFixed(2)} {unitLabel}
                       </p>
                     </div>
                     <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                       <p className="text-xs font-bold text-purple-900 mb-1.5 uppercase tracking-wide">Max Moment</p>
                       <p className="text-2xl font-bold text-purple-700 mb-1">
                         {Math.abs(results.maxMoment.value).toFixed(2)} <span className="text-base">{momentUnit}</span>
                       </p>
                       <p className="text-xs text-purple-600">
                         at x = {results.maxMoment.position.toFixed(2)} {unitLabel}
                       </p>
                     </div>
                      {results.maxDeflection && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                          <p className="text-xs font-bold text-green-900 mb-1.5 uppercase tracking-wide">Max Deflection</p>
                          <p className="text-2xl font-bold text-green-700 mb-1">
                            {Math.abs(results.maxDeflection.value * 1000).toFixed(2)} <span className="text-base">mm</span>
                          </p>
                          <p className="text-xs text-green-600">
                            at x = {results.maxDeflection.position.toFixed(2)} {unitLabel}
                          </p>
                        </div>
                      )}
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
              yAxisLabel={`Shear Force (${forceUnit})`}
              color="#3b82f6"
            />
            <DiagramDisplay
              title="Bending Moment Diagram"
              data={results.bendingMoment}
              yAxisLabel={`Bending Moment (${momentUnit})`}
              color="#8b5cf6"
            />
            {results.deflection && (
              <DiagramDisplay
                title="Deflection Diagram"
                data={results.deflection}
                yAxisLabel={`Deflection (${unitLabel})`}
                color="#10b981"
              />
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
