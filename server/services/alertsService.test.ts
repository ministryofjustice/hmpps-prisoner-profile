import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import AlertsService from './alertsService'
import { AlertsApiClient } from '../data/interfaces/alertsApi/alertsApiClient'
import { AlertsListQueryParams } from '../data/interfaces/prisonApi/PagedList'
import { pagedActiveAlertsMock, pagedInactiveAlertsMock } from '../data/localMockData/pagedAlertsMock'
import { alertDetailsCreatedMock, alertDetailsMock } from '../data/localMockData/alertDetailsMock'
import { alertFormMock } from '../data/localMockData/alertFormMock'
import { AlertSummaryData } from '../data/interfaces/alertsApi/Alert'

jest.mock('../data/prisonApiClient')

describe('Alerts Service', () => {
  let alertsApiClientSpy: AlertsApiClient
  let prisonerData: Prisoner
  let alertSummaryData: AlertSummaryData
  let alertsService: AlertsService

  beforeEach(() => {
    prisonerData = { bookingId: 123456, prisonerNumber: 'A1234AB', firstName: 'JOHN', lastName: 'SMITH' } as Prisoner
    alertSummaryData = {
      activeAlertCount: 80,
      inactiveAlertCount: 0,
      activeAlertTypesFilter: {},
      inactiveAlertTypesFilter: {},
      alertFlags: [],
      apiUnavailable: false,
    }
    alertsApiClientSpy = {
      createAlert: jest.fn(),
      getAlertDetails: jest.fn(),
      updateAlert: jest.fn(),
      getAlerts: jest.fn(),
      getAlertTypes: jest.fn(),
    } as AlertsApiClient
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Caseload is enabled for Alerts API', () => {
    describe('Get Alerts', () => {
      it('should call Alerts API tp get active alerts when queryParams includes ACTIVE', async () => {
        const queryParams: AlertsListQueryParams = { alertStatus: 'ACTIVE' }
        alertsApiClientSpy.getAlerts = jest.fn(async () => pagedActiveAlertsMock)

        alertsService = new AlertsService(() => alertsApiClientSpy)
        const alertsPageData = await alertsService.get('TOKEN', prisonerData, alertSummaryData, queryParams)

        expect(alertsApiClientSpy.getAlerts).toHaveBeenCalledWith(prisonerData.prisonerNumber, {
          isActive: true,
          size: 20,
          sort: ['createdAt,DESC'],
        })

        expect(alertsPageData.pagedAlerts).toEqual(pagedActiveAlertsMock)
        expect(alertsPageData.activeAlertCount).toEqual(80)
        expect(alertsPageData.inactiveAlertCount).toEqual(0)
        expect(alertsPageData.fullName).toEqual('John Smith')
      })

      it('should call Alerts API to get inactive alerts when queryParams includes INACTIVE', async () => {
        const queryParams: AlertsListQueryParams = { alertStatus: 'INACTIVE', sort: 'dateExpires,DESC' }
        alertsApiClientSpy.getAlerts = jest.fn(async () => pagedInactiveAlertsMock)

        alertsService = new AlertsService(() => alertsApiClientSpy)
        const alertsPageData = await alertsService.get(
          'TOKEN',
          prisonerData,
          { ...alertSummaryData, activeAlertCount: 0, inactiveAlertCount: 80 },
          queryParams,
        )

        expect(alertsApiClientSpy.getAlerts).toHaveBeenCalledWith(prisonerData.prisonerNumber, {
          isActive: false,
          size: 20,
          sort: ['activeTo,DESC', 'lastModifiedAt,DESC', 'createdAt,DESC'],
        })

        expect(alertsPageData.pagedAlerts).toEqual(pagedInactiveAlertsMock)
        expect(alertsPageData.activeAlertCount).toEqual(0)
        expect(alertsPageData.inactiveAlertCount).toEqual(80)
        expect(alertsPageData.fullName).toEqual('John Smith')
      })
    })

    describe('Create alert', () => {
      it('should call Alerts API to create the alert', async () => {
        alertsApiClientSpy.createAlert = jest.fn(async () => alertDetailsMock)

        alertsService = new AlertsService(() => alertsApiClientSpy)
        const alert = await alertsService.createAlert('TOKEN', {
          prisonerNumber: 'AA1234A',
          alertForm: alertFormMock,
        })

        expect(alert).toEqual(alertDetailsCreatedMock)
      })

      it('should call Alerts API to create the alert without expiry date', async () => {
        alertsApiClientSpy.createAlert = jest.fn(async () => alertDetailsMock)

        alertsService = new AlertsService(() => alertsApiClientSpy)
        const alert = await alertsService.createAlert('TOKEN', {
          prisonerNumber: 'AA1234A',
          alertForm: { ...alertFormMock, activeTo: null },
        })

        expect(alert).toEqual(alertDetailsCreatedMock)
      })
    })

    describe('Get Alert Details', () => {
      it('should call Alerts API tp get alert details', async () => {
        alertsApiClientSpy.getAlertDetails = jest.fn(async () => alertDetailsMock)

        alertsService = new AlertsService(() => alertsApiClientSpy)
        const alertDetails = await alertsService.getAlertDetails('TOKEN', 'c9ba3596-8abf-4fe1-b21c-78170b5ff58d')

        expect(alertsApiClientSpy.getAlertDetails).toHaveBeenCalledWith('c9ba3596-8abf-4fe1-b21c-78170b5ff58d')

        expect(alertDetails).toEqual(alertDetailsCreatedMock)
      })
    })

    describe('Update alert', () => {
      it('should call Alerts API to update the alert', async () => {
        alertsApiClientSpy.updateAlert = jest.fn(async () => alertDetailsMock)

        alertsService = new AlertsService(() => alertsApiClientSpy)
        const alert = await alertsService.updateAlert('TOKEN', 'c9ba3596-8abf-4fe1-b21c-78170b5ff58d', {
          description: 'Comment',
        })

        expect(alert).toEqual(alertDetailsCreatedMock)
      })
    })
  })
})
