import { LoggerService } from '@nestjs/common';

/** Minimal structured (JSON-line) logger. */
export class JsonLogger implements LoggerService {
  private write(level: string, message: unknown, context?: string, extra?: unknown) {
    const line = JSON.stringify({
      time: new Date().toISOString(),
      level,
      context,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      ...(extra ? { trace: extra } : {}),
    });
    (level === 'error' ? process.stderr : process.stdout).write(line + '\n');
  }
  log(m: unknown, c?: string) { this.write('info', m, c); }
  error(m: unknown, trace?: string, c?: string) { this.write('error', m, c, trace); }
  warn(m: unknown, c?: string) { this.write('warn', m, c); }
  debug(m: unknown, c?: string) { this.write('debug', m, c); }
  verbose(m: unknown, c?: string) { this.write('verbose', m, c); }
}
