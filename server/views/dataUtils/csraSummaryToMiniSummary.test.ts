import csraSummaryToMiniSummary from './csraSummaryToMiniSummary'
import OverviewPageData from '../../controllers/interfaces/OverviewPageData'
import config from '../../config'

describe('csraSummaryToMiniSummary', () => {
  const originalCsraServiceEnabled = config.featureToggles.csraServiceEnabled

  beforeEach(() => {
    config.featureToggles.csraServiceEnabled = false
  })
  afterEach(() => {
    config.featureToggles.csraServiceEnabled = originalCsraServiceEnabled
    jest.useRealTimers()
  })

  it('should return a mini summary object', () => {
    const csraSummary: OverviewPageData['csraSummary'] = {
      classification: 'Standard',
      assessmentDate: '2021-01-01',
    }
    const prisonerNumber = 'A1234BC'
    const miniSummary = csraSummaryToMiniSummary(csraSummary, true, prisonerNumber)
    expect(miniSummary).toEqual({
      id: 'csra',
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
      id: 'csra',
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
      id: 'csra',
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
      id: 'csra',
      heading: 'CSRA',
      items: [{ text: 'Not entered' }, { text: 'Last review: 01/01/2021', classes: 'hmpps-secondary-text' }],
    })
  })

  describe('when CSRA setting is on', () => {
    const prisonerNumber = 'A1234BC'
    const csraDetailsLink = {
      linkLabel: 'CSRA details',
      linkHref: `${config.serviceUrls.csraService}/prisoner/A1234BC`,
    }

    const summaryWith = (currentCsra: object) =>
      ({
        classification: 'Standard',
        assessmentDate: '2021-01-01',
        currentCsra,
      }) as OverviewPageData['csraSummary']

    beforeEach(() => {
      config.featureToggles.csraServiceEnabled = true
      jest.useFakeTimers().setSystemTime(new Date('2026-07-29T12:00:00'))
    })

    it.each([
      ['No rating', { status: 'NO_RATING', description: 'No rating' }, []],
      ['Standard risk', { status: 'COMPLETE', description: 'Standard risk' }, []],
      [
        'High risk - specific',
        {
          status: 'COMPLETE',
          rating: 'HIGH_SPECIFIC',
          ratingStage: 'FINAL',
          description: 'High risk - specific',
          reviewDueDate: '2027-07-28',
        },
        [{ text: 'Review due by: 28/07/2027', classes: 'hmpps-secondary-text' }],
      ],
      [
        'High risk - specific (provisional)',
        {
          status: 'PROVISIONAL',
          rating: 'HIGH_SPECIFIC',
          ratingStage: 'PROVISIONAL',
          description: 'High risk - specific (provisional)',
        },
        [],
      ],
      [
        'High risk - general (provisional)',
        {
          status: 'PROVISIONAL',
          rating: 'HIGH_GENERAL',
          ratingStage: 'PROVISIONAL',
          description: 'High risk - general (provisional)',
        },
        [],
      ],
      [
        'High risk - general (interim)',
        {
          status: 'COMPLETE',
          rating: 'HIGH_GENERAL',
          ratingStage: 'INTERIM',
          description: 'High risk - general (interim)',
          reviewDueDate: '2027-07-28',
        },
        [{ text: 'Review due by: 28/07/2027', classes: 'hmpps-secondary-text' }],
      ],
      [
        'High risk (NOMIS)',
        {
          status: 'COMPLETE',
          rating: 'HIGH',
          description: 'High risk',
          reviewDueDate: '2027-07-28',
        },
        [{ text: 'Review due by: 28/07/2027', classes: 'hmpps-secondary-text' }],
      ],
    ])('shows %s', (description, currentCsra, extraItems) => {
      const miniSummary = csraSummaryToMiniSummary(summaryWith(currentCsra), false, prisonerNumber)
      expect(miniSummary).toEqual({
        id: 'csra',
        heading: 'CSRA',
        items: [{ text: currentCsra.description }, ...extraItems],
        ...csraDetailsLink,
      })
    })

    it('shows an overdue marker when the review due date has passed', () => {
      const currentCsra = {
        status: 'COMPLETE',
        rating: 'HIGH_GENERAL',
        ratingStage: 'FINAL',
        description: 'High risk - general',
        reviewDueDate: '2026-07-04',
      }

      const miniSummary = csraSummaryToMiniSummary(summaryWith(currentCsra), false, prisonerNumber)

      expect(miniSummary).toEqual({
        id: 'csra',
        heading: 'CSRA',
        items: [
          { text: 'High risk - general' },
          { text: 'Review due by: 04/07/2026', classes: 'hmpps-secondary-text' },
          { text: '25 days overdue', showWarningIcon: true, classes: 'hmpps-red-text govuk-!-font-weight-bold' },
        ],
        ...csraDetailsLink,
      })
    })

    it('shows the CSRA details link even without history permission', () => {
      const miniSummary = csraSummaryToMiniSummary(
        summaryWith({ status: 'NO_RATING', description: 'No rating' }),
        false,
        prisonerNumber,
      )

      expect(miniSummary.linkLabel).toEqual('CSRA details')
      expect(miniSummary.linkHref).toEqual(csraDetailsLink.linkHref)
    })

    it('falls back to "Not entered" when Prisoner Search has no currentCsra', () => {
      const miniSummary = csraSummaryToMiniSummary(summaryWith(undefined), false, prisonerNumber)

      expect(miniSummary.items).toEqual([{ text: 'Not entered' }])
    })
  })
})
