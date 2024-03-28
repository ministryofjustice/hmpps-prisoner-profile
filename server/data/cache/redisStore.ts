import logger from '../../../logger'
import { RedisClient } from './redisClient'

export default abstract class RedisStore {
  protected constructor(private readonly redisClient: RedisClient) {
    redisClient.on('error', error => {
      logger.error(error, `Redis error`)
    })
  }

  protected async setEntry(key: string, value: string, durationSeconds: number): Promise<string> {
    await this.ensureConnected()
    return this.redisClient.set(key, value, { EX: durationSeconds })
  }

  protected async getEntry(key: string): Promise<string> {
    await this.ensureConnected()
    return this.redisClient.get(key)
  }

  protected async deleteEntry(key: string): Promise<number> {
    await this.ensureConnected()
    return this.redisClient.del(key)
  }

  private async ensureConnected(): Promise<void> {
    if (!this.redisClient.isOpen) {
      await this.redisClient.connect()
    }
  }
}
