const noopLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  extend: () => noopLogger,
};

export const consoleTransport = () => {};

export const logger = {
  createLogger: () => ({
    ...noopLogger,
    extend: () => noopLogger,
  }),
};

export type LoggerInstance<T extends string> = typeof noopLogger;
