import { RedisClient } from './redisClient'
import { PrisonDto } from './interfaces/prisonRegisterApi/prisonRegisterApiTypes'
import logger from '../../logger'

const ACTIVE_PRISONS = 'activePrisons'

export default class PrisonRegisterStore {
  constructor(private readonly client: RedisClient) {
    client.on('error', error => {
      logger.error(error, `Redis error`)
    })
  }

  private async ensureConnected() {
    if (!this.client.isOpen) {
      await this.client.connect()
    }
  }

  async setActivePrisons(prisons: Array<PrisonDto>, durationDays = 1): Promise<string> {
    await this.ensureConnected()
    const activePrisons = prisons.filter(prison => prison.active === true)
    return this.client.set(ACTIVE_PRISONS, JSON.stringify(activePrisons), { EX: durationDays * 24 * 60 * 60 })
  }

  async getActivePrisons(): Promise<Array<PrisonDto>> {
    await this.ensureConnected()
    const serializedActivePrisons = await this.client.get(ACTIVE_PRISONS)
    return serializedActivePrisons ? (JSON.parse(serializedActivePrisons) as Array<PrisonDto>) : []
  }
}
