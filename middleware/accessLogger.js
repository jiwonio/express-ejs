// middleware/logger.js
const morgan = require('morgan');
const {logger} = require("../modules/logger");
const path = require("path");

// morgan ip token
morgan.token('real-ip', (req) => {
    return req.ip ||
        req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress;
});

// morgan session token
morgan.token('user-id', (req) => {
    return req.session?.user_id || '-';
});

const accessLogger = morgan(':real-ip [:user-id] :method :url :status :response-time ms', {
    stream: { write: message => logger.info(message.trim()) },
    skip: (req, res) => {
        const urlWithoutQuery = req.url.split('?')[0];
        const ext = path.extname(urlWithoutQuery);
        const excludeExt = ['.css', '.js', '.map', '.ico', '.png', '.jpg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.eot'];
        const excludePaths = ['/css/', '/font/', '/images/', '/js/'];

        return excludeExt.includes(ext) || excludePaths.some(path => urlWithoutQuery.includes(path));
    }
});

module.exports = { accessLogger };