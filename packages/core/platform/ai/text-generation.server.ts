import { isLocalRuntime } from '../runtime/runtime-mode.server'
import type { GenerateTextInput } from './text-generation'

async function getTextGenerationProvider() {
  if (isLocalRuntime()) {
    const { getLocalTextGenerationProvider } = await import('../providers/local/text-generation.server')
    return getLocalTextGenerationProvider()
  }

  const { getCloudflareTextGenerationProvider } = await import('../providers/cloudflare/text-generation.server')
  return getCloudflareTextGenerationProvider()
}

export async function generateText(input: GenerateTextInput): Promise<string> {
  const provider = await getTextGenerationProvider()
  return provider.generateText(input)
}
