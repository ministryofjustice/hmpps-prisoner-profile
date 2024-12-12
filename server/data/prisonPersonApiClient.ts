import { Readable } from 'stream'
import config from '../config'
import {
  FieldHistory,
  PrisonPerson,
  PrisonPersonApiClient,
  PrisonPersonDistinguishingMark,
  PrisonPersonDistinguishingMarkRequest,
  PrisonPersonHealthUpdate,
  PrisonPersonPhysicalAttributes,
  PrisonPersonPhysicalAttributesUpdate,
  ReferenceDataCode,
  ReferenceDataDomain,
} from './interfaces/prisonPersonApi/prisonPersonApiClient'
import RestClient from './restClient'
import { mapToQueryString } from '../utils/utils'
import MulterFile from '../controllers/interfaces/MulterFile'

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
    physicalAttributes: Partial<PrisonPersonPhysicalAttributesUpdate>,
  ): Promise<PrisonPersonPhysicalAttributes> {
    return this.restClient.patch<PrisonPersonPhysicalAttributes>({
      path: `/prisoners/${prisonerNumber}/physical-attributes`,
      data: physicalAttributes,
    })
  }

  /* Reference Data Domain and Code endpoints */
  async getReferenceDataDomains(
    includeInactive?: boolean,
    includeSubDomains?: boolean,
  ): Promise<ReferenceDataDomain[]> {
    return this.restClient.get<ReferenceDataDomain[]>({
      path: `/reference-data/domains`,
      query: mapToQueryString({ includeInactive, includeSubDomains }),
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

  async updateHealth(prisonerNumber: string, healthData: Partial<PrisonPersonHealthUpdate>): Promise<PrisonPerson> {
    return this.restClient.patch<PrisonPerson>({
      path: `/prisoners/${prisonerNumber}/health`,
      data: healthData,
    })
  }

  async getFieldHistory(prisonerNumber: string, field: string): Promise<FieldHistory[]> {
    return this.restClient.get<FieldHistory[]>({ path: `/prisoners/${prisonerNumber}/field-history/${field}` })
  }

  async getDistinguishingMarks(prisonerNumber: string): Promise<PrisonPersonDistinguishingMark[]> {
    return this.restClient.get<PrisonPersonDistinguishingMark[]>({
      path: `/distinguishing-marks/prisoner/${prisonerNumber}`,
    })
  }

  postDistinguishingMark(
    distinguishingMarkRequest: PrisonPersonDistinguishingMarkRequest,
    photograph: MulterFile,
  ): Promise<PrisonPersonDistinguishingMark> {
    return this.restClient.postMultipart<PrisonPersonDistinguishingMark>({
      path: '/distinguishing-marks/mark',
      data: distinguishingMarkRequest,
      file: photograph,
    })
  }

  async getDistinguishingMark(markId: string): Promise<PrisonPersonDistinguishingMark> {
    return this.restClient.get<PrisonPersonDistinguishingMark>({
      path: `/distinguishing-marks/mark/${markId}`,
    })
  }

  async getImage(imageId: string): Promise<Readable> {
    return this.restClient.stream({
      path: `/photographs/${imageId}/file`,
    })
  }
}
