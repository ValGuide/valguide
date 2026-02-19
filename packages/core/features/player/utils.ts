import { getAssetImageUrl, getAssetUrl } from '../assets/image-url'
import { getLocalizedStopText } from '../tours/public/localization-helpers'
import type { StopWithAssets } from '../tours/public/types'
import type { PlayerStop } from './types'

/**
 * Converts a StopWithAssets to a PlayerStop for the audio player.
 */
export function toPlayerStop(stop: StopWithAssets, locale: string): PlayerStop {
  const title = getLocalizedStopText(stop, 'title', locale)
  const audioAsset = stop.assets.find((a) => a.type === 'audio')
  const imageAsset = stop.assets.find((a) => a.type === 'image')

  return {
    nanoId: stop.nanoId,
    title: title || 'Untitled',
    audioUrl: audioAsset ? getAssetUrl(audioAsset.storagePath) : null,
    coverImageUrl: imageAsset ? getAssetImageUrl(imageAsset) : null,
    duration: audioAsset?.duration ?? undefined,
  }
}

/**
 * Converts an array of StopWithAssets to PlayerStops.
 */
export function toPlayerStops(stops: StopWithAssets[], locale: string): PlayerStop[] {
  return stops.map((stop) => toPlayerStop(stop, locale))
}
