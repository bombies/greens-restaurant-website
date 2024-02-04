import {ZodError} from "zod";
import {NextRequest, NextResponse} from "next/server";
import RateLimiter, { RateLimiterGeoLimit } from "./rate-limiter";

export type RouteResponseType<T> = {
    status?: number,
    message?: string,
    headers?: HeadersInit,
    data?: T,
}

class RouteResponse<T> {

    constructor(private readonly data: RouteResponseType<T>) {
    }

    public toNextResponse(): NextResponse<T | null> {
        return NextResponse.json(this.data.data ?? null, {
            status: this.data.status,
            statusText: this.data.message,
            headers: this.data.headers,
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