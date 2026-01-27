import type en from './messages/en.json'

type Messages = typeof en

declare module 'use-intl' {
  interface AppConfig {
    Messages: Messages
  }
}
