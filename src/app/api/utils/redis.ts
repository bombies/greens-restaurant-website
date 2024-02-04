import Redis, {RedisOptions} from "ioredis";

const redisOptions: RedisOptions = {
    host: process.env.REDIS_HOSTNAME!,
    port: parseInt(process.env.REDIS_PORT!),
    password: process.env.REDIS_PASSWORD!
}

const redis = new Redis(redisOptions)
export default redis