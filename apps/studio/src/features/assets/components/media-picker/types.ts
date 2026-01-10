import type { ComponentType } from 'react'
import type { Asset, AssetType } from '@valguide/core/features/assets/schema'

export type MediaPickerComponentProps = {
  mode: 'single' | 'multiple'
  mediaTypes: AssetType[]
  value: Asset | Asset[] | null
  onChange: (value: Asset | Asset[] | null) => void
  label?: string
  helperText?: string
  maxFileSize?: number
  organizationId: string
  locale?: string
  showLibrary?: boolean
  disabled?: boolean
}

export type MediaPickerComponent = ComponentType<MediaPickerComponentProps>
