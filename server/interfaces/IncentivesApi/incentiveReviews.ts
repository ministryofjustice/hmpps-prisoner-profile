import { AgencyDetails } from '../prisonApi/agencies'
import { StaffDetails } from '../prisonApi/staffDetails'

export interface IncentiveDetailsDto {
  incentiveReviewSummary: IncentiveReviewSummary
  prisons: AgencyDetails[]
  staff: StaffDetails[]
}

export interface IncentiveReviewSummary {
  id: number
  iepCode: string
  iepLevel: string
  prisonerNumber: string
  bookingId: number
  iepDate: string
  iepTime: string
  locationId: string
  iepDetails?: IncentiveReviewDetail[]
  nextReviewDate: string
  daysSinceReview: number
}

export interface IncentiveReviewDetail {
  id: number
  iepLevel: string
  iepCode: string
  comments: string
  prisonerNumber: string
  bookingId: number
  iepDate: string
  iepTime: string
  agencyId: string
  locationId: string
  userId: string
  reviewType: string
  auditModuleName: string
  isRealReview: true
}
