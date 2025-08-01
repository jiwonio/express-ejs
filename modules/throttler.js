// modules/throttler.js

const { rateLimit } = require('express-rate-limit');
const { slowDown } = require('express-slow-down');
const { logger } = require('../modules/logger');

/**
 * Request throttling module
 * @param {Object} options
 * @param {number} [options.windowMs=900000] - Time window (default 15 minutes)
 * @param {number} [options.limit=100] - Maximum number of requests
 * @param {number} [options.delayAfter=50] - Number of requests before starting the delay
 * @param {number} [options.delayMs=500] - Request delay time (ms)
 */
const throttler = ({
  windowMs = 15 * 60 * 1000,
  limit = 100,
  delayAfter = 50,
  delayMs = 500
} = {}) => {
    const keyGenerator = (req) => `${req.method}:${req.path}:${req.ip}`;

    const speed = slowDown({
        windowMs,
        delayAfter,
        delayMs: () => delayMs,
        keyGenerator
    });

    const rate = rateLimit({
        windowMs,
        limit,
        keyGenerator,
        handler: (req, res) => {
            const ip = req.ip ||
                req.headers['x-forwarded-for'] ||
                req.headers['x-real-ip'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress;

            logger.warn(`Rate limit exceeded: ${req.method} ${req.path} from ${ip}`);
            res.error('Too many requests', 429);
        }
    });

    return [speed, rate];
};

module.exports = throttler;