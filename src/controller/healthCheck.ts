import type { Context } from 'hono'

export const healthCheckController = (c: Context) => {
    return c.json({
        status: "ok"
    })
}
