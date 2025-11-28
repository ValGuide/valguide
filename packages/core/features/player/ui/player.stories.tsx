import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { themes } from '@valguide/ui/theme/themes'
import { Player } from './player'

const meta: Meta<typeof Player> = {
  title: 'Player/Player',
  component: Player,
}

export default meta

const sampleAlbumArt = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop&q=80'

export const All: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6">
      {themes.map((theme) => (
        <div className="flex flex-col gap-4 p-4" data-theme={theme} key={theme}>
          <h1>{theme}</h1>
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="mb-2 text-lg font-medium">Default Layout</h2>
              <Player
                title="Bohemian Rhapsody"
                artist="Queen"
                albumArt={sampleAlbumArt}
                isPlaying={false}
                currentTime="1:45"
                duration="5:55"
                progress={30}
                volume={50}
              />
            </div>
            <div>
              <h2 className="mb-2 text-lg font-medium">Compact</h2>
              <Player
                title="Bohemian Rhapsody"
                artist="Queen"
                albumArt={sampleAlbumArt}
                isPlaying={true}
                currentTime="1:45"
                duration="5:55"
                progress={30}
                volume={50}
                variant="compact"
              />
            </div>
            <div>
              <h2 className="mb-2 text-lg font-medium">Inline Layout</h2>
              <Player
                title="Bohemian Rhapsody"
                artist="Queen"
                albumArt={sampleAlbumArt}
                isPlaying={false}
                layout="inline"
                volume={50}
              />
            </div>
            <div>
              <h2 className="mb-2 text-lg font-medium">Compact Inline</h2>
              <Player
                title="Bohemian Rhapsody"
                artist="Queen"
                albumArt={sampleAlbumArt}
                isPlaying={true}
                layout="inline"
                variant="compact"
                volume={50}
              />
            </div>
            <div>
              <h2 className="mb-2 text-lg font-medium">With Shuffle and Repeat Active</h2>
              <Player
                title="Bohemian Rhapsody"
                artist="Queen"
                albumArt={sampleAlbumArt}
                isPlaying={false}
                currentTime="1:45"
                duration="5:55"
                progress={30}
                volume={50}
                shuffleActive={true}
                repeatActive={true}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
}

export const Default: StoryObj<typeof Player> = {
  args: {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    albumArt: sampleAlbumArt,
    isPlaying: false,
    currentTime: '1:45',
    duration: '5:55',
    progress: 30,
    volume: 50,
  },
}

export const Playing: StoryObj<typeof Player> = {
  args: {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    albumArt: sampleAlbumArt,
    isPlaying: true,
    currentTime: '1:45',
    duration: '5:55',
    progress: 30,
    volume: 50,
  },
}

export const Compact: StoryObj<typeof Player> = {
  args: {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    albumArt: sampleAlbumArt,
    isPlaying: false,
    currentTime: '1:45',
    duration: '5:55',
    progress: 30,
    volume: 50,
    variant: 'compact',
  },
}

export const InlineLayout: StoryObj<typeof Player> = {
  args: {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    albumArt: sampleAlbumArt,
    isPlaying: false,
    volume: 50,
    layout: 'inline',
  },
}

export const CompactInline: StoryObj<typeof Player> = {
  args: {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    albumArt: sampleAlbumArt,
    isPlaying: false,
    volume: 50,
    variant: 'compact',
    layout: 'inline',
  },
}

export const WithoutAlbumArt: StoryObj<typeof Player> = {
  args: {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    isPlaying: false,
    currentTime: '1:45',
    duration: '5:55',
    progress: 30,
    volume: 50,
  },
}

export const ShuffleAndRepeatActive: StoryObj<typeof Player> = {
  args: {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    albumArt: sampleAlbumArt,
    isPlaying: false,
    currentTime: '1:45',
    duration: '5:55',
    progress: 30,
    volume: 50,
    shuffleActive: true,
    repeatActive: true,
  },
}

export const NoVolumeControl: StoryObj<typeof Player> = {
  args: {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    albumArt: sampleAlbumArt,
    isPlaying: false,
    currentTime: '1:45',
    duration: '5:55',
    progress: 30,
    showVolumeControl: false,
  },
}

export const Interactive: StoryObj<typeof Player> = {
  args: {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    albumArt: sampleAlbumArt,
    isPlaying: false,
    currentTime: '1:45',
    duration: '5:55',
    progress: 30,
    volume: 50,
    onPlayPause: () => console.log('Play/Pause clicked'),
    onSkipNext: () => console.log('Skip Next clicked'),
    onSkipPrevious: () => console.log('Skip Previous clicked'),
    onToggleShuffle: () => console.log('Toggle Shuffle clicked'),
    onToggleRepeat: () => console.log('Toggle Repeat clicked'),
    onSeek: (value) => console.log('Seek to:', value),
    onVolumeChange: (value) => console.log('Volume changed to:', value),
  },
}
