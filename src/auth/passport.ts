import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';

import User from '../db/user.js';

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password', passReqToCallback: false },
    async (email, password, done) => {
      try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
        if (!user || !user.passwordHash) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        return done(null, { id: String(user._id) });
      } catch (err) {
        return done(err as Error);
      }
    },
  ),
);

passport.serializeUser((user: unknown, done) => {
  const u = user as { id: string };
  done(null, u.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id).lean();
    if (!user) return done(null, false);
    done(null, { id: String(user._id), email: user.email, role: user.role, status: user.status, name: user.name ?? null });
  } catch (err) {
    done(err as Error);
  }
});

export default passport;


