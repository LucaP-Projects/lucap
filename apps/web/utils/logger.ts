import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

// Configure the logger
const logger = pino({
  level: isDev ? 'debug' : 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard'
        }
      }
    : undefined,
  // Add base object to include timestamp in all log records
  base: {
    timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`
  }
});

// Add convenience methods
export const logError = (err: Error, msg?: string) => {
  logger.error({ err, msg: msg || err.message });
};

export default logger;
