import { RestClientBuilder } from '../data'
import MetricsService from './metrics/metricsService'
import {
  AddIdentifierRequestDto,
  PersonIntegrationApiClient,
  UpdateIdentifierRequestDto,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { PrisonUser } from '../interfaces/HmppsUser'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'

export default class IdentityNumbersService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly personIntegrationApiClientBuilder: RestClientBuilder<PersonIntegrationApiClient>,
    private readonly metricsService: MetricsService,
  ) {}

  async getIdentityNumbers(clientToken: string, prisonerNumber: string) {
    const prisonApiClient = this.prisonApiClientBuilder(clientToken)
    return prisonApiClient.getIdentifiers(prisonerNumber, true)
  }

  async getIdentityNumber(clientToken: string, offenderId: number, seqId: number) {
    const prisonApiClient = this.prisonApiClientBuilder(clientToken)
    return prisonApiClient.getIdentifier(offenderId, seqId)
  }

  async updateIdentityNumber(
    clientToken: string,
    user: PrisonUser,
    prisonerNumber: string,
    offenderId: number,
    seqId: number,
    identifier: UpdateIdentifierRequestDto,
  ) {
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)

    const response = await personIntegrationApiClient.updateIdentityNumber(offenderId, seqId, {
      ...identifier,
      value: identifier.value?.toUpperCase(),
    })

    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: ['identity-numbers'],
      prisonerNumber,
      user,
    })

    return response
  }

  async addIdentityNumbers(
    clientToken: string,
    user: PrisonUser,
    prisonerNumber: string,
    identifiers: AddIdentifierRequestDto[],
  ) {
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)

    const response = await personIntegrationApiClient.addIdentityNumbers(
      prisonerNumber,
      identifiers.map(identifier => {
        return {
          ...identifier,
          value: identifier.value?.toUpperCase(),
        }
      }),
    )

    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: ['identity-numbers'],
      prisonerNumber,
      user,
    })

    return response
  }
}
