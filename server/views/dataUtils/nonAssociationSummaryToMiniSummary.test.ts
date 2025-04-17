import nonAssociationSummaryToMiniSummary from './nonAssociationSummaryToMiniSummary'
import { Result } from '../../utils/result/result'
import { apiErrorMessage } from '../../utils/utils'

describe('nonAssociationSummaryToMiniSummary', () => {
  const prisonerNumber = 'A1234BC'

  it('should return a mini summary object', () => {
    const nonAssociationSummary = {
      prisonName: 'Moorland (HMP & YOI)',
      prisonCount: 1,
      otherPrisonsCount: 2,
    }
    const miniSummary = nonAssociationSummaryToMiniSummary(Result.fulfilled(nonAssociationSummary), prisonerNumber)
    expect(miniSummary).toEqual({
      heading: 'Non-associations',
      topLabel: `In Moorland (HMP & YOI)`,
      topContent: 1,
      topClass: 'big',
      bottomLabel: 'In other establishments',
      bottomContentLine1: 2,
      bottomClass: 'big',
      linkLabel: 'Non-associations',
      linkHref: `http://localhost:3001/prisoner/A1234BC/non-associations`,
    })
  })

  it('should return a mini summary object with error message if nonAssociationSummary is an error', () => {
    const error = {
      name: 'Error',
      message: 'Something went wrong!',
    }
    const miniSummary = nonAssociationSummaryToMiniSummary(Result.rejected(error), prisonerNumber)
    expect(miniSummary).toEqual({
      heading: 'Non-associations',
      bottomLabel: null,
      bottomContentLine1: apiErrorMessage,
      bottomClass: 'small',
      linkLabel: 'Non-associations',
      linkHref: `http://localhost:3001/prisoner/A1234BC/non-associations`,
    })
  })
})
