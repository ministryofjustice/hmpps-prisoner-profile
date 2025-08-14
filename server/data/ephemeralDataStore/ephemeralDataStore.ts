import { randomUUID, UUID } from 'node:crypto'
import type { RedisClient } from '../redisClient'

import logger from '../../../logger'

export interface EphemeralDataStoreResponse<T> {
  key: UUID
  value: T
}

export class EphemeralDataStore {
  constructor(private readonly client: RedisClient) {
    client.on('error', error => {
      logger.error(error, `Redis error - Failed to create EphemeralDataStore`)
    })
  }

  async cacheData<T>(value: T, ttlMinutes: number): Promise<UUID> {
    const key = randomUUID()
    await this.ensureConnected()
    await this.client.set(`ephemeral:${key}`, JSON.stringify(value), {
      EX: ttlMinutes * 60,
    })
    return key
  }

  async getData<T>(key: UUID): Promise<EphemeralDataStoreResponse<T>> {
    await this.ensureConnected()
    const data = (await this.client.get(`ephemeral:${key}`))?.toString()
    return data && { key, value: JSON.parse(data) }
  }

  async removeData(key: UUID): Promise<void> {
    await this.ensureConnected()
    this.client.del(`ephemeral:${key}`)
  }

  private async ensureConnected() {
    if (!this.client.isOpen) {
      await this.client.connect()
    }
  }
}
