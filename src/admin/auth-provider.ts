import { DefaultAuthProvider } from 'adminjs';
import bcrypt from 'bcryptjs';

import componentLoader from './component-loader.js';
import User from '../db/user.js';

/**
 * Make sure to modify "authenticate" to be a proper authentication method
 */
const provider = new DefaultAuthProvider({
  componentLoader,
  authenticate: async ({ email, password }) => {
    if (!email || !password) return null;

    const user = await User.findOne({ email: String(email).toLowerCase().trim() })
      .select('+passwordHash')
      .lean();

    if (!user) return null;
    if (user.role !== 'admin' || user.status !== 'active') return null;

    const ok = await bcrypt.compare(String(password), user.passwordHash as string);
    if (!ok) return null;

    return { email: user.email };
  },
});

export default provider;
