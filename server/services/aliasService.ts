import { RestClientBuilder } from '../data'
import MetricsService from './metrics/metricsService'
import { PersonIntegrationApiClient } from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import NotFoundError from '../utils/notFoundError'
import { PrisonUser } from '../interfaces/HmppsUser'

export interface Name {
  firstName: string
  middleName1?: string
  middleName2?: string
  lastName: string
}

export default class AliasService {
  constructor(
    private readonly personIntegrationApiClientBuilder: RestClientBuilder<PersonIntegrationApiClient>,
    private readonly metricsService: MetricsService,
  ) {}

  async getWorkingNameAlias(clientToken: string, prisonerNumber: string) {
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)
    return (await personIntegrationApiClient.getPseudonyms(prisonerNumber)).filter(
      pseudonym => pseudonym.isWorkingName,
    )[0]
  }

  async updateWorkingName(clientToken: string, user: PrisonUser, prisonerNumber: string, name: Name) {
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)
    const existingWorkingName = await this.getWorkingNameAlias(clientToken, prisonerNumber)

    if (!existingWorkingName) throw new NotFoundError('Existing working name not found')

    const response = personIntegrationApiClient.updatePseudonym(existingWorkingName.sourceSystemId, {
      isWorkingName: true,
      dateOfBirth: existingWorkingName.dateOfBirth,
      sex: existingWorkingName.sex?.code,
      nameType: existingWorkingName.nameType?.code,
      title: existingWorkingName.title?.code,
      ethnicity: existingWorkingName.ethnicity?.code,
      ...name,
    })

    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: this.getUpdatedFields(existingWorkingName, name),
      prisonerNumber,
      user,
    })

    return response
  }

  async createNewWorkingName(clientToken: string, user: PrisonUser, prisonerNumber: string, name: Name) {
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)
    const existingWorkingName = await this.getWorkingNameAlias(clientToken, prisonerNumber)

    if (!existingWorkingName) throw new NotFoundError('Existing working name not found')

    const response = personIntegrationApiClient.createPseudonym(prisonerNumber, {
      isWorkingName: true,
      dateOfBirth: existingWorkingName.dateOfBirth,
      sex: existingWorkingName.sex?.code,
      nameType: existingWorkingName.nameType?.code,
      title: existingWorkingName.title?.code,
      ethnicity: existingWorkingName.ethnicity?.code,
      ...name,
    })

    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: this.getUpdatedFields(existingWorkingName, name),
      prisonerNumber,
      user,
    })

    return response
  }

  private getUpdatedFields(existingWorkingName: Name, name: Name): Array<keyof Name> {
    return (Object.keys(name) as Array<keyof Name>)
      .map(field => {
        if (existingWorkingName[field] !== name[field]) return field
        return null
      })
      .filter(Boolean) as Array<keyof Name>
  }
}
