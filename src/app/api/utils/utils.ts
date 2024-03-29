import { ZodError } from "zod";
import { NextRequest, NextResponse } from "next/server";
import RateLimiter, { RateLimiterGeoLimit } from "./rate-limiter";

export type ApiRoute<Ctx extends Record<string, string> | unknown = unknown> = (req: NextRequest, context: { params: Ctx }) => Promise<NextResponse>

export type RouteResponseType<T> = {
    status?: number,
    message?: string,
    headers?: HeadersInit,
    data?: T,
}

class RouteResponse<T> {

    constructor(private readonly response: RouteResponseType<T>) {
    }

    public toNextResponse(): NextResponse<T | null> {
        return NextResponse.json(this.response.data ?? null, {
            status: this.response.status,
            statusText: this.response.message,
            headers: this.response.headers,
        })
    }
}

export const buildResponse = <T>(response: RouteResponseType<T>): NextResponse<T | null> => {
    return new RouteResponse(response).toNextResponse()
}

export const buildFailedValidationResponse = <T>(error: ZodError): NextResponse<T | null> => {
    if (!error.message)
        console.error(error.issues)

    return new RouteResponse({
        status: 400,
        message: error.issues.map(issue => issue.message).join(", ") ?? "Something went wrong!",
        data: null
    }).toNextResponse()
}

export type PaginatedResponse<T> = {
    data: T[],
    nextCursor: string | null,
}

type RateLimiterOptions = {
    NAME: string,
    /**
     * The number of requests that can be done within the specified duration
     */
    REQUEST_LIMIT?: number,
    /**
     * The duration, in seconds, to watch for requests.
     */
    DURATION?: number,
    GEO_LIMITS?: RateLimiterGeoLimit[],
    BLOCK_MESSAGE?: string,
}

export const rateLimited = async (req: NextRequest, logic: () => Promise<NextResponse>, options: RateLimiterOptions): Promise<NextResponse> => {
    const rateLimiter = new RateLimiter(options?.NAME, options?.REQUEST_LIMIT, options?.DURATION, options?.GEO_LIMITS, options?.BLOCK_MESSAGE)
    return await rateLimiter.handle(req, logic)
}