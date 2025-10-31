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


const port = Number(process.env.PORT) || 3000;

const start = async () => {
  const app = express();
  // app.use(morgan('dev'));
  app.use(express.json());
  // Serve static assets from ../public (for AdminJS custom CSS)
  const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
  const projectRoot = path.resolve(__dirname, '..');
  app.use(express.static(path.join(__dirname, '../public')));
  
  // Initialize database first
  await initializeDb();

  // Use MongoDB session store for production
  app.use(
    session({
      secret: process.env.COOKIE_SECRET as string,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.DATABASE_URL as string,
        ttl: 14 * 24 * 60 * 60, // 14 days
      }),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.json());

  // Test route - available immediately
  app.get('/', (req, res) => {
    res.json({ message: 'Test route is working!', timestamp: new Date().toISOString() });
  });

  // Initialize AdminJS (non-blocking)
  let admin: AdminJS | null = null;
  try {
    // Ensure .adminjs bundle directory exists in multiple possible locations
    // AdminJS may look for bundles relative to source files or project root
    const possibleBundleDirs = [
      path.join(projectRoot, '.adminjs'),
      path.join(projectRoot, 'src', '.adminjs'),
      path.join(__dirname, '.adminjs'),
      path.join(process.cwd(), '.adminjs'),
      path.join(process.cwd(), 'src', '.adminjs'),
    ];
    
    for (const bundleDir of possibleBundleDirs) {
      if (!fs.existsSync(bundleDir)) {
        fs.mkdirSync(bundleDir, { recursive: true });
      }
    }

    admin = new AdminJS(options);

    if (process.env.NODE_ENV === 'production') {
      // In production, initialize AdminJS asynchronously - don't block server startup
      admin.initialize().then(() => {
        console.log('AdminJS initialized successfully');
      }).catch((err) => {
        console.error('Error initializing AdminJS:', err);
      });
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
    // Dashboard API routes (protected)
    app.use('/api/dashboard', dashboardRouter);
  } catch (error) {
    console.error('Error setting up AdminJS:', error);
    // Server still runs even if AdminJS fails
  }

  // Public API routes - available immediately
  app.use('/api/auth', authRouter);
  app.use('/api/products', productRouter);

  // Start server - bind to 0.0.0.0 for Render deployment
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server started on port ${port} (bound to 0.0.0.0)`);
    if (admin) {
      console.log(`AdminJS available at http://0.0.0.0:${port}${admin.options.rootPath}`);
    }
  });

  // Configure server timeouts for Render (prevent 502 errors)
  server.keepAliveTimeout = 120000; // 120 seconds
  server.headersTimeout = 120000; // 120 seconds
};

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
