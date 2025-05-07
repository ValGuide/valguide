import { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { QRCode } from './qr-code'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@valguide/ui/components/tabs'

const QRCodeExample = () => {
  const [activeTab, setActiveTab] = useState('basic')
  const defaultValue = 'https://valguide.com'
  const logoUrl = 'https://github.com/shadcn.png' // Example logo URL

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>QR Code Generator</CardTitle>
        <CardDescription>Generate customizable QR codes with optional logo and styling</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="withLogo">With Logo</TabsTrigger>
            <TabsTrigger value="customizable">Customizable</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="flex justify-center">
            <QRCode
              value={defaultValue}
              showDownloadButtons={true}
              onDownload={(format) => console.log(`Downloaded as ${format}`)}
            />
          </TabsContent>

          <TabsContent value="withLogo" className="flex justify-center">
            <QRCode
              value={defaultValue}
              logoUrl={logoUrl}
              errorCorrectionLevel="H"
              showDownloadButtons={true}
              onDownload={(format) => console.log(`Downloaded as ${format}`)}
            />
          </TabsContent>

          <TabsContent value="customizable" className="flex flex-col items-center">
            <QRCode
              value={defaultValue}
              logoUrl={logoUrl}
              errorCorrectionLevel="H"
              showDownloadButtons={true}
              showControls={true}
              onDownload={(format) => console.log(`Downloaded as ${format}`)}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

const meta: Meta = {
  title: 'Features/QRCode',
  component: QRCodeExample,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {}

export const SimpleQRCode: StoryObj = {
  render: () => (
    <div className="p-4">
      <QRCode value="https://valguide.com" />
    </div>
  ),
}

export const WithLogo: StoryObj = {
  render: () => (
    <div className="p-4">
      <QRCode value="https://valguide.com" logoUrl="https://github.com/shadcn.png" errorCorrectionLevel="H" />
    </div>
  ),
}

export const CustomColors: StoryObj = {
  render: () => (
    <div className="p-4">
      <QRCode value="https://valguide.com" fgColor="#4f46e5" bgColor="#f3f4f6" />
    </div>
  ),
}

export const WithDownloadButtons: StoryObj = {
  render: () => (
    <div className="p-4">
      <QRCode
        value="https://valguide.com"
        showDownloadButtons={true}
        onDownload={(format) => console.log(`Downloaded as ${format}`)}
      />
    </div>
  ),
}

export const FullyCustomizable: StoryObj = {
  render: () => (
    <div className="p-4">
      <QRCode
        value="https://valguide.com"
        logoUrl="https://github.com/shadcn.png"
        showDownloadButtons={true}
        showControls={true}
        onDownload={(format) => console.log(`Downloaded as ${format}`)}
      />
    </div>
  ),
}
