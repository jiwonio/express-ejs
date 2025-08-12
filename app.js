import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import sessionFileStore from 'session-file-store';
import configurePassport from '#middleware/passport';
import gatekeeper from '#middleware/gatekeeper';
import helmet from 'helmet';
import cors from 'cors';
import accessLogger from '#middleware/accessLogger';
import { logger } from '#utils/logger';
import routerLoader from '#middleware/routerLoader';
import responseHandler from '#middleware/responseHandler';
import compression from 'compression';
import throttler from '#utils/throttler';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const FileStore = sessionFileStore(session);

// 0. view engine setup
app.set('views', path.join(import.meta.dirname, 'views'));
app.set('view engine', 'ejs');

// 1. Compression
app.use(compression());

// 2. Security
app.use(helmet());
app.use(cors());

// 3. Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 4. Session
app.use(session({
  store: new FileStore({
    retries: 0,
    ttl: 12 * 60 * 60, // 12 hours
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 60 * 60 * 1000 * 12, // 12 hours
  }
}));

// 5. Passport & Gatekeeper
configurePassport()(app);
app.use(gatekeeper);

// 6. Logger
app.use(accessLogger);

// 7. Throttler
app.use(throttler());

// 8. Response Handler
app.use(responseHandler());

// 9. Static
app.use(express.static(path.join(import.meta.dirname, 'public'), { extensions: ['html'] }));

// 10. Router
await routerLoader(path.join(import.meta.dirname, 'routes'))(app);

// TODO: - https: nginx
//       - cache
//       - session-redis-store
//       - ORM (Sequelize, Prisma, TypeORM, ...)

// 11. 404 Error
app.use((req, res, next) => {
  logger.error(`404 Not Found: ${req.originalUrl}`);
  next(createError(404));
});

// 12. Error
app.use((err, req, res, next) => {
  logger.error(err?.stack);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (req.accepts('json')) {
    return res.status(status).json({
      success: false,
      message
    });
  }

  res.status(status);
  res.render('error', {
    success: false,
    message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

export default app;