import crypto from 'crypto'

import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

import env from '../util/env.js'

function verifyCode(secret: string, payload: ArrayBuffer, code: string): boolean {
    const h = crypto.createHmac('sha256', secret);
    h.update(Buffer.from(payload));
    const calculatedHMAC = h.digest('hex');
    return crypto.timingSafeEqual(Buffer.from(calculatedHMAC, 'hex'), Buffer.from(code, 'hex'));
}

export const hmacVerificationMiddleware = createMiddleware(async (c, next) => {
  const code = c.req.header("X-HMAC") || ""

  const body = await c.req.arrayBuffer();
  const hmacSecret = env(c).HMAC_SECRET
  if (!verifyCode(hmacSecret, body, code)) {
    throw new HTTPException(401, {message: "HMAC verification is failed"});
  }

  await next()
})

