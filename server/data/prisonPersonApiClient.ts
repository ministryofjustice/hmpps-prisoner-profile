import config from '../config'
import {
  PrisonPerson,
  PrisonPersonApiClient,
  PrisonPersonPhysicalAttributes,
  ReferenceDataCode,
  ReferenceDataDomain,
} from './interfaces/prisonPersonApi/prisonPersonApiClient'
import RestClient from './restClient'
import { mapToQueryString } from '../utils/utils'

export default class PrisonPersonApiRestClient implements PrisonPersonApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison Person API', config.apis.prisonPersonApi, token)
  }

  async getPrisonPerson(prisonerNumber: string): Promise<PrisonPerson> {
    return this.restClient.get<PrisonPerson>({ path: `/prisoners/${prisonerNumber}`, ignore404: true })
  }

  /* PATCH endpoint for updating one or more physical attributes */
  async updatePhysicalAttributes(
    prisonerNumber: string,
    physicalAttributes: Partial<PrisonPersonPhysicalAttributes>,
  ): Promise<PrisonPersonPhysicalAttributes> {
    return this.restClient.patch<PrisonPersonPhysicalAttributes>({
      path: `/prisoners/${prisonerNumber}/physical-attributes`,
      data: physicalAttributes,
    })
  }

  /* Reference Data Domain and Code endpoints */
  async getReferenceDataDomains(includeInactive?: boolean): Promise<ReferenceDataDomain[]> {
    return this.restClient.get<ReferenceDataDomain[]>({
      path: `/reference-data/domains`,
      query: mapToQueryString({ includeInactive }),
    })
  }

  async getReferenceDataDomain(domain: string): Promise<ReferenceDataDomain> {
    return this.restClient.get<ReferenceDataDomain>({ path: `/reference-data/domains/${domain}` })
  }

  async getReferenceDataCodes(domain: string, includeInactive = false): Promise<ReferenceDataCode[]> {
    return this.restClient.get<ReferenceDataCode[]>({
      path: `/reference-data/domains/${domain}/codes`,
      query: mapToQueryString({ includeInactive }),
    })
  }

  async getReferenceDataCode(domain: string, code: string): Promise<ReferenceDataCode> {
    return this.restClient.get<ReferenceDataCode>({ path: `/reference-data/domains/${domain}/codes/${code}` })
  }
}
