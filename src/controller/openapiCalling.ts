import { HTTPException } from 'hono/http-exception'
import type { Context } from 'hono'
import env from '../util/env.js'

export const openapiCallingController = async (c: Context) => {
    const body = await c.req.json()

    if (body.webhookType != "function_calling") {
        throw new HTTPException(400, {
            message: "Invalid webhook type"
        })
    }
    if (body.functionName != "openApiCalling") {
        throw new HTTPException(400, {
            message: "Invalid function name"
        })
    }

    const path = body.path
    const method = body.method
    const parameters = body.parameters

    const baseUrl = env(c).OPENAPI_BASE_URL

    const response = await fetch(`${baseUrl}${path}`, {
        method: method,
        body: JSON.stringify(parameters)
    })
    if (!response.ok) {
        throw new HTTPException(400, {
            message: "Invalid response"
        })
    }
    if (response.status > 299) {
        throw new HTTPException(400, {
            message: "Invalid response"
        })
    }

    const responseBody = await response.json()

    return c.json({response: responseBody})
}
