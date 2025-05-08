# QR Code Feature Package

A responsive SVG-backed QR code component with customization options including logo insertion, color customization, and download capabilities.

## Features

- Responsive SVG-backed QR code component
- Add a logo in the middle of the QR code
- Customize colors (foreground and background)
- Download as PNG and SVG
- Interactive customization controls
- Utility functions for QR code manipulation

## Installation

This package is part of the `@valguide/core` package and can be imported directly:

```jsx
import { QRCode } from '@valguide/core/features/qrcodes'
```

## Usage

### Basic QR Code

```jsx
<QRCode value="https://valguide.com" />
```

### QR Code with Logo

```jsx
<QRCode 
  value="https://valguide.com" 
  logoUrl="https://example.com/logo.png"
  errorCorrectionLevel="H" // Recommended when using a logo
/>
```

### QR Code with Custom Colors

```jsx
<QRCode 
  value="https://valguide.com" 
  fgColor="#4f46e5" // Foreground color (the dots)
  bgColor="#f3f4f6" // Background color
/>
```

### QR Code with Download Buttons

```jsx
<QRCode 
  value="https://valguide.com" 
  showDownloadButtons={true}
  onDownload={(format) => console.log(`Downloaded as ${format}`)}
/>
```

### Fully Customizable QR Code

```jsx
<QRCode 
  value="https://valguide.com" 
  logoUrl="https://example.com/logo.png"
  showDownloadButtons={true}
  showControls={true}
  onDownload={(format) => console.log(`Downloaded as ${format}`)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | string | (required) | The value to encode in the QR code |
| `width` | number | 300 | Width of the QR code in pixels |
| `height` | number | 300 | Height of the QR code in pixels |
| `logoUrl` | string | undefined | URL of the logo to display in the center of the QR code |
| `logoWidth` | number | 60 | Width of the logo in pixels |
| `logoHeight` | number | 60 | Height of the logo in pixels |
| `bgColor` | string | '#FFFFFF' | Background color of the QR code |
| `fgColor` | string | '#000000' | Foreground color of the QR code (the dots) |
| `errorCorrectionLevel` | 'L' \| 'M' \| 'Q' \| 'H' | 'H' | QR code error correction level |
| `showDownloadButtons` | boolean | false | Whether to show download buttons |
| `showControls` | boolean | false | Whether to show customization controls |
| `onDownload` | (format: 'svg' \| 'png') => void | undefined | Callback when QR code is downloaded |

## Utility Functions

The package also exports utility functions for QR code manipulation:

```jsx
import { 
  svgToDataUrl, 
  svgToPngDataUrl, 
  downloadDataUrl,
  downloadSvgAsPng,
  downloadSvgAsSvg,
  getOptimalErrorCorrectionLevel,
  calculateOptimalLogoSize,
  hasGoodContrast
} from '@valguide/core/features/qrcodes'
```

### Best Practices

1. **Error Correction Level**: When adding a logo, use a higher error correction level ('H' is recommended) to ensure the QR code remains scannable.

2. **Logo Size**: Keep the logo size around 15-20% of the QR code size for optimal scanning.

3. **Color Contrast**: Ensure there's sufficient contrast between the foreground and background colors for better readability.

4. **Testing**: Always test the QR code with different scanners to ensure it works reliably.
