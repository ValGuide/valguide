import type { TextGenerationProvider } from '../../ai/text-generation'

export function getLocalTextGenerationProvider(): TextGenerationProvider {
  return {
    async generateText(): Promise<string> {
      throw new Error('Text generation is unavailable in local runtime')
    },
  }
}
