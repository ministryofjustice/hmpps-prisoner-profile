import csraAssessmentMock from '../data/localMockData/csraAssessmentMock'
import mapCsraQuestions from './csraQuestionsToSummaryListMapper'

describe('csraQuestionsToSummaryListMapper', () => {
  it('should map the csra review questions to summary rows', async () => {
    const result = mapCsraQuestions(csraAssessmentMock.questions)

    const expectedQuestions = [
      {
        key: {
          classes: 'govuk-!-font-weight-regular',
          text: 'Select Risk Rating',
        },
        value: {
          text: 'Standard',
        },
      },
    ]

    expect(result).toEqual(expectedQuestions)
  })
})
