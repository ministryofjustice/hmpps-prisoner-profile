import categorySummaryToMiniSummary from './categorySummaryToMiniSummary'
import OverviewPageData from '../../controllers/interfaces/OverviewPageData'

describe('categorySummaryToMiniSummary', () => {
  it('should return a mini summary object', () => {
    const categorySummary: OverviewPageData['categorySummary'] = {
      codeDescription: 'CODE',
      nextReviewDate: '2021-01-01',
      userCanManage: false,
    }
    const bookingId = 12345
    const miniSummary = categorySummaryToMiniSummary(categorySummary, true, bookingId)
    expect(miniSummary).toEqual({
      id: 'category',
      heading: 'Category',
      items: [
        { text: 'CODE', classes: 'hmpps-mini-card__big' },
        { text: 'Next review: 01/01/2021', classes: 'hmpps-secondary-text' },
      ],
      linkLabel: 'Category',
      linkHref: 'http://localhost:3001/12345',
    })
  })

  it('should return a mini summary object with manage link if user can manage', () => {
    const categorySummary: OverviewPageData['categorySummary'] = {
      codeDescription: 'CODE',
      nextReviewDate: '2021-01-01',
      userCanManage: true,
    }
    const bookingId = 12345
    const miniSummary = categorySummaryToMiniSummary(categorySummary, true, bookingId)
    expect(miniSummary).toEqual({
      id: 'category',
      heading: 'Category',
      items: [
        { text: 'CODE', classes: 'hmpps-mini-card__big' },
        { text: 'Next review: 01/01/2021', classes: 'hmpps-secondary-text' },
      ],
      linkLabel: 'Manage category',
      linkHref: 'http://localhost:3001/12345',
    })
  })

  it('should return a mini summary object without a link if prisoner is not in caseload', () => {
    const categorySummary: OverviewPageData['categorySummary'] = {
      codeDescription: 'CODE',
      nextReviewDate: '2021-01-01',
      userCanManage: false,
    }
    const bookingId = 12345
    const miniSummary = categorySummaryToMiniSummary(categorySummary, false, bookingId)
    expect(miniSummary).toEqual({
      id: 'category',
      heading: 'Category',
      items: [
        { text: 'CODE', classes: 'hmpps-mini-card__big' },
        { text: 'Next review: 01/01/2021', classes: 'hmpps-secondary-text' },
      ],
    })
  })

  it('should return default values if categorySummary is null', () => {
    const bookingId = 12345
    const miniSummary = categorySummaryToMiniSummary(null, true, bookingId)
    expect(miniSummary).toEqual({
      id: 'category',
      heading: 'Category',
      items: [{ text: 'Not entered', classes: 'hmpps-mini-card__big' }],
      linkHref: 'http://localhost:3001/12345',
      linkLabel: 'Category',
    })
  })
})
