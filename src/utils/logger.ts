import winston from 'winston';
import { config } from '../config/index.js';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const customFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  customFormat
);

const prodFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: config.logging.level,
  format: config.server.isProduction ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    ...(config.server.isProduction
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});

export default logger;
