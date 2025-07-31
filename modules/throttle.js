// modules/throttle.js

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
const throttle = ({
  windowMs = 15 * 60 * 1000,
  limit = 100,
  delayAfter = 50,
  delayMs = 500
} = {}) => {
    const keyGenerator = (req) => `${req.method}:${req.path}:${req.ip}`;

    const speed = slowDown({
        windowMs,
        delayAfter,
        delayMs,
        keyGenerator,
        onLimitReached: (req) => {
            logger.warn(`Speed limit reached: ${req.method} ${req.path} from ${req.ip}`);
        }
    });

    const rate = rateLimit({
        windowMs,
        limit,
        keyGenerator,
        handler: (req, res) => {
            logger.warn(`Rate limit exceeded: ${req.method} ${req.path} from ${req.ip}`);
            res.error('Too many requests', 429);
        }
    });

    return [speed, rate];
};

module.exports = throttle;