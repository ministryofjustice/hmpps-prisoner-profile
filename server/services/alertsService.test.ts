import { Prisoner } from '../interfaces/prisoner'
import AlertsService from './alertsService'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { pagedActiveAlertsMock, pagedInactiveAlertsMock } from '../data/localMockData/pagedAlertsMock'
import { PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { alertFormMock } from '../data/localMockData/alertFormMock'
import { alertDetailsMock } from '../data/localMockData/alertDetailsMock'

jest.mock('../data/prisonApiClient')

describe('Alerts Service', () => {
  let prisonApiClientSpy: PrisonApiClient
  let prisonerData: Prisoner
  let alertsService: AlertsService

  beforeEach(() => {
    prisonerData = { bookingId: 123456, firstName: 'JOHN', lastName: 'SMITH' } as Prisoner
    prisonApiClientSpy = prisonApiClientMock()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Get Alerts', () => {
    it('should call Prison API tp get active alerts when queryParams includes ACTIVE', async () => {
      const queryParams: PagedListQueryParams = { alertStatus: 'ACTIVE' }
      prisonApiClientSpy.getInmateDetail = jest.fn(async () => ({
        ...inmateDetailMock,
        activeAlertCount: pagedActiveAlertsMock.totalElements,
        inactiveAlertCount: 0,
      }))
      prisonApiClientSpy.getAlerts = jest.fn(async () => pagedActiveAlertsMock)

      alertsService = new AlertsService(() => prisonApiClientSpy)
      const alertsPageData = await alertsService.get('', prisonerData, queryParams, true)

      expect(prisonApiClientSpy.getInmateDetail).toHaveBeenCalledWith(prisonerData.bookingId)
      expect(prisonApiClientSpy.getAlerts).toHaveBeenCalledWith(prisonerData.bookingId, { alertStatus: 'ACTIVE' })

      expect(alertsPageData.pagedAlerts).toEqual(pagedActiveAlertsMock)
      expect(alertsPageData.activeAlertCount).toEqual(80)
      expect(alertsPageData.inactiveAlertCount).toEqual(0)
      expect(alertsPageData.fullName).toEqual('John Smith')
    })

    it('should call Prison API to get inactive alerts when queryParams includes INACTIVE', async () => {
      const queryParams: PagedListQueryParams = { alertStatus: 'INACTIVE' }
      prisonApiClientSpy.getInmateDetail = jest.fn(async () => ({
        ...inmateDetailMock,
        activeAlertCount: 0,
        inactiveAlertCount: pagedActiveAlertsMock.totalElements,
      }))
      prisonApiClientSpy.getAlerts = jest.fn(async () => pagedInactiveAlertsMock)

      alertsService = new AlertsService(() => prisonApiClientSpy)
      const alertsPageData = await alertsService.get('', prisonerData, queryParams, true)

      expect(prisonApiClientSpy.getInmateDetail).toHaveBeenCalledWith(prisonerData.bookingId)
      expect(prisonApiClientSpy.getAlerts).toHaveBeenCalledWith(prisonerData.bookingId, { alertStatus: 'INACTIVE' })

      expect(alertsPageData.pagedAlerts).toEqual(pagedInactiveAlertsMock)
      expect(alertsPageData.activeAlertCount).toEqual(0)
      expect(alertsPageData.inactiveAlertCount).toEqual(80)
      expect(alertsPageData.fullName).toEqual('John Smith')
    })
  })

  describe('Create alert', () => {
    it('should call Prison API to create the alert', async () => {
      prisonApiClientSpy.createAlert = jest.fn(async () => pagedActiveAlertsMock.content[0])

      alertsService = new AlertsService(() => prisonApiClientSpy)
      const alert = await alertsService.createAlert('', 123456, alertFormMock)

      expect(alert).toEqual(pagedActiveAlertsMock.content[0])
    })

    it('should call Prison API to create the alert without expiry date', async () => {
      prisonApiClientSpy.createAlert = jest.fn(async () => pagedActiveAlertsMock.content[0])

      alertsService = new AlertsService(() => prisonApiClientSpy)
      const alert = await alertsService.createAlert('', 123456, { ...alertFormMock, expiryDate: null })

      expect(alert).toEqual(pagedActiveAlertsMock.content[0])
    })
  })

  describe('Get Alert Details', () => {
    it('should call Prison API tp get alert details', async () => {
      prisonApiClientSpy.getAlertDetails = jest.fn(async () => alertDetailsMock)

      alertsService = new AlertsService(() => prisonApiClientSpy)
      const alertDetails = await alertsService.getAlertDetails('', 123456, 1)

      expect(prisonApiClientSpy.getAlertDetails).toHaveBeenCalledWith(prisonerData.bookingId, 1)

      expect(alertDetails).toEqual({ ...alertDetailsMock, addedByFullName: 'James T Kirk', expiredByFullName: '' })
    })
  })

  describe('Update alert', () => {
    it('should call Prison API to update the alert', async () => {
      prisonApiClientSpy.updateAlert = jest.fn(async () => pagedActiveAlertsMock.content[0])

      alertsService = new AlertsService(() => prisonApiClientSpy)
      const alert = await alertsService.updateAlert('', 123456, 1, { comment: 'Comment' })

      expect(alert).toEqual(pagedActiveAlertsMock.content[0])
    })
  })
})
