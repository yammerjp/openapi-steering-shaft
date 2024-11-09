import { Hono } from 'hono'
import { rootController } from './controller/root.js'
import { healthCheckController } from './controller/healthCheck.js'
import { hmacVerificationMiddleware } from './middleware/hmacVerification.js'
import { openapiCallingController } from './controller/openapiCalling.js'
import { AuthProtectedMiddleware, AuthCallbackController, AuthLogoutController, AuthLoginController, AuthProtectedMeController } from './controller/auth.js'

export const app = new Hono()

import { CookieStoredSessionMiddleware } from './middleware/cookieStoredSession.js'

app.use('/*', CookieStoredSessionMiddleware)
app.get('/', rootController)
app.get('/healthcheck', healthCheckController)
app.post('/openapi-calling', hmacVerificationMiddleware, openapiCallingController)

app.get('/auth/logout', AuthLogoutController)
app.get('/auth/login', AuthLoginController)
app.get('/auth/callback', AuthCallbackController)
app.use('/auth/protected/*', AuthProtectedMiddleware)
app.get('/auth/protected/me', AuthProtectedMeController)
