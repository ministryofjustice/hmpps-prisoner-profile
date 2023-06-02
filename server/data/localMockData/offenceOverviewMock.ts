import { FullStatus } from '../../interfaces/prisonApi/fullStatus'
import { MainOffence } from '../../interfaces/prisonApi/mainOffence'

export const mainOffenceMock: MainOffence = {
  bookingId: 1102484,
  offenceDescription: 'Drive vehicle for more than 13 hours or more in a working day - domestic',
  offenceCode: 'TR68132',
  statuteCode: 'TR68',
}

export const fullStatusMock: FullStatus = {
  nomsId: 'G6123VU',
  establishmentCode: 'TRN',
  bookingId: 1102484,
  givenName1: 'JOHN',
  lastName: 'SAUNDERS',
  dateOfBirth: '1990-10-12',
  gender: 'Male',
  englishSpeaking: true,
  bookingBeginDate: '2016-05-30',
  releaseDate: '2076-01-29',
  categoryCode: 'C',
  communityStatus: 'INACTIVE TRN',
  legalStatus: 'RECALL',
  establishmentName: 'Transfer',
}

export const fullStatusRemandMock: FullStatus = {
  nomsId: 'G6123VU',
  establishmentCode: 'TRN',
  bookingId: 1102484,
  givenName1: 'JOHN',
  lastName: 'SAUNDERS',
  dateOfBirth: '1990-10-12',
  gender: 'Male',
  englishSpeaking: true,
  bookingBeginDate: '2016-05-30',
  releaseDate: '2076-01-29',
  categoryCode: 'C',
  communityStatus: 'INACTIVE TRN',
  legalStatus: 'REMAND',
  establishmentName: 'Transfer',
}

export const offenceOverviewMock: object = {
  conditionalReleaseDate: undefined,
  confirmedReleaseDate: undefined,
  courtCaseData: [
    {
      agency: {
        active: true,
        agencyId: 'SHEFCC',
        agencyType: 'CRT',
        courtType: 'CC',
        description: 'Sheffield Crown Court',
        longDescription: 'Sheffield Crown Court',
      },
      beginDate: '2016-05-30',
      caseInfoNumber: 'T20167348',
      caseSeq: 1,
      caseStatus: 'ACTIVE',
      caseType: 'Adult',
      courtHearings: [
        {
          dateTime: '2020-06-18T10:00:00',
          id: 407072650,
          location: {
            active: true,
            agencyId: 'SHEFCC',
            agencyType: 'CRT',
            courtType: 'CC',
            description: 'Sheffield Crown Court',
            longDescription: 'Sheffield Crown Court',
          },
        },
        {
          dateTime: '2016-05-30T10:00:00',
          id: 304966745,
          location: {
            active: true,
            agencyId: 'DONCMC',
            agencyType: 'CRT',
            courtType: 'MC',
            description: 'Doncaster Magistrates Court',
            longDescription: 'Doncaster Magistrates Court',
          },
        },
        {
          dateTime: '2016-06-27T10:00:00',
          id: 304966783,
          location: {
            active: true,
            agencyId: 'SHEFCC',
            agencyType: 'CRT',
            courtType: 'CC',
            description: 'Sheffield Crown Court',
            longDescription: 'Sheffield Crown Court',
          },
        },
        {
          dateTime: '2016-06-30T10:00:00',
          id: 305411026,
          location: {
            active: true,
            agencyId: 'SHEFCC',
            agencyType: 'CRT',
            courtType: 'CC',
            description: 'Sheffield Crown Court',
            longDescription: 'Sheffield Crown Court',
          },
        },
      ],
      id: 1563148,
    },
  ],
  fullStatus: {
    bookingBeginDate: '2016-05-30',
    bookingId: 1102484,
    categoryCode: 'C',
    communityStatus: 'INACTIVE TRN',
    dateOfBirth: '1990-10-12',
    englishSpeaking: true,
    establishmentCode: 'TRN',
    establishmentName: 'Transfer',
    gender: 'Male',
    givenName1: 'JOHN',
    lastName: 'SAUNDERS',
    legalStatus: 'RECALL',
    nomsId: 'G6123VU',
    releaseDate: '2076-01-29',
  },
  imprisonmentStatusDescription: undefined,
  mainOffence: {
    bookingId: 1102484,
    offenceCode: 'TR68132',
    offenceDescription: 'Drive vehicle for more than 13 hours or more in a working day - domestic',
    statuteCode: 'TR68',
  },
  nextCourtAppearance: {},
}
