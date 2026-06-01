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
