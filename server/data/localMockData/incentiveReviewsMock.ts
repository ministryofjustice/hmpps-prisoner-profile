import { IncentiveDetailsDto, IncentiveReviewSummary } from '../../interfaces/IncentivesApi/incentiveReviews'
import AgenciesMock from './agenciesDetails'
import StaffDetailsMock from './staffDetails'
import { StaffDetails } from '../../interfaces/prisonApi/staffDetails'

export const incentiveReviewsMock: IncentiveReviewSummary = {
  id: 12345,
  iepCode: 'STD',
  iepLevel: 'Standard',
  prisonerNumber: 'A1234BC',
  bookingId: 1234567,
  iepDate: '2023-12-01',
  iepTime: '2023-12-01T10:35:17',
  locationId: '1-2-003',
  nextReviewDate: '2024-01-01',
  daysSinceReview: 23,
}

export const incentiveReviewsWithDetailsMock: IncentiveReviewSummary = {
  id: 12345,
  iepCode: 'STD',
  iepLevel: 'Standard',
  prisonerNumber: 'A1234BC',
  bookingId: 1234567,
  iepDate: '2023-12-01',
  iepTime: '2023-12-01T10:35:17',
  locationId: '1-2-003',
  iepDetails: [
    {
      id: 12345,
      iepLevel: 'Standard',
      iepCode: 'STD',
      comments: 'A review took place',
      prisonerNumber: 'A1234BC',
      bookingId: 1234567,
      iepDate: '2023-12-01',
      iepTime: '2023-12-01T10:35:17',
      agencyId: 'MDI',
      locationId: '1-2-003',
      userId: 'USER_1_GEN',
      reviewType: 'REVIEW',
      auditModuleName: 'INCENTIVES_API',
      isRealReview: true,
    },
  ],
  nextReviewDate: '2024-01-01',
  daysSinceReview: 23,
}

export const incentiveDetailsDtoMock: IncentiveDetailsDto = {
  incentiveReviewSummary: incentiveReviewsWithDetailsMock,
  prisons: [AgenciesMock],
  staff: [
    StaffDetailsMock,
    {
      username: 'INCENTIVES_API',
      firstName: 'System',
      lastName: '',
    } as StaffDetails,
  ],
}
