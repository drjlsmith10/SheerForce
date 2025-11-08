declare module 'plotly.js-basic-dist-min' {
  const Plotly: {
    newPlot: (element: HTMLElement, data: unknown[], layout: unknown, config?: unknown) => void;
    purge: (element: HTMLElement) => void;
  };
  export default Plotly;
}
