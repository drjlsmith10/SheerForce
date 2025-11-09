import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-basic-dist-min';
import type { DiagramPoint } from '../types/beam';

interface DiagramDisplayProps {
  title: string;
  data: DiagramPoint[];
  xAxisLabel: string;
  yAxisLabel: string;
  color?: string;
  id?: string;  // ID for PDF export
}

export function DiagramDisplay({ title, data, xAxisLabel, yAxisLabel, color = '#3b82f6', id }: DiagramDisplayProps) {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!plotRef.current || data.length === 0) return;

    const plotElement = plotRef.current;

    // Find max and min values for annotations
    const values = data.map(p => p.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const maxIndex = values.indexOf(maxValue);
    const minIndex = values.indexOf(minValue);

    const trace = {
      x: data.map(p => p.position),
      y: data.map(p => p.value),
      type: 'scatter',
      mode: 'lines',
      name: title,
      line: {
        color,
        width: 3,
        shape: 'spline',  // Smooth curves for better visualization
      },
      fill: 'tozeroy',
      fillcolor: color + '25',
      hovertemplate:
        '<b>Position:</b> %{x:.3f} ' + xAxisLabel.match(/\(([^)]+)\)/)?.[1] + '<br>' +
        '<b>Value:</b> %{y:.3f} ' + yAxisLabel.match(/\(([^)]+)\)/)?.[1] + '<br>' +
        '<extra></extra>',
    } as const;

    // Create annotations for max/min values
    const annotations = [];

    if (Math.abs(maxValue) > 0.01) {
      annotations.push({
        x: data[maxIndex].position,
        y: maxValue,
        text: `Max: ${maxValue.toFixed(2)}`,
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1,
        arrowwidth: 2,
        arrowcolor: color,
        ax: 0,
        ay: maxValue > 0 ? -40 : 40,
        font: {
          size: 11,
          color: color,
          family: 'Inter, system-ui, sans-serif',
          weight: 600
        },
        bgcolor: 'white',
        bordercolor: color,
        borderwidth: 2,
        borderpad: 4,
        opacity: 0.9
      });
    }

    if (Math.abs(minValue) > 0.01 && minIndex !== maxIndex) {
      annotations.push({
        x: data[minIndex].position,
        y: minValue,
        text: `Min: ${minValue.toFixed(2)}`,
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1,
        arrowwidth: 2,
        arrowcolor: color,
        ax: 0,
        ay: minValue < 0 ? 40 : -40,
        font: {
          size: 11,
          color: color,
          family: 'Inter, system-ui, sans-serif',
          weight: 600
        },
        bgcolor: 'white',
        bordercolor: color,
        borderwidth: 2,
        borderpad: 4,
        opacity: 0.9
      });
    }

    const layout = {
      title: {
        text: title,
        font: { size: 18, family: 'Inter, system-ui, sans-serif', color: '#111827', weight: 700 },
      },
      xaxis: {
        title: {
          text: xAxisLabel,
          font: { size: 13, color: '#4b5563', family: 'Inter, system-ui, sans-serif', weight: 600 }
        },
        gridcolor: '#e5e7eb',
        zeroline: true,
        zerolinecolor: '#6b7280',
        zerolinewidth: 2,
        linecolor: '#d1d5db',
        linewidth: 1,
        showspikes: true,
        spikecolor: color,
        spikethickness: 1,
        spikedash: 'dot',
        spikemode: 'across',
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
        showspikes: true,
        spikecolor: color,
        spikethickness: 1,
        spikedash: 'dot',
        spikemode: 'across',
      },
      margin: { l: 70, r: 30, t: 60, b: 60 },
      paper_bgcolor: 'white',
      plot_bgcolor: '#f9fafb',
      hovermode: 'x unified',  // Unified hover mode for better interactivity
      hoverlabel: {
        bgcolor: 'white',
        bordercolor: color,
        font: { size: 12, color: '#111827', family: 'monospace' }
      },
      annotations: annotations,
      showlegend: false,
    } as const;

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
      toImageButtonOptions: {
        format: 'png',
        filename: `${title.replace(/\s+/g, '_').toLowerCase()}`,
        height: 800,
        width: 1200,
        scale: 2  // 2x resolution
      },
      scrollZoom: true,  // Enable scroll zoom for better exploration
    } as const;

    Plotly.newPlot(plotElement, [trace], layout, config);

    return () => {
      Plotly.purge(plotElement);
    };
  }, [data, title, xAxisLabel, yAxisLabel, color]);

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-5 md:p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div ref={plotRef} id={id} className="w-full h-80 md:h-96" />
    </div>
  );
}
