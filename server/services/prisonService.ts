import logger from '../../logger'
import PrisonRegisterStore from '../data/prisonRegisterStore/prisonRegisterStore'
import PrisonRegisterApiClient from '../data/interfaces/prisonRegisterApi/PrisonRegisterApiClient'
import { PrisonDto } from '../data/interfaces/prisonRegisterApi/prisonRegisterApiTypes'
import { Prison } from './interfaces/prisonService/PrisonServicePrisons'
import toPrison from './mappers/prisonMapper'
import { RestClientBuilder } from '../data'

const PRISON_CACHE_TTL_DAYS = 1

/**
 * Service class to retrieve and cache prisons from the `prison-register` API.
 */
export default class PrisonService {
  constructor(
    private readonly prisonRegisterStore: PrisonRegisterStore,
    private readonly prisonRegisterClientBuilder: RestClientBuilder<PrisonRegisterApiClient>,
  ) {}

  /**
   * Returns a [Prison] identified by the specified `prisonId`
   */
  async getPrisonByPrisonId(prisonId: string, token: string): Promise<Prison> {
    try {
      const prisonResponse = await this.getPrison(prisonId, token)

      if (prisonResponse) {
        return toPrison(prisonResponse)
      }

      logger.info(`Could not find details for prison ${prisonId}`)
      return { prisonId, prisonName: undefined }
    } catch (e) {
      logger.error(`Error looking up prison ${prisonId}`, e)
      return { prisonId, prisonName: undefined }
    }
  }

  /**
   * Returns the [PrisonResponse] identified by the specified `prisonId`
   * Return the object from the cache if it exists in the cache, else seed the cache by calling the API and return the
   * specified [PrisonResponse]
   */
  private async getPrison(prisonId: string, token: string): Promise<PrisonDto> {
    return (
      // return prison from the cache
      (await this.getCachedPrison(prisonId)) ||
      (async () => {
        // or retrieve prisons from the API and cache them before returning the one we are looking for
        const allPrisonResponses = await this.retrieveAndCacheActivePrisons(token)
        return allPrisonResponses.find(prisonResponse => prisonResponse.prisonId === prisonId)
      })()
    )
  }

  private async getCachedPrison(prisonId: string): Promise<PrisonDto> {
    try {
      const allActivePrisons = await this.prisonRegisterStore.getActivePrisons()
      const cachedPrison = allActivePrisons.find(prisonResponse => prisonResponse.prisonId === prisonId)
      if (cachedPrison) {
        return cachedPrison
      }
      logger.debug(`Prison ${prisonId} not found in cache`)
    } catch (ex) {
      // Looking up the prisons from the cached data store failed for some reason. Return undefined.
      logger.error('Error retrieving cached prisons', ex)
    }
    return undefined
  }

  /**
   * Calls the prison-register API to retrieve all prisons, then caches just the active ones in the cache.
   * Returns an array of active prisons that were cached.
   */
  private async retrieveAndCacheActivePrisons(token: string): Promise<Array<PrisonDto>> {
    logger.info('Retrieving and caching active prisons')
    let allPrisonResponses: Array<PrisonDto>
    try {
      allPrisonResponses = (await this.prisonRegisterClientBuilder(token).getAllPrisons()) || []
    } catch (ex) {
      // Retrieving prisons from the API failed. Return an empty array.
      logger.error('Error retrieving prisons', ex)
      return []
    }

    const activePrisons = allPrisonResponses.filter(prison => prison.active === true)
    try {
      await this.prisonRegisterStore.setActivePrisons(activePrisons, PRISON_CACHE_TTL_DAYS)
    } catch (ex) {
      // Caching prisons retrieved from the API failed. Log a warning but return the prisons anyway. Next time the service is called the caching will be retried.
      logger.warn('Error caching prisons', ex)
    }
    return activePrisons
  }
}
