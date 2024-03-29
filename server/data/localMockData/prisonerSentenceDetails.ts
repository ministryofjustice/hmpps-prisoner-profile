import PrisonerSentenceDetails from '../interfaces/prisonApi/PrisonerSentenceDetails'

export const prisonerSentenceDetailsMock: PrisonerSentenceDetails = {
  bookingId: 1102484,
  offenderNo: 'G6123VU',
  firstName: 'JOHN',
  lastName: 'SAUNDERS',
  agencyLocationId: 'MDI',
  mostRecentActiveBooking: true,
  sentenceDetail: {
    sentenceExpiryDate: '2132-03-12',
    conditionalReleaseDate: '2076-01-29',
    licenceExpiryDate: '2132-03-12',
    paroleEligibilityDate: '2021-12-12',
    effectiveSentenceEndDate: '2132-03-12',
    bookingId: 1102484,
    sentenceStartDate: '2020-03-02',
    postRecallReleaseOverrideDate: '2021-12-12',
    nonDtoReleaseDate: '2076-01-29',
    sentenceExpiryCalculatedDate: '2132-03-12',
    licenceExpiryCalculatedDate: '2132-03-12',
    paroleEligibilityOverrideDate: '2021-12-12',
    nonDtoReleaseDateType: 'CRD' as PrisonerSentenceDetails['sentenceDetail']['nonDtoReleaseDateType'],
    confirmedReleaseDate: '2076-01-29',
    releaseDate: '2076-01-29',
  },
  dateOfBirth: '1990-10-12',
  agencyLocationDesc: 'Moorland (HMP & YOI)',
  internalLocationDesc: '3-3-028',
  facialImageId: 1413311,
}

export default prisonerSentenceDetailsMock
