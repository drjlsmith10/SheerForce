/**
 * Diagram Renderer
 *
 * Utilities to render Plotly diagrams to canvas for PDF export.
 */

import html2canvas from 'html2canvas';

/**
 * Capture a Plotly diagram as a canvas
 *
 * @param elementId - ID of the plot element
 * @param scale - Resolution scale (1 = screen, 2 = print quality)
 * @returns Canvas element with rendered diagram
 */
export async function captureDiagram(
  elementId: string,
  scale: number = 2
): Promise<HTMLCanvasElement | null> {
  const element = document.getElementById(elementId);

  if (!element) {
    console.warn(`Element with ID "${elementId}" not found`);
    return null;
  }

  try {
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    });

    return canvas;
  } catch (error) {
    console.error('Error capturing diagram:', error);
    return null;
  }
}

/**
 * Convert canvas to base64 image data URL
 */
export function canvasToDataURL(canvas: HTMLCanvasElement, format: 'png' | 'jpeg' = 'png'): string {
  return canvas.toDataURL(`image/${format}`, 1.0);
}

/**
 * Get optimal dimensions for diagram in PDF
 * Maintains aspect ratio while fitting within max dimensions
 */
export function getOptimalDimensions(
  canvas: HTMLCanvasElement,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = canvas.width / canvas.height;

  let width = maxWidth;
  let height = width / aspectRatio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return { width, height };
}
