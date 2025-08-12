// modules/logger.js

const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');
const path = require('path');
const cluster = require('cluster');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(info => {
    const { timestamp, level, message } = info;
    const workerId = cluster.isWorker ? `worker${cluster.worker.id}` : 'master';
    const splatMessages = (info[Symbol.for('splat')] || [])
      .map(arg => (typeof arg === 'object' && arg !== null) ? JSON.stringify(arg) : arg)
      .join(' ');
    return `${timestamp} [${workerId}] ${level.toUpperCase()}: ${message} ${splatMessages}`.trim();
  })
);

// logger
const logger = winston.createLogger({
  format: logFormat,
  transports: [
    // console logging (for PM2)
    new winston.transports.Console(),

    // normal log setting
    new winstonDaily({
      level: 'info',
      datePattern: 'YYYY-MM-DD',
      dirname: 'logs',
      filename: '%DATE%.log',
      maxFiles: '14d',      // 14 days
      zippedArchive: true   // older files are compressed
    }),

    // error log setting
    new winstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: 'logs',
      filename: '%DATE%.error.log',
      maxFiles: '14d',
      zippedArchive: true
    })
  ]
});

// create logger with file
const createLogger = (folder) => {
  return winston.createLogger({
    format: logFormat,
    transports: [
      new winstonDaily({
        dirname: path.join(process.cwd(), 'logs', folder),
        filename: `${folder}_%DATE%.log`,
        datePattern: 'YYYYMMDD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
      })
    ]
  });
}

module.exports = { logger, createLogger };