import csraAssessmentMock from '../data/localMockData/csraAssessmentMock'
import AgencyMock from '../data/localMockData/agency'
import StaffDetailsMock from '../data/localMockData/staffDetails'
import mapCsraReviewToSummaryList from './csraReviewToSummaryListMapper'
import { CsraAssessment } from '../interfaces/prisonApi/csraAssessment'

describe('mapCsraReviewToSummaryList', () => {
  it('should map the csra review details to summary rows', async () => {
    const result = mapCsraReviewToSummaryList(csraAssessmentMock, AgencyMock, StaffDetailsMock)

    const expectedDetails = [
      {
        key: { text: 'CSRA' },
        value: { text: 'Standard' },
      },
      {
        key: { text: 'Authorised by' },
        value: { text: 'Review Board' },
      },
      {
        key: { text: 'Location', classes: 'govuk-!-padding-top-6' },
        value: { text: 'Sheffield Crown Court' },
      },
      {
        key: { text: 'Comments' },
        value: { text: 'HiMEIesRHiMEIesR' },
      },
      { key: { text: 'Reviewed by' }, value: { text: 'Reception - John Smith' } },
      {
        key: { text: 'Next review date' },
        value: { text: '13 January 2018' },
      },
    ]

    expect(result).toEqual(expectedDetails)
  })

  it('should handle staff details and agency details being null', async () => {
    const result = mapCsraReviewToSummaryList(csraAssessmentMock, null, null)
    const expectedDetails = [
      {
        key: { text: 'CSRA' },
        value: { text: 'Standard' },
      },
      {
        key: { text: 'Authorised by' },
        value: { text: 'Review Board' },
      },
      {
        key: { text: 'Location', classes: 'govuk-!-padding-top-6' },
        value: { text: 'Not entered' },
      },
      {
        key: { text: 'Comments' },
        value: { text: 'HiMEIesRHiMEIesR' },
      },
      { key: { text: 'Reviewed by' }, value: { text: 'Reception - Not entered' } },
      {
        key: { text: 'Next review date' },
        value: { text: '13 January 2018' },
      },
    ]

    expect(result).toEqual(expectedDetails)
  })

  it('should display override information if present', async () => {
    const csraAssessment = {
      ...csraAssessmentMock,
      originalClassificationCode: 'HI' as CsraAssessment['originalClassificationCode'],
      classificationReviewReason: 'A reason',
    }

    const result = mapCsraReviewToSummaryList(csraAssessment, AgencyMock, StaffDetailsMock)

    const expectedDetails = [
      {
        key: { text: 'CSRA' },
        value: { text: 'Standard - this is an override from High' },
      },
      {
        key: { text: 'Override reason' },
        value: { text: 'A reason' },
      },
      {
        key: { text: 'Authorised by' },
        value: { text: 'Review Board' },
      },
      {
        key: { text: 'Location', classes: 'govuk-!-padding-top-6' },
        value: { text: 'Sheffield Crown Court' },
      },
      {
        key: { text: 'Comments' },
        value: { text: 'HiMEIesRHiMEIesR' },
      },
      { key: { text: 'Reviewed by' }, value: { text: 'Reception - John Smith' } },
      {
        key: { text: 'Next review date' },
        value: { text: '13 January 2018' },
      },
    ]

    expect(result).toEqual(expectedDetails)
  })

  it('should handle details not being present', async () => {
    const csraAssessment = {
      ...csraAssessmentMock,
      assessmentComment: '',
      nextReviewDate: undefined as CsraAssessment['nextReviewDate'],
    }
    const agencyDetails = { ...AgencyMock, description: '' }

    const result = mapCsraReviewToSummaryList(csraAssessment, agencyDetails, StaffDetailsMock)

    const expectedDetails = [
      {
        key: { text: 'CSRA' },
        value: { text: 'Standard' },
      },
      {
        key: { text: 'Authorised by' },
        value: { text: 'Review Board' },
      },
      {
        key: { text: 'Location', classes: 'govuk-!-padding-top-6' },
        value: { text: 'Not entered' },
      },
      {
        key: { text: 'Comments' },
        value: { text: 'Not entered' },
      },
      { key: { text: 'Reviewed by' }, value: { text: 'Reception - John Smith' } },
      {
        key: { text: 'Next review date' },
        value: { text: 'Not entered' },
      },
    ]

    expect(result).toEqual(expectedDetails)
  })
})
