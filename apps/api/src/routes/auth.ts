import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { UserRepository } from '@botforge/infrastructure';
import { sign } from 'hono/jwt';
import crypto from 'crypto';

export const authRoutes = new OpenAPIHono();
const userRepo = new UserRepository();

const hasher = (pwd: string) => crypto.createHash('sha256').update(pwd).digest('hex');

const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({ email: z.string().email(), password: z.string() })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Login successful',
      content: { 'application/json': { schema: z.object({ token: z.string() }) } }
    },
    401: { description: 'Unauthorized' }
  }
});

authRoutes.openapi(loginRoute, async (c) => {
  const { email, password } = c.req.valid('json');
  const user = await userRepo.findByEmail(email);
  
  if (!user || user.passwordHash !== hasher(password)) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24hs
  };

  const secret = process.env.JWT_SECRET || 'super-secret-sprint-01-key-change-me';
  const token = await sign(payload, secret);
  
  return c.json({ token }, 200);
});
