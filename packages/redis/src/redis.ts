import Redis from "ioredis";

let redis: Redis | undefined;

export const getRedisClient = () => {

    if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined");
}

  if (redis) return redis;

  redis = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    reconnectOnError: (err) => {
      const targetError = "READONLY";
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
  });

  redis.on("connect", () => {
    console.log("🟢 Redis Connected");
  });

  redis.on("error", (err) => {
    console.error("🔴 Redis Error:", err);
  });

  return redis;
};
