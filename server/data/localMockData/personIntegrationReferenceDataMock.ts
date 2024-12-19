import { ReferenceDataCodeDto } from '../interfaces/personIntegrationApi/personIntegrationApiClient'

export const CountryReferenceDataCodes: ReferenceDataCodeDto[] = [
  {
    id: '1',
    code: 'ENG',
    description: 'England',
    listSequence: 1,
    isActive: true,
  },
  {
    id: '2',
    code: 'FRA',
    description: 'France',
    listSequence: 2,
    isActive: true,
  },
  {
    id: '3',
    code: 'ZZZ',
    description: 'Inactive',
    listSequence: 3,
    isActive: false,
  },
]

export const ActiveCountryReferenceDataCodes: ReferenceDataCodeDto[] = [
  {
    id: '1',
    code: 'ENG',
    description: 'England',
    listSequence: 1,
    isActive: true,
  },
  {
    id: '2',
    code: 'FRA',
    description: 'France',
    listSequence: 2,
    isActive: true,
  },
]
