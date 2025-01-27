import config from '../config'
import RestClient from './restClient'
import {
  HealthAndMedication,
  HealthAndMedicationApiClient,
  HealthAndMedicationUpdate,
} from './interfaces/healthAndMedicationApi/healthAndMedicationApiClient'

export default class HealthAndMedicationApiRestClient implements HealthAndMedicationApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Health and medication API', config.apis.healthAndMedicationApi, token)
  }

  getHealthAndMedicationForPrisoner(prisonerNumber: string): Promise<HealthAndMedication> {
    return this.restClient.get<HealthAndMedication>({ path: `/prisoners/${prisonerNumber}`, ignore404: true })
  }

  updateHealthAndMedicationForPrisoner(
    prisonerNumber: string,
    healthData: Partial<HealthAndMedicationUpdate>,
  ): Promise<HealthAndMedication> {
    return this.restClient.patch<HealthAndMedication>({
      path: `/prisoners/${prisonerNumber}`,
      data: healthData,
    })
  }
}
