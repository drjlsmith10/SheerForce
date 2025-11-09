import { useState } from 'react';
import type { AnalysisResults } from '../types/beam';

interface ValidationReportProps {
  results: AnalysisResults;
  units: 'metric' | 'imperial';
}

export function ValidationReport({ results, units }: ValidationReportProps) {
  const [expanded, setExpanded] = useState(false);

  const forceUnit = units === 'metric' ? 'kN' : 'kips';
  const lengthUnit = units === 'metric' ? 'm' : 'ft';

  if (!results.validation) {
    return null;
  }

  const { equilibrium, diagramClosure, relationships } = results.validation;

  // Overall validation status
  const allValid =
    equilibrium?.isValid &&
    diagramClosure?.isValid &&
    (relationships?.isValid ?? true); // relationships may be undefined

  return (
    <div className={`validation-report border rounded-lg p-4 shadow-sm ${
      allValid ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'
    }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left font-semibold hover:bg-white/50 -m-4 p-4 rounded-lg transition-colors"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2">
          <span className="text-xl">{allValid ? '✅' : '⚠️'}</span>
          <span className={allValid ? 'text-green-800' : 'text-yellow-800'}>
            Validation Report
            <span className="ml-2 text-sm font-normal">
              {allValid ? 'All checks passed' : 'Some warnings'}
            </span>
          </span>
        </span>
        <span className="text-gray-500">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Equilibrium Checks */}
          {equilibrium && (
            <div className={`p-4 rounded-lg border ${
              equilibrium.isValid ? 'bg-white border-green-300' : 'bg-red-50 border-red-300'
            }`}>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-lg">{equilibrium.isValid ? '✓' : '✗'}</span>
                Equilibrium Checks
              </h4>
              <div className="space-y-2 text-sm font-mono">
                <div className={`flex justify-between ${
                  equilibrium.isVerticalEquilibrium ? 'text-green-700' : 'text-red-700'
                }`}>
                  <span>Vertical Force Equilibrium:</span>
                  <span>
                    ΣF_y = {equilibrium.sumVerticalForces.toFixed(6)} {forceUnit}
                    {equilibrium.isVerticalEquilibrium ? ' ✓' : ' ✗'}
                  </span>
                </div>
                <div className={`flex justify-between ${
                  equilibrium.isHorizontalEquilibrium ? 'text-green-700' : 'text-red-700'
                }`}>
                  <span>Horizontal Force Equilibrium:</span>
                  <span>
                    ΣF_x = {equilibrium.sumHorizontalForces.toFixed(6)} {forceUnit}
                    {equilibrium.isHorizontalEquilibrium ? ' ✓' : ' ✗'}
                  </span>
                </div>
                <div className={`flex justify-between ${
                  equilibrium.isMomentEquilibrium ? 'text-green-700' : 'text-red-700'
                }`}>
                  <span>Moment Equilibrium:</span>
                  <span>
                    ΣM = {equilibrium.sumMomentsAboutOrigin.toFixed(6)} {forceUnit}·{lengthUnit}
                    {equilibrium.isMomentEquilibrium ? ' ✓' : ' ✗'}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-300">
                  Tolerance: ±{equilibrium.tolerance.toExponential(1)}
                </div>
              </div>
              {equilibrium.messages.length > 0 && (
                <div className="mt-3 space-y-1">
                  {equilibrium.messages.map((msg, idx) => (
                    <div key={idx} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                      ⚠ {msg}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Diagram Closure Checks */}
          {diagramClosure && (
            <div className={`p-4 rounded-lg border ${
              diagramClosure.isValid ? 'bg-white border-green-300' : 'bg-yellow-50 border-yellow-300'
            }`}>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-lg">{diagramClosure.isValid ? '✓' : '⚠'}</span>
                Boundary Conditions
              </h4>
              {diagramClosure.momentClosure.length > 0 && (
                <div className="space-y-2 text-sm">
                  <div className="font-semibold text-gray-700 mb-2">
                    Moment at Supports:
                  </div>
                  {diagramClosure.momentClosure.map((check, idx) => (
                    <div
                      key={idx}
                      className={`flex justify-between font-mono ${
                        check.isValid ? 'text-green-700' : 'text-yellow-700'
                      }`}
                    >
                      <span>{check.location}:</span>
                      <span>
                        M = {check.actualValue.toFixed(6)} {forceUnit}·{lengthUnit}
                        {check.isValid ? ' ✓' : ' ⚠'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {diagramClosure.messages.length > 0 && (
                <div className="mt-3 space-y-1">
                  {diagramClosure.messages.map((msg, idx) => (
                    <div key={idx} className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
                      ⚠ {msg}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Relationship Verification */}
          {relationships && (
            <div className={`p-4 rounded-lg border ${
              relationships.isValid ? 'bg-white border-green-300' : 'bg-yellow-50 border-yellow-300'
            }`}>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-lg">{relationships.isValid ? '✓' : '⚠'}</span>
                Fundamental Relationships
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-semibold text-gray-700 mb-1">
                    dM/dx = V (Slope of moment equals shear)
                  </div>
                  <div className="font-mono text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Max Error:</span>
                      <span className={
                        relationships.dMdx_equals_V.maxError < 0.01 ? 'text-green-700' : 'text-yellow-700'
                      }>
                        {(relationships.dMdx_equals_V.maxError * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Error:</span>
                      <span className={
                        relationships.dMdx_equals_V.averageError < 0.001 ? 'text-green-700' : 'text-yellow-700'
                      }>
                        {(relationships.dMdx_equals_V.averageError * 100).toFixed(4)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>RMS Error:</span>
                      <span>
                        {(relationships.dMdx_equals_V.rmsError * 100).toFixed(4)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-gray-700 mb-1">
                    dV/dx = -w (Slope of shear equals negative load)
                  </div>
                  <div className="font-mono text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Max Error:</span>
                      <span className={
                        relationships.dVdx_equals_negW.maxError < 0.01 ? 'text-green-700' : 'text-yellow-700'
                      }>
                        {(relationships.dVdx_equals_negW.maxError * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Error:</span>
                      <span className={
                        relationships.dVdx_equals_negW.averageError < 0.001 ? 'text-green-700' : 'text-yellow-700'
                      }>
                        {(relationships.dVdx_equals_negW.averageError * 100).toFixed(4)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {relationships.messages.length > 0 && (
                <div className="mt-3 space-y-1">
                  {relationships.messages.map((msg, idx) => (
                    <div key={idx} className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
                      ℹ {msg}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Overall Summary */}
          <div className={`p-4 rounded-lg border font-semibold text-center ${
            allValid
              ? 'bg-green-100 border-green-400 text-green-800'
              : 'bg-yellow-100 border-yellow-400 text-yellow-800'
          }`}>
            {allValid
              ? '✓ All validation checks passed - calculations are mathematically sound'
              : '⚠ Some validation warnings - review detailed checks above'}
          </div>
        </div>
      )}
    </div>
  );
}
