import { Router } from 'express';
import bcrypt from 'bcryptjs';
import passport from '../auth/passport.js';
import { signAccessToken, requireJwt } from '../auth/jwt.js';
import User from '../db/user.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() }).lean();
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email.toLowerCase().trim(),
      name: name?.trim(),
      passwordHash,
    });

    return res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name ?? null,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    // Basic error shaping
    return res.status(500).json({ message: 'Registration failed' });
  }
});



router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info?.message || 'Unauthorized' });
    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.json({ ok: true });
    });
  })(req, res, next);
});

router.get('/me', (req, res) => {
  if (!req.isAuthenticated?.() || !req.user) return res.status(401).json({ user: null });
  return res.json({ user: req.user });
});

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ ok: true });
  });
});

// JWT login for mobile clients
router.post('/jwt-login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
  if (!user || !user.passwordHash) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signAccessToken({
    sub: String(user._id),
    email: user.email,
    role: user.role,
    status: user.status,
  });

  return res.json({ accessToken: token });
});

// Example JWT-protected endpoint
router.get('/jwt-me', requireJwt, (req, res) => {
  return res.json({ user: (req as any).jwtUser });
});

export default router;