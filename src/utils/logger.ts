import { consoleTransport, logger, LoggerInstance } from "react-native-logs";

const exts = ["PLAYER", "TEST"] as const;

type LoggerExtention = (typeof exts)[number];

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
  enabledExtensions: exts as unknown as string[],
});

export const appLogger = exts.reduce(
  (acc, curr) => {
    acc[curr] = baseLogger.extend(curr);
    return acc;
  },
  {} as Record<LoggerExtention, LoggerInstance<"debug" | "error" | "info" | "warn">>,
);
