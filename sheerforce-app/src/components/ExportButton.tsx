/**
 * Export Button Component
 *
 * Professional export functionality with PDF and CSV options.
 */

import { useState } from 'react';
import type { Beam, AnalysisResults } from '../types/beam';
import type { ReactionCalculationTrace } from '../lib/calculationTrace/types';
import type { CriticalPoint } from '../lib/criticalPoints/types';
import { generatePDFReport } from '../lib/export/pdfGenerator';
import type { PDFExportOptions } from '../lib/export/types';
import { CSVExporter } from '../lib/export/csvExporter';

interface ExportButtonProps {
  beam: Beam;
  results: AnalysisResults;
  trace: ReactionCalculationTrace;
  criticalPoints: CriticalPoint[];
}

export function ExportButton({ beam, results, trace, criticalPoints }: ExportButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<Partial<PDFExportOptions>>({
    projectName: '',
    engineer: '',
    company: '',
  });

  const unitLabel = beam.units === 'metric' ? 'm' : 'ft';
  const forceUnit = beam.units === 'metric' ? 'kN' : 'kips';
  const momentUnit = beam.units === 'metric' ? 'kN·m' : 'kip·ft';

  const handleExportPDF = async () => {
    setIsExporting(true);

    try {
      const blob = await generatePDFReport(
        beam,
        results,
        trace,
        criticalPoints,
        exportOptions
      );

      // Download the PDF
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = exportOptions.projectName
        ? `${exportOptions.projectName.replace(/\s+/g, '_')}_beam_analysis.pdf`
        : `beam_analysis_${new Date().getTime()}.pdf`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowOptions(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickExport = async () => {
    setIsExporting(true);

    try {
      const blob = await generatePDFReport(beam, results, trace, criticalPoints);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beam_analysis_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportShearCSV = () => {
    CSVExporter.exportShearForce(results.shearForce, unitLabel, forceUnit);
    setShowExportMenu(false);
  };

  const handleExportMomentCSV = () => {
    CSVExporter.exportBendingMoment(results.bendingMoment, unitLabel, momentUnit);
    setShowExportMenu(false);
  };

  const handleExportReactionsCSV = () => {
    CSVExporter.exportReactions(results.reactions, unitLabel, forceUnit, momentUnit);
    setShowExportMenu(false);
  };

  const handleExportCriticalPointsCSV = () => {
    CSVExporter.exportCriticalPoints(criticalPoints, unitLabel, forceUnit, momentUnit);
    setShowExportMenu(false);
  };

  const handleExportAllCSV = () => {
    CSVExporter.exportAll(
      results.shearForce,
      results.bendingMoment,
      results.reactions,
      criticalPoints,
      unitLabel,
      forceUnit,
      momentUnit
    );
    setShowExportMenu(false);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          onClick={handleQuickExport}
          disabled={isExporting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors font-semibold shadow-md hover:shadow-lg"
        >
          {isExporting ? (
            <>
              <span className="animate-spin">⏳</span>
              Generating...
            </>
          ) : (
            <>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Export PDF
            </>
          )}
        </button>

        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={isExporting}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
          title="PDF Export Options"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>

          {showExportMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowExportMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 z-20 overflow-hidden">
                <div className="py-2">
                  <button
                    onClick={handleExportShearCSV}
                    className="w-full px-4 py-2.5 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Shear Force Diagram</div>
                      <div className="text-xs text-gray-500">Position vs. Shear Force</div>
                    </div>
                  </button>

                  <button
                    onClick={handleExportMomentCSV}
                    className="w-full px-4 py-2.5 text-left hover:bg-purple-50 flex items-center gap-3 transition-colors"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-purple-600">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Bending Moment Diagram</div>
                      <div className="text-xs text-gray-500">Position vs. Moment</div>
                    </div>
                  </button>

                  <button
                    onClick={handleExportReactionsCSV}
                    className="w-full px-4 py-2.5 text-left hover:bg-emerald-50 flex items-center gap-3 transition-colors"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-emerald-600">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Support Reactions</div>
                      <div className="text-xs text-gray-500">Forces and moments</div>
                    </div>
                  </button>

                  <button
                    onClick={handleExportCriticalPointsCSV}
                    className="w-full px-4 py-2.5 text-left hover:bg-amber-50 flex items-center gap-3 transition-colors"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-amber-600">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Critical Points</div>
                      <div className="text-xs text-gray-500">Key values and locations</div>
                    </div>
                  </button>

                  <div className="border-t border-gray-200 my-2"></div>

                  <button
                    onClick={handleExportAllCSV}
                    className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 flex items-center gap-3 transition-colors font-semibold"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-indigo-600">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Export All Data</div>
                      <div className="text-xs text-gray-500">Complete analysis in one file</div>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Export Options Modal */}
      {showOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">PDF Export Options</h3>
              <button
                onClick={() => setShowOptions(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Project Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={exportOptions.projectName || ''}
                  onChange={(e) => setExportOptions({ ...exportOptions, projectName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Bridge Deck Analysis"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Number
                </label>
                <input
                  type="text"
                  value={exportOptions.projectNumber || ''}
                  onChange={(e) => setExportOptions({ ...exportOptions, projectNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., PROJ-2025-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Engineer Name
                </label>
                <input
                  type="text"
                  value={exportOptions.engineer || ''}
                  onChange={(e) => setExportOptions({ ...exportOptions, engineer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Jane Smith, PE"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={exportOptions.company || ''}
                  onChange={(e) => setExportOptions({ ...exportOptions, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ABC Engineering"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Revision
                </label>
                <input
                  type="text"
                  value={exportOptions.revision || ''}
                  onChange={(e) => setExportOptions({ ...exportOptions, revision: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Rev A"
                />
              </div>

              {/* Content Options */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Include in Report:
                </label>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeCalculationSteps !== false}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        includeCalculationSteps: e.target.checked
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm">Calculation Steps</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeDiagrams !== false}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        includeDiagrams: e.target.checked
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm">Diagrams</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeCriticalPoints !== false}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        includeCriticalPoints: e.target.checked
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm">Critical Points Table</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeValidation !== false}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        includeValidation: e.target.checked
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm">Validation Report</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowOptions(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isExporting ? 'Generating...' : 'Generate PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
