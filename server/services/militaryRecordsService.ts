import { RestClientBuilder } from '../data'
import MetricsService from './metrics/metricsService'
import {
  MilitaryRecord,
  PersonIntegrationApiClient,
  ProxyReferenceDataDomain,
  ReferenceDataCodeDto,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import ReferenceDataService from './referenceDataService'
import { PrisonUser } from '../interfaces/HmppsUser'
import BadRequestError from '../utils/badRequestError'

export default class MilitaryRecordsService {
  constructor(
    private readonly personIntegrationApiClientBuilder: RestClientBuilder<PersonIntegrationApiClient>,
    private readonly referenceDataService: ReferenceDataService,
    private readonly metricsService: MetricsService,
  ) {}

  async getMilitaryRecords(clientToken: string, prisonerNumber: string) {
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)
    return personIntegrationApiClient.getMilitaryRecords(prisonerNumber)
  }

  async getReferenceData(
    clientToken: string,
    domains: ProxyReferenceDataDomain[],
  ): Promise<Record<string, ReferenceDataCodeDto[]>> {
    return Object.fromEntries(
      await Promise.all(
        domains.map(async domain => [
          Object.entries(ProxyReferenceDataDomain).find(([_, value]) => value === domain)?.[0] ?? domain, // Get enum key name
          await this.referenceDataService.getActiveReferenceDataCodes(domain, clientToken),
        ]),
      ),
    )
  }

  async updateMilitaryRecord(
    clientToken: string,
    user: PrisonUser,
    prisonerNumber: string,
    militaryRecord: Partial<MilitaryRecord>,
  ) {
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)

    const existingRecord =
      (await personIntegrationApiClient.getMilitaryRecords(prisonerNumber)).find(
        record => record.militarySeq === militaryRecord.militarySeq,
      ) ??
      (() => {
        throw new BadRequestError(
          `Military record not found for ${prisonerNumber} with seq ${militaryRecord.militarySeq}`,
        )
      })()

    const response = await personIntegrationApiClient.updateMilitaryRecord(prisonerNumber, {
      ...existingRecord,
      ...militaryRecord,
    })

    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: ['military-record'],
      prisonerNumber,
      user,
    })

    return response
  }

  async createMilitaryRecord(
    clientToken: string,
    user: PrisonUser,
    prisonerNumber: string,
    militaryRecord: MilitaryRecord,
  ) {
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)

    const response = await personIntegrationApiClient.createMilitaryRecord(prisonerNumber, militaryRecord)

    // TODO change to create?
    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: ['military-record'],
      prisonerNumber,
      user,
    })

    return response
  }
}
