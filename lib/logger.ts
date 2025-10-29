/**
 * Structured Logging System
 *
 * AMÉLIORATION: Monitoring & Logging
 * Remplace console.error par un système de logging structuré
 * Compatible avec Sentry, Datadog, CloudWatch, etc.
 */

// ============================================
// TYPES
// ============================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export type LogContext = {
  userId?: string
  artistId?: string
  eventId?: string
  ticketId?: string
  transactionId?: string
  requestId?: string
  ipAddress?: string
  userAgent?: string
  [key: string]: any
}

export type LogEntry = {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

// ============================================
// LOGGER CLASS
// ============================================

class Logger {
  private minLevel: LogLevel
  private enableConsole: boolean

  constructor() {
    this.minLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'
    this.enableConsole = process.env.NODE_ENV !== 'test'
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal']
    return levels.indexOf(level) >= levels.indexOf(this.minLevel)
  }

  private formatEntry(entry: LogEntry): string {
    // JSON format for production (easy to parse by log aggregators)
    if (process.env.NODE_ENV === 'production') {
      return JSON.stringify(entry)
    }

    // Pretty format for development
    const emoji = {
      debug: '🐛',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      fatal: '💀',
    }[entry.level]

    let output = `${emoji} [${entry.level.toUpperCase()}] ${entry.message}`

    if (entry.context && Object.keys(entry.context).length > 0) {
      output += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.name}: ${entry.error.message}`
      if (entry.error.stack) {
        output += `\n  Stack: ${entry.error.stack}`
      }
    }

    return output
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (!this.shouldLog(level)) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }

    const formatted = this.formatEntry(entry)

    // Console output
    if (this.enableConsole) {
      const consoleFn = {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
        fatal: console.error,
      }[level]

      consoleFn(formatted)
    }

    // TODO: Send to external logging service (Sentry, Datadog, etc.)
    this.sendToExternalService(entry)
  }

  private sendToExternalService(entry: LogEntry) {
    // This can be extended to send logs to:
    // - Sentry (for errors)
    // - Datadog (for all logs)
    // - CloudWatch (for AWS deployments)
    // - Custom logging endpoint

    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement external logging
      // Example: Sentry.captureException(entry.error)
    }
  }

  // ============================================
  // PUBLIC API
  // ============================================

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, context, error)
  }

  fatal(message: string, error?: Error, context?: LogContext) {
    this.log('fatal', message, context, error)
  }

  // ============================================
  // SPECIALIZED LOGGING METHODS
  // ============================================

  /**
   * Log API request
   */
  apiRequest(method: string, path: string, context?: LogContext) {
    this.info(`API Request: ${method} ${path}`, {
      ...context,
      method,
      path,
    })
  }

  /**
   * Log API response
   */
  apiResponse(
    method: string,
    path: string,
    status: number,
    duration: number,
    context?: LogContext
  ) {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
    this.log(level, `API Response: ${method} ${path} - ${status} (${duration}ms)`, {
      ...context,
      method,
      path,
      status,
      duration,
    })
  }

  /**
   * Log payment event
   */
  payment(event: string, amount: number, context?: LogContext) {
    this.info(`Payment: ${event}`, {
      ...context,
      event,
      amount,
    })
  }

  /**
   * Log webhook event
   */
  webhook(provider: string, eventType: string, eventId: string, context?: LogContext) {
    this.info(`Webhook: ${provider} - ${eventType}`, {
      ...context,
      provider,
      eventType,
      eventId,
    })
  }

  /**
   * Log database query (for debugging)
   */
  dbQuery(query: string, duration: number, context?: LogContext) {
    if (duration > 1000) {
      this.warn(`Slow DB Query (${duration}ms)`, {
        ...context,
        query,
        duration,
      })
    } else {
      this.debug(`DB Query (${duration}ms)`, {
        ...context,
        query,
        duration,
      })
    }
  }

  /**
   * Log cache event
   */
  cache(action: 'hit' | 'miss' | 'set' | 'invalidate', key: string, context?: LogContext) {
    this.debug(`Cache ${action}: ${key}`, {
      ...context,
      action,
      key,
    })
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const logger = new Logger()

// ============================================
// REQUEST CONTEXT HELPERS
// ============================================

/**
 * Extracts logging context from a Next.js request
 */
export function getRequestContext(request: Request): LogContext {
  return {
    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    requestId: request.headers.get('x-request-id') || crypto.randomUUID(),
  }
}

/**
 * Creates a performance tracker for timing operations
 */
export function createPerformanceTracker(name: string) {
  const start = Date.now()

  return {
    end: (context?: LogContext) => {
      const duration = Date.now() - start
      if (duration > 3000) {
        logger.warn(`Slow operation: ${name} (${duration}ms)`, {
          ...context,
          duration,
          operation: name,
        })
      } else {
        logger.debug(`Operation: ${name} (${duration}ms)`, {
          ...context,
          duration,
          operation: name,
        })
      }
      return duration
    },
  }
}
