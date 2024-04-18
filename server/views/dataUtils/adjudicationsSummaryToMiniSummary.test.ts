import adjudicationsSummaryToMiniSummary from './adjudicationsSummaryToMiniSummary'
import OverviewPage from '../../services/interfaces/overviewPageService/OverviewPage'

describe('adjudicationsSummaryToMiniSummary', () => {
  it('should return a mini summary object', () => {
    const adjudicationsSummary: OverviewPage['adjudicationSummary'] = {
      adjudicationCount: 1,
      activePunishments: 2,
    }
    const prisonerNumber = 'A1234BC'
    const miniSummary = adjudicationsSummaryToMiniSummary(adjudicationsSummary, prisonerNumber)
    expect(miniSummary).toEqual({
      heading: 'Adjudications',
      topLabel: 'Proven in last 3 months',
      topContent: 1,
      topClass: 'big',
      bottomLabel: 'Active',
      bottomContentLine1: '2 active punishments',
      bottomContentLine1Href: 'http://localhost:3001/active-punishments/A1234BC',
      bottomClass: 'small',
      linkLabel: 'Adjudication history',
      linkHref: 'http://localhost:3001/adjudication-history/A1234BC',
    })
  })

  it('should return a mini summary object with no active punishments message if there are no active punishments', () => {
    const adjudicationsSummary: OverviewPage['adjudicationSummary'] = {
      adjudicationCount: 1,
      activePunishments: 0,
    }
    const prisonerNumber = 'A1234BC'
    const miniSummary = adjudicationsSummaryToMiniSummary(adjudicationsSummary, prisonerNumber)
    expect(miniSummary).toEqual({
      heading: 'Adjudications',
      topLabel: 'Proven in last 3 months',
      topContent: 1,
      topClass: 'big',
      bottomLabel: 'Active',
      bottomContentLine1: 'No active punishments',
      bottomContentLine1Href: undefined,
      bottomClass: 'small',
      linkLabel: 'Adjudication history',
      linkHref: 'http://localhost:3001/adjudication-history/A1234BC',
    })
  })
})
