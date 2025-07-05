import { appendFileSync } from 'fs'

const LOG_FILE = '/tmp/claude-metadata-browser-perf.log'

type LogContext = Record<string, string | number | boolean | undefined>

interface PerfLogEntry {
  timestamp: string
  action: string
  duration: number
  [key: string]: string | number | boolean | undefined
}

export class PerfLogger {
  private startTimes = new Map<string, bigint>()

  start(label: string): void {
    this.startTimes.set(label, process.hrtime.bigint())
  }

  end(label: string, context: LogContext = {}): void {
    const startTime = this.startTimes.get(label)
    if (!startTime) {
      console.warn(`No start time found for label: ${label}`)
      return
    }

    const endTime = process.hrtime.bigint()
    const durationNs = endTime - startTime
    const durationMs = Number(durationNs) / 1_000_000

    const logEntry: PerfLogEntry = {
      timestamp: new Date().toISOString(),
      action: label,
      duration: Math.round(durationMs * 100) / 100,
      ...context,
    }

    try {
      appendFileSync(LOG_FILE, JSON.stringify(logEntry) + '\n')
    } catch (error) {
      console.error('Failed to write performance log:', error)
    }

    this.startTimes.delete(label)
  }

  async measure<T>(
    label: string,
    fn: () => Promise<T>,
    context: LogContext = {},
  ): Promise<T> {
    this.start(label)
    try {
      const result = await fn()
      this.end(label, context)
      return result
    } catch (error) {
      this.end(label, { ...context, error: true })
      throw error
    }
  }

  measureSync<T>(label: string, fn: () => T, context: LogContext = {}): T {
    this.start(label)
    try {
      const result = fn()
      this.end(label, context)
      return result
    } catch (error) {
      this.end(label, { ...context, error: true })
      throw error
    }
  }
}

export const perfLogger = new PerfLogger()
