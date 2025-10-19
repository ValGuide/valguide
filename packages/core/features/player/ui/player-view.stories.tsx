import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PlayerView } from './player-view'
import { themes } from '@valguide/ui/theme/themes'

const meta: Meta<typeof PlayerView> = {
  title: 'Player/PlayerView',
  component: PlayerView,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

const sampleImage = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=800&fit=crop&q=80'
const landscapeImage = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=450&fit=crop&q=80'

export const All: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6">
      {themes.map((theme) => (
        <div className="flex flex-col gap-4 p-4" data-theme={theme} key={theme}>
          <h1>{theme}</h1>
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="mb-2 text-lg font-medium">Default with Square Image</h2>
              <PlayerView
                title="Bohemian Rhapsody"
                artist="Queen"
                image={sampleImage}
                albumArt={sampleImage}
                isPlaying={false}
                currentTime="1:45"
                duration="5:55"
                progress={30}
                volume={50}
                imageRatio="square"
              />
            </div>
            <div>
              <h2 className="mb-2 text-lg font-medium">Default with Original Ratio Image</h2>
              <PlayerView
                title="Bohemian Rhapsody"
                artist="Queen"
                image={landscapeImage}
                albumArt={sampleImage}
                isPlaying={true}
                currentTime="1:45"
                duration="5:55"
                progress={30}
                volume={50}
                imageRatio="original"
                aspectRatio={16 / 9}
              />
            </div>
            <div>
              <h2 className="mb-2 text-lg font-medium">Fullscreen Variant (Preview)</h2>
              <div className="h-[600px] border border-border">
                <PlayerView
                  title="Bohemian Rhapsody"
                  artist="Queen"
                  image={sampleImage}
                  albumArt={sampleImage}
                  isPlaying={false}
                  currentTime="1:45"
                  duration="5:55"
                  progress={30}
                  volume={50}
                  variant="fullscreen"
                  imageRatio="square"
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Note: For true fullscreen experience, see the "FullscreenSquare" and "FullscreenOriginal" stories.
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
}

export const Default: StoryObj<typeof PlayerView> = {
  args: {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    image: sampleImage,
    albumArt: sampleImage,
    isPlaying: false,
    currentTime: '1:45',
    duration: '5:55',
    progress: 30,
    volume: 50,
    imageRatio: 'square',
  },
}

export const OriginalRatio: StoryObj<typeof PlayerView> = {
  args: {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    image: landscapeImage,
    albumArt: sampleImage,
    isPlaying: false,
    currentTime: '1:45',
    duration: '5:55',
    progress: 30,
    volume: 50,
    imageRatio: 'original',
    aspectRatio: 16 / 9,
  },
}

export const FullscreenSquare: StoryObj<typeof PlayerView> = {
  render: (args) => (
    <div className="relative w-screen h-screen overflow-hidden">
      <PlayerView
        {...args}
        title="Bohemian Rhapsody"
        artist="Queen"
        image={sampleImage}
        albumArt={sampleImage}
        isPlaying={false}
        currentTime="1:45"
        duration="5:55"
        progress={30}
        volume={50}
        variant="fullscreen"
        imageRatio="square"
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
}

export const FullscreenOriginal: StoryObj<typeof PlayerView> = {
  render: (args) => (
    <div className="relative w-screen h-screen overflow-hidden">
      <PlayerView
        {...args}
        title="Bohemian Rhapsody"
        artist="Queen"
        image={landscapeImage}
        albumArt={sampleImage}
        isPlaying={false}
        currentTime="1:45"
        duration="5:55"
        progress={30}
        volume={50}
        variant="fullscreen"
        imageRatio="original"
        aspectRatio={16 / 9}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
}

export const MobileView: StoryObj<typeof PlayerView> = {
  args: {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    image: sampleImage,
    albumArt: sampleImage,
    isPlaying: false,
    currentTime: '1:45',
    duration: '5:55',
    progress: 30,
    volume: 50,
    imageRatio: 'square',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

export const TabletView: StoryObj<typeof PlayerView> = {
  args: {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    image: landscapeImage,
    albumArt: sampleImage,
    isPlaying: false,
    currentTime: '1:45',
    duration: '5:55',
    progress: 30,
    volume: 50,
    imageRatio: 'original',
    aspectRatio: 16 / 9,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
}
