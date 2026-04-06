import { jwt } from 'hono/jwt';

export const authMiddleware = jwt({
  secret: process.env.JWT_SECRET || 'super-secret-sprint-01-key-change-me',
  alg: 'HS256'
});
