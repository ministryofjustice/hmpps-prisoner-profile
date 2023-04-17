import { Prisoner } from '../interfaces/prisoner'
import AlertsPageService from './alertsPageService'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { pagedActiveAlertsMock, pagedInactiveAlertsMock } from '../data/localMockData/pagedAlertsMock'
import { PagedListQueryParams } from '../interfaces/prisonApi/pagedList'

jest.mock('../data/prisonApiClient')

describe('Alerts Page', () => {
  let getInmateDetailsSpy: jest.SpyInstance
  let getAlertsSpy: jest.SpyInstance
  let prisonerData: Prisoner
  let alertsPageService: AlertsPageService

  beforeEach(() => {
    prisonerData = { bookingId: 123456, firstName: 'JOHN', lastName: 'SMITH' } as Prisoner
    alertsPageService = new AlertsPageService(null)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Get Alerts', () => {
    it('should call Prison API tp get active alerts when queryParams includes ACTIVE', async () => {
      const queryParams: PagedListQueryParams = { alertStatus: 'ACTIVE' }
      getInmateDetailsSpy = jest
        .spyOn<any, string>(alertsPageService['prisonApiClient'], 'getInmateDetail')
        .mockResolvedValue({
          ...inmateDetailMock,
          activeAlertCount: pagedActiveAlertsMock.totalElements,
          inactiveAlertCount: 0,
        })
      getAlertsSpy = jest
        .spyOn<any, string>(alertsPageService['prisonApiClient'], 'getAlerts')
        .mockResolvedValue(pagedActiveAlertsMock)

      const alertsPageData = await alertsPageService.get(prisonerData, queryParams)

      expect(getInmateDetailsSpy).toHaveBeenCalledWith(prisonerData.bookingId)
      expect(getAlertsSpy).toHaveBeenCalledWith(prisonerData.bookingId, queryParams)

      expect(alertsPageData.pagedAlerts).toEqual(pagedActiveAlertsMock)
      // expect(alertsPageData.alertsCodes).toEqual(inmateDetailMock.alertsCodes)
      expect(alertsPageData.activeAlertCount).toEqual(80)
      expect(alertsPageData.inactiveAlertCount).toEqual(0)
      expect(alertsPageData.fullName).toEqual('John Smith')
    })

    it('should call Prison API to get inactive alerts when queryParams includes INACTIVE', async () => {
      const queryParams: PagedListQueryParams = { alertStatus: 'INACTIVE' }
      getInmateDetailsSpy = jest
        .spyOn<any, string>(alertsPageService['prisonApiClient'], 'getInmateDetail')
        .mockResolvedValue({
          ...inmateDetailMock,
          activeAlertCount: 0,
          inactiveAlertCount: pagedActiveAlertsMock.totalElements,
        })
      getAlertsSpy = jest
        .spyOn<any, string>(alertsPageService['prisonApiClient'], 'getAlerts')
        .mockResolvedValue(pagedInactiveAlertsMock)

      const alertsPageData = await alertsPageService.get(prisonerData, queryParams)

      expect(getInmateDetailsSpy).toHaveBeenCalledWith(prisonerData.bookingId)
      expect(getAlertsSpy).toHaveBeenCalledWith(prisonerData.bookingId, queryParams)

      expect(alertsPageData.pagedAlerts).toEqual(pagedInactiveAlertsMock)
      // expect(alertsPageData.alertsCodes).toEqual(inmateDetailMock.alertsCodes)
      expect(alertsPageData.activeAlertCount).toEqual(0)
      expect(alertsPageData.inactiveAlertCount).toEqual(80)
      expect(alertsPageData.fullName).toEqual('John Smith')
    })
  })
})
