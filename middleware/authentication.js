// middleware/authentication.js
// TODO: check login
const { logger } = require("../modules/logger");

const authentication = (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        return next();
    }

    // public path
    const publicPaths = [
        '/login',
        '/api/auth/login',
        '/api/auth/logout',
        '/stylesheets/',
        '/fonts/',
        '/images/',
        '/javascripts/'
    ];

    // url
    const urlWithoutQuery = req.path.split('?')[0];

    // already login
    if (urlWithoutQuery === '/login' && req.session && req.session.user_id) {
        return res.redirect(`/`);
    }

    // ip
    const ip = req.ip ||
        req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress;

    // allowed ip
    const allowedIps = ['*'];

    // pass
    if (publicPaths.some(path =>
            urlWithoutQuery === '' ||   // /index
            urlWithoutQuery === '/' ||  // /index/
            urlWithoutQuery.startsWith(path)
        ) &&
        allowedIps.includes('*') ||
        allowedIps.includes(ip)) {
        return next();
    }

    // check session
    if (!req.session || !req.session.user_id) {
        logger.warn('No authentication information.');

        // response text
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({
                success: false,
                message: 'No authentication information.'
            });
        }

        // redirect
        return res.redirect(`/login?error=empty_user`);
    }

    next();
};

module.exports = { authentication };