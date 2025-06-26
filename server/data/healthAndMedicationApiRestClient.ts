import config from '../config'
import RestClient from './restClient'
import {
  DietAndAllergy,
  DietAndAllergyUpdate,
  HealthAndMedication,
  HealthAndMedicationApiClient,
  HealthAndMedicationReferenceDataDomain,
  ReferenceDataCode,
  SmokerStatusUpdate,
} from './interfaces/healthAndMedicationApi/healthAndMedicationApiClient'
import { mapToQueryString } from '../utils/utils'
import { handleNomisLockedError } from '../utils/nomisLockedErrorHelpers'

export default class HealthAndMedicationApiRestClient implements HealthAndMedicationApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Health and medication API', config.apis.healthAndMedicationApi, token)
  }

  async getReferenceDataCodes(
    domain: HealthAndMedicationReferenceDataDomain,
    includeInactive = false,
  ): Promise<ReferenceDataCode[]> {
    return this.restClient.get<ReferenceDataCode[]>({
      path: `/reference-data/domains/${domain}/codes`,
      query: mapToQueryString({ includeInactive }),
    })
  }

  getHealthAndMedication(prisonerNumber: string): Promise<HealthAndMedication> {
    return this.restClient.get<HealthAndMedication>({ path: `/prisoners/${prisonerNumber}`, ignore404: true })
  }

  updateDietAndAllergyData(
    prisonerNumber: string,
    dietAndAllergyUpdate: Partial<DietAndAllergyUpdate>,
  ): Promise<DietAndAllergy> {
    return handleNomisLockedError(() =>this.restClient.put<DietAndAllergy>({
      path: `/prisoners/${prisonerNumber}/diet-and-allergy`,
      data: dietAndAllergyUpdate,
    }))
  }

  updateSmokerStatus(prisonerNumber: string, smokerStatusUpdate: Partial<SmokerStatusUpdate>): Promise<void> {
    return handleNomisLockedError(() => this.restClient.put<void>({
      path: `/prisoners/${prisonerNumber}/smoker`,
      data: smokerStatusUpdate,
    }))
  }
}
