import { useState } from 'react';
import type { ReactionCalculationTrace } from '../lib/calculationTrace/types';

interface CalculationStepsProps {
  trace: ReactionCalculationTrace;
}

export function CalculationSteps({ trace }: CalculationStepsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="calculation-steps border rounded-lg p-4 bg-gray-50 shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left font-semibold hover:bg-gray-100 -m-4 p-4 rounded-lg transition-colors"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2 text-blue-700">
          <span className="text-xl">📋</span>
          <span>Calculation Details</span>
        </span>
        <span className="text-gray-500">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {trace.steps.map(step => (
            <div key={step.stepNumber} className="step border-l-4 border-blue-500 pl-4 bg-white p-4 rounded-r shadow-sm">
              <h4 className="font-semibold text-blue-700 text-lg">
                Step {step.stepNumber}: {step.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1 mb-3">{step.description}</p>
              <div className="mt-2 font-mono text-sm bg-gray-50 p-3 rounded border border-gray-200 whitespace-pre-wrap">
                {step.equations.map((eq, idx) => (
                  <div key={idx} className={eq === '' ? 'h-2' : ''}>
                    {eq}
                  </div>
                ))}
              </div>
              {step.result && (
                <div className="mt-3 font-semibold text-green-700 bg-green-50 p-2 rounded border border-green-200">
                  → {step.result}
                </div>
              )}
            </div>
          ))}

          <div className="summary bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
            <strong className="text-blue-800">Summary:</strong>
            <span className="ml-2 text-gray-700">{trace.summary}</span>
          </div>
        </div>
      )}
    </div>
  );
}
