import { useState } from 'react';
import type { CriticalPointsAnalysis } from '../lib/criticalPoints/types';

interface CriticalPointsTableProps {
  analysis: CriticalPointsAnalysis;
  units: 'metric' | 'imperial';
}

export function CriticalPointsTable({ analysis, units }: CriticalPointsTableProps) {
  const [expanded, setExpanded] = useState(false);

  const forceUnit = units === 'metric' ? 'kN' : 'kips';
  const lengthUnit = units === 'metric' ? 'm' : 'ft';

  return (
    <div className="critical-points border rounded-lg p-4 bg-gray-50 shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left font-semibold hover:bg-gray-100 -m-4 p-4 rounded-lg transition-colors"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2 text-purple-700">
          <span className="text-xl">📊</span>
          <span>Critical Points ({analysis.points.length} points)</span>
        </span>
        <span className="text-gray-500">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="mt-4 overflow-x-auto">
          {/* Summary of extrema */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.maxPositiveMoment && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <div className="text-sm text-green-800 font-semibold">Max Positive Moment</div>
                <div className="text-lg font-bold text-green-900">
                  {analysis.maxPositiveMoment.moment.toFixed(2)} {forceUnit}·{lengthUnit}
                </div>
                <div className="text-sm text-gray-600">
                  at x = {analysis.maxPositiveMoment.position.toFixed(2)} {lengthUnit}
                </div>
              </div>
            )}
            {analysis.maxNegativeMoment && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="text-sm text-red-800 font-semibold">Max Negative Moment</div>
                <div className="text-lg font-bold text-red-900">
                  {analysis.maxNegativeMoment.moment.toFixed(2)} {forceUnit}·{lengthUnit}
                </div>
                <div className="text-sm text-gray-600">
                  at x = {analysis.maxNegativeMoment.position.toFixed(2)} {lengthUnit}
                </div>
              </div>
            )}
            {analysis.maxPositiveShear && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="text-sm text-blue-800 font-semibold">Max Positive Shear</div>
                <div className="text-lg font-bold text-blue-900">
                  {analysis.maxPositiveShear.shear.toFixed(2)} {forceUnit}
                </div>
                <div className="text-sm text-gray-600">
                  at x = {analysis.maxPositiveShear.position.toFixed(2)} {lengthUnit}
                </div>
              </div>
            )}
            {analysis.maxNegativeShear && (
              <div className="bg-orange-50 border border-orange-200 rounded p-3">
                <div className="text-sm text-orange-800 font-semibold">Max Negative Shear</div>
                <div className="text-lg font-bold text-orange-900">
                  {analysis.maxNegativeShear.shear.toFixed(2)} {forceUnit}
                </div>
                <div className="text-sm text-gray-600">
                  at x = {analysis.maxNegativeShear.position.toFixed(2)} {lengthUnit}
                </div>
              </div>
            )}
          </div>

          {/* Detailed table */}
          <table className="min-w-full bg-white border border-gray-300 rounded shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                  Position ({lengthUnit})
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                  Description
                </th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700 border-b">
                  Shear ({forceUnit})
                </th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700 border-b">
                  Moment ({forceUnit}·{lengthUnit})
                </th>
              </tr>
            </thead>
            <tbody>
              {analysis.points.map((point, idx) => (
                <tr
                  key={idx}
                  className={`${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50 transition-colors`}
                >
                  <td className="px-4 py-2 text-sm text-gray-900 border-b font-mono">
                    {point.position.toFixed(2)}
                    {point.isDiscontinuity && (
                      <span className="ml-1 text-red-500" title="Discontinuity">
                        *
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700 border-b">
                    {point.description}
                  </td>
                  <td className={`px-4 py-2 text-sm border-b text-right font-mono ${
                    point.shear > 0 ? 'text-blue-600' : point.shear < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {point.shear.toFixed(2)}
                  </td>
                  <td className={`px-4 py-2 text-sm border-b text-right font-mono ${
                    point.moment > 0 ? 'text-green-600' : point.moment < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {point.moment.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-2 text-sm text-gray-500">
            <span className="text-red-500">*</span> Indicates discontinuity (sudden change in value)
          </div>
        </div>
      )}
    </div>
  );
}
