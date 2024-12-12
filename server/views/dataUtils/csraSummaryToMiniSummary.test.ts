import csraSummaryToMiniSummary from './csraSummaryToMiniSummary'
import OverviewPageData from '../../controllers/interfaces/OverviewPageData'

describe('csraSummaryToMiniSummary', () => {
  it('should return a mini summary object', () => {
    const csraSummary: OverviewPageData['csraSummary'] = {
      classification: 'Standard',
      assessmentDate: '2021-01-01',
    }
    const prisonerNumber = 'A1234BC'
    const miniSummary = csraSummaryToMiniSummary(csraSummary, true, prisonerNumber)
    expect(miniSummary).toEqual({
      heading: 'CSRA',
      items: [{ text: 'Standard' }, { text: 'Last review: 01/01/2021', classes: 'hmpps-secondary-text' }],
      linkLabel: 'CSRA history',
      linkHref: '/prisoner/A1234BC/csra-history',
    })
  })

  it('should return a mini summary object with no data message if classification is not entered', () => {
    const csraSummary: OverviewPageData['csraSummary'] = {
      classification: null,
      assessmentDate: '2021-01-01',
    }
    const prisonerNumber = 'A1234BC'
    const miniSummary = csraSummaryToMiniSummary(csraSummary, true, prisonerNumber)
    expect(miniSummary).toEqual({
      heading: 'CSRA',
      items: [{ text: 'Not entered' }, { text: 'Last review: 01/01/2021', classes: 'hmpps-secondary-text' }],
      linkLabel: 'CSRA history',
      linkHref: '/prisoner/A1234BC/csra-history',
    })
  })

  it('should return a mini summary object without a link if prisoner is not in caseload', () => {
    const csraSummary: OverviewPageData['csraSummary'] = {
      classification: 'Standard',
      assessmentDate: '2021-01-01',
    }
    const prisonerNumber = 'A1234BC'
    const miniSummary = csraSummaryToMiniSummary(csraSummary, false, prisonerNumber)
    expect(miniSummary).toEqual({
      heading: 'CSRA',
      items: [{ text: 'Standard' }, { text: 'Last review: 01/01/2021', classes: 'hmpps-secondary-text' }],
    })
  })

  it('should return a mini summary object without a link if prisoner is not in caseload and classification is not entered', () => {
    const csraSummary: OverviewPageData['csraSummary'] = {
      classification: null,
      assessmentDate: '2021-01-01',
    }
    const prisonerNumber = 'A1234BC'
    const miniSummary = csraSummaryToMiniSummary(csraSummary, false, prisonerNumber)
    expect(miniSummary).toEqual({
      heading: 'CSRA',
      items: [{ text: 'Not entered' }, { text: 'Last review: 01/01/2021', classes: 'hmpps-secondary-text' }],
    })
  })
})
