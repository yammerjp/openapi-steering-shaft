import * as Iron from 'iron-webcrypto'
import type { Context, Next } from 'hono'
import { deleteCookie, setCookie, getCookie } from 'hono/cookie'

import env from '../util/env.js'

import crypto from 'crypto'

const encrypt = async (data: unknown, secret: string) => {
    return Iron.seal(crypto, data, secret, Iron.defaults)
}

const decrypt = async (encryptedData: string, secret: string) => {
    return Iron.unseal(crypto, encryptedData, secret, Iron.defaults)
}

class CookieStoredSession{
    context: Context
    secret: string
    cookieName: string

    data: Record<string, string>

    constructor(context: Context, secret: string, cookieName: string = 'session'){
        this.context = context
        this.secret = secret
        this.cookieName = cookieName
        this.data = {}
    }

    set(key: string, value: string){
        this.data[key] = value
    }

    get(key: string){
        return this.data[key]
    }

    async saveToCookie(){
        const encrypted = await encrypt(JSON.stringify(this.data), this.secret)
        setCookie(this.context, this.cookieName, encrypted)
    }

    async deleteFromCookie(){
        deleteCookie(this.context, this.cookieName)
    }

    async loadFromCookie(){
        const encrypted = await getCookie(this.context, this.cookieName)
        if (!encrypted) {
            return
        }
        const decrypted = await decrypt(encrypted, this.secret)
        if (!decrypted) {
            return
        }
        if (typeof decrypted !== 'object') {
            return
        }
        const data: Record<string, string> = {}
        for (const [key, value] of Object.entries(decrypted)) {
            if (typeof key !== 'string' || typeof value !== 'string') {
                return;
            }
            data[key] = value
        }
        this.data = data
    }
}

export const CookieStoredSessionMiddleware = async (c: Context, next: Next) => {
    const cookieStoredSession = new CookieStoredSession(c, env(c).COOKIE_ENCRYPTION_KEY)
    c.set('cookieStoredSession', cookieStoredSession)
    await next()
    await cookieStoredSession.saveToCookie()
}
