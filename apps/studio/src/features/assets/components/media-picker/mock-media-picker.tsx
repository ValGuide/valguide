import { MediaPicker } from './media-picker'
import type { MediaPickerComponentProps } from './types'

async function mockUpload(_file: File, onProgress: (progress: number) => void) {
  for (let i = 0; i <= 100; i += 10) {
    onProgress(i)
    await new Promise((r) => setTimeout(r, 50))
  }
  return null
}

export function MockMediaPicker(props: MediaPickerComponentProps) {
  return <MediaPicker {...props} onUpload={mockUpload} showLibrary={false} />
}
