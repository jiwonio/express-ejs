// middleware/routerLoader.js

import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';
import { logger } from '#utils/logger';

// Route registration function is isolated into a separate module
const registerRoute = async (app, fullPath, cleanRoute) => {
  try {
    const routeModule = await import(pathToFileURL(fullPath).href);
    const routeHandler = routeModule.default || routeModule.router;

    if (routeHandler) {
      app.use(cleanRoute, routeHandler);
      logger.info(`🚀 Route registered: ${cleanRoute} (${fullPath})`);
    } else {
      logger.warn(`⚠️ No router found in ${fullPath}. Make sure to use a default export or a named 'router' export.`);
    }
  } catch (err) {
    logger.error(`❌ Error loading route ${fullPath}: ${err.message}`);
  }
};

// Higher-order function expressed as an arrow function
const routerLoader = (controllerPath) => async (app) => {
  const collectPromises = (dir, baseRoute = '') => {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((dirent) => {
      const fullPath = path.join(dir, dirent.name);
      if (dirent.isDirectory()) {
        // Recursively collect Promises from subdirectories.
        return collectPromises(fullPath, `${baseRoute}/${dirent.name}`);
      }
      if (dirent.name.endsWith('.js')) {
        const routeName = path.basename(dirent.name, '.js');
        const route = routeName === 'index' ? baseRoute : `${baseRoute}/${routeName}`;
        const cleanRoute = route.replace(/\/+/g, '/').replace(/^\/$/, '') || '/';
        // Returns a Promise to be added to the array
        return registerRoute(app, fullPath, cleanRoute);
      }
      return []; // Non-matching files return an empty array to be filtered out by flatMap
    });
  };

  // Wait for all collected Promises to complete.
  await Promise.all(collectPromises(controllerPath));
  return app;
};

export default routerLoader;