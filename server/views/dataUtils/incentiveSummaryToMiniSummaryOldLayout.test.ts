import IncentiveSummary from '../../services/interfaces/incentivesService/IncentiveSummary'
import incentiveSummaryToMiniSummaryOldLayout from './incentiveSummaryToMiniSummaryOldLayout'

describe('incentiveSummaryToMiniSummaryOldLayout', () => {
  it('should return a mini summary object', () => {
    const incentiveSummary = {
      positiveBehaviourCount: 1,
      negativeBehaviourCount: 2,
      nextReviewDate: '2021-01-01',
      daysOverdue: 1,
    }
    const prisonerNumber = 'A1234BC'
    const prisonerDisplayName = 'John Doe'
    const miniSummary = incentiveSummaryToMiniSummaryOldLayout(incentiveSummary, prisonerNumber, prisonerDisplayName)
    expect(miniSummary).toEqual({
      heading: 'Incentives: since last review',
      items: [
        { text: 'Positive behaviours: 1' },
        { text: 'Negative behaviours: 2' },
        { text: 'Next review by: 01/01/2021', classes: 'hmpps-secondary-text' },
        { text: '1 day overdue', classes: 'hmpps-red-text govuk-!-font-weight-bold' },
      ],
      linkLabel: 'Incentive level details',
      linkHref: 'http://localhost:3001/incentive-reviews/prisoner/A1234BC',
    })
  })

  it('should pluralise the overdue days', () => {
    const incentiveSummary = {
      positiveBehaviourCount: 1,
      negativeBehaviourCount: 2,
      nextReviewDate: '2021-01-01',
      daysOverdue: 3,
    }
    const prisonerNumber = 'A1234BC'
    const prisonerDisplayName = 'John Doe'
    const miniSummary = incentiveSummaryToMiniSummaryOldLayout(incentiveSummary, prisonerNumber, prisonerDisplayName)
    expect(miniSummary).toEqual({
      heading: 'Incentives: since last review',
      items: [
        { text: 'Positive behaviours: 1' },
        { text: 'Negative behaviours: 2' },
        { text: 'Next review by: 01/01/2021', classes: 'hmpps-secondary-text' },
        { text: '3 days overdue', classes: 'hmpps-red-text govuk-!-font-weight-bold' },
      ],
      linkLabel: 'Incentive level details',
      linkHref: 'http://localhost:3001/incentive-reviews/prisoner/A1234BC',
    })
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
    const miniSummary = incentiveSummaryToMiniSummaryOldLayout(incentiveSummary, prisonerNumber, prisonerDisplayName)
    expect(miniSummary).toEqual({
      heading: 'Incentives: since last review',
      items: [{ text: 'John Doe has no incentive level history' }],
      linkLabel: 'Incentive level details',
      linkHref: 'http://localhost:3001/incentive-reviews/prisoner/A1234BC',
    })
  })

  it('should return a mini summary object with error message if incentiveSummary is an error', () => {
    const prisonerNumber = 'A1234BC'
    const prisonerDisplayName = 'John Doe'
    const miniSummary = incentiveSummaryToMiniSummaryOldLayout({ error: true }, prisonerNumber, prisonerDisplayName)
    expect(miniSummary).toEqual({
      heading: 'Incentives: since last review',
      items: [{ text: 'We cannot show these details right now' }],
      linkLabel: 'Incentive level details',
      linkHref: 'http://localhost:3001/incentive-reviews/prisoner/A1234BC',
    })
  })
})
