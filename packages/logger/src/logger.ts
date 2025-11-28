export type LoggerMetadata = { [field: string]: unknown }

export type Logger = {
  child: (metadata?: LoggerMetadata) => Logger
  defaultMeta: LoggerMetadata
  info: (message?: unknown, ...optionalParams: unknown[]) => void
  warn: (message?: unknown, ...optionalParams: unknown[]) => void
  debug: (message?: unknown, ...optionalParams: unknown[]) => void
  error: (message?: unknown, ...optionalParams: unknown[]) => void
}

export const createLogger = (name: string): Logger => {
  const logger = console

  const child = (_metadata: LoggerMetadata = {}) => {
    return createLogger(name)
  }

  return {
    child,
    defaultMeta: {},
    info: logger.info,
    warn: logger.warn,
    debug: logger.debug,
    error: logger.error,
  }
}
