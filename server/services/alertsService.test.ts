import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import AlertsService from './alertsService'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import {
  pagedActiveAlertsMock,
  pagedActivePrisonApiAlertsMock,
  pagedInactiveAlertsMock,
  pagedInactivePrisonApiAlertsMock,
} from '../data/localMockData/pagedAlertsMock'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { alertFormMock } from '../data/localMockData/alertFormMock'
import { alertDetailsCreatedMock, prisonApiAlertDetailsMock } from '../data/localMockData/alertDetailsMock'
import { AlertsListQueryParams } from '../data/interfaces/prisonApi/PagedList'

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
      const queryParams: AlertsListQueryParams = { alertStatus: 'ACTIVE' }
      prisonApiClientSpy.getInmateDetail = jest.fn(async () => ({
        ...inmateDetailMock,
        activeAlertCount: pagedActivePrisonApiAlertsMock.totalElements,
        inactiveAlertCount: 0,
      }))
      prisonApiClientSpy.getAlerts = jest.fn(async () => pagedActivePrisonApiAlertsMock)

      alertsService = new AlertsService(() => prisonApiClientSpy)
      const alertsPageData = await alertsService.get('', prisonerData, queryParams)

      expect(prisonApiClientSpy.getInmateDetail).toHaveBeenCalledWith(prisonerData.bookingId)
      expect(prisonApiClientSpy.getAlerts).toHaveBeenCalledWith(prisonerData.bookingId, { alertStatus: 'ACTIVE' })

      expect(alertsPageData.pagedAlerts).toEqual(pagedActiveAlertsMock)
      expect(alertsPageData.activeAlertCount).toEqual(80)
      expect(alertsPageData.inactiveAlertCount).toEqual(0)
      expect(alertsPageData.fullName).toEqual('John Smith')
    })

    it('should call Prison API to get inactive alerts when queryParams includes INACTIVE', async () => {
      const queryParams: AlertsListQueryParams = { alertStatus: 'INACTIVE' }
      prisonApiClientSpy.getInmateDetail = jest.fn(async () => ({
        ...inmateDetailMock,
        activeAlertCount: 0,
        inactiveAlertCount: pagedActiveAlertsMock.totalElements,
      }))
      prisonApiClientSpy.getAlerts = jest.fn(async () => pagedInactivePrisonApiAlertsMock)

      alertsService = new AlertsService(() => prisonApiClientSpy)
      const alertsPageData = await alertsService.get('', prisonerData, queryParams)

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
      prisonApiClientSpy.createAlert = jest.fn(async () => prisonApiAlertDetailsMock)

      alertsService = new AlertsService(() => prisonApiClientSpy)
      const alert = await alertsService.createAlert('', {
        bookingId: 123456,
        prisonerNumber: '',
        alertForm: alertFormMock,
      })

      expect(alert).toEqual(alertDetailsCreatedMock)
    })

    it('should call Prison API to create the alert without expiry date', async () => {
      prisonApiClientSpy.createAlert = jest.fn(async () => prisonApiAlertDetailsMock)

      alertsService = new AlertsService(() => prisonApiClientSpy)
      const alert = await alertsService.createAlert('', {
        bookingId: 123456,
        prisonerNumber: '',
        alertForm: { ...alertFormMock, activeTo: null },
      })

      expect(alert).toEqual(alertDetailsCreatedMock)
    })
  })

  describe('Get Alert Details', () => {
    it('should call Prison API tp get alert details', async () => {
      prisonApiClientSpy.getAlertDetails = jest.fn(async () => prisonApiAlertDetailsMock)

      alertsService = new AlertsService(() => prisonApiClientSpy)
      const alertDetails = await alertsService.getAlertDetails('', 123456, '1')

      expect(prisonApiClientSpy.getAlertDetails).toHaveBeenCalledWith(prisonerData.bookingId, '1')

      expect(alertDetails).toEqual(alertDetailsCreatedMock)
    })
  })

  describe('Update alert', () => {
    it('should call Prison API to update the alert', async () => {
      prisonApiClientSpy.updateAlert = jest.fn(async () => prisonApiAlertDetailsMock)

      alertsService = new AlertsService(() => prisonApiClientSpy)
      const alert = await alertsService.updateAlert('', 123456, '1', { description: 'Comment' })

      expect(alert).toEqual(alertDetailsCreatedMock)
    })
  })
})
