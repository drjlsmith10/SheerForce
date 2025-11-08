import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-basic-dist-min';
import type { DiagramPoint } from '../types/beam';

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
      line: {
        color,
        width: 3,
      },
      fill: 'tozeroy',
      fillcolor: color + '25',
    } as const;

    const layout = {
      title: {
        text: title,
        font: { size: 18, family: 'Inter, system-ui, sans-serif', color: '#111827', weight: 700 },
      },
      xaxis: {
        title: {
          text: 'Position (m)',
          font: { size: 13, color: '#4b5563', family: 'Inter, system-ui, sans-serif', weight: 600 }
        },
        gridcolor: '#e5e7eb',
        zeroline: true,
        zerolinecolor: '#6b7280',
        zerolinewidth: 2,
        linecolor: '#d1d5db',
        linewidth: 1,
      },
      yaxis: {
        title: {
          text: yAxisLabel,
          font: { size: 13, color: '#4b5563', family: 'Inter, system-ui, sans-serif', weight: 600 }
        },
        gridcolor: '#e5e7eb',
        zeroline: true,
        zerolinecolor: '#6b7280',
        zerolinewidth: 2,
        linecolor: '#d1d5db',
        linewidth: 1,
      },
      margin: { l: 70, r: 30, t: 60, b: 60 },
      paper_bgcolor: 'white',
      plot_bgcolor: '#f9fafb',
      hovermode: 'closest',
      hoverlabel: {
        bgcolor: '#1f2937',
        bordercolor: color,
        font: { size: 12, color: 'white', family: 'Inter, system-ui, sans-serif' }
      },
    } as const;

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    } as const;

    Plotly.newPlot(plotRef.current, [trace], layout, config);

    const currentRef = plotRef.current;
    return () => {
      if (currentRef) {
        Plotly.purge(currentRef);
      }
    };
  }, [data, title, yAxisLabel, color]);

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-5 md:p-6 border border-gray-100 dark:border-gray-700">
      <div ref={plotRef} className="w-full h-96 md:h-80 lg:h-96" />
    </div>
  );
}
