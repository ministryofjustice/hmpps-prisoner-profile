import { RestClientBuilder } from '../data'
import MetricsService from './metrics/metricsService'
import {
  PersonIntegrationApiClient,
  PseudonymRequestDto,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import NotFoundError from '../utils/notFoundError'
import { PrisonUser } from '../interfaces/HmppsUser'
import logger from '../../logger'

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

  async checkForDuplicateAlias(clientToken: string, prisonerNumber: string, pseudonym: PseudonymRequestDto) {
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)
    const normalise = (value: string | null | undefined) => value?.trim().toUpperCase() || ''
    logger.error(await personIntegrationApiClient.getPseudonyms(prisonerNumber))
    logger.error(pseudonym)
    return (await personIntegrationApiClient.getPseudonyms(prisonerNumber)).some(
      alias =>
        normalise(alias.firstName) === normalise(pseudonym.firstName) &&
        normalise(alias.middleName1) === normalise(pseudonym.middleName1) &&
        normalise(alias.middleName2) === normalise(pseudonym.middleName2) &&
        normalise(alias.lastName) === normalise(pseudonym.lastName) &&
        alias.dateOfBirth === pseudonym.dateOfBirth.toString() &&
        alias.sex.code === pseudonym.sex,
    )
  }

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

  async updateDateOfBirth(clientToken: string, user: PrisonUser, prisonerNumber: string, dateOfBirth: string) {
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)
    const existingWorkingName = await this.getWorkingNameAlias(clientToken, prisonerNumber)

    if (!existingWorkingName) throw new NotFoundError('Existing working name not found')

    const response = personIntegrationApiClient.updatePseudonym(existingWorkingName.sourceSystemId, {
      isWorkingName: true,
      firstName: existingWorkingName.firstName,
      middleName1: existingWorkingName.middleName1,
      middleName2: existingWorkingName.middleName2,
      lastName: existingWorkingName.lastName,
      sex: existingWorkingName.sex?.code,
      nameType: existingWorkingName.nameType?.code,
      title: existingWorkingName.title?.code,
      ethnicity: existingWorkingName.ethnicity?.code,
      dateOfBirth,
    })

    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: ['dateOfBirth'],
      prisonerNumber,
      user,
    })

    return response
  }

  async updateEthnicity(clientToken: string, user: PrisonUser, prisonerNumber: string, ethnicity: string) {
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)
    const existingWorkingName = await this.getWorkingNameAlias(clientToken, prisonerNumber)

    if (!existingWorkingName) throw new NotFoundError('Existing working name not found')

    const response = personIntegrationApiClient.updatePseudonym(existingWorkingName.sourceSystemId, {
      isWorkingName: true,
      firstName: existingWorkingName.firstName,
      middleName1: existingWorkingName.middleName1,
      middleName2: existingWorkingName.middleName2,
      lastName: existingWorkingName.lastName,
      sex: existingWorkingName.sex?.code,
      nameType: existingWorkingName.nameType?.code,
      title: existingWorkingName.title?.code,
      dateOfBirth: existingWorkingName.dateOfBirth,
      ethnicity,
    })

    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: ['ethnicity'],
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

  async addNewAlias(clientToken: string, user: PrisonUser, prisonerNumber: string, pseudonym: PseudonymRequestDto) {
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)

    const response = personIntegrationApiClient.createPseudonym(prisonerNumber, pseudonym)

    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: ['alias'],
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
