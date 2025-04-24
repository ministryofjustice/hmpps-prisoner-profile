import { RestClientBuilder } from '../data'
import MetricsService from './metrics/metricsService'
import ReferenceDataService from './referenceData/referenceDataService'
import { ReferenceDataCodeDto } from '../data/interfaces/referenceData'
import {
  PersonalRelationshipsApiClient,
  PersonalRelationshipsDomesticStatusDto,
  PersonalRelationshipsDomesticStatusUpdateRequest,
  PersonalRelationshipsReferenceDataDomain,
} from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import { compareStrings } from '../utils/utils'
import { PrisonUser } from '../interfaces/HmppsUser'

const domesticStatusMapping: Record<string, string> = {
  S: 'Single – never married or in a civil partnership',
  C: 'Cohabiting',
  M: 'Married or in a civil partnership',
  D: 'Divorced or dissolved',
  P: 'Separated – married or in a civil partnership but living apart',
  W: 'Widowed or surviving civil partner',
  N: 'Prefer not to say',
}

export default class DomesticStatusService {
  constructor(
    private readonly personalRelationShipsApiClientBuilder: RestClientBuilder<PersonalRelationshipsApiClient>,
    private readonly referenceDataService: ReferenceDataService,
    private readonly metricsService: MetricsService,
  ) {}

  async getDomesticStatus(
    clientToken: string,
    prisonerNumber: string,
  ): Promise<PersonalRelationshipsDomesticStatusDto> {
    const personalRelationShipsApiClient = this.personalRelationShipsApiClientBuilder(clientToken)
    const response = await personalRelationShipsApiClient.getDomesticStatus(prisonerNumber)

    return (
      response && {
        ...response,
        domesticStatusDescription:
          domesticStatusMapping[response?.domesticStatusCode] ?? response.domesticStatusDescription,
      }
    )
  }

  async updateDomesticStatus(
    clientToken: string,
    user: PrisonUser,
    prisonerNumber: string,
    request: PersonalRelationshipsDomesticStatusUpdateRequest,
  ): Promise<PersonalRelationshipsDomesticStatusDto> {
    const personalRelationShipsApiClient = this.personalRelationShipsApiClientBuilder(clientToken)
    const response = await personalRelationShipsApiClient.updateDomesticStatus(prisonerNumber, request)

    this.metricsService.trackPersonalRelationshipsUpdate({
      fieldsUpdated: ['domesticStatus'],
      prisonerNumber,
      user,
    })

    return (
      response && {
        ...response,
        domesticStatusDescription:
          domesticStatusMapping[response?.domesticStatusCode] ?? response.domesticStatusDescription,
      }
    )
  }

  async getReferenceData(clientToken: string): Promise<ReferenceDataCodeDto[]> {
    const referenceData = await this.referenceDataService.getActiveReferenceDataCodes(
      PersonalRelationshipsReferenceDataDomain.DomesticStatus,
      clientToken,
    )

    return referenceData
      .map(item => {
        return {
          ...item,
          description: domesticStatusMapping[item.code] ?? item.description,
        }
      })
      .sort((a, b) => compareStrings(a.description, b.description))
  }
}
