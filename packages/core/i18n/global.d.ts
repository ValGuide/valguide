import type en from './messages/en.json'
import type wwwEn from '../../../apps/www/src/i18n/messages/en.json'

type Messages = typeof en & typeof wwwEn

declare module 'use-intl' {
  interface AppConfig {
    Messages: Messages
  }
}
