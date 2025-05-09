import {
  CorePersonRecordReferenceDataCodeDto,
  MilitaryRecord,
  PersonIntegrationDistinguishingMark,
  PseudonymRequestDto,
  PseudonymResponseDto,
} from '../interfaces/personIntegrationApi/personIntegrationApiClient'
import { ReferenceDataCodeDto } from '../interfaces/referenceData'
import { PrisonerMockDataA } from './prisoner'

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
    description: 'Other',
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
    id: 'RELF_TPRNTS',
    code: 'TPRNTS',
    description: 'They prefer not to say',
    listSequence: 6,
    isActive: true,
  },
]

export const SexualOrientationReferenceDataCodesMock: CorePersonRecordReferenceDataCodeDto[] = [
  {
    id: 'SEXO_HET',
    code: 'HET',
    description: 'Heterosexual / Straight',
    listSequence: 1,
    isActive: true,
  },
  {
    id: 'SEXO_HOM',
    code: 'HOM',
    description: 'Homosexual / Lesbian',
    listSequence: 2,
    isActive: true,
  },
  {
    id: 'SEXO_BIS',
    code: 'BIS',
    description: 'Bisexual',
    listSequence: 3,
    isActive: true,
  },
  {
    id: 'SEXO_OTH',
    code: 'OTH',
    description: 'Other',
    listSequence: 4,
    isActive: true,
  },
  {
    id: 'SEXO_ND',
    code: 'ND',
    description: 'Not Disclosed',
    listSequence: 5,
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

export const DisciplinaryActionRefDataMock: ReferenceDataCodeDto[] = [
  {
    id: 'MLTY_DISCP_CM',
    code: 'CM',
    description: 'Court Martial',
    listSequence: 1,
    isActive: true,
  },
]

export const MilitaryDischargeRefDataMock: ReferenceDataCodeDto[] = [
  {
    id: 'MLTY_DSCHRG_HON',
    code: 'HON',
    description: 'Honourable',
    listSequence: 1,
    isActive: true,
  },
]

export const LanguageReferenceDataCodesMock: CorePersonRecordReferenceDataCodeDto[] = [
  {
    id: 'LANG_ENG',
    code: 'ENG',
    description: 'English',
    listSequence: 1,
    isActive: true,
  },
  {
    id: 'LANG_FRE',
    code: 'FRE',
    description: 'French',
    listSequence: 2,
    isActive: true,
  },
  {
    id: 'LANG_SPA',
    code: 'SPA',
    description: 'Spanish',
    listSequence: 3,
    isActive: true,
  },
  {
    id: 'LANG_ARA',
    code: 'ARA',
    description: 'Arabic',
    listSequence: 4,
    isActive: true,
  },
  {
    id: 'LANG_CHI',
    code: 'CHI',
    description: 'Chinese',
    listSequence: 5,
    isActive: true,
  },
]

export const DistinguishingMarksMock: PersonIntegrationDistinguishingMark[] = [
  {
    id: 1,
    bookingId: 1,
    offenderNo: 'A1234AA',
    bodyPart: {
      id: 'BODY_PART_HEAD',
      code: 'HEAD',
      description: 'Head',
    },
    markType: {
      id: 'MARK_TYPE_SCAR',
      code: 'SCAR',
      description: 'Scar',
    },
    side: {
      id: 'SIDE_L',
      code: 'L',
      description: 'Left',
    },
    partOrientation: {
      id: 'PART_ORIENT_UPP',
      code: 'UPP',
      description: 'Upper',
    },
    comment: 'Some comment',
    createdAt: '2011-08-22T10:41:00',
    createdBy: 'USER',
    photographUuids: [],
  },
  {
    id: 2,
    bookingId: 1,
    offenderNo: 'A1234AA',
    bodyPart: {
      id: 'BODY_PART_ARM',
      code: 'ARM',
      description: 'ARM',
    },
    markType: {
      id: 'MARK_TYPE_TAT',
      code: 'TAT',
      description: 'Tattoo',
    },
    side: {
      id: 'SIDE_R',
      code: 'R',
      description: 'Right',
    },
    partOrientation: {
      id: 'PART_ORIENT_LOW',
      code: 'LOW',
      description: 'Low',
    },
    comment: 'Some comment',
    createdAt: '2011-08-22T10:41:00',
    createdBy: 'USER',
    photographUuids: [],
  },
]

export const PseudonymRequestMock: PseudonymRequestDto = {
  firstName: PrisonerMockDataA.firstName,
  middleName1: PrisonerMockDataA.middleNames.split(' ')[0],
  middleName2: PrisonerMockDataA.middleNames.split(' ')[1],
  lastName: PrisonerMockDataA.lastName,
  dateOfBirth: PrisonerMockDataA.dateOfBirth,
  nameType: 'CN',
  title: 'MR',
  sex: 'M',
  ethnicity: 'W1',
  isWorkingName: true,
}

export const PseudonymResponseMock: PseudonymResponseDto = {
  prisonerNumber: PrisonerMockDataA.prisonerNumber,
  sourceSystem: 'NOMIS',
  sourceSystemId: 12345,
  firstName: PrisonerMockDataA.firstName,
  middleName1: PrisonerMockDataA.middleNames.split(' ')[0],
  middleName2: PrisonerMockDataA.middleNames.split(' ')[1],
  lastName: PrisonerMockDataA.lastName,
  dateOfBirth: PrisonerMockDataA.dateOfBirth,
  nameType: {
    id: 'NAME_TYPE_CN',
    code: 'CN',
    description: 'Current name',
  },
  title: {
    id: 'TITLE_MR',
    code: 'MR',
    description: 'Mr.',
  },
  sex: {
    id: 'SEX_M',
    code: 'M',
    description: 'Male',
  },
  ethnicity: {
    id: 'ETHNICITY_W1',
    code: 'W1',
    description: 'White',
  },
  isWorkingName: true,
}
