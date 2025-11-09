import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import * as url from 'url';
import path from 'path';
import fs from 'fs';
import AdminJS from 'adminjs';
import morgan from 'morgan';
import { buildAuthenticatedRouter } from '@adminjs/express';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import provider from './admin/auth-provider.js';
import options from './admin/options.js';
import initializeDb from './db/index.js';
import passport from './auth/passport.js';
import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import productRouter from './routes/product.js';
import orderRouter from './routes/order.js';
import paymentRouter from './routes/payment.js';

const port = Number(process.env.PORT) || 3000;

const start = async () => {
  const app = express();
  
  const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
  const projectRoot = path.resolve(__dirname, '..');
  
  // Serve static files
  app.use(express.static(path.join(__dirname, '../public')));

  // Initialize database first
  await initializeDb();

  // Stripe webhook route must be registered before express.json() middleware
  // to receive raw body for signature verification (only if webhook secret is configured)
  // if (process.env.STRIPE_WEBHOOK_SECRET) {
  //   app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
  // }

  // JSON parsing middleware for all other routes
  app.use(express.json());

  // Session configuration
  app.use(
    session({
      secret: process.env.COOKIE_SECRET as string,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.DATABASE_URL as string,
        ttl: 14 * 24 * 60 * 60,
      }),
    }),
  );
  
  app.use(passport.initialize());
  app.use(passport.session());

  // Test route
  app.get('/', (req, res) => {
    res.json({ message: 'Test route is working!', timestamp: new Date().toISOString() });
  });

  // Initialize AdminJS with production-safe approach
  let admin: AdminJS | null = null;
  
  try {
    // CRITICAL FIX: Disable bundling in production or ensure bundle exists
    const adminOptions = {
      ...options,
      bundling: {
        enabled: process.env.NODE_ENV === 'development',
      },
    };

    admin = new AdminJS(adminOptions);

    // In production, don't use watch() - rely on pre-built bundle
    if (process.env.NODE_ENV === 'production') {
      console.log('Production mode: Using pre-built AdminJS bundle');
      // This will use the bundle that should be built during npm run build
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
    console.log(`AdminJS routes mounted at ${admin.options.rootPath}`);
  } catch (error) {
    console.error('Error setting up AdminJS:', error);
    // Continue without AdminJS - don't crash the server
  }

  // API routes
  app.use('/api/auth', authRouter);
  app.use('/api/products', productRouter);
  app.use('/api/orders', orderRouter);
  app.use('/api/payment', paymentRouter);
  
  if (admin) {
    app.use('/api/dashboard', dashboardRouter);
  }

  // Start server
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server started on port ${port}`);
    if (admin) {
      console.log(`AdminJS available at http://0.0.0.0:${port}${admin.options.rootPath}`);
    }
  });

  server.keepAliveTimeout = 120000;
  server.headersTimeout = 120000;
};

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});