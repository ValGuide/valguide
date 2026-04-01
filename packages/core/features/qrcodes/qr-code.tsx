import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@valguide/ui/components/select'
import { Slider } from '@valguide/ui/components/slider'
import QRCodeStyling from 'qr-code-styling'
import React, { useRef, useState } from 'react'
import { useTranslations } from '../../i18n/client'
import { generateSlug } from '../../utils/slug'

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
   * Width of the logo in pixels (used to calculate imageSize)
   */
  logoWidth?: number
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
   * Shape of the QR code
   */
  shape?: 'square' | 'circle'
  /**
   * Whether to show download buttons
   */
  showDownloadButtons?: boolean
  /**
   * Dots style preset
   */
  dotsType?: 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded'
  /**
   * Finder square style preset
   */
  cornersSquareType?: 'square' | 'dot' | 'extra-rounded'
  /**
   * Finder dot style preset
   */
  cornersDotType?: 'square' | 'dot'
  /**
   * Quiet zone / outer margin in pixels
   */
  margin?: number
  /**
   * Whether to show customization controls
   */
  showControls?: boolean
  /**
   * Callback when QR code is downloaded
   */
  onDownload?: (format: 'svg' | 'png') => void
  /**
   * Base filename to use for downloads
   */
  downloadFileName?: string
}

function resolveDownloadFileName(fileName?: string): string {
  const trimmedFileName = fileName?.trim()
  if (!trimmedFileName) {
    return 'qr'
  }

  return generateSlug(trimmedFileName) || 'qr'
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
  bgColor = '#FFFFFF',
  fgColor = '#000000',
  errorCorrectionLevel = 'H',
  shape = 'square',
  showDownloadButtons = false,
  dotsType = 'rounded',
  cornersSquareType = 'extra-rounded',
  cornersDotType = 'dot',
  margin = 12,
  showControls = false,
  onDownload,
  downloadFileName,
}: QRCodeProps) {
  const t = useTranslations('studio.qr')
  const qrRef = useRef<HTMLDivElement>(null)
  const sanitizedDownloadFileName = resolveDownloadFileName(downloadFileName)
  const [qrCode] = useState<QRCodeStyling>(
    new QRCodeStyling({
      width,
      height,
      type: 'svg',
      data: value,
      image: logoUrl,
      margin,
      dotsOptions: {
        color: fgColor,
        type: dotsType,
      },
      backgroundOptions: {
        color: bgColor,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 5,
        imageSize: logoWidth ? logoWidth / width : 0.2,
      },
      cornersSquareOptions: {
        type: cornersSquareType,
        color: fgColor,
      },
      cornersDotOptions: {
        type: cornersDotType,
        color: fgColor,
      },
      qrOptions: {
        errorCorrectionLevel,
      },
      shape,
    }),
  )

  // State for customization controls
  const [customValue, setCustomValue] = useState(value)
  const [customWidth, setCustomWidth] = useState(width)
  const [customHeight, setCustomHeight] = useState(height)
  const [customLogoUrl, setCustomLogoUrl] = useState(logoUrl || '')
  const [customLogoWidth, setCustomLogoWidth] = useState(logoWidth)
  const [customBgColor, setCustomBgColor] = useState(bgColor)
  const [customFgColor, setCustomFgColor] = useState(fgColor)
  const [customErrorLevel, setCustomErrorLevel] = useState(errorCorrectionLevel)
  const [customShape, setCustomShape] = useState<'square' | 'circle'>(shape)
  const [customDotsType, setCustomDotsType] = useState<
    'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded'
  >('rounded')
  const [customCornersSquareType, setCustomCornersSquareType] = useState<'square' | 'dot' | 'extra-rounded'>(
    'extra-rounded',
  )
  const [customCornersDotType, setCustomCornersDotType] = useState<'square' | 'dot'>('dot')
  const [customImageMargin, setCustomImageMargin] = useState(5)
  const [customImageSize, setCustomImageSize] = useState(0.2)
  const [customType, setCustomType] = useState<'svg' | 'canvas'>('svg')
  const [customMargin, setCustomMargin] = useState(margin)
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
      margin: showControls ? customMargin : margin,
      image: showControls ? customLogoUrl || undefined : logoUrl,
      dotsOptions: {
        color: showControls ? customFgColor : fgColor,
        type: showControls ? customDotsType : dotsType,
      },
      backgroundOptions: {
        color: showControls ? customBgColor : bgColor,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: showControls ? customImageMargin : 5,
        imageSize: showControls
          ? customLogoWidth
            ? customLogoWidth / customWidth
            : customImageSize
          : logoWidth
            ? logoWidth / width
            : 0.2,
      },
      cornersSquareOptions: {
        type: showControls ? customCornersSquareType : cornersSquareType,
        color: showControls ? customCornersSquareColor : fgColor,
      },
      cornersDotOptions: {
        type: showControls ? customCornersDotType : cornersDotType,
        color: showControls ? customCornersDotColor : fgColor,
      },
      qrOptions: {
        errorCorrectionLevel: showControls ? customErrorLevel : errorCorrectionLevel,
      },
      shape: showControls ? customShape : shape,
    })
  }, [
    qrCode,
    value,
    width,
    height,
    logoUrl,
    logoWidth,
    bgColor,
    fgColor,
    errorCorrectionLevel,
    shape,
    dotsType,
    cornersSquareType,
    cornersDotType,
    margin,
    showControls,
    customValue,
    customWidth,
    customHeight,
    customLogoUrl,
    customLogoWidth,
    customBgColor,
    customFgColor,
    customErrorLevel,
    customShape,
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
      name: sanitizedDownloadFileName,
    })
    onDownload?.('svg')
  }

  // Download QR code as PNG
  const downloadPNG = () => {
    qrCode.download({
      extension: 'png',
      name: sanitizedDownloadFileName,
    })
    onDownload?.('png')
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="qr-code-container flex items-center justify-center overflow-visible" ref={qrRef} />

      {showDownloadButtons && (
        <div className="flex space-x-4">
          <Button onClick={downloadSVG} variant="outline">
            {t('downloadSvg')}
          </Button>
          <Button onClick={downloadPNG} variant="outline">
            {t('downloadPng')}
          </Button>
        </div>
      )}

      {showControls && (
        <div className="w-full max-w-md space-y-4 p-4 border rounded-lg">
          <div>
            <Label htmlFor="qr-value">{t('qrCodeValue')}</Label>
            <Input
              id="qr-value"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder={t('qrCodeValuePlaceholder')}
            />
          </div>

          <div>
            <Label htmlFor="qr-logo-url">{t('logoUrl')}</Label>
            <Input
              id="qr-logo-url"
              value={customLogoUrl}
              onChange={(e) => setCustomLogoUrl(e.target.value)}
              placeholder={t('logoUrlPlaceholder')}
            />
          </div>

          <div>
            <Label>{t('qrCodeSize')}</Label>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <Label htmlFor="qr-width" className="text-xs">
                  {t('widthValue', { value: customWidth })}
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
                  {t('heightValue', { value: customHeight })}
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
            <Label>{t('logoSize')}</Label>
            <div>
              <Label htmlFor="logo-width" className="text-xs">
                {t('widthValue', { value: customLogoWidth })}
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
          </div>

          <div>
            <Label>{t('colors')}</Label>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <Label htmlFor="bg-color" className="text-xs">
                  {t('backgroundColor')}
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
                  {t('foregroundColor')}
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
            <Label htmlFor="error-level">{t('errorCorrectionLevel')}</Label>
            <Select
              value={customErrorLevel}
              onValueChange={(value) => setCustomErrorLevel(value as 'L' | 'M' | 'Q' | 'H')}
            >
              <SelectTrigger id="error-level">
                <SelectValue placeholder={t('selectErrorCorrectionLevel')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">{t('errorCorrectionLow')}</SelectItem>
                <SelectItem value="M">{t('errorCorrectionMedium')}</SelectItem>
                <SelectItem value="Q">{t('errorCorrectionQuartile')}</SelectItem>
                <SelectItem value="H">{t('errorCorrectionHigh')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="qr-type">{t('qrCodeType')}</Label>
            <Select value={customType} onValueChange={(value) => setCustomType(value as 'svg' | 'canvas')}>
              <SelectTrigger id="qr-type">
                <SelectValue placeholder={t('selectQrCodeType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="svg">{t('svg')}</SelectItem>
                <SelectItem value="canvas">{t('canvas')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="qr-shape">{t('qrCodeShape')}</Label>
            <Select value={customShape} onValueChange={(value) => setCustomShape(value as 'square' | 'circle')}>
              <SelectTrigger id="qr-shape">
                <SelectValue placeholder={t('selectQrCodeShape')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">{t('styleSquare')}</SelectItem>
                <SelectItem value="circle">{t('circle')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dots-type">{t('dotsStyle')}</Label>
            <Select
              value={customDotsType}
              onValueChange={(value) =>
                setCustomDotsType(
                  value as 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded',
                )
              }
            >
              <SelectTrigger id="dots-type">
                <SelectValue placeholder={t('selectDotsStyle')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">{t('styleSquare')}</SelectItem>
                <SelectItem value="dots">{t('styleDots')}</SelectItem>
                <SelectItem value="rounded">{t('styleRounded')}</SelectItem>
                <SelectItem value="classy">{t('styleClassy')}</SelectItem>
                <SelectItem value="classy-rounded">{t('styleClassyRounded')}</SelectItem>
                <SelectItem value="extra-rounded">{t('styleExtraRounded')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="corners-square-type">{t('cornersSquareStyle')}</Label>
            <Select
              value={customCornersSquareType}
              onValueChange={(value) => setCustomCornersSquareType(value as 'square' | 'dot' | 'extra-rounded')}
            >
              <SelectTrigger id="corners-square-type">
                <SelectValue placeholder={t('selectCornersSquareStyle')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">{t('styleSquare')}</SelectItem>
                <SelectItem value="dot">{t('dot')}</SelectItem>
                <SelectItem value="extra-rounded">{t('styleExtraRounded')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="corners-dot-type">{t('cornersDotStyle')}</Label>
            <Select
              value={customCornersDotType}
              onValueChange={(value) => setCustomCornersDotType(value as 'square' | 'dot')}
            >
              <SelectTrigger id="corners-dot-type">
                <SelectValue placeholder={t('selectCornersDotStyle')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">{t('styleSquare')}</SelectItem>
                <SelectItem value="dot">{t('dot')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="image-margin" className="text-xs">
              {t('logoMarginValue', { value: customImageMargin })}
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
              {t('logoSizeRatioValue', { value: customImageSize })}
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
              {t('qrCodeMarginValue', { value: customMargin })}
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
            <Label>{t('cornerColors')}</Label>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <Label htmlFor="corners-square-color" className="text-xs">
                  {t('cornersSquare')}
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
                  {t('cornersDot')}
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
