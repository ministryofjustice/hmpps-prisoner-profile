import { createClient } from 'redis'

import logger from '../../../logger'
import config from '../../config'

export type RedisClient = ReturnType<typeof createClient>

const url =
  config.redis.tls_enabled === 'true'
    ? `rediss://${config.redis.host}:${config.redis.port}`
    : `redis://${config.redis.host}:${config.redis.port}`

export const createRedisClient = (prefix?: string): RedisClient => {
  const clientOptions = {
    url,
    password: config.redis.password,
    socket: {
      reconnectStrategy: (attempts: number) => {
        // Exponential back off: 20ms, 40ms, 80ms..., capped to retry every 30 seconds
        const nextDelay = Math.min(2 ** attempts * 20, 30000)
        logger.info(`Retry Redis connection attempt: ${attempts}, next attempt in: ${nextDelay}ms`)
        return nextDelay
      },
    },
    prefix,
  }
  const client = createClient(clientOptions)

  client.on('error', (e: Error) => logger.error('Redis client error', e))

  return client
}
