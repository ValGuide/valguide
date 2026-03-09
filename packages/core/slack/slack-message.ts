export type SlackMrkdwnText = {
  type: 'mrkdwn'
  text: string
}

export type SlackPlainText = {
  type: 'plain_text'
  text: string
  emoji?: boolean
}

export type SlackTextObject = SlackMrkdwnText | SlackPlainText

export type SlackButtonElement = {
  type: 'button'
  text: SlackPlainText
  action_id: string
  url?: string
}

export type SlackContextElement =
  | SlackMrkdwnText
  | {
      type: 'image'
      image_url: string
      alt_text: string
    }

export type SlackSectionBlock = {
  type: 'section'
  text?: SlackMrkdwnText
  fields?: SlackMrkdwnText[]
}

export type SlackActionsBlock = {
  type: 'actions'
  elements: SlackButtonElement[]
}

export type SlackDividerBlock = {
  type: 'divider'
}

export type SlackHeaderBlock = {
  type: 'header'
  text: SlackPlainText
}

export type SlackImageBlock = {
  type: 'image'
  image_url: string
  alt_text: string
}

export type SlackContextBlock = {
  type: 'context'
  elements: SlackContextElement[]
}

export type SlackBlock =
  | SlackSectionBlock
  | SlackActionsBlock
  | SlackDividerBlock
  | SlackHeaderBlock
  | SlackImageBlock
  | SlackContextBlock

export type SlackMessage = {
  channel: string
  text: string
  blocks?: SlackBlock[]
}
