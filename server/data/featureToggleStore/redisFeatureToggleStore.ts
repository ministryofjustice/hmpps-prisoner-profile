import type { RedisClient } from '../redisClient'

import logger from '../../../logger'
import FeatureToggleStore from './featureToggleStore'

export default class RedisFeatureToggleStore implements FeatureToggleStore {
  constructor(private readonly client: RedisClient) {
    client.on('error', error => {
      logger.error(error, `Redis error - Failed to create FeatureToggleStore`)
    })
  }

  private async ensureConnected() {
    if (!this.client.isOpen) {
      await this.client.connect()
    }
  }

  public async setToggle(prisonId: string, featureToggle: string, status: boolean, durationHours = 1): Promise<void> {
    await this.ensureConnected()
    await this.client.set(`featureToggle:${prisonId}:${featureToggle}`, JSON.stringify(status), {
      EX: durationHours * 60 * 60,
    })
  }

  public async getToggle(prisonId: string, featureToggle: string): Promise<boolean> {
    await this.ensureConnected()
    const status = (await this.client.get(`featureToggle:${prisonId}:${featureToggle}`))?.toString()

    return status ? JSON.parse(status) : false
  }
}
