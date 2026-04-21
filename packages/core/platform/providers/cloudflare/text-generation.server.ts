import { env } from 'cloudflare:workers'
import type { GenerateTextInput, TextGenerationProvider } from '../../ai/text-generation'

type AiBinding = {
  run: (model: string, inputs: unknown) => Promise<unknown>
}

function getAiBinding(): AiBinding {
  const ai = (env as unknown as { AI?: AiBinding }).AI
  if (!ai) {
    throw new Error('Workers AI binding is unavailable')
  }

  return ai
}

function toCloudflareResponseFormat(
  input: GenerateTextInput,
): { type: 'json_object' } | { type: 'json_schema'; json_schema: unknown } | undefined {
  if (!input.responseFormat) {
    return undefined
  }

  if (input.responseFormat.type === 'json_object') {
    return { type: 'json_object' }
  }

  return {
    type: 'json_schema',
    json_schema: input.responseFormat.jsonSchema,
  }
}

function toCloudflareMessages(messages: GenerateTextInput['messages']) {
  return messages.map((message) => ({
    role: message.role,
    content:
      typeof message.content === 'string'
        ? message.content
        : message.content.map((part) =>
            part.type === 'text'
              ? {
                  type: 'text',
                  text: part.text,
                }
              : {
                  type: 'image_url',
                  image_url: { url: part.url },
                },
          ),
  }))
}

function extractTextResponse(response: unknown): string {
  if (typeof response === 'string') {
    return response.trim()
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    'response' in response &&
    typeof response.response === 'string'
  ) {
    return response.response.trim()
  }

  return ''
}

export function getCloudflareTextGenerationProvider(): TextGenerationProvider {
  return {
    async generateText(input: GenerateTextInput): Promise<string> {
      const ai = getAiBinding()
      const response = await ai.run(input.model, {
        messages: toCloudflareMessages(input.messages),
        max_tokens: input.maxTokens,
        temperature: input.temperature,
        response_format: toCloudflareResponseFormat(input),
      })

      return extractTextResponse(response)
    },
  }
}
