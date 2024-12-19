import logger from '../../logger'
import { RestClientBuilder } from '../data'
import ReferenceDataStore from '../data/referenceDataStore/referenceDataStore'
import {
  PersonIntegrationApiClient,
  ReferenceDataCodeDto,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'

const REFERENCE_DATA_CACHE_TTL_HOURS = 1

/**
 * Service class to retrieve and cache reference data from `hmpps-person-integration-api`.
 */
export default class ReferenceDataService {
  constructor(
    private readonly referenceDataStore: ReferenceDataStore,
    private readonly personIntegrationApiClientBuilder: RestClientBuilder<PersonIntegrationApiClient>,
  ) {}

  async getReferenceData(domain: string, code: string, token: string): Promise<ReferenceDataCodeDto> {
    const cachedCode = (await this.referenceDataStore.getReferenceData(domain)).find(c => c.code === code)
    if (cachedCode) return cachedCode

    return (await this.retrieveAndCacheReferenceDataCodes(domain, token)).find(c => c.code === code)
  }

  async getActiveReferenceDataCodes(domain: string, token: string): Promise<ReferenceDataCodeDto[]> {
    const cachedReferenceDataCodes = await this.referenceDataStore.getReferenceData(domain)

    const allReferenceDataCodes = cachedReferenceDataCodes.length
      ? cachedReferenceDataCodes
      : await this.retrieveAndCacheReferenceDataCodes(domain, token)

    return allReferenceDataCodes.filter(c => c.isActive)
  }

  private async retrieveAndCacheReferenceDataCodes(domain: string, token: string): Promise<ReferenceDataCodeDto[]> {
    logger.info(`Retrieving and caching reference data codes for domain: ${domain}`)
    const referenceData = await this.personIntegrationApiClientBuilder(token).getReferenceDataCodes(domain)
    try {
      await this.referenceDataStore.setReferenceData(domain, referenceData, REFERENCE_DATA_CACHE_TTL_HOURS)
    } catch (ex) {
      logger.warn('Error caching reference data codes', ex)
    }

    return referenceData
  }
}
