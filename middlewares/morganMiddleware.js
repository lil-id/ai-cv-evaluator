import 'dotenv/config';
import morgan from 'morgan';
import logger from '../utils/logger/logger.js';

const stream = {
  write: (message) => logger.http(message),
};

const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env !== 'production' && env !== 'development';
};

/**
 * Morgan middleware for logging HTTP requests.
 * Logs requests in 'combined' format to the custom logger.
 * Skips logging in non-production and non-development environments.
 */
const morganMiddleware = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

export default morganMiddleware;
