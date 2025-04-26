export type LoggerMetadata = { [field: string]: any }

export type Logger = {
  /**
   * Creates a new logger instance that adds given metadata to each log entry.
   */
  child: (metadata?: LoggerMetadata) => Logger

  defaultMeta: LoggerMetadata

  info: (message?: any, ...optionalParams: any[]) => void
  warn: (message?: any, ...optionalParams: any[]) => void
  debug: (message?: any, ...optionalParams: any[]) => void
  error: (message?: any, ...optionalParams: any[]) => void
}

export const createLogger = (name: string): Logger => {
  const logger = console

  const child = (metadata: LoggerMetadata = {}) => {
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
