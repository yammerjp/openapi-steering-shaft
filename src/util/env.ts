import type { Context } from 'hono'
import { env } from 'hono/adapter'

export default (c: Context) => env<{
    COOKIE_ENCRYPTION_KEY: string
    OAUTH2_CLIENT_ID: string
    OAUTH2_CLIENT_SECRET: string
    OAUTH2_REDIRECT_URI: string
    OAUTH2_SCOPE: string
    OAUTH2_AUTH_URI: string
    OAUTH2_TOKEN_URI: string
    HMAC_SECRET: string
    OPENAPI_BASE_URL: string
}>(c)
