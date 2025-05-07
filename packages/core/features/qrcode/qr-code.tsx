'use client'

import React, { useRef, useState } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { Slider } from '@valguide/ui/components/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@valguide/ui/components/select'

export interface QRCodeProps {
  /**
   * The value to encode in the QR code
   */
  value: string
  /**
   * Width of the QR code in pixels
   */
  width?: number
  /**
   * Height of the QR code in pixels
   */
  height?: number
  /**
   * URL of the logo to display in the center of the QR code
   */
  logoUrl?: string
  /**
   * Width of the logo in pixels
   */
  logoWidth?: number
  /**
   * Height of the logo in pixels
   */
  logoHeight?: number
  /**
   * Background color of the QR code
   */
  bgColor?: string
  /**
   * Foreground color of the QR code (the dots)
   */
  fgColor?: string
  /**
   * QR code error correction level
   */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  /**
   * Whether to show download buttons
   */
  showDownloadButtons?: boolean
  /**
   * Whether to show customization controls
   */
  showControls?: boolean
  /**
   * Callback when QR code is downloaded
   */
  onDownload?: (format: 'svg' | 'png') => void
}

/**
 * A responsive QR code component with customization options
 */
export function QRCode({
  value,
  width = 300,
  height = 300,
  logoUrl,
  logoWidth = 60,
  logoHeight = 60,
  bgColor = '#FFFFFF',
  fgColor = '#000000',
  errorCorrectionLevel = 'H',
  showDownloadButtons = false,
  showControls = false,
  onDownload,
}: QRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null)
  const [qrCode] = useState<QRCodeStyling>(
    new QRCodeStyling({
      width,
      height,
      type: 'svg',
      data: value,
      image: logoUrl,
      margin: 0,
      dotsOptions: {
        color: fgColor,
        type: 'rounded',
      },
      backgroundOptions: {
        color: bgColor,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 5,
        imageSize: 0.2,
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
        color: fgColor,
      },
      cornersDotOptions: {
        type: 'dot',
        color: fgColor,
      },
      qrOptions: {
        errorCorrectionLevel,
      },
    }),
  )

  // State for customization controls
  const [customValue, setCustomValue] = useState(value)
  const [customWidth, setCustomWidth] = useState(width)
  const [customHeight, setCustomHeight] = useState(height)
  const [customLogoUrl, setCustomLogoUrl] = useState(logoUrl || '')
  const [customLogoWidth, setCustomLogoWidth] = useState(logoWidth)
  const [customLogoHeight, setCustomLogoHeight] = useState(logoHeight)
  const [customBgColor, setCustomBgColor] = useState(bgColor)
  const [customFgColor, setCustomFgColor] = useState(fgColor)
  const [customErrorLevel, setCustomErrorLevel] = useState(errorCorrectionLevel)
  const [customDotsType, setCustomDotsType] = useState<'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded'>('rounded')
  const [customCornersSquareType, setCustomCornersSquareType] = useState<'square' | 'dot' | 'extra-rounded'>('extra-rounded')
  const [customCornersDotType, setCustomCornersDotType] = useState<'square' | 'dot'>('dot')
  const [customImageMargin, setCustomImageMargin] = useState(5)
  const [customImageSize, setCustomImageSize] = useState(0.2)
  const [customType, setCustomType] = useState<'svg' | 'canvas'>('svg')
  const [customMargin, setCustomMargin] = useState(0)
  const [customCornersSquareColor, setCustomCornersSquareColor] = useState(fgColor)
  const [customCornersDotColor, setCustomCornersDotColor] = useState(fgColor)

  // Update QR code when props change
  React.useEffect(() => {
    if (qrRef.current) {
      qrCode.append(qrRef.current)
    }
  }, [qrCode])

  // Update QR code options when customization changes
  React.useEffect(() => {
    qrCode.update({
      type: showControls ? customType : 'svg',
      data: showControls ? customValue : value,
      width: showControls ? customWidth : width,
      height: showControls ? customHeight : height,
      margin: showControls ? customMargin : 0,
      image: showControls ? customLogoUrl || undefined : logoUrl,
      dotsOptions: {
        color: showControls ? customFgColor : fgColor,
        type: showControls ? customDotsType : 'rounded',
      },
      backgroundOptions: {
        color: showControls ? customBgColor : bgColor,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: showControls ? customImageMargin : 5,
        imageSize: showControls ? customImageSize : 0.2,
      },
      cornersSquareOptions: {
        type: showControls ? customCornersSquareType : 'extra-rounded',
        color: showControls ? customCornersSquareColor : fgColor,
      },
      cornersDotOptions: {
        type: showControls ? customCornersDotType : 'dot',
        color: showControls ? customCornersDotColor : fgColor,
      },
      qrOptions: {
        errorCorrectionLevel: showControls ? customErrorLevel : errorCorrectionLevel,
      },
    })
  }, [
    qrCode,
    value,
    width,
    height,
    logoUrl,
    logoWidth,
    logoHeight,
    bgColor,
    fgColor,
    errorCorrectionLevel,
    showControls,
    customValue,
    customWidth,
    customHeight,
    customLogoUrl,
    customLogoWidth,
    customLogoHeight,
    customBgColor,
    customFgColor,
    customErrorLevel,
    customDotsType,
    customCornersSquareType,
    customCornersDotType,
    customImageMargin,
    customImageSize,
    customType,
    customMargin,
    customCornersSquareColor,
    customCornersDotColor,
  ])

  // Download QR code as SVG
  const downloadSVG = () => {
    qrCode.download({
      extension: 'svg',
    })
    onDownload?.('svg')
  }

  // Download QR code as PNG
  const downloadPNG = () => {
    qrCode.download({
      extension: 'png',
    })
    onDownload?.('png')
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="qr-code-container" ref={qrRef} />

      {showDownloadButtons && (
        <div className="flex space-x-4">
          <Button onClick={downloadSVG} variant="outline">
            Download SVG
          </Button>
          <Button onClick={downloadPNG} variant="outline">
            Download PNG
          </Button>
        </div>
      )}

      {showControls && (
        <div className="w-full max-w-md space-y-4 p-4 border rounded-lg">
          <div>
            <Label htmlFor="qr-value">QR Code Value</Label>
            <Input
              id="qr-value"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="Enter value for QR code"
            />
          </div>

          <div>
            <Label htmlFor="qr-logo-url">Logo URL</Label>
            <Input
              id="qr-logo-url"
              value={customLogoUrl}
              onChange={(e) => setCustomLogoUrl(e.target.value)}
              placeholder="Enter logo URL (optional)"
            />
          </div>

          <div>
            <Label>QR Code Size</Label>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <Label htmlFor="qr-width" className="text-xs">
                  Width: {customWidth}px
                </Label>
                <Slider
                  id="qr-width"
                  min={100}
                  max={500}
                  step={10}
                  value={[customWidth]}
                  onValueChange={(value) => setCustomWidth(value[0] || customWidth)}
                />
              </div>
              <div className="w-1/2">
                <Label htmlFor="qr-height" className="text-xs">
                  Height: {customHeight}px
                </Label>
                <Slider
                  id="qr-height"
                  min={100}
                  max={500}
                  step={10}
                  value={[customHeight]}
                  onValueChange={(value) => setCustomHeight(value[0] || customHeight)}
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Logo Size</Label>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <Label htmlFor="logo-width" className="text-xs">
                  Width: {customLogoWidth}px
                </Label>
                <Slider
                  id="logo-width"
                  min={20}
                  max={150}
                  step={5}
                  value={[customLogoWidth]}
                  onValueChange={(value) => setCustomLogoWidth(value[0] || customLogoWidth)}
                />
              </div>
              <div className="w-1/2">
                <Label htmlFor="logo-height" className="text-xs">
                  Height: {customLogoHeight}px
                </Label>
                <Slider
                  id="logo-height"
                  min={20}
                  max={150}
                  step={5}
                  value={[customLogoHeight]}
                  onValueChange={(value) => setCustomLogoHeight(value[0] || customLogoHeight)}
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Colors</Label>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <Label htmlFor="bg-color" className="text-xs">
                  Background
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="bg-color"
                    type="color"
                    value={customBgColor}
                    onChange={(e) => setCustomBgColor(e.target.value)}
                    className="w-12 h-8 p-0"
                  />
                  <Input value={customBgColor} onChange={(e) => setCustomBgColor(e.target.value)} className="flex-1" />
                </div>
              </div>
              <div className="w-1/2">
                <Label htmlFor="fg-color" className="text-xs">
                  Foreground
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="fg-color"
                    type="color"
                    value={customFgColor}
                    onChange={(e) => setCustomFgColor(e.target.value)}
                    className="w-12 h-8 p-0"
                  />
                  <Input value={customFgColor} onChange={(e) => setCustomFgColor(e.target.value)} className="flex-1" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="error-level">Error Correction Level</Label>
            <Select
              value={customErrorLevel}
              onValueChange={(value) => setCustomErrorLevel(value as 'L' | 'M' | 'Q' | 'H')}
            >
              <SelectTrigger id="error-level">
                <SelectValue placeholder="Select error correction level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (7%)</SelectItem>
                <SelectItem value="M">Medium (15%)</SelectItem>
                <SelectItem value="Q">Quartile (25%)</SelectItem>
                <SelectItem value="H">High (30%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="qr-type">QR Code Type</Label>
            <Select value={customType} onValueChange={(value) => setCustomType(value as 'svg' | 'canvas')}>
              <SelectTrigger id="qr-type">
                <SelectValue placeholder="Select QR code type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="svg">SVG</SelectItem>
                <SelectItem value="canvas">Canvas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dots-type">Dots Style</Label>
            <Select 
              value={customDotsType} 
              onValueChange={(value) => setCustomDotsType(value as "square" | "dots" | "rounded" | "classy" | "classy-rounded" | "extra-rounded")}
            >
              <SelectTrigger id="dots-type">
                <SelectValue placeholder="Select dots style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="dots">Dots</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="classy">Classy</SelectItem>
                <SelectItem value="classy-rounded">Classy Rounded</SelectItem>
                <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="corners-square-type">Corners Square Style</Label>
            <Select 
              value={customCornersSquareType} 
              onValueChange={(value) => setCustomCornersSquareType(value as "square" | "dot" | "extra-rounded")}
            >
              <SelectTrigger id="corners-square-type">
                <SelectValue placeholder="Select corners square style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="dot">Dot</SelectItem>
                <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="corners-dot-type">Corners Dot Style</Label>
            <Select 
              value={customCornersDotType} 
              onValueChange={(value) => setCustomCornersDotType(value as "square" | "dot")}
            >
              <SelectTrigger id="corners-dot-type">
                <SelectValue placeholder="Select corners dot style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="dot">Dot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="image-margin" className="text-xs">
              Logo Margin: {customImageMargin}
            </Label>
            <Slider
              id="image-margin"
              min={0}
              max={20}
              step={1}
              value={[customImageMargin]}
              onValueChange={(value) => setCustomImageMargin(value[0] || customImageMargin)}
            />
          </div>

          <div>
            <Label htmlFor="image-size" className="text-xs">
              Logo Size Ratio: {customImageSize}
            </Label>
            <Slider
              id="image-size"
              min={0.1}
              max={0.5}
              step={0.01}
              value={[customImageSize]}
              onValueChange={(value) => setCustomImageSize(value[0] || customImageSize)}
            />
          </div>

          <div>
            <Label htmlFor="qr-margin" className="text-xs">
              QR Code Margin: {customMargin}px
            </Label>
            <Slider
              id="qr-margin"
              min={0}
              max={50}
              step={1}
              value={[customMargin]}
              onValueChange={(value) => setCustomMargin(value[0] || customMargin)}
            />
          </div>

          <div>
            <Label>Corner Colors</Label>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <Label htmlFor="corners-square-color" className="text-xs">
                  Corners Square
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="corners-square-color"
                    type="color"
                    value={customCornersSquareColor}
                    onChange={(e) => setCustomCornersSquareColor(e.target.value)}
                    className="w-12 h-8 p-0"
                  />
                  <Input
                    value={customCornersSquareColor}
                    onChange={(e) => setCustomCornersSquareColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="w-1/2">
                <Label htmlFor="corners-dot-color" className="text-xs">
                  Corners Dot
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="corners-dot-color"
                    type="color"
                    value={customCornersDotColor}
                    onChange={(e) => setCustomCornersDotColor(e.target.value)}
                    className="w-12 h-8 p-0"
                  />
                  <Input
                    value={customCornersDotColor}
                    onChange={(e) => setCustomCornersDotColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
