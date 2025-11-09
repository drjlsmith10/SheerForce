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

interface ExportButtonProps {
  beam: Beam;
  results: AnalysisResults;
  trace: ReactionCalculationTrace;
  criticalPoints: CriticalPoint[];
}

export function ExportButton({ beam, results, trace, criticalPoints }: ExportButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<Partial<PDFExportOptions>>({
    projectName: '',
    engineer: '',
    company: '',
  });

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

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          onClick={handleQuickExport}
          disabled={isExporting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          {isExporting ? (
            <>
              <span className="animate-spin">⏳</span>
              Generating...
            </>
          ) : (
            <>
              📄 Export PDF
            </>
          )}
        </button>

        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={isExporting}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          title="PDF Export Options"
        >
          ⚙️
        </button>
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
