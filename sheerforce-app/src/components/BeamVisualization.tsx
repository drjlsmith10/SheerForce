import type { Beam } from '../types/beam';

interface BeamVisualizationProps {
  beam: Beam;
  width?: number;
  height?: number;
}

export function BeamVisualization({ beam, width = 600, height = 150 }: BeamVisualizationProps) {
  const margin = 40;
  const beamY = height / 2;
  const scale = (width - 2 * margin) / beam.length;

  const getX = (position: number) => margin + position * scale;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 text-center">Beam Configuration</h3>
      <svg width={width} height={height} className="block mx-auto">
        {/* Beam line */}
        <line
          x1={margin}
          y1={beamY}
          x2={width - margin}
          y2={beamY}
          stroke="#374151"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Supports */}
        {beam.supports.map((support) => {
          const x = getX(support.position);
          if (support.type === 'pin') {
            return (
              <g key={support.id}>
                <polygon
                  points={`${x-8},${beamY+15} ${x},${beamY-5} ${x+8},${beamY+15}`}
                  fill="#6b7280"
                />
                <line x1={x} y1={beamY-5} x2={x} y2={beamY-20} stroke="#6b7280" strokeWidth="2" />
              </g>
            );
          } else if (support.type === 'roller') {
            return (
              <g key={support.id}>
                <circle cx={x} cy={beamY+10} r="6" fill="#6b7280" />
                <line x1={x-10} y1={beamY+16} x2={x+10} y2={beamY+16} stroke="#6b7280" strokeWidth="2" />
                <line x1={x} y1={beamY+10} x2={x} y2={beamY-10} stroke="#6b7280" strokeWidth="2" />
              </g>
            );
          }
          return null;
        })}

        {/* Loads */}
        {beam.loads.map((load) => {
          if (load.type === 'point') {
            const x = getX(load.position);
            return (
              <g key={load.id}>
                <line x1={x} y1={beamY-30} x2={x} y2={beamY-5} stroke="#ef4444" strokeWidth="2" />
                <polygon
                  points={`${x-4},${beamY-5} ${x},${beamY-15} ${x+4},${beamY-5}`}
                  fill="#ef4444"
                />
                <text x={x} y={beamY-35} textAnchor="middle" fontSize="10" fill="#ef4444">
                  {load.magnitude}
                </text>
              </g>
            );
          } else if (load.type === 'distributed') {
            const x1 = getX(load.startPosition);
            const x2 = getX(load.endPosition);
            const midY = beamY - 25;
            return (
              <g key={load.id}>
                <polygon
                  points={`${x1},${beamY-5} ${x2},${beamY-5} ${x2},${midY} ${x1},${midY}`}
                  fill="#f97316"
                  opacity="0.7"
                />
                <line x1={x1} y1={midY} x2={x2} y2={midY} stroke="#f97316" strokeWidth="2" />
                <text x={(x1 + x2) / 2} y={midY - 5} textAnchor="middle" fontSize="10" fill="#f97316">
                  {load.startMagnitude}
                </text>
              </g>
            );
          }
          return null;
        })}

        {/* Position markers */}
        <text x={margin} y={beamY + 25} textAnchor="middle" fontSize="10" fill="#6b7280">0</text>
        <text x={width - margin} y={beamY + 25} textAnchor="middle" fontSize="10" fill="#6b7280">
          {beam.length}
        </text>
      </svg>
    </div>
  );
}