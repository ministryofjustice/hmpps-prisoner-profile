import { CourtHearing } from '../interfaces/prisonApi/CourtCase'
import ReferenceCode from '../interfaces/bookAVideoLinkApi/ReferenceCode'
import { SelectOption } from '../../utils/utils'

export const CourtHearingsMock: CourtHearing[] = [
  {
    id: 407072650,
    dateTime: '2020-06-18T10:00:00',
    location: {
      agencyId: 'SHEFCC',
      description: 'Sheffield Crown Court',
      longDescription: 'Sheffield Crown Court',
      agencyType: 'CRT',
      active: true,
      courtType: 'CC',
    },
  },
  {
    id: 304966745,
    dateTime: '2016-05-30T10:00:00',
    location: {
      agencyId: 'DONCMC',
      description: 'Doncaster Magistrates Court',
      longDescription: 'Doncaster Magistrates Court',
      agencyType: 'CRT',
      active: true,
      courtType: 'MC',
    },
  },
  {
    id: 304966783,
    dateTime: '2016-06-27T10:00:00',
    location: {
      agencyId: 'SHEFCC',
      description: 'Sheffield Crown Court',
      longDescription: 'Sheffield Crown Court',
      agencyType: 'CRT',
      active: true,
      courtType: 'CC',
    },
  },
  {
    id: 305411026,
    dateTime: '2016-06-30T10:00:00',
    location: {
      agencyId: 'SHEFCC',
      description: 'Sheffield Crown Court',
      longDescription: 'Sheffield Crown Court',
      agencyType: 'CRT',
      active: true,
      courtType: 'CC',
    },
  },
]

export const CourtHearingsMockA: CourtHearing[] = [
  {
    id: 329257623,
    dateTime: '2017-01-17T10:00:00',
    location: {
      agencyId: 'SHEFCC',
      description: 'Sheffield Crown Court',
      longDescription: 'Sheffield Crown Court',
      agencyType: 'CRT',
      active: true,
      courtType: 'CC',
    },
  },
  {
    id: 349392356,
    dateTime: '2018-09-21T10:00:00',
    location: {
      agencyId: 'SHEFCC',
      description: 'Sheffield Crown Court',
      longDescription: 'Sheffield Crown Court',
      agencyType: 'CRT',
      active: true,
      courtType: 'CC',
    },
  },
]

export const courtHearingTypes: ReferenceCode[] = [
  {
    referenceCodeId: 1,
    groupCode: 'COURT_HEARING_TYPE',
    code: 'APPEAL',
    description: 'Appeal',
  },
]

export const probationMeetingTypes: ReferenceCode[] = [
  {
    referenceCodeId: 1,
    groupCode: 'PROBATION_MEETING_TYPE',
    code: 'PSR',
    description: 'Post-sentence report',
  },
]

export const courtHearingTypesSelectOptions: SelectOption[] = [
  {
    value: 'APPEAL',
    text: 'Appeal',
  },
]

export const probationMeetingTypesSelectOptions: SelectOption[] = [
  {
    value: 'PSR',
    text: 'Post-sentence report',
  },
]
