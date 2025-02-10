import {
  CorePersonRecordReferenceDataCodeDto,
  MilitaryRecord,
} from '../interfaces/personIntegrationApi/personIntegrationApiClient'

export const EnglandCountryReferenceDataCodeMock = {
  id: '1',
  code: 'ENG',
  description: 'England',
  listSequence: 1,
  isActive: true,
}

export const ActiveCountryReferenceDataCodesMock: CorePersonRecordReferenceDataCodeDto[] = [
  EnglandCountryReferenceDataCodeMock,
  {
    id: '2',
    code: 'FRA',
    description: 'France',
    listSequence: 2,
    isActive: true,
  },
]

export const CountryReferenceDataCodesMock: CorePersonRecordReferenceDataCodeDto[] = [
  ...ActiveCountryReferenceDataCodesMock,
  {
    id: '3',
    code: 'ZZZ',
    description: 'Inactive',
    listSequence: 3,
    isActive: false,
  },
]

export const NationalityReferenceDataCodesMock: CorePersonRecordReferenceDataCodeDto[] = [
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

export const ReligionReferenceDataCodesMock: CorePersonRecordReferenceDataCodeDto[] = [
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

export const MilitaryRecordsMock: MilitaryRecord[] = [
  {
    prisonerNumber: 'A1234BC',
    militarySeq: 1,
    warZoneCode: 'AFG',
    warZoneDescription: 'Afghanistan',
    startDate: '2020-01-01',
    militaryDischargeCode: 'HON',
    militaryDischargeDescription: 'Honourable',
    militaryBranchCode: 'ARM',
    militaryBranchDescription: 'Army',
    description: 'Description',
    unitNumber: 'Unit 1',
    enlistmentLocation: 'Location 1',
    dischargeLocation: 'Location 2',
    selectiveServicesFlag: false,
    militaryRankCode: 'CPL_ARM',
    militaryRankDescription: 'Corporal',
    serviceNumber: '123456789',
    disciplinaryActionCode: 'CM',
    disciplinaryActionDescription: 'Court Martial',
  },
  {
    prisonerNumber: 'A1234BC',
    militarySeq: 2,
    warZoneCode: 'AFG',
    warZoneDescription: 'Afghanistan',
    startDate: '2020-03-01',
    militaryBranchCode: 'RMA',
    militaryBranchDescription: 'Royal Marines',
    selectiveServicesFlag: false,
  },
]

export const MilitaryBranchRefDataMock: CorePersonRecordReferenceDataCodeDto[] = [
  {
    id: 'MLTY_ARM',
    code: 'ARM',
    description: 'Army',
    listSequence: 1,
    isActive: true,
  },
  {
    id: 'MLTY_NAV',
    code: 'NAV',
    description: 'Navy',
    listSequence: 2,
    isActive: true,
  },
  {
    id: 'MLTY_RMA',
    code: 'RMA',
    description: 'Royal Marines',
    listSequence: 3,
    isActive: true,
  },
  {
    id: 'MLTY_RAF',
    code: 'RAF',
    description: 'RAF',
    listSequence: 4,
    isActive: true,
  },
]

export const MilitaryRankRefDataMock: CorePersonRecordReferenceDataCodeDto[] = [
  {
    id: 'MLTY_RANK_CPL_ARM',
    code: 'CPL_ARM',
    description: 'Corporal',
    listSequence: 1,
    isActive: true,
  },
]

export const MilitaryWarZoneRefDataMock: CorePersonRecordReferenceDataCodeDto[] = [
  {
    id: 'MLTY_WZONE_AFG',
    code: 'AFG',
    description: 'Afganistan',
    listSequence: 1,
    isActive: true,
  },
]
