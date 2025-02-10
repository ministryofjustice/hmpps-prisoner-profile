import logger from '../../../logger'
import ReferenceDataStore from '../../data/referenceDataStore/referenceDataStore'
import { ReferenceDataCodeDto, ReferenceDataDomain } from '../../data/interfaces/referenceData'
import { ReferenceDataSourceFactory } from './referenceDataSourceFactory'

const REFERENCE_DATA_CACHE_TTL_HOURS = 1

export default class ReferenceDataService {
  constructor(
    private readonly referenceDataStore: ReferenceDataStore,
    private readonly referenceDataSourceFactory: ReferenceDataSourceFactory,
  ) {}

  async getReferenceData(domain: ReferenceDataDomain, code: string, token: string): Promise<ReferenceDataCodeDto> {
    const cachedCode = (await this.referenceDataStore.getReferenceData(domain)).find(c => c.code === code)
    if (cachedCode) return cachedCode
    return (await this.retrieveAndCacheReferenceDataCodes(domain, token)).find(c => c.code === code)
  }

  async getActiveReferenceDataCodes(domain: ReferenceDataDomain, token: string): Promise<ReferenceDataCodeDto[]> {
    const cachedReferenceDataCodes = await this.referenceDataStore.getReferenceData(domain)

    const allReferenceDataCodes = cachedReferenceDataCodes.length
      ? cachedReferenceDataCodes
      : await this.retrieveAndCacheReferenceDataCodes(domain, token)

    return allReferenceDataCodes.filter(c => c.isActive)
  }

  private async retrieveAndCacheReferenceDataCodes(
    domain: ReferenceDataDomain,
    token: string,
  ): Promise<ReferenceDataCodeDto[]> {
    logger.info(`Retrieving and caching reference data codes for domain: ${domain}`)
    const referenceDataSource = this.referenceDataSourceFactory.getReferenceDataSourceFor(domain)
    const referenceData = await referenceDataSource.getActiveReferenceDataCodes(domain, token)
    try {
      await this.referenceDataStore.setReferenceData(domain, referenceData, REFERENCE_DATA_CACHE_TTL_HOURS)
    } catch (ex) {
      logger.warn('Error caching reference data codes', ex)
    }

    return referenceData
  }
}
