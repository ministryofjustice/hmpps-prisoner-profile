import adjudicationsSummaryToMiniSummary from './adjudicationsSummaryToMiniSummary'
import AdjudicationsOverviewSummary from '../../services/interfaces/adjudicationsService/AdjudicationsOverviewSummary'
import { Result } from '../../utils/result/result'
import { unavailablePlaceholder } from '../../utils/utils'

describe('adjudicationsSummaryToMiniSummary', () => {
  it('should return a mini summary object', () => {
    const adjudicationsSummary: AdjudicationsOverviewSummary = {
      adjudicationCount: 1,
      activePunishments: 2,
    }
    const prisonerNumber = 'A1234BC'
    const miniSummary = adjudicationsSummaryToMiniSummary(Result.fulfilled(adjudicationsSummary), prisonerNumber)
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
    const adjudicationsSummary: AdjudicationsOverviewSummary = {
      adjudicationCount: 1,
      activePunishments: 0,
    }
    const prisonerNumber = 'A1234BC'
    const miniSummary = adjudicationsSummaryToMiniSummary(Result.fulfilled(adjudicationsSummary), prisonerNumber)
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

  it('should return a mini summary object with error message if adjudicationSummary is an error', () => {
    const prisonerNumber = 'A1234BC'
    const error = {
      name: 'Error',
      message: 'Something went wrong!',
    }
    const miniSummary = adjudicationsSummaryToMiniSummary(Result.rejected(error), prisonerNumber)
    expect(miniSummary).toEqual({
      heading: 'Adjudications',
      topLabel: 'Proven in last 3 months',
      topContent: unavailablePlaceholder,
      topClass: 'small',
      bottomLabel: 'Active',
      bottomContentLine1: unavailablePlaceholder,
      bottomClass: 'small',
    })
  })
})
