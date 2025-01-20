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

export const ReligionReferenceDataCodesMock: ReferenceDataCodeDto[] = [
  {
    id: 'RELF_DRU',
    code: 'DRU',
    description: 'Druid',
    listSequence: 1,
    isActive: true,
  },
  {
    id: 'RELF_PAG',
    code: 'PAG',
    description: 'Pagan',
    listSequence: 2,
    isActive: true,
  },
  {
    id: 'RELF_ZORO',
    code: 'ZORO',
    description: 'Zoroastrian',
    listSequence: 3,
    isActive: true,
  },
  {
    id: 'RELF_OTH',
    code: 'OTH',
    description: 'Other religion',
    listSequence: 4,
    isActive: true,
  },
  {
    id: 'RELF_NIL',
    code: 'NIL',
    description: 'No religion',
    listSequence: 5,
    isActive: true,
  },
  {
    id: 'RELF_UNKN',
    code: 'UNKN',
    description: 'Unknown',
    listSequence: 6,
    isActive: true,
  },
]
