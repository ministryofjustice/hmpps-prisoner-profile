import FullStatus from '../interfaces/prisonApi/FullStatus'
import MainOffence from '../interfaces/prisonApi/MainOffence'
import OverviewPage from '../../services/interfaces/overviewPageService/OverviewPage'

export const mainOffenceMock: MainOffence[] = [
  {
    bookingId: 1102484,
    offenceDescription: 'Drive vehicle for more than 13 hours or more in a working day - domestic',
    offenceCode: 'TR68132',
    statuteCode: 'TR68',
  },
]

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

export const offenceOverviewMock: OverviewPage['offencesOverview'] = {
  conditionalReleaseDate: undefined,
  confirmedReleaseDate: undefined,
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
  mainOffenceDescription: 'Drive vehicle for more than 13 hours or more in a working day - domestic',
}
