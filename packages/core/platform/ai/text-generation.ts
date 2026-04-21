export type TextGenerationResponseFormat =
  | {
      type: 'json_object'
    }
  | {
      type: 'json_schema'
      jsonSchema: unknown
    }

export type TextGenerationContentPart =
  | {
      type: 'text'
      text: string
    }
  | {
      type: 'image'
      url: string
    }

export type TextGenerationMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string | TextGenerationContentPart[]
}

export type GenerateTextInput = {
  model: string
  messages: TextGenerationMessage[]
  maxTokens?: number
  temperature?: number
  responseFormat?: TextGenerationResponseFormat
}

export interface TextGenerationProvider {
  generateText(input: GenerateTextInput): Promise<string>
}
