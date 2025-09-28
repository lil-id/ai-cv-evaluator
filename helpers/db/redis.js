import 'dotenv/config';
import IORedis from 'ioredis';
import logger from '../../utils/logger/logger.js';

const connectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
};

const ioredisClient = new IORedis(connectionOptions);

ioredisClient.on('connect', () => {
  logger.info('Connected to Redis via ioredis!');
});

ioredisClient.on('error', (err) => {
  logger.error('IORedis Client Error', err);
});

export default ioredisClient;