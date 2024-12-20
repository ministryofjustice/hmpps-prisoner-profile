import { ReferenceDataCodeDto } from '../interfaces/personIntegrationApi/personIntegrationApiClient'

export const EnglandCountryReferenceDataCodeMock = {
  id: '1',
  code: 'ENG',
  description: 'England',
  listSequence: 1,
  isActive: true,
}

export const ActiveCountryReferenceDataCodesMock: ReferenceDataCodeDto[] = [
  EnglandCountryReferenceDataCodeMock,
  {
    id: '2',
    code: 'FRA',
    description: 'France',
    listSequence: 2,
    isActive: true,
  },
]

export const CountryReferenceDataCodesMock: ReferenceDataCodeDto[] = [
  ...ActiveCountryReferenceDataCodesMock,
  {
    id: '3',
    code: 'ZZZ',
    description: 'Inactive',
    listSequence: 3,
    isActive: false,
  },
]

export const NationalityReferenceDataCodesMock: ReferenceDataCodeDto[] = [
  {
    id: 'NAT_BRIT',
    code: 'BRIT',
    description: 'British',
    listSequence: 1,
    isActive: true,
  },
  {
    id: 'NAT_FREN',
    code: 'FREN',
    description: 'French',
    listSequence: 2,
    isActive: true,
  },
  {
    id: 'NAT_GERM',
    code: 'GERM',
    description: 'German',
    listSequence: 3,
    isActive: false,
  },
]
