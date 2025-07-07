// middleware/loader.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const { logger } = require('../modules/logger');

// Route registration function is isolated into a separate module
const registerRoute = (app, fullPath, cleanRoute) => {
    try {
        const routeModule = require(fullPath);
        if (routeModule.router) {
            app.use(cleanRoute, routeModule.router);
        } else if (typeof routeModule === 'function' || routeModule instanceof express.Router) {
            app.use(cleanRoute, routeModule);
        }
        logger.info(`🚀 Route registered: ${cleanRoute} (${fullPath})`);
    } catch (err) {
        logger.error(`❌ Error loading route ${fullPath}:`, err.message);
    }
};

// Higher-order function expressed as an arrow function
const routerLoader = (controllerPath) => (app) => {
    const processDirectory = (dir, baseRoute = '') => {
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);

            if (fs.statSync(fullPath).isDirectory()) {
                processDirectory(fullPath, `${baseRoute}/${file}`);
                return;
            }

            if (!file.endsWith('.js')) return;

            const route = file === 'index.js' ? baseRoute : `${baseRoute}/${path.basename(file, '.js')}`;
            const cleanRoute = route.replace(/\/+/g, '/').replace(/^\/$/, '') || '/';

            registerRoute(app, fullPath, cleanRoute);
        });
    };

    processDirectory(controllerPath);
    return app;
};

module.exports = routerLoader;