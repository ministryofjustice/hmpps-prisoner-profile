import { addDays } from 'date-fns'
import AlertsController from './alertsController'
import * as headerMappers from '../mappers/headerMappers'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { Role } from '../data/enums/role'
import AlertsService from '../services/alertsService'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { alertTypesMock } from '../data/localMockData/alertTypesMock'
import { alertFormMock } from '../data/localMockData/alertFormMock'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { alertDetailsMock } from '../data/localMockData/alertDetailsMock'
import { formatLocation, formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { formatDate, formatDateISO } from '../utils/dateHelpers'
import { pagedActiveAlertsMock, pagedInactiveAlertsMock } from '../data/localMockData/pagedAlertsMock'

let req: any
let res: any
let next: any
let controller: AlertsController

jest.mock('../services/prisonerSearch.ts')
jest.mock('../services/alertsService.ts')

describe('Alerts Controller', () => {
  describe('Alerts page', () => {
    beforeEach(() => {
      req = {
        params: { prisonerNumber: '' },
        query: { page: '0', sort: 'dateCreated,ASC', alertType: 'R', from: '01/01/2023', to: '02/02/2023' },
        path: 'alerts/active',
        middleware: {
          clientToken: 'CLIENT_TOKEN',
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
          alertSummaryData: { alertFlags: [] },
        },
      }
      res = {
        locals: {
          user: {
            authSource: 'nomis',
            activeCaseLoadId: 'MDI',
            userRoles: [Role.UpdateAlert],
            caseLoads: CaseLoadsDummyDataA,
            token: 'TOKEN',
          },
        },
        render: jest.fn(),
      }
      next = jest.fn()
      controller = new AlertsController(new AlertsService(null), auditServiceMock())
    })

    it('should get active alerts', async () => {
      const getAlertsSpy = jest
        .spyOn<any, string>(controller['alertsService'], 'get')
        .mockResolvedValue({ pagedAlerts: pagedActiveAlertsMock })
      const mapSpy = jest.spyOn(headerMappers, 'mapHeaderData')

      await controller.displayAlerts(req, res, next, true)

      expect(getAlertsSpy).toHaveBeenCalledWith(
        req.middleware.clientToken,
        PrisonerMockDataA,
        req.middleware.alertSummaryData,
        {
          alertStatus: 'ACTIVE',
          page: 0,
          sort: 'dateCreated,ASC',
          alertType: 'R',
          from: '01/01/2023',
          to: '02/02/2023',
        },
      )
      expect(mapSpy).toHaveBeenCalledWith(
        PrisonerMockDataA,
        inmateDetailMock,
        req.middleware.alertSummaryData,
        res.locals.user,
        'alerts',
      )
    })

    it('should handle API being unavailable', async () => {
      req.middleware.alertSummaryData.apiUnavailable = true
      const getAlertsSpy = jest
        .spyOn<any, string>(controller['alertsService'], 'get')
        .mockResolvedValue({ pagedAlerts: pagedInactiveAlertsMock })

      await controller.displayAlerts(req, res, next, true)

      expect(getAlertsSpy).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith(
        'pages/alerts/alertsPage',
        expect.objectContaining({
          alertSummaryData: expect.objectContaining({
            apiUnavailable: true,
          }),
        }),
      )
    })

    it('should get inactive alerts', async () => {
      req.path = 'alerts/inactive'

      const getAlertsSpy = jest
        .spyOn<any, string>(controller['alertsService'], 'get')
        .mockResolvedValue({ pagedAlerts: pagedInactiveAlertsMock })
      const mapSpy = jest.spyOn(headerMappers, 'mapHeaderData')

      await controller.displayAlerts(req, res, next, false)

      expect(getAlertsSpy).toHaveBeenCalledWith(
        req.middleware.clientToken,
        PrisonerMockDataA,
        req.middleware.alertSummaryData,
        {
          alertStatus: 'INACTIVE',
          page: 0,
          sort: 'dateCreated,ASC',
          alertType: 'R',
          from: '01/01/2023',
          to: '02/02/2023',
        },
      )
      expect(mapSpy).toHaveBeenCalledWith(
        PrisonerMockDataA,
        inmateDetailMock,
        req.middleware.alertSummaryData,
        res.locals.user,
        'alerts',
      )
    })
  })

  describe('Add alert page', () => {
    beforeEach(() => {
      req = {
        params: { prisonerNumber: 'G6123VU' },
        query: {},
        path: 'alerts/add-alert',
        middleware: {
          clientToken: 'CLIENT_TOKEN',
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
        },
        flash: jest.fn(),
      }
      res = {
        locals: {
          user: {
            activeCaseLoadId: 'MDI',
            userRoles: [Role.UpdateAlert],
            caseLoads: CaseLoadsDummyDataA,
          },
        },
        render: jest.fn(),
        redirect: jest.fn(),
        send: jest.fn(),
        sendStatus: jest.fn(),
      }
      next = jest.fn()
      controller = new AlertsController(new AlertsService(null), auditServiceMock())
    })
    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should get ref data for alert form', async () => {
      const getAlertTypes = jest
        .spyOn<any, string>(controller['alertsService'], 'getAlertTypes')
        .mockResolvedValue(alertTypesMock)

      await controller.displayAddAlert(req, res, next)

      expect(getAlertTypes).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })

    it('should filter out excluded alert codes (DOCGM and DRONE)', async () => {
      jest.spyOn<any, string>(controller['alertsService'], 'getAlertTypes').mockResolvedValue(alertTypesMock)

      await controller.displayAddAlert(req, res, next)

      expect(res.render.mock.calls[0][1].typeCodeMap).toEqual({
        A: [{ text: 'AAA111', value: 'A1', attributes: undefined }],
        B: [{ text: 'BBB111', value: 'B1', attributes: undefined }],
        C: [{ text: 'CCC111', value: 'C1', attributes: undefined }],
      })
    })

    it('should add alert', async () => {
      req.body = { ...alertFormMock, bookingId: 123456 }

      const createAlertsSpy = jest
        .spyOn<any, string>(controller['alertsService'], 'createAlert')
        .mockResolvedValue(pagedActiveAlertsMock.content[0])
      jest.spyOn<any, string>(controller['alertsService'], 'getAlertTypes').mockResolvedValue(alertTypesMock)

      await controller.post()(req, res, next)

      expect(createAlertsSpy).toHaveBeenCalledWith('CLIENT_TOKEN', {
        prisonerNumber: req.params.prisonerNumber,
        alertForm: alertFormMock,
      })
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${req.params.prisonerNumber}/alerts/active`)
    })
  })

  describe('Alert details page', () => {
    beforeEach(() => {
      req = {
        params: { prisonerNumber: '' },
        query: {},
        middleware: {
          clientToken: 'CLIENT_TOKEN',
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
        },
      }
      res = {
        locals: {
          user: {
            activeCaseLoadId: 'MDI',
            userRoles: [Role.UpdateAlert],
            caseLoads: CaseLoadsDummyDataA,
            token: 'TOKEN',
          },
        },
        render: jest.fn(),
      }
      next = jest.fn()
      controller = new AlertsController(new AlertsService(null), auditServiceMock())
    })

    it('should get one alert', async () => {
      req.query = { ids: 1 }
      const getAlertDetailsSpy = jest
        .spyOn<any, string>(controller['alertsService'], 'getAlertDetails')
        .mockResolvedValue(alertDetailsMock)
      const { prisonerNumber, cellLocation, firstName, lastName } = PrisonerMockDataA
      const prisonerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })

      await controller.displayAlert()(req, res, next)

      expect(getAlertDetailsSpy).toHaveBeenCalledWith(req.middleware.clientToken, '1')
      expect(res.render).toHaveBeenCalledWith('pages/alerts/alertDetailsPage', {
        pageTitle: 'Alerts',
        miniBannerData: {
          prisonerName,
          prisonerNumber,
          cellLocation: formatLocation(cellLocation),
          prisonerThumbnailImageUrl: '/api/prisoner/G6123VU/image?imageId=1413311&fullSizeImage=false',
        },
        alerts: [alertDetailsMock],
      })
    })

    it('should get two alerts', async () => {
      req.query = { ids: [1, 2] }
      const getAlertDetailsSpy = jest
        .spyOn<any, string>(controller['alertsService'], 'getAlertDetails')
        .mockResolvedValue(alertDetailsMock)

      const { prisonerNumber, cellLocation, firstName, lastName } = PrisonerMockDataA
      const prisonerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })

      await controller.displayAlert()(req, res, next)

      expect(getAlertDetailsSpy).toHaveBeenCalledWith(req.middleware.clientToken, '1')
      expect(getAlertDetailsSpy).toHaveBeenCalledWith(req.middleware.clientToken, '2')

      expect(res.render).toHaveBeenCalledWith('pages/alerts/alertDetailsPage', {
        pageTitle: 'Alerts',
        miniBannerData: {
          prisonerName,
          prisonerNumber,
          cellLocation: formatLocation(cellLocation),
          prisonerThumbnailImageUrl: '/api/prisoner/G6123VU/image?imageId=1413311&fullSizeImage=false',
        },
        alerts: [alertDetailsMock, alertDetailsMock],
      })
    })
  })

  describe('Get alert details (modal)', () => {
    beforeEach(() => {
      req = {
        params: { prisonerNumber: '' },
        query: {},
        middleware: {
          clientToken: 'CLIENT_TOKEN',
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
        },
      }
      res = {
        locals: {
          user: {
            activeCaseLoadId: 'MDI',
            userRoles: [Role.UpdateAlert],
            caseLoads: CaseLoadsDummyDataA,
            token: 'TOKEN',
          },
        },
        render: jest.fn(),
      }
      next = jest.fn()
      controller = new AlertsController(new AlertsService(null), auditServiceMock())
    })

    it('should get one alert', async () => {
      req.query = { ids: 1 }
      const getAlertDetailsSpy = jest
        .spyOn<any, string>(controller['alertsService'], 'getAlertDetails')
        .mockResolvedValue(alertDetailsMock)
      const { prisonerNumber } = PrisonerMockDataA

      await controller.getAlertDetails()(req, res, next)

      expect(getAlertDetailsSpy).toHaveBeenCalledWith(req.middleware.clientToken, '1')
      expect(res.render).toHaveBeenCalledWith('partials/alerts/alertDetails', {
        alerts: [alertDetailsMock],
        allAlertsUrl: `/prisoner/${prisonerNumber}/alerts/active`,
      })
    })

    it('should get two alerts', async () => {
      req.query = { ids: [1, 2] }
      const getAlertDetailsSpy = jest
        .spyOn<any, string>(controller['alertsService'], 'getAlertDetails')
        .mockResolvedValue(alertDetailsMock)
      const { prisonerNumber } = PrisonerMockDataA

      await controller.getAlertDetails()(req, res, next)

      expect(getAlertDetailsSpy).toHaveBeenCalledWith(req.middleware.clientToken, '1')
      expect(getAlertDetailsSpy).toHaveBeenCalledWith(req.middleware.clientToken, '2')
      expect(res.render).toHaveBeenCalledWith('partials/alerts/alertDetails', {
        alerts: [alertDetailsMock, alertDetailsMock],
        allAlertsUrl: `/prisoner/${prisonerNumber}/alerts/active`,
      })
    })
  })

  describe('Add more details', () => {
    beforeEach(() => {
      req = {
        params: { prisonerNumber: 'G6123VU' },
        query: {},
        path: 'alerts/1/add-more-details',
        middleware: {
          clientToken: 'CLIENT_TOKEN',
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
        },
        flash: jest.fn(),
      }
      res = {
        locals: {
          user: {
            activeCaseLoadId: 'MDI',
            userRoles: [Role.UpdateAlert],
            caseLoads: CaseLoadsDummyDataA,
          },
        },
        render: jest.fn(),
        redirect: jest.fn(),
        send: jest.fn(),
        sendStatus: jest.fn(),
      }
      next = jest.fn()
      controller = new AlertsController(new AlertsService(null), auditServiceMock())
    })
    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should get existing alert record and display page', async () => {
      const existingAlert = alertDetailsMock
      const getAlertDetails = jest
        .spyOn<any, string>(controller['alertsService'], 'getAlertDetails')
        .mockResolvedValue(existingAlert)

      await controller.displayAddMoreDetails(req, res, next)

      expect(getAlertDetails).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/alerts/addMoreDetails', {
        pageTitle: 'Add more details to alert',
        miniBannerData: {
          prisonerName: 'Saunders, John',
          prisonerNumber: 'G6123VU',
          cellLocation: formatLocation('1-1-035'),
          prisonerThumbnailImageUrl: '/api/prisoner/G6123VU/image?imageId=1413311&fullSizeImage=false',
        },
        alert: existingAlert,
        formValues: {
          description: existingAlert.description,
        },
        refererUrl: `/prisoner/G6123VU/alerts/active`,
        errors: [],
      })
    })

    it('should get render already closed page if expired', async () => {
      const getAlertDetails = jest
        .spyOn<any, string>(controller['alertsService'], 'getAlertDetails')
        .mockResolvedValue({ alertDetailsMock, isActive: false })

      await controller.displayAddMoreDetails(req, res, next)

      expect(getAlertDetails).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/alerts/alreadyClosed', {
        pageTitle: 'Alert already closed',
        refererUrl: `/prisoner/G6123VU/alerts/active`,
      })
    })

    it('should redirect back to form if validation errors', async () => {
      req.body = { bookingId: 123456, description: '' }
      req.params = { prisonerNumber: 'G6123VU', alertId: '1' }
      req.errors = [{ text: 'error' }]

      await controller.postAddMoreDetails()(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/G6123VU/alerts/1/add-more-details`)
    })

    it('should redirect back to form with generic error message on 400 from API', async () => {
      req.body = { bookingId: 123456, description: 'Comment' }
      req.params = { prisonerNumber: 'G6123VU', alertId: '1' }

      jest
        .spyOn<any, string>(controller['alertsService'], 'updateAlert')
        .mockRejectedValue({ status: 400, message: 'Bad request' })

      await controller.postAddMoreDetails()(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/G6123VU/alerts/1/add-more-details`)
      expect(req.flash).toHaveBeenNthCalledWith(1, 'alert', { description: 'Comment' })
      expect(req.flash).toHaveBeenNthCalledWith(2, 'errors', [{ text: 'Bad request' }])
    })

    it('should redirect back to form with record lock error message on 423 from API', async () => {
      req.body = { bookingId: 123456, description: 'Comment' }
      req.params = { prisonerNumber: 'G6123VU', alertId: '1' }

      jest.spyOn<any, string>(controller['alertsService'], 'updateAlert').mockRejectedValue({ status: 423 })

      await controller.postAddMoreDetails()(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/G6123VU/alerts/1/add-more-details`)
      expect(req.flash).toHaveBeenNthCalledWith(1, 'alert', { description: 'Comment' })
      expect(req.flash).toHaveBeenNthCalledWith(2, 'errors', [
        { text: 'This alert cannot be updated because someone else has opened it in NOMIS. Try again later.' },
      ])
    })

    it('should update alert', async () => {
      req.body = { bookingId: 123456, description: 'New comment' }
      req.params = { prisonerNumber: 'G6123VU', alertId: '1' }

      const updateAlert = jest
        .spyOn<any, string>(controller['alertsService'], 'updateAlert')
        .mockResolvedValue(alertDetailsMock)

      await controller.postAddMoreDetails()(req, res, next)

      expect(updateAlert).toHaveBeenCalledWith('CLIENT_TOKEN', '1', {
        description: 'New comment',
      })
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${req.params.prisonerNumber}/alerts/active`)
    })
  })

  describe('Close alert', () => {
    beforeEach(() => {
      req = {
        params: { prisonerNumber: 'G6123VU' },
        query: {},
        path: 'alerts/1/close',
        middleware: {
          clientToken: 'CLIENT_TOKEN',
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
        },
        flash: jest.fn(),
      }
      res = {
        locals: {
          user: {
            activeCaseLoadId: 'MDI',
            userRoles: [Role.UpdateAlert],
            caseLoads: CaseLoadsDummyDataA,
          },
        },
        render: jest.fn(),
        redirect: jest.fn(),
        send: jest.fn(),
        sendStatus: jest.fn(),
      }
      next = jest.fn()
      controller = new AlertsController(new AlertsService(null), auditServiceMock())
    })
    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should get existing alert record and display page', async () => {
      const existingAlert = alertDetailsMock
      const getAlertDetails = jest
        .spyOn<any, string>(controller['alertsService'], 'getAlertDetails')
        .mockResolvedValue(existingAlert)

      await controller.displayCloseAlert(req, res, next)

      expect(getAlertDetails).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/alerts/closeAlert', {
        pageTitle: 'Close alert',
        miniBannerData: {
          prisonerName: 'Saunders, John',
          prisonerNumber: 'G6123VU',
          cellLocation: formatLocation('1-1-035'),
          prisonerThumbnailImageUrl: '/api/prisoner/G6123VU/image?imageId=1413311&fullSizeImage=false',
        },
        alert: existingAlert,
        formValues: {
          description: existingAlert.description,
          activeTo: '',
          today: 'yes',
        },
        refererUrl: `/prisoner/G6123VU/alerts/active`,
        tomorrow: formatDate(formatDateISO(addDays(new Date(), 1)), 'short'),
        errors: [],
      })
    })

    it('should render already closed page if expired', async () => {
      const getAlertDetails = jest
        .spyOn<any, string>(controller['alertsService'], 'getAlertDetails')
        .mockResolvedValue({ ...alertDetailsMock, isActive: false })

      await controller.displayCloseAlert(req, res, next)

      expect(getAlertDetails).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/alerts/alreadyClosed', {
        pageTitle: 'Alert already closed',
        refererUrl: `/prisoner/G6123VU/alerts/active`,
      })
    })

    it('should redirect back to form if errors', async () => {
      req.body = { bookingId: 123456, description: '' }
      req.params = { prisonerNumber: 'G6123VU', alertId: '1' }
      req.errors = [{ text: 'error' }]

      await controller.postCloseAlert()(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/G6123VU/alerts/1/close`)
    })

    it('should update alert', async () => {
      req.body = { bookingId: 123456, description: 'New comment', today: 'yes' }
      req.params = { prisonerNumber: 'G6123VU', alertId: '1' }

      const updateAlert = jest
        .spyOn<any, string>(controller['alertsService'], 'updateAlert')
        .mockResolvedValue(alertDetailsMock)

      await controller.postCloseAlert()(req, res, next)

      expect(updateAlert).toHaveBeenCalledWith('CLIENT_TOKEN', '1', {
        description: 'New comment',
        activeTo: formatDateISO(new Date()),
      })
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${req.params.prisonerNumber}/alerts/active`)
    })
  })

  describe('Change or remove end date', () => {
    beforeEach(() => {
      req = {
        params: { prisonerNumber: 'G6123VU' },
        query: {},
        path: 'alerts/1/change-end-date',
        middleware: {
          clientToken: 'CLIENT_TOKEN',
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
        },
        flash: jest.fn(),
      }
      res = {
        locals: {
          user: {
            activeCaseLoadId: 'MDI',
            userRoles: [Role.UpdateAlert],
            caseLoads: CaseLoadsDummyDataA,
          },
        },
        render: jest.fn(),
        redirect: jest.fn(),
        send: jest.fn(),
        sendStatus: jest.fn(),
      }
      next = jest.fn()
      controller = new AlertsController(new AlertsService(null), auditServiceMock())
    })
    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should get existing alert record and display page', async () => {
      const existingAlert = alertDetailsMock
      const getAlertDetails = jest
        .spyOn<any, string>(controller['alertsService'], 'getAlertDetails')
        .mockResolvedValue(existingAlert)

      await controller.displayChangeEndDate(req, res, next)

      expect(getAlertDetails).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/alerts/changeEndDate', {
        pageTitle: 'Change or remove alert end date',
        miniBannerData: {
          prisonerName: 'Saunders, John',
          prisonerNumber: 'G6123VU',
          cellLocation: formatLocation('1-1-035'),
          prisonerThumbnailImageUrl: '/api/prisoner/G6123VU/image?imageId=1413311&fullSizeImage=false',
        },
        alert: existingAlert,
        formValues: {
          description: existingAlert.description,
          activeTo: '',
          removeEndDate: '',
        },
        refererUrl: `/prisoner/G6123VU/alerts/active`,
        today: formatDate(formatDateISO(new Date()), 'short'),
        errors: [],
      })
    })

    it('should render already closed page if expired', async () => {
      const getAlertDetails = jest
        .spyOn<any, string>(controller['alertsService'], 'getAlertDetails')
        .mockResolvedValue({ ...alertDetailsMock, isActive: false })

      await controller.displayChangeEndDate(req, res, next)

      expect(getAlertDetails).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/alerts/alreadyClosed', {
        pageTitle: 'Alert already closed',
        refererUrl: `/prisoner/G6123VU/alerts/active`,
      })
    })

    it('should redirect back to form if errors', async () => {
      req.body = { bookingId: 123456, description: '' }
      req.params = { prisonerNumber: 'G6123VU', alertId: '1' }
      req.errors = [{ text: 'error' }]

      await controller.postChangeEndDate()(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/G6123VU/alerts/1/change-end-date`)
    })

    it('should remove end date on alert', async () => {
      req.body = { bookingId: 123456, description: 'New comment', removeEndDate: 'yes' }
      req.params = { prisonerNumber: 'G6123VU', alertId: '1' }

      const updateAlert = jest
        .spyOn<any, string>(controller['alertsService'], 'updateAlert')
        .mockResolvedValue(alertDetailsMock)

      await controller.postChangeEndDate()(req, res, next)

      expect(updateAlert).toHaveBeenCalledWith('CLIENT_TOKEN', '1', {
        description: 'New comment',
        activeTo: null,
      })
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${req.params.prisonerNumber}/alerts/active`)
    })

    it('should change end date on alert', async () => {
      req.body = { bookingId: 123456, description: 'New comment', activeTo: '01/01/2199', removeEndDate: 'no' }
      req.params = { prisonerNumber: 'G6123VU', alertId: '1' }

      const updateAlert = jest
        .spyOn<any, string>(controller['alertsService'], 'updateAlert')
        .mockResolvedValue(alertDetailsMock)

      await controller.postChangeEndDate()(req, res, next)

      expect(updateAlert).toHaveBeenCalledWith('CLIENT_TOKEN', '1', {
        description: 'New comment',
        activeTo: '2199-01-01',
      })
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${req.params.prisonerNumber}/alerts/active`)
    })
  })
})
