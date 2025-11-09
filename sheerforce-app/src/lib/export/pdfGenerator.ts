/**
 * PDF Generator
 *
 * Core PDF generation engine for professional beam analysis reports.
 */

import jsPDF from 'jspdf';
import type { Beam, AnalysisResults } from '../../types/beam';
import type { ReactionCalculationTrace } from '../calculationTrace/types';
import type { CriticalPoint } from '../criticalPoints/types';
import type { PDFExportOptions } from './types';
import { DEFAULT_PDF_OPTIONS } from './types';
import { captureDiagram, canvasToDataURL, getOptimalDimensions } from './diagramRenderer';

/**
 * Generate a professional PDF report for beam analysis
 */
export async function generatePDFReport(
  beam: Beam,
  results: AnalysisResults,
  trace: ReactionCalculationTrace,
  criticalPoints: CriticalPoint[],
  options: Partial<PDFExportOptions> = {}
): Promise<Blob> {
  // Merge with defaults
  const opts: PDFExportOptions = { ...DEFAULT_PDF_OPTIONS, ...options };

  // Initialize PDF
  const doc = new jsPDF({
    orientation: opts.orientation,
    unit: 'mm',
    format: opts.paperSize,
  });

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let y = margin;

  // Header
  if (opts.includeHeader) {
    y = renderHeader(doc, opts, y, pageWidth, margin);
    y += 5;
  }

  // Beam Configuration
  if (opts.includeConfiguration) {
    y = checkPageBreak(doc, y, 60, margin);
    y = renderConfiguration(doc, beam, y, margin, contentWidth);
    y += 5;
  }

  // Reactions
  y = checkPageBreak(doc, y, 40, margin);
  y = renderReactions(doc, beam, results, y, margin, contentWidth);
  y += 5;

  // Calculation Steps
  if (opts.includeCalculationSteps && trace.steps.length > 0) {
    y = checkPageBreak(doc, y, 60, margin);
    y = renderCalculationSteps(doc, trace, y, margin, contentWidth, pageHeight);
  }

  // Diagrams
  if (opts.includeDiagrams) {
    y = checkPageBreak(doc, y, 100, margin);
    y = await renderDiagrams(doc, y, margin, contentWidth, opts.diagramDPI);
  }

  // Critical Points
  if (opts.includeCriticalPoints && criticalPoints.length > 0) {
    y = checkPageBreak(doc, y, 60, margin);
    y = renderCriticalPointsTable(doc, beam, criticalPoints, y, margin, contentWidth);
  }

  // Validation Report
  if (opts.includeValidation && results.validation) {
    y = checkPageBreak(doc, y, 60, margin);
    y = renderValidationReport(doc, results, y, margin, contentWidth);
  }

  // Footer with page numbers
  if (opts.includeFooter) {
    renderFooter(doc, opts);
  }

  // Return as blob
  return doc.output('blob');
}

/**
 * Render professional header
 */
function renderHeader(
  doc: jsPDF,
  options: PDFExportOptions,
  y: number,
  pageWidth: number,
  margin: number
): number {
  const centerX = pageWidth / 2;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Beam Analysis Report', centerX, y, { align: 'center' });
  y += 8;

  // Project info (if provided)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  if (options.projectName) {
    doc.text(`Project: ${options.projectName}`, centerX, y, { align: 'center' });
    y += 5;
  }

  if (options.projectNumber) {
    doc.text(`Project No: ${options.projectNumber}`, centerX, y, { align: 'center' });
    y += 5;
  }

  // Metadata table
  doc.setFontSize(9);
  const metaY = y + 2;

  if (options.engineer || options.company) {
    const leftX = margin;
    const rightX = pageWidth - margin;

    if (options.engineer) {
      doc.text(`Engineer: ${options.engineer}`, leftX, metaY);
    }
    if (options.checked) {
      doc.text(`Checked: ${options.checked}`, leftX, metaY + 4);
    }
    if (options.company) {
      doc.text(options.company, rightX, metaY, { align: 'right' });
    }

    y = metaY + 8;
  }

  const date = options.date || new Date();
  doc.text(`Date: ${date.toLocaleDateString()}`, margin, y);
  if (options.revision) {
    doc.text(`Rev: ${options.revision}`, pageWidth - margin, y, { align: 'right' });
  }
  y += 6;

  // Horizontal line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  return y;
}

/**
 * Render beam configuration section
 */
function renderConfiguration(
  doc: jsPDF,
  beam: Beam,
  y: number,
  margin: number,
  _contentWidth: number
): number {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Beam Configuration', margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const lengthUnit = beam.units === 'metric' ? 'm' : 'ft';
  const forceUnit = beam.units === 'metric' ? 'kN' : 'kips';

  doc.text(`Length: ${beam.length} ${lengthUnit}`, margin + 5, y);
  y += 5;
  doc.text(`Unit System: ${beam.units === 'metric' ? 'Metric (kN, m)' : 'Imperial (kips, ft)'}`, margin + 5, y);
  y += 8;

  // Supports
  doc.setFont('helvetica', 'bold');
  doc.text('Supports:', margin + 5, y);
  y += 5;
  doc.setFont('helvetica', 'normal');

  beam.supports.forEach((support, idx) => {
    const supportType = support.type.charAt(0).toUpperCase() + support.type.slice(1);
    doc.text(`${idx + 1}. ${supportType} support at x = ${support.position.toFixed(2)} ${lengthUnit}`, margin + 10, y);
    y += 5;
  });
  y += 3;

  // Loads
  doc.setFont('helvetica', 'bold');
  doc.text('Applied Loads:', margin + 5, y);
  y += 5;
  doc.setFont('helvetica', 'normal');

  if (beam.loads.length === 0) {
    doc.text('No loads applied', margin + 10, y);
    y += 5;
  } else {
    beam.loads.forEach((load, idx) => {
      if (load.type === 'point') {
        doc.text(
          `${idx + 1}. Point Load: ${load.magnitude.toFixed(2)} ${forceUnit} at x = ${load.position.toFixed(2)} ${lengthUnit}`,
          margin + 10,
          y
        );
      } else if (load.type === 'distributed') {
        doc.text(
          `${idx + 1}. Distributed Load: ${load.startMagnitude.toFixed(2)} ${forceUnit}/${lengthUnit} ` +
          `from x = ${load.startPosition.toFixed(2)} to ${load.endPosition.toFixed(2)} ${lengthUnit}`,
          margin + 10,
          y
        );
      } else if (load.type === 'moment') {
        const momentUnit = beam.units === 'metric' ? 'kN·m' : 'kip-ft';
        doc.text(
          `${idx + 1}. Applied Moment: ${load.magnitude.toFixed(2)} ${momentUnit} ${load.direction} at x = ${load.position.toFixed(2)} ${lengthUnit}`,
          margin + 10,
          y
        );
      }
      y += 5;
    });
  }

  return y;
}

/**
 * Render reactions section
 */
function renderReactions(
  doc: jsPDF,
  beam: Beam,
  results: AnalysisResults,
  y: number,
  margin: number,
  _contentWidth: number
): number {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Support Reactions', margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const forceUnit = beam.units === 'metric' ? 'kN' : 'kips';
  const momentUnit = beam.units === 'metric' ? 'kN·m' : 'kip-ft';

  results.reactions.forEach((reaction, idx) => {
    const support = beam.supports.find(s => s.id === reaction.supportId);
    const supportLabel = support ? support.id.toUpperCase() : `Support ${idx + 1}`;

    doc.setFont('helvetica', 'bold');
    doc.text(`${supportLabel}:`, margin + 5, y);
    y += 5;
    doc.setFont('helvetica', 'normal');

    doc.text(`Vertical Force: ${reaction.verticalForce >= 0 ? '+' : ''}${reaction.verticalForce.toFixed(3)} ${forceUnit}`, margin + 10, y);
    y += 5;

    if (Math.abs(reaction.horizontalForce) > 1e-6) {
      doc.text(`Horizontal Force: ${reaction.horizontalForce >= 0 ? '+' : ''}${reaction.horizontalForce.toFixed(3)} ${forceUnit}`, margin + 10, y);
      y += 5;
    }

    if (Math.abs(reaction.moment) > 1e-6) {
      doc.text(`Moment: ${reaction.moment >= 0 ? '+' : ''}${reaction.moment.toFixed(3)} ${momentUnit}`, margin + 10, y);
      y += 5;
    }

    y += 2;
  });

  return y;
}

/**
 * Render calculation steps section
 */
function renderCalculationSteps(
  doc: jsPDF,
  trace: ReactionCalculationTrace,
  y: number,
  margin: number,
  _contentWidth: number,
  _pageHeight: number
): number {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Calculation Steps', margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  trace.steps.forEach(step => {
    // Check if we need a new page
    y = checkPageBreak(doc, y, 40, margin);

    doc.setFont('helvetica', 'bold');
    doc.text(`Step ${step.stepNumber}: ${step.title}`, margin + 5, y);
    y += 5;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text(step.description, margin + 5, y);
    y += 5;

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);

    step.equations.forEach(eq => {
      if (eq === '') {
        y += 2;
      } else {
        y = checkPageBreak(doc, y, 5, margin);
        doc.text(eq, margin + 10, y);
        y += 4;
      }
    });

    if (step.result) {
      y += 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`→ ${step.result}`, margin + 10, y);
      y += 5;
    }

    y += 3;
  });

  return y;
}

/**
 * Render diagrams section
 */
async function renderDiagrams(
  doc: jsPDF,
  y: number,
  margin: number,
  contentWidth: number,
  dpiScale: number
): Promise<number> {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Shear Force and Bending Moment Diagrams', margin, y);
  y += 7;

  // Capture shear diagram
  const shearCanvas = await captureDiagram('shear-diagram', dpiScale);
  if (shearCanvas) {
    const dims = getOptimalDimensions(shearCanvas, contentWidth, 80);
    const imgData = canvasToDataURL(shearCanvas, 'png');

    doc.text('Shear Force Diagram:', margin + 5, y);
    y += 5;
    doc.addImage(imgData, 'PNG', margin, y, dims.width, dims.height);
    y += dims.height + 8;
  }

  // Check if we need a new page before moment diagram
  y = checkPageBreak(doc, y, 100, margin);

  // Capture moment diagram
  const momentCanvas = await captureDiagram('moment-diagram', dpiScale);
  if (momentCanvas) {
    const dims = getOptimalDimensions(momentCanvas, contentWidth, 80);
    const imgData = canvasToDataURL(momentCanvas, 'png');

    doc.text('Bending Moment Diagram:', margin + 5, y);
    y += 5;
    doc.addImage(imgData, 'PNG', margin, y, dims.width, dims.height);
    y += dims.height + 8;
  }

  return y;
}

/**
 * Render critical points table
 */
function renderCriticalPointsTable(
  doc: jsPDF,
  beam: Beam,
  points: CriticalPoint[],
  y: number,
  margin: number,
  _contentWidth: number
): number {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('5. Critical Points', margin, y);
  y += 7;

  const lengthUnit = beam.units === 'metric' ? 'm' : 'ft';
  const forceUnit = beam.units === 'metric' ? 'kN' : 'kips';
  const momentUnit = beam.units === 'metric' ? 'kN·m' : 'kip-ft';

  // Table headers
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  const colWidths = {
    position: 25,
    description: 70,
    shear: 30,
    moment: 30,
  };

  let x = margin + 5;
  doc.text(`Position (${lengthUnit})`, x, y);
  x += colWidths.position;
  doc.text('Description', x, y);
  x += colWidths.description;
  doc.text(`Shear (${forceUnit})`, x, y);
  x += colWidths.shear;
  doc.text(`Moment (${momentUnit})`, x, y);
  y += 5;

  // Horizontal line
  doc.setLineWidth(0.3);
  doc.line(margin + 5, y - 1, margin + 5 + colWidths.position + colWidths.description + colWidths.shear + colWidths.moment, y - 1);
  y += 2;

  // Table rows
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);

  points.forEach((point, _idx) => {
    y = checkPageBreak(doc, y, 6, margin);

    x = margin + 5;
    doc.text(point.position.toFixed(3), x, y);
    x += colWidths.position;

    // Truncate description if too long
    const desc = point.description.length > 35
      ? point.description.substring(0, 32) + '...'
      : point.description;
    doc.text(desc, x, y);
    x += colWidths.description;

    const shearText = point.shear >= 0 ? `+${point.shear.toFixed(2)}` : point.shear.toFixed(2);
    doc.text(shearText, x, y);
    x += colWidths.shear;

    const momentText = point.moment >= 0 ? `+${point.moment.toFixed(2)}` : point.moment.toFixed(2);
    doc.text(momentText, x, y);

    y += 5;
  });

  y += 5;
  return y;
}

/**
 * Render validation report section
 */
function renderValidationReport(
  doc: jsPDF,
  results: AnalysisResults,
  y: number,
  margin: number,
  _contentWidth: number
): number {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('6. Validation Report', margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const validation = results.validation;
  if (!validation) {
    doc.text('No validation data available', margin + 5, y);
    return y + 5;
  }

  // Equilibrium checks
  if (validation.equilibrium) {
    doc.setFont('helvetica', 'bold');
    doc.text('Equilibrium Checks:', margin + 5, y);
    y += 5;
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);

    const eq = validation.equilibrium;
    const checkMark = eq.isValid ? '✓' : '✗';

    doc.text(`${checkMark} ΣFy = ${eq.sumVerticalForces.toExponential(2)} (tolerance: ${eq.tolerance.toExponential(1)})`, margin + 10, y);
    y += 4;
    doc.text(`${checkMark} ΣM = ${eq.sumMomentsAboutOrigin.toExponential(2)}`, margin + 10, y);
    y += 6;
  }

  // Overall status
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const status = validation.equilibrium?.isValid ? '✓ All validations PASSED' : '✗ Validation FAILED';
  doc.text(status, margin + 5, y);
  y += 5;

  return y;
}

/**
 * Render footer with page numbers
 */
function renderFooter(doc: jsPDF, options: PDFExportOptions): void {
  if (!options.includePageNumbers) return;

  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    const footerText = `Page ${i} of ${pageCount}`;
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Timestamp
    doc.text('Generated by SheerForce', pageWidth - 20, pageHeight - 10, { align: 'right' });
  }
}

/**
 * Check if we need a page break and add one if necessary
 */
function checkPageBreak(
  doc: jsPDF,
  currentY: number,
  requiredSpace: number,
  margin: number
): number {
  const pageHeight = doc.internal.pageSize.getHeight();

  if (currentY + requiredSpace > pageHeight - 20) {
    doc.addPage();
    return margin;
  }

  return currentY;
}
