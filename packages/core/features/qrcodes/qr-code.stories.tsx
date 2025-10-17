import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { QRCode } from './qr-code'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@valguide/ui/components/tabs'
import { faker } from '@faker-js/faker'

const QRCodeExample = () => {
  const [activeTab, setActiveTab] = useState('basic')
  const defaultValue = 'https://valguide.com'
  const logoUrl = faker.image.avatar() // Fake avatar image from faker

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
              shape="square"
              showDownloadButtons={true}
              onDownload={(format) => console.log(`Downloaded as ${format}`)}
            />
          </TabsContent>

          <TabsContent value="withLogo" className="flex justify-center">
            <QRCode
              value={defaultValue}
              logoUrl={logoUrl}
              shape="square"
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
              shape="circle"
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
      <QRCode value="https://valguide.com" shape="square" />
    </div>
  ),
}

export const WithLogo: StoryObj = {
  render: () => (
    <div className="p-4">
      <QRCode value="https://valguide.com" logoUrl={faker.image.avatar()} shape="square" errorCorrectionLevel="H" />
    </div>
  ),
}

export const CustomColors: StoryObj = {
  render: () => (
    <div className="p-4">
      <QRCode value="https://valguide.com" shape="square" fgColor="#4f46e5" bgColor="#f3f4f6" />
    </div>
  ),
}

export const WithDownloadButtons: StoryObj = {
  render: () => (
    <div className="p-4">
      <QRCode
        value="https://valguide.com"
        shape="square"
        showDownloadButtons={true}
        onDownload={(format) => console.log(`Downloaded as ${format}`)}
      />
    </div>
  ),
}

export const CircleShape: StoryObj = {
  render: () => (
    <div className="p-4">
      <QRCode
        value="https://valguide.com"
        shape="circle"
        fgColor="#4f46e5"
        bgColor="#f3f4f6"
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
        logoUrl={faker.image.avatar()}
        errorCorrectionLevel="H"
        shape="square"
        showDownloadButtons={true}
        showControls={true}
        onDownload={(format) => console.log(`Downloaded as ${format}`)}
      />
    </div>
  ),
}
