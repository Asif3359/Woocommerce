import express from 'express';
import * as url from 'url';
import path from 'path';
import AdminJS from 'adminjs';
import morgan from 'morgan';
import { buildAuthenticatedRouter } from '@adminjs/express';

import provider from './admin/auth-provider.js';
import options from './admin/options.js';
import initializeDb from './db/index.js';
import session from 'express-session';
import passport from './auth/passport.js';
import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import productRouter from './routes/product.js';


const port = process.env.PORT || 3000;

const start = async () => {
  const app = express();
  // app.use(morgan('dev'));
  app.use(express.json());
  // Serve static assets from ../public (for AdminJS custom CSS)
  const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
  app.use(express.static(path.join(__dirname, '../public')));
  app.use(
    session({
      secret: process.env.COOKIE_SECRET as string,
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.json());

  await initializeDb();

  // Test route
  app.get('/', (req, res) => {
    res.json({ message: 'Test route is working!', timestamp: new Date().toISOString() });
  });

  const admin = new AdminJS(options);

  if (process.env.NODE_ENV === 'production') {
    await admin.initialize();
  } else {
    admin.watch();
  }

  const router = buildAuthenticatedRouter(
    admin,
    {
      cookiePassword: process.env.COOKIE_SECRET,
      cookieName: 'adminjs',
      provider,
    },
    null,
    {
      secret: process.env.COOKIE_SECRET,
      saveUninitialized: true,
      resave: true,
    },
  );

  app.use(admin.options.rootPath, router);
  // Public API routes
  app.use('/api/auth', authRouter);
  // Dashboard API routes
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/products', productRouter);

  app.listen(port, () => {
    console.log(`AdminJS available at http://localhost:${port}${admin.options.rootPath}`);
  });
};

start();
