import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-basic-dist-min';
import { DiagramPoint } from '../types/beam';

interface DiagramDisplayProps {
  title: string;
  data: DiagramPoint[];
  yAxisLabel: string;
  color?: string;
}

export function DiagramDisplay({ title, data, yAxisLabel, color = '#3b82f6' }: DiagramDisplayProps) {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!plotRef.current || data.length === 0) return;

    const trace = {
      x: data.map(p => p.position),
      y: data.map(p => p.value),
      type: 'scatter',
      mode: 'lines',
      line: { color, width: 2 },
      fill: 'tozeroy',
      fillcolor: color + '20',
    } as const;

    const layout = {
      title: {
        text: title,
        font: { size: 16, family: 'system-ui, sans-serif' },
      },
      xaxis: {
        title: 'Position (m)',
        gridcolor: '#e5e7eb',
        zeroline: true,
        zerolinecolor: '#9ca3af',
        zerolinewidth: 2,
      },
      yaxis: {
        title: yAxisLabel,
        gridcolor: '#e5e7eb',
        zeroline: true,
        zerolinecolor: '#9ca3af',
        zerolinewidth: 2,
      },
      margin: { l: 60, r: 30, t: 50, b: 50 },
      paper_bgcolor: 'white',
      plot_bgcolor: '#fafafa',
      hovermode: 'closest',
    } as const;

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    } as const;

    Plotly.newPlot(plotRef.current, [trace], layout, config);

    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
    };
  }, [data, title, yAxisLabel, color]);

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4">
      <div ref={plotRef} className="w-full h-96" />
    </div>
  );
}
