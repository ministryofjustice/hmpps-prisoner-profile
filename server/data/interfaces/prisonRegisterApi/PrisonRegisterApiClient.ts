import { PrisonDto } from './prisonRegisterApiTypes'

/**
 * Interface defining the REST API operations of the Prison Register API
 */
export default interface PrisonRegisterApiClient {
  getPrisonByPrisonId(prisonId: string): Promise<PrisonDto>
  getAllPrisons(): Promise<Array<PrisonDto>>
}
