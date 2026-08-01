export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  scope: string;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export function buildLogEntry(
  level: LogLevel,
  scope: string,
  message: string,
  context?: Record<string, unknown>,
): LogEntry {
  return {
    level,
    scope,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? { context } : {}),
  };
}

/** Logger estruturado (JSON) reutilizado por todas as camadas. */
export function createLogger(scope: string) {
  const emit = (level: LogLevel, message: string, context?: Record<string, unknown>) => {
    const entry = buildLogEntry(level, scope, message, context);
    const line = JSON.stringify(entry);
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
    return entry;
  };

  return {
    debug: (m: string, c?: Record<string, unknown>) => emit("debug", m, c),
    info: (m: string, c?: Record<string, unknown>) => emit("info", m, c),
    warn: (m: string, c?: Record<string, unknown>) => emit("warn", m, c),
    error: (m: string, c?: Record<string, unknown>) => emit("error", m, c),
  };
}

export type Logger = ReturnType<typeof createLogger>;
