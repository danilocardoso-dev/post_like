import Redis from 'ioredis'

export const redisConnectionOptions = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
}

const redis = new Redis(redisConnectionOptions)

redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message)
})

const DEFAULT_TTL = 60

export async function getCache<T>(key: string): Promise<T | null> {
  const value = await redis.get(key)
  return value ? (JSON.parse(value) as T) : null
}

export async function setCache(key: string, value: unknown, ttl = DEFAULT_TTL): Promise<void> {
  await redis.set(key, JSON.stringify(value), 'EX', ttl)
}

export async function invalidateCache(...keys: string[]): Promise<void> {
  if (keys.length > 0) await redis.del(...keys)
}

export default redis
