import csraAssessmentMock from '../data/localMockData/csraAssessmentMock'
import AgencyMock from '../data/localMockData/agency'
import StaffDetailsMock from '../data/localMockData/staffDetails'
import mapCsraReviewToSummaryList from './csraReviewToSummaryListMapper'
import CsraAssessment from '../data/interfaces/prisonApi/CsraAssessment'

describe('mapCsraReviewToSummaryList', () => {
  it('should map the csra review details to summary rows', async () => {
    const result = mapCsraReviewToSummaryList(csraAssessmentMock, AgencyMock, StaffDetailsMock)

    const expectedDetails = [
      {
        key: { text: 'Approved result' },
        value: { text: 'Standard' },
      },
      {
        key: { text: 'Approval comments' },
        value: { text: 'Approved' },
      },
      {
        key: { text: 'Approved by' },
        value: { text: 'Review Board' },
      },
      {
        key: { text: 'Approval date' },
        value: { text: '13 January 2017' },
      },
      {
        key: { text: 'Assessment comments', classes: 'govuk-!-padding-top-6' },
        value: { text: 'HiMEIesRHiMEIesR' },
      },
      {
        key: { text: 'Calculated result' },
        value: { text: 'Standard' },
      },
      {
        key: { text: 'Location' },
        value: { text: 'Sheffield Crown Court' },
      },
      { key: { text: 'Assessed by' }, value: { text: 'Reception - John Smith' } },
      {
        key: { text: 'Next review date', classes: 'govuk-!-padding-top-6' },
        value: { text: '13 January 2018' },
      },
    ]

    expect(result).toEqual(expectedDetails)
  })

  it('should handle staff details and agency details being null', async () => {
    const result = mapCsraReviewToSummaryList(csraAssessmentMock, null, null)
    const expectedDetails = [
      {
        key: { text: 'Approved result' },
        value: { text: 'Standard' },
      },
      {
        key: { text: 'Approval comments' },
        value: { text: 'Approved' },
      },
      {
        key: { text: 'Approved by' },
        value: { text: 'Review Board' },
      },
      {
        key: { text: 'Approval date' },
        value: { text: '13 January 2017' },
      },
      {
        key: { text: 'Assessment comments', classes: 'govuk-!-padding-top-6' },
        value: { text: 'HiMEIesRHiMEIesR' },
      },
      {
        key: { text: 'Calculated result' },
        value: { text: 'Standard' },
      },
      {
        key: { text: 'Location' },
        value: { text: 'Not entered' },
      },
      { key: { text: 'Assessed by' }, value: { text: 'Reception - Not entered' } },
      {
        key: { text: 'Next review date', classes: 'govuk-!-padding-top-6' },
        value: { text: '13 January 2018' },
      },
    ]

    expect(result).toEqual(expectedDetails)
  })

  it('should display override information if present', async () => {
    const csraAssessment = {
      ...csraAssessmentMock,
      originalClassificationCode: 'HI',
      classificationReviewReason: 'A reason',
      overrideReason: 'A reason',
      overridingClassificationCode: 'HI',
    } as CsraAssessment

    const result = mapCsraReviewToSummaryList(csraAssessment, AgencyMock, StaffDetailsMock)

    const expectedDetails = [
      {
        key: { text: 'Approved result' },
        value: { text: 'Standard - this is an override from High' },
      },
      {
        key: { text: 'Approval comments' },
        value: { text: 'Approved' },
      },
      {
        key: { text: 'Approved by' },
        value: { text: 'Review Board' },
      },
      {
        key: { text: 'Approval date' },
        value: { text: '13 January 2017' },
      },
      {
        key: { text: 'Assessment comments', classes: 'govuk-!-padding-top-6' },
        value: { text: 'HiMEIesRHiMEIesR' },
      },
      {
        key: { text: 'Calculated result' },
        value: { text: 'Standard' },
      },
      {
        key: { text: 'Override result' },
        value: { text: 'High' },
      },
      {
        key: { text: 'Override reason' },
        value: { text: 'A reason' },
      },
      {
        key: { text: 'Location' },
        value: { text: 'Sheffield Crown Court' },
      },
      { key: { text: 'Assessed by' }, value: { text: 'Reception - John Smith' } },
      {
        key: { text: 'Next review date', classes: 'govuk-!-padding-top-6' },
        value: { text: '13 January 2018' },
      },
    ]

    expect(result).toEqual(expectedDetails)
  })

  it('should handle details not being present', async () => {
    const csraAssessment: CsraAssessment = {
      ...csraAssessmentMock,
      assessmentComment: '',
      approvalComment: undefined,
      approvalDate: undefined,
      approvedClassificationCode: undefined,
      approvalCommitteeCode: undefined,
      approvalCommitteeName: undefined,
      nextReviewDate: undefined,
    }
    const agencyDetails = { ...AgencyMock, description: '' }

    const result = mapCsraReviewToSummaryList(csraAssessment, agencyDetails, StaffDetailsMock)

    const expectedDetails = [
      {
        key: { text: 'Assessment comments' },
        value: { text: 'No assessment comment entered' },
      },
      {
        key: { text: 'Calculated result' },
        value: { text: 'Standard' },
      },
      {
        key: { text: 'Location' },
        value: { text: 'Not entered' },
      },
      { key: { text: 'Assessed by' }, value: { text: 'Reception - John Smith' } },
      {
        key: { text: 'Next review date', classes: 'govuk-!-padding-top-6' },
        value: { text: 'Not entered' },
      },
    ]

    expect(result).toEqual(expectedDetails)
  })
})
