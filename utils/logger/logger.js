import 'dotenv/config';
import winston from 'winston';

// Define custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Determine the log level based on the environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define colors for each log level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'cyan',
  debug: 'white',
};

winston.addColors(colors);

/**
 * Combines multiple Winston formatters to create a custom log format.
 * - Adds a timestamp to each log entry in the format 'DD-MM-YYYY HH:mm:ss:ms'.
 * - Applies colorization to all log levels and messages.
 * - Formats the log output as a string containing the timestamp, log level, and message.
 */
const format = winston.format.combine(
  winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

/**
 * An array of Winston transport instances used for logging.
 * 
 * - `File (error.log)`: Logs messages with the level 'error' to the file 'logs/error.log'.
 * - `File (all.log)`: Logs all messages to the file 'logs/all.log'.
 */
const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({ filename: 'logs/all.log' }),
];

/**
 * Creates a logger instance using Winston with the specified configuration.
 * 
 * @property {string} level - The logging level determined by the `level()` function.
 * @property {Object} levels - The custom logging levels.
 * @property {import('winston').format} format - The format configuration for log messages.
 * @property {import('winston').transports[]} transports - The array of transport mechanisms for logging output.
 */
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default logger;
