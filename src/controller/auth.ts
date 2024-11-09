import type { Context, Next } from 'hono'
import env from '../util/env.js'

export const AuthLogoutController = async (c: Context) => {
    const cookieStoredSession = c.get('cookieStoredSession')
    await cookieStoredSession.deleteFromCookie()
    // verify csrf token

    return c.redirect('/')
}

export const AuthLoginController = async (c: Context) => {
    const state = crypto.randomUUID()
    const cookieStoredSession = c.get('cookieStoredSession')
    cookieStoredSession.set('oauth2_state', state)

    const url = new URL(env(c).OAUTH2_AUTH_URI)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('client_id', env(c).OAUTH2_CLIENT_ID)
    url.searchParams.set('redirect_uri', env(c).OAUTH2_REDIRECT_URI)
    url.searchParams.set('state', state)
    url.searchParams.set('scope', 'read_products')

    return c.redirect(url.toString())
}

export const AuthCallbackController = async (c: Context) => {
    const code = c.req.query('code')
    const state = c.req.query('state')
    const cookieStoredSession = c.get('cookieStoredSession')
    if (state !== cookieStoredSession.get('oauth2_state')) {
        return c.redirect('/auth/failure')
    }
    const res = await fetch(env(c).OAUTH2_TOKEN_URI, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            grant_type: 'authorization_code',
            code: code,
            client_id: env(c).OAUTH2_CLIENT_ID,
            client_secret: env(c).OAUTH2_CLIENT_SECRET,
            redirect_uri: env(c).OAUTH2_REDIRECT_URI
        })
    })
    const body = await res.json()
    if (body.error) {
        return c.redirect('/auth/failure')
    }

    cookieStoredSession.set('is_authenticated', 'true')
    cookieStoredSession.set('access_token', body.access_token)

    return c.redirect('/auth/protected/me')
}

export const AuthProtectedMiddleware = async (c: Context, next: Next) => {
    const cookieStoredSession = c.get('cookieStoredSession')
    if (cookieStoredSession.get('is_authenticated') !== 'true') {
        return c.redirect('/auth/login')
    }

    return next()
}

export const AuthProtectedMeController = async (c: Context) => {
    const cookieStoredSession = c.get('cookieStoredSession')
    return c.json({
        message: 'Hello, World!',
        access_token: cookieStoredSession.get('access_token')
    })
}
