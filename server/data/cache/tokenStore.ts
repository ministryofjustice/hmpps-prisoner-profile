import { createRedisClient, RedisClient } from './redisClient'
import RedisStore from './redisStore'

export default class TokenStore extends RedisStore {
  constructor(redisClient: RedisClient = createRedisClient('systemToken:')) {
    super(redisClient)
  }

  public async setToken(key: string, token: string, durationSeconds: number): Promise<string> {
    return this.setEntry(key, token, durationSeconds)
  }

  public async getToken(key: string): Promise<string> {
    return this.getEntry(key)
  }
}
