import incentiveSummaryToMiniSummary from './incentiveSummaryToMiniSummary'
import IncentiveSummary from '../../services/interfaces/incentivesService/IncentiveSummary'

describe('incentiveSummaryToMiniSummary', () => {
  it('should return a mini summary object', () => {
    const incentiveSummary = {
      positiveBehaviourCount: 1,
      negativeBehaviourCount: 2,
      nextReviewDate: '2021-01-01',
      daysOverdue: 1,
    }
    const prisonerNumber = 'A1234BC'
    const prisonerDisplayName = 'John Doe'
    const miniSummary = incentiveSummaryToMiniSummary(incentiveSummary, prisonerNumber, prisonerDisplayName)
    expect(miniSummary).toEqual({
      bottomLabel: 'Incentives: since last review',
      bottomContentLine1: 'Positive behaviours: 1',
      bottomContentLine2: 'Negative behaviours: 2',
      bottomContentLine3: 'Next review by: 01/01/2021',
      bottomContentError: '1 day overdue',
      bottomClass: 'small',
      linkLabel: 'Incentive level details',
      linkHref: 'http://localhost:3001/incentive-reviews/prisoner/A1234BC',
    })
  })

  it('should pliuralise the overdue days', () => {
    const incentiveSummary = {
      positiveBehaviourCount: 1,
      negativeBehaviourCount: 2,
      nextReviewDate: '2021-01-01',
      daysOverdue: 3,
    }
    const prisonerNumber = 'A1234BC'
    const prisonerDisplayName = 'John Doe'
    const miniSummary = incentiveSummaryToMiniSummary(incentiveSummary, prisonerNumber, prisonerDisplayName)
    expect(miniSummary.bottomContentError).toEqual('3 days overdue')
  })

  it('should return a mini summary object with no data message if all values are null', () => {
    const incentiveSummary: IncentiveSummary = {
      positiveBehaviourCount: null,
      negativeBehaviourCount: null,
      nextReviewDate: null,
      daysOverdue: null,
    }
    const prisonerNumber = 'A1234BC'
    const prisonerDisplayName = 'John Doe'
    const miniSummary = incentiveSummaryToMiniSummary(incentiveSummary, prisonerNumber, prisonerDisplayName)
    expect(miniSummary).toEqual({
      bottomLabel: 'Incentives: since last review',
      bottomContentLine1: 'John Doe has no incentive level history',
      bottomClass: 'small',
      linkLabel: 'Incentive level details',
      linkHref: 'http://localhost:3001/incentive-reviews/prisoner/A1234BC',
    })
  })

  it('should return a mini summary object with error message if incentiveSummary is an error', () => {
    const prisonerNumber = 'A1234BC'
    const prisonerDisplayName = 'John Doe'
    const miniSummary = incentiveSummaryToMiniSummary({ error: true }, prisonerNumber, prisonerDisplayName)
    expect(miniSummary).toEqual({
      bottomLabel: 'Incentives: since last review',
      bottomContentLine1: 'We cannot show these details right now',
      bottomClass: 'small',
      linkLabel: 'Incentive level details',
      linkHref: 'http://localhost:3001/incentive-reviews/prisoner/A1234BC',
    })
  })
})
