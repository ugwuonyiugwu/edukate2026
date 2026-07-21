import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";
export const generalRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, "10s"),
});

export const strictRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "10s"),
});