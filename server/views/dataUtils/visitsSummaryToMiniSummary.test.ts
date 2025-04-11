import visitsSummaryToMiniSummary from './visitsSummaryToMiniSummary'
import VisitsOverviewSummary from '../../services/interfaces/visitsService/VisitsOverviewSummary'

describe('visitsSummaryToMiniSummary', () => {
  it('should return a mini summary object', () => {
    const visitsSummary: VisitsOverviewSummary = {
      startDate: '2021-01-01',
      remainingVo: 3,
      remainingPvo: 4,
    }
    const prisonerNumber = 'A1234BC'
    const miniSummary = visitsSummaryToMiniSummary(visitsSummary, prisonerNumber)
    expect(miniSummary).toEqual({
      heading: 'Visits',
      topLabel: 'Next visit date',
      topContent: '01/01/2021',
      topClass: 'big',
      bottomLabel: 'Remaining visits',
      bottomContentLine1: '3',
      bottomContentLine3: 'Including 4 privileged visits',
      bottomClass: 'big',
      linkLabel: 'Visits details',
      linkHref: `/prisoner/${prisonerNumber}/visits-details`,
    })
  })

  it('should return a mini summary object with no scheduled visit', () => {
    const visitsSummary: VisitsOverviewSummary = {
      startDate: undefined,
      remainingVo: 0,
      remainingPvo: 0,
    }
    const prisonerNumber = 'A1234BC'
    const miniSummary = visitsSummaryToMiniSummary(visitsSummary, prisonerNumber)
    expect(miniSummary).toEqual({
      heading: 'Visits',
      topLabel: 'Next visit date',
      topContent: 'None scheduled',
      topClass: 'small',
      bottomLabel: 'Remaining visits',
      bottomContentLine1: '0',
      bottomContentLine3: '',
      bottomClass: 'big',
      linkLabel: 'Visits details',
      linkHref: `/prisoner/${prisonerNumber}/visits-details`,
    })
  })

  it('should return a mini summary object with no privileged visits', () => {
    const visitsSummary: VisitsOverviewSummary = {
      startDate: '2021-01-01',
      remainingVo: 3,
      remainingPvo: 0,
    }
    const prisonerNumber = 'A1234BC'
    const miniSummary = visitsSummaryToMiniSummary(visitsSummary, prisonerNumber)
    expect(miniSummary).toEqual({
      heading: 'Visits',
      topLabel: 'Next visit date',
      topContent: '01/01/2021',
      topClass: 'big',
      bottomLabel: 'Remaining visits',
      bottomContentLine1: '3',
      bottomContentLine3: 'No privileged visits',
      bottomClass: 'big',
      linkLabel: 'Visits details',
      linkHref: `/prisoner/${prisonerNumber}/visits-details`,
    })
  })

  it('should return a mini summary object with no visits', () => {
    const visitsSummary: VisitsOverviewSummary = {
      startDate: undefined,
      remainingVo: 0,
      remainingPvo: 0,
    }
    const prisonerNumber = 'A1234BC'
    const miniSummary = visitsSummaryToMiniSummary(visitsSummary, prisonerNumber)
    expect(miniSummary).toEqual({
      heading: 'Visits',
      topLabel: 'Next visit date',
      topContent: 'None scheduled',
      topClass: 'small',
      bottomLabel: 'Remaining visits',
      bottomContentLine1: '0',
      bottomContentLine3: '',
      bottomClass: 'big',
      linkLabel: 'Visits details',
      linkHref: `/prisoner/${prisonerNumber}/visits-details`,
    })
  })

  it('should default bottomContentLine1 to 0 if remainingVo is undefined', () => {
    const visitsSummary: VisitsOverviewSummary = {
      startDate: undefined,
      remainingVo: undefined,
      remainingPvo: 0,
    }
    const prisonerNumber = 'A1234BC'
    const miniSummary = visitsSummaryToMiniSummary(visitsSummary, prisonerNumber)
    expect(miniSummary.bottomContentLine1).toEqual('0')
  })
})
