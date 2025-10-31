import jwt, { type Secret, type SignOptions, JwtPayload as JwtPayloadBase } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = (process.env.JWT_SECRET as Secret);
const JWT_EXPIRES_IN: SignOptions['expiresIn'] = 15 * 60;

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  status: string;
};

export function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as unknown as number };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function requireJwt(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.header('authorization') || req.header('Authorization');
    if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
      return res.status(401).json({ message: 'Missing bearer token' });
    }
    const token = auth.slice(7).trim();
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & JwtPayloadBase;
    // Attach minimal user info for handlers
    (req as any).jwtUser = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      status: decoded.status,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}


