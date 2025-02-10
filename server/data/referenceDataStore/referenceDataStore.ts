import { RedisClient } from '../redisClient'
import logger from '../../../logger'
import { ReferenceDataCodeDto } from '../interfaces/referenceData'

const REFERENCE_DATA_PREFIX = 'reference_data_'

export default class ReferenceDataStore {
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

  async setReferenceData(domain: string, codes: ReferenceDataCodeDto[], durationHours = 1): Promise<string> {
    await this.ensureConnected()
    return this.client.set(REFERENCE_DATA_PREFIX + domain, JSON.stringify(codes), { EX: durationHours * 60 * 60 })
  }

  async getReferenceData(domain: string): Promise<ReferenceDataCodeDto[]> {
    await this.ensureConnected()
    const serializedReferenceDataCodes = await this.client.get(REFERENCE_DATA_PREFIX + domain)
    return serializedReferenceDataCodes ? (JSON.parse(serializedReferenceDataCodes) as ReferenceDataCodeDto[]) : []
  }
}
