import config from '../config'
import RestClient from './restClient'
import {
  DietAndAllergy,
  DietAndAllergyUpdate,
  HealthAndMedication,
  HealthAndMedicationApiClient,
  ReferenceDataCode,
} from './interfaces/healthAndMedicationApi/healthAndMedicationApiClient'
import { mapToQueryString } from '../utils/utils'

export default class HealthAndMedicationApiRestClient implements HealthAndMedicationApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Health and medication API', config.apis.healthAndMedicationApi, token)
  }

  async getReferenceDataCodes(domain: string, includeInactive = false): Promise<ReferenceDataCode[]> {
    return this.restClient.get<ReferenceDataCode[]>({
      path: `/reference-data/domains/${domain}/codes`,
      query: mapToQueryString({ includeInactive }),
    })
  }

  getHealthAndMedicationForPrisoner(prisonerNumber: string): Promise<HealthAndMedication> {
    return this.restClient.get<HealthAndMedication>({ path: `/prisoners/${prisonerNumber}`, ignore404: true })
  }

  updateDietAndAllergyDataForPrisoner(
    prisonerNumber: string,
    dietAndAllergyUpdate: Partial<DietAndAllergyUpdate>,
  ): Promise<DietAndAllergy> {
    return this.restClient.put<DietAndAllergy>({
      path: `/prisoners/${prisonerNumber}/diet-and-allergy`,
      data: dietAndAllergyUpdate,
    })
  }
}
