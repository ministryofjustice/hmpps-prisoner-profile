import { CorePersonRecordReferenceDataDomain } from '../../server/data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { ReferenceDataCodeDto } from '../../server/data/interfaces/referenceData'
import {
  ActiveCountryReferenceDataCodesMock,
  NationalityReferenceDataCodesMock,
  ReligionReferenceDataCodesMock,
  SexualOrientationReferenceDataCodesMock,
  phoneUsageReferenceDataMock,
} from '../../server/data/localMockData/personIntegrationApiReferenceDataMock'
import {
  foodAllergyCodesMock,
  medicalDietCodesMock,
  personalisedDietCodesMock,
  smokerStatusCodesMock,
} from '../../server/data/localMockData/healthAndMedicationApi/referenceDataMocks'
import {
  buildCodesMock,
  eyeColourCodesMock,
  faceCodesMock,
  facialHairCodesMock,
  hairCodesMock,
} from '../../server/data/localMockData/personIntegrationApi/referenceDataMocks'

export const getMockReferenceDataCodesForDomain = (domain: string): ReferenceDataCodeDto[] => {
  switch (domain) {
    case CorePersonRecordReferenceDataDomain.phoneTypes:
      return phoneUsageReferenceDataMock
    case 'COUNTRY':
      return ActiveCountryReferenceDataCodesMock
    case 'NAT':
      return NationalityReferenceDataCodesMock
    case 'RELF':
      return ReligionReferenceDataCodesMock
    case 'SEXO':
      return SexualOrientationReferenceDataCodesMock
    case 'MEDICAL_DIET':
      return medicalDietCodesMock
    case 'FOOD_ALLERGY':
      return foodAllergyCodesMock
    case 'PERSONALISED_DIET':
      return personalisedDietCodesMock
    case 'SMOKER':
      return smokerStatusCodesMock
    case 'HAIR':
      return hairCodesMock
    case 'FACIAL_HAIR':
      return facialHairCodesMock
    case 'FACE':
      return faceCodesMock
    case 'BUILD':
      return buildCodesMock
    case 'L_EYE_C':
      return eyeColourCodesMock
    case 'R_EYE_C':
      return eyeColourCodesMock
    default:
      return []
  }
}
