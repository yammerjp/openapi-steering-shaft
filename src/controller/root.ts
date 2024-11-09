import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'

export const rootController = (_: Context) => {
    throw new HTTPException(404, {message: "Not found"});
}
