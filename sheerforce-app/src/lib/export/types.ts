/**
 * PDF Export Types
 *
 * Type definitions for PDF generation options and configuration.
 */

export interface PDFExportOptions {
  // Content sections to include
  includeConfiguration: boolean;
  includeCalculationSteps: boolean;
  includeDiagrams: boolean;
  includeCriticalPoints: boolean;
  includeValidation: boolean;

  // Project metadata
  projectName?: string;
  projectNumber?: string;
  engineer?: string;
  company?: string;
  checked?: string;
  date?: Date;
  revision?: string;

  // Formatting options
  paperSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  includeHeader: boolean;
  includeFooter: boolean;
  includePageNumbers: boolean;

  // Diagram options
  diagramDPI: number;  // Resolution multiplier (1 = screen, 2 = print quality)
}

export const DEFAULT_PDF_OPTIONS: PDFExportOptions = {
  includeConfiguration: true,
  includeCalculationSteps: true,
  includeDiagrams: true,
  includeCriticalPoints: true,
  includeValidation: true,

  paperSize: 'letter',
  orientation: 'portrait',
  includeHeader: true,
  includeFooter: true,
  includePageNumbers: true,

  diagramDPI: 2,  // 2x resolution for crisp diagrams
};

export interface PDFSection {
  title: string;
  render: (doc: any, yPosition: number) => number;  // Returns new Y position
}
