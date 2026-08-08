import { consoleTransport, logger, LoggerInstance } from "react-native-logs";

const allLoggerExtensions = [
  "PLAYER",
  "API",
  "QUERY",
  "COVER_ART",
  "SIGN_IN",
  "DOWNLOADS",
] as const;

type LoggerExtention = (typeof allLoggerExtensions)[number];

const enabledLoggerExtensions: LoggerExtention[] = ["API", "QUERY"];

const baseLogger = logger.createLogger({
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  severity: "debug",
  transport: consoleTransport,
  transportOptions: {
    colors: {
      info: "blueBright",
      warn: "yellowBright",
      error: "redBright",
    },
  },
  async: true,
  dateFormat: "time",
  printLevel: true,
  printDate: true,
  fixedExtLvlLength: false,
  enabled: true,
  enabledExtensions: enabledLoggerExtensions,
});

export const appLogger = allLoggerExtensions.reduce(
  (acc, curr) => {
    acc[curr] = baseLogger.extend(curr);
    return acc;
  },
  {} as Record<LoggerExtention, LoggerInstance<"debug" | "error" | "info" | "warn">>,
);
