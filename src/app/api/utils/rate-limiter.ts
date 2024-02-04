import requestIp, {RequestHeaders} from "request-ip";
import {NextRequest, NextResponse} from "next/server";
import Redis from "ioredis";
import { buildResponse } from "./utils";
import redis from "./redis";

export type RateLimiterLocation = {
    country: string,
    city: string,
}

export type RateLimiterGeoLimit = {
    location: RateLimiterLocation,
    limit: number,
    duration: number,
}

export default class RateLimiter {
    private readonly redisClient: Redis

    constructor(
        private readonly NAME: string,
        private readonly REQUEST_LIMIT = 10,
        private readonly DURATION = 60,
        private readonly GEO_LIMITS: RateLimiterGeoLimit[] = [],
        private readonly BLOCK_MESSAGE = "You are being rate limited!"
    ) {
        this.redisClient = redis
    }

    public async handle(req: NextRequest, work: () => Promise<NextResponse>): Promise<NextResponse> {
        const headers: RequestHeaders = {
            "x-client-ip": req.headers.get("x-client-ip") ?? undefined,
            "x-forwarded-for": req.headers.get("x-forwarded-for") ?? undefined,
            "x-real-ip": req.headers.get("x-real-ip") ?? undefined,
            "x-cluster-client-ip": req.headers.get("x-cluster-client-ip") ?? undefined,
            "x-forwarded": req.headers.get("x-forwarded") ?? undefined,
            "forwarded-for": req.headers.get("forwarded-for") ?? undefined,
            "forwarded": req.headers.get("forwarded") ?? undefined,
        }

        const ipAddr = requestIp.getClientIp({
            ...req,
            headers
        })

        if (!ipAddr)
            return buildResponse({
                status: 403,
                message: "Couldn't fetch your IP address for this rate-limited route!"
            })

        const {country, city} = req.geo ?? {country: undefined, city: undefined}
        const matchingLimit = this.GEO_LIMITS.find((limit) =>
            limit.location.country === country && limit.location.city === city
        )

        const doRateLimitCheck = async (key: string, limitMax: number) => {
            const fullKey = `greensres_${process.env.NODE_ENV}_ratelimit_${this.NAME}:${key}`
            let count = Number(await this.redisClient.get(fullKey) || 0)

            if (count >= limitMax)
                return this.tooManyRequests()

            this.redisClient.incr(fullKey)
            this.redisClient.expire(fullKey, this.DURATION)
            return work()
        }

        if (!matchingLimit)
            return doRateLimitCheck(ipAddr, this.REQUEST_LIMIT)
        else
            return doRateLimitCheck(
                `${country}:${city}:${ipAddr}`,
                matchingLimit.limit
            )
    }

    private tooManyRequests(): NextResponse {
        return NextResponse.json(null, {
            status: 429,
            statusText: this.BLOCK_MESSAGE
        })
    }
}