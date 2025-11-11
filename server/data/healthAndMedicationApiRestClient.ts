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
import { handleNomisLockedError } from '../utils/nomisLockedError'

export default class HealthAndMedicationApiRestClient extends RestClient implements HealthAndMedicationApiClient {
  constructor(token: string) {
    super('Health and medication API', config.apis.healthAndMedicationApi, token)
  }

  async getReferenceDataCodes(
    domain: HealthAndMedicationReferenceDataDomain,
    includeInactive = false,
  ): Promise<ReferenceDataCode[]> {
    return this.get(
      {
        path: `/reference-data/domains/${domain}/codes`,
        query: mapToQueryString({ includeInactive }),
      },
      this.token,
    )
  }

  getHealthAndMedication(prisonerNumber: string): Promise<HealthAndMedication | null> {
    return this.getAndIgnore404({ path: `/prisoners/${prisonerNumber}` })
  }

  updateDietAndAllergyData(
    prisonerNumber: string,
    dietAndAllergyUpdate: Partial<DietAndAllergyUpdate>,
  ): Promise<DietAndAllergy> {
    return handleNomisLockedError(() =>
      this.put(
        {
          path: `/prisoners/${prisonerNumber}/diet-and-allergy`,
          data: dietAndAllergyUpdate,
        },
        this.token,
      ),
    )
  }

  updateSmokerStatus(prisonerNumber: string, smokerStatusUpdate: Partial<SmokerStatusUpdate>): Promise<void> {
    return handleNomisLockedError(() =>
      this.put(
        {
          path: `/prisoners/${prisonerNumber}/smoker`,
          data: smokerStatusUpdate,
        },
        this.token,
      ),
    )
  }
}
