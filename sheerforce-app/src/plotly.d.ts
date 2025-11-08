declare module 'plotly.js-basic-dist-min' {
  interface PlotlyConfig {
    responsive?: boolean;
    displayModeBar?: boolean;
    displaylogo?: boolean;
    modeBarButtonsToRemove?: readonly string[];
  }

  interface PlotlyLayout {
    title?: {
      text: string;
      font?: {
        size?: number;
        family?: string;
        color?: string;
        weight?: number;
      };
    };
    xaxis?: Record<string, unknown>;
    yaxis?: Record<string, unknown>;
    margin?: { l?: number; r?: number; t?: number; b?: number };
    paper_bgcolor?: string;
    plot_bgcolor?: string;
    hovermode?: string;
    hoverlabel?: Record<string, unknown>;
  }

  interface PlotlyTrace {
    x: number[];
    y: number[];
    type: string;
    mode?: string;
    line?: {
      color: string;
      width: number;
    };
    fill?: string;
    fillcolor?: string;
  }

  const Plotly: {
    newPlot: (
      element: HTMLElement,
      data: PlotlyTrace[],
      layout?: PlotlyLayout,
      config?: PlotlyConfig
    ) => Promise<void>;
    purge: (element: HTMLElement) => void;
  };

  export default Plotly;
}
