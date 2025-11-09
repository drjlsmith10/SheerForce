import type { DiagramPoint, Reaction } from '../../types/beam';
import type { CriticalPoint } from '../criticalPoints/types';

/**
 * Convert data to CSV format
 */
function arrayToCSV(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers.join(',')];

  rows.forEach(row => {
    lines.push(row.map(cell => {
      // Handle strings with commas by wrapping in quotes
      if (typeof cell === 'string' && cell.includes(',')) {
        return `"${cell}"`;
      }
      return cell;
    }).join(','));
  });

  return lines.join('\n');
}

/**
 * Trigger browser download of CSV file
 */
function downloadCSV(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export shear force diagram data to CSV
 */
export function exportShearForceCSV(
  data: DiagramPoint[],
  unitLabel: string,
  forceUnit: string,
  filename = 'shear_force_diagram.csv'
): void {
  const headers = [`Position (${unitLabel})`, `Shear Force (${forceUnit})`];
  const rows = data.map(point => [point.position, point.value]);

  const csv = arrayToCSV(headers, rows);
  downloadCSV(filename, csv);
}

/**
 * Export bending moment diagram data to CSV
 */
export function exportBendingMomentCSV(
  data: DiagramPoint[],
  unitLabel: string,
  momentUnit: string,
  filename = 'bending_moment_diagram.csv'
): void {
  const headers = [`Position (${unitLabel})`, `Bending Moment (${momentUnit})`];
  const rows = data.map(point => [point.position, point.value]);

  const csv = arrayToCSV(headers, rows);
  downloadCSV(filename, csv);
}

/**
 * Export support reactions to CSV
 */
export function exportReactionsCSV(
  reactions: Reaction[],
  unitLabel: string,
  forceUnit: string,
  momentUnit: string,
  filename = 'support_reactions.csv'
): void {
  const headers = [
    'Support',
    `Position (${unitLabel})`,
    `Vertical Force (${forceUnit})`,
    `Horizontal Force (${forceUnit})`,
    `Moment (${momentUnit})`
  ];

  const rows = reactions.map((reaction, idx) => [
    `Support ${idx + 1}`,
    reaction.position,
    reaction.verticalForce,
    reaction.horizontalForce || 0,
    reaction.moment || 0
  ]);

  const csv = arrayToCSV(headers, rows);
  downloadCSV(filename, csv);
}

/**
 * Export critical points to CSV
 */
export function exportCriticalPointsCSV(
  criticalPoints: CriticalPoint[],
  unitLabel: string,
  forceUnit: string,
  momentUnit: string,
  filename = 'critical_points.csv'
): void {
  const headers = [
    `Position (${unitLabel})`,
    'Description',
    `Shear Force (${forceUnit})`,
    `Bending Moment (${momentUnit})`
  ];

  const rows = criticalPoints.map(point => [
    point.position,
    point.description,
    point.shear,
    point.moment
  ]);

  const csv = arrayToCSV(headers, rows);
  downloadCSV(filename, csv);
}

/**
 * Export all data to a comprehensive CSV file
 */
export function exportAllDataCSV(
  shearData: DiagramPoint[],
  momentData: DiagramPoint[],
  reactions: Reaction[],
  criticalPoints: CriticalPoint[],
  unitLabel: string,
  forceUnit: string,
  momentUnit: string,
  filename = 'beam_analysis_complete.csv'
): void {
  const lines: string[] = [];

  // Section 1: Support Reactions
  lines.push('SUPPORT REACTIONS');
  lines.push('Support,Position (' + unitLabel + '),Vertical Force (' + forceUnit + '),Horizontal Force (' + forceUnit + '),Moment (' + momentUnit + ')');
  reactions.forEach((reaction, idx) => {
    lines.push([
      `Support ${idx + 1}`,
      reaction.position,
      reaction.verticalForce,
      reaction.horizontalForce || 0,
      reaction.moment || 0
    ].join(','));
  });
  lines.push('');

  // Section 2: Critical Points
  lines.push('CRITICAL POINTS');
  lines.push('Position (' + unitLabel + '),Description,Shear Force (' + forceUnit + '),Bending Moment (' + momentUnit + ')');
  criticalPoints.forEach(point => {
    lines.push([
      point.position,
      `"${point.description}"`,
      point.shear,
      point.moment
    ].join(','));
  });
  lines.push('');

  // Section 3: Shear Force Diagram
  lines.push('SHEAR FORCE DIAGRAM');
  lines.push('Position (' + unitLabel + '),Shear Force (' + forceUnit + ')');
  shearData.forEach(point => {
    lines.push(`${point.position},${point.value}`);
  });
  lines.push('');

  // Section 4: Bending Moment Diagram
  lines.push('BENDING MOMENT DIAGRAM');
  lines.push('Position (' + unitLabel + '),Bending Moment (' + momentUnit + ')');
  momentData.forEach(point => {
    lines.push(`${point.position},${point.value}`);
  });

  const csv = lines.join('\n');
  downloadCSV(filename, csv);
}

/**
 * Export interface for easier usage
 */
export const CSVExporter = {
  exportShearForce: exportShearForceCSV,
  exportBendingMoment: exportBendingMomentCSV,
  exportReactions: exportReactionsCSV,
  exportCriticalPoints: exportCriticalPointsCSV,
  exportAll: exportAllDataCSV
};
