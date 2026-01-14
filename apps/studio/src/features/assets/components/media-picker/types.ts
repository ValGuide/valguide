import type { Asset, AssetType } from '@valguide/core/features/assets/schema'
import type { ComponentType } from 'react'

export type MediaPickerComponentProps = {
  mode: 'single' | 'multiple'
  mediaTypes: AssetType[]
  value: Asset | Asset[] | null
  onChange: (value: Asset | Asset[] | null) => void
  label?: string
  helperText?: string
  maxFileSize?: number
  locale?: string
  showLibrary?: boolean
  disabled?: boolean
}

export type MediaPickerComponent = ComponentType<MediaPickerComponentProps>
