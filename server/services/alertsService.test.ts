import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import AlertsService from './alertsService'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { AlertsApiClient } from '../data/interfaces/alertsApi/alertsApiClient'
import { AlertsListQueryParams } from '../data/interfaces/prisonApi/PagedList'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import {
  pagedActiveAlertsMock,
  pagedActivePrisonApiAlertsMock,
  pagedInactiveAlertsMock,
  pagedInactivePrisonApiAlertsMock,
} from '../data/localMockData/pagedAlertsMock'
import {
  alertDetailsCreatedMock,
  alertDetailsCreatedViaMapperMock,
  alertDetailsMock,
  prisonApiAlertDetailsMock,
} from '../data/localMockData/alertDetailsMock'
import { alertFormMock } from '../data/localMockData/alertFormMock'
import FeatureToggleService from './featureToggleService'
import FeatureToggleStore from '../data/featureToggleStore/featureToggleStore'
import { AlertSummaryData } from '../data/interfaces/alertsApi/Alert'
import { alertFlagLabels } from '../data/alertFlags/alertFlags'

jest.mock('../data/prisonApiClient')

describe('Alerts Service', () => {
  let prisonApiClientSpy: PrisonApiClient
  let alertsApiClientSpy: AlertsApiClient
  let prisonerData: Prisoner
  let alertSummaryData: AlertSummaryData
  let alertsService: AlertsService
  let featureToggleStoreMock: FeatureToggleStore

  beforeEach(() => {
    prisonerData = { bookingId: 123456, prisonerNumber: 'A1234AB', firstName: 'JOHN', lastName: 'SMITH' } as Prisoner
    alertSummaryData = {
      activeAlertCount: 80,
      inactiveAlertCount: 0,
      activeAlertTypesFilter: {},
      inactiveAlertTypesFilter: {},
      alertFlags: alertFlagLabels,
    }
    prisonApiClientSpy = prisonApiClientMock()
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

  describe('Caseload not enabled for Alerts API', () => {
    beforeEach(() => {
      featureToggleStoreMock = {
        getToggle: jest.fn(async () => false),
        setToggle: jest.fn(),
      }
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
        alertsApiClientSpy.getAlerts = jest.fn(async () => pagedActiveAlertsMock)

        alertsService = new AlertsService(
          () => prisonApiClientSpy,
          () => alertsApiClientSpy,
          new FeatureToggleService(featureToggleStoreMock),
        )
        const alertsPageData = await alertsService.get('', 'MDI', prisonerData, alertSummaryData, queryParams)

        expect(prisonApiClientSpy.getInmateDetail).toHaveBeenCalledWith(prisonerData.bookingId)
        expect(prisonApiClientSpy.getAlerts).toHaveBeenCalledWith(prisonerData.bookingId, {
          alertStatus: 'ACTIVE',
          size: 20,
        })

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

        alertsService = new AlertsService(
          () => prisonApiClientSpy,
          () => alertsApiClientSpy,
          new FeatureToggleService(featureToggleStoreMock),
        )
        const alertsPageData = await alertsService.get('', 'MDI', prisonerData, alertSummaryData, queryParams)

        expect(prisonApiClientSpy.getInmateDetail).toHaveBeenCalledWith(prisonerData.bookingId)
        expect(prisonApiClientSpy.getAlerts).toHaveBeenCalledWith(prisonerData.bookingId, {
          alertStatus: 'INACTIVE',
          size: 20,
        })

        expect(alertsPageData.pagedAlerts).toEqual(pagedInactiveAlertsMock)
        expect(alertsPageData.activeAlertCount).toEqual(0)
        expect(alertsPageData.inactiveAlertCount).toEqual(80)
        expect(alertsPageData.fullName).toEqual('John Smith')
      })
    })

    describe('Create alert', () => {
      it('should call Prison API to create the alert', async () => {
        prisonApiClientSpy.createAlert = jest.fn(async () => prisonApiAlertDetailsMock)

        alertsService = new AlertsService(
          () => prisonApiClientSpy,
          () => alertsApiClientSpy,
          new FeatureToggleService(featureToggleStoreMock),
        )
        const alert = await alertsService.createAlert('', {
          prisonId: 'MDI',
          bookingId: 123456,
          prisonerNumber: '',
          alertForm: alertFormMock,
        })

        expect(alert).toEqual(alertDetailsCreatedViaMapperMock)
      })

      it('should call Prison API to create the alert without expiry date', async () => {
        prisonApiClientSpy.createAlert = jest.fn(async () => prisonApiAlertDetailsMock)

        alertsService = new AlertsService(
          () => prisonApiClientSpy,
          () => alertsApiClientSpy,
          new FeatureToggleService(featureToggleStoreMock),
        )
        const alert = await alertsService.createAlert('', {
          prisonId: 'MDI',
          bookingId: 123456,
          prisonerNumber: '',
          alertForm: { ...alertFormMock, activeTo: null },
        })

        expect(alert).toEqual(alertDetailsCreatedViaMapperMock)
      })
    })

    describe('Get Alert Details', () => {
      it('should call Prison API tp get alert details', async () => {
        prisonApiClientSpy.getAlertDetails = jest.fn(async () => prisonApiAlertDetailsMock)

        alertsService = new AlertsService(
          () => prisonApiClientSpy,
          () => alertsApiClientSpy,
          new FeatureToggleService(featureToggleStoreMock),
        )
        const alertDetails = await alertsService.getAlertDetails('', 'MDI', 123456, '1')

        expect(prisonApiClientSpy.getAlertDetails).toHaveBeenCalledWith(prisonerData.bookingId, '1')

        expect(alertDetails).toEqual(alertDetailsCreatedViaMapperMock)
      })
    })

    describe('Update alert', () => {
      it('should call Prison API to update the alert', async () => {
        prisonApiClientSpy.updateAlert = jest.fn(async () => prisonApiAlertDetailsMock)

        alertsService = new AlertsService(
          () => prisonApiClientSpy,
          () => alertsApiClientSpy,
          new FeatureToggleService(featureToggleStoreMock),
        )
        const alert = await alertsService.updateAlert('', 'MDI', 123456, '1', { description: 'Comment' })

        expect(alert).toEqual(alertDetailsCreatedViaMapperMock)
      })
    })
  })

  describe('Caseload is enabled for Alerts API', () => {
    beforeEach(() => {
      featureToggleStoreMock = {
        getToggle: jest.fn(async () => true),
        setToggle: jest.fn(),
      }
    })

    describe('Get Alerts', () => {
      it('should call Alerts API tp get active alerts when queryParams includes ACTIVE', async () => {
        const queryParams: AlertsListQueryParams = { alertStatus: 'ACTIVE' }
        prisonApiClientSpy.getInmateDetail = jest.fn(async () => ({
          ...inmateDetailMock,
          activeAlertCount: pagedActivePrisonApiAlertsMock.totalElements,
          inactiveAlertCount: 0,
        }))
        alertsApiClientSpy.getAlerts = jest.fn(async () => pagedActiveAlertsMock)

        alertsService = new AlertsService(
          () => prisonApiClientSpy,
          () => alertsApiClientSpy,
          new FeatureToggleService(featureToggleStoreMock),
        )
        const alertsPageData = await alertsService.get('', 'MDI', prisonerData, alertSummaryData, queryParams)

        expect(prisonApiClientSpy.getInmateDetail).not.toHaveBeenCalled()
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
        prisonApiClientSpy.getInmateDetail = jest.fn(async () => ({
          ...inmateDetailMock,
          activeAlertCount: 0,
          inactiveAlertCount: pagedActiveAlertsMock.totalElements,
        }))
        alertsApiClientSpy.getAlerts = jest.fn(async () => pagedInactiveAlertsMock)

        alertsService = new AlertsService(
          () => prisonApiClientSpy,
          () => alertsApiClientSpy,
          new FeatureToggleService(featureToggleStoreMock),
        )
        const alertsPageData = await alertsService.get(
          '',
          'MDI',
          prisonerData,
          { ...alertSummaryData, activeAlertCount: 0, inactiveAlertCount: 80 },
          queryParams,
        )

        expect(prisonApiClientSpy.getInmateDetail).not.toHaveBeenCalled()
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

        alertsService = new AlertsService(
          () => prisonApiClientSpy,
          () => alertsApiClientSpy,
          new FeatureToggleService(featureToggleStoreMock),
        )
        const alert = await alertsService.createAlert('', {
          prisonId: 'MDI',
          bookingId: 123456,
          prisonerNumber: 'AA1234A',
          alertForm: alertFormMock,
        })

        expect(alert).toEqual(alertDetailsCreatedMock)
      })

      it('should call Alerts API to create the alert without expiry date', async () => {
        alertsApiClientSpy.createAlert = jest.fn(async () => alertDetailsMock)

        alertsService = new AlertsService(
          () => prisonApiClientSpy,
          () => alertsApiClientSpy,
          new FeatureToggleService(featureToggleStoreMock),
        )
        const alert = await alertsService.createAlert('', {
          prisonId: 'MDI',
          bookingId: 123456,
          prisonerNumber: 'AA1234A',
          alertForm: { ...alertFormMock, activeTo: null },
        })

        expect(alert).toEqual(alertDetailsCreatedMock)
      })
    })

    describe('Get Alert Details', () => {
      it('should call Alerts API tp get alert details', async () => {
        alertsApiClientSpy.getAlertDetails = jest.fn(async () => alertDetailsMock)

        alertsService = new AlertsService(
          () => prisonApiClientSpy,
          () => alertsApiClientSpy,
          new FeatureToggleService(featureToggleStoreMock),
        )
        const alertDetails = await alertsService.getAlertDetails(
          '',
          'MDI',
          123456,
          'c9ba3596-8abf-4fe1-b21c-78170b5ff58d',
        )

        expect(alertsApiClientSpy.getAlertDetails).toHaveBeenCalledWith('c9ba3596-8abf-4fe1-b21c-78170b5ff58d')

        expect(alertDetails).toEqual(alertDetailsCreatedMock)
      })
    })

    describe('Update alert', () => {
      it('should call Alerts API to update the alert', async () => {
        alertsApiClientSpy.updateAlert = jest.fn(async () => alertDetailsMock)

        alertsService = new AlertsService(
          () => prisonApiClientSpy,
          () => alertsApiClientSpy,
          new FeatureToggleService(featureToggleStoreMock),
        )
        const alert = await alertsService.updateAlert('', 'MDI', 123456, 'c9ba3596-8abf-4fe1-b21c-78170b5ff58d', {
          description: 'Comment',
        })

        expect(alert).toEqual(alertDetailsCreatedMock)
      })
    })
  })
})
