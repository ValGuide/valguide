/**
 * Utility functions for QR code generation and manipulation
 */

/**
 * Convert an SVG string to a data URL
 * @param svgString - The SVG string to convert
 * @returns A data URL representing the SVG
 */
export function svgToDataUrl(svgString: string): string {
  const encodedSvg = encodeURIComponent(svgString)
  return `data:image/svg+xml;charset=utf-8,${encodedSvg}`
}

/**
 * Convert an SVG element to a PNG data URL
 * @param svgElement - The SVG element to convert
 * @param width - The width of the output PNG
 * @param height - The height of the output PNG
 * @returns A Promise that resolves to a data URL representing the PNG
 */
export function svgToPngDataUrl(svgElement: SVGElement, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      // Create an image from the SVG
      const img = new Image()
      const svgString = new XMLSerializer().serializeToString(svgElement)
      const dataUrl = svgToDataUrl(svgString)

      img.onload = () => {
        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0, width, height)
        // Convert the canvas to a data URL
        const pngDataUrl = canvas.toDataURL('image/png')
        resolve(pngDataUrl)
      }

      img.onerror = (error) => {
        reject(error)
      }

      img.src = dataUrl
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Download a data URL as a file
 * @param dataUrl - The data URL to download
 * @param filename - The name of the file to download
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Download an SVG element as a PNG file
 * @param svgElement - The SVG element to download
 * @param filename - The name of the file to download (without extension)
 * @param width - The width of the output PNG
 * @param height - The height of the output PNG
 */
export async function downloadSvgAsPng(
  svgElement: SVGElement,
  filename: string,
  width: number,
  height: number,
): Promise<void> {
  try {
    const pngDataUrl = await svgToPngDataUrl(svgElement, width, height)
    downloadDataUrl(pngDataUrl, `${filename}.png`)
  } catch (error) {
    console.error('Error downloading SVG as PNG:', error)
  }
}

/**
 * Download an SVG element as an SVG file
 * @param svgElement - The SVG element to download
 * @param filename - The name of the file to download (without extension)
 */
export function downloadSvgAsSvg(svgElement: SVGElement, filename: string): void {
  try {
    const svgString = new XMLSerializer().serializeToString(svgElement)
    const dataUrl = svgToDataUrl(svgString)
    downloadDataUrl(dataUrl, `${filename}.svg`)
  } catch (error) {
    console.error('Error downloading SVG:', error)
  }
}

/**
 * Get the optimal error correction level for a QR code with a logo
 * @param logoSizeRatio - The ratio of the logo size to the QR code size (0-1)
 * @returns The recommended error correction level
 */
export function getOptimalErrorCorrectionLevel(logoSizeRatio: number): 'L' | 'M' | 'Q' | 'H' {
  if (logoSizeRatio <= 0) return 'L' // No logo, lowest correction level is fine
  if (logoSizeRatio <= 0.1) return 'M' // Small logo, medium correction
  if (logoSizeRatio <= 0.2) return 'Q' // Medium logo, quartile correction
  return 'H' // Large logo, highest correction level
}

/**
 * Calculate the optimal size for a logo in a QR code
 * @param qrSize - The size of the QR code in pixels
 * @returns The recommended logo size in pixels
 */
export function calculateOptimalLogoSize(qrSize: number): number {
  // A good rule of thumb is to keep the logo around 15-20% of the QR code size
  return Math.round(qrSize * 0.18)
}

/**
 * Check if a color has enough contrast with another color for good readability
 * @param color1 - The first color in hex format (#RRGGBB)
 * @param color2 - The second color in hex format (#RRGGBB)
 * @returns True if the colors have sufficient contrast
 */
export function hasGoodContrast(color1: string, color2: string): boolean {
  // Convert hex to RGB
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) return false

  // Calculate relative luminance
  const luminance1 = calculateLuminance(rgb1)
  const luminance2 = calculateLuminance(rgb2)

  // Calculate contrast ratio
  const contrastRatio = (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05)

  // WCAG recommends a contrast ratio of at least 4.5:1 for normal text
  return contrastRatio >= 4.5
}

/**
 * Convert a hex color to RGB
 * @param hex - The hex color string (#RRGGBB)
 * @returns The RGB values or null if invalid
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Calculate the relative luminance of an RGB color
 * @param rgb - The RGB color values
 * @returns The relative luminance
 */
function calculateLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb

  // Convert RGB to sRGB
  const sR = r / 255
  const sG = g / 255
  const sB = b / 255

  // Calculate luminance
  const R = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4)
  const G = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4)
  const B = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4)

  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}
