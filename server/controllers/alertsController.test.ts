import { pagedActiveAlertsMock, pagedInactiveAlertsMock } from '../data/localMockData/pagedAlertsMock'
import AlertsController from './alertsController'
import * as headerMappers from '../mappers/headerMappers'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { Role } from '../data/enums/role'
import PrisonerSearchService from '../services/prisonerSearch'
import AlertsPageService from '../services/alertsPageService'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'

let req: any
let res: any
let controller: AlertsController

jest.mock('../services/prisonerSearch.ts')
jest.mock('../services/alertsPageService.ts')

describe('Alerts Controller', () => {
  beforeEach(() => {
    req = {
      params: { prisonerNumber: '' },
      query: { page: '0', sort: 'dateCreated,ASC', alertType: 'R', from: '01/01/2023', to: '02/02/2023' },
      path: 'alerts/active',
    }
    res = {
      locals: {
        user: {
          activeCaseLoadId: 'MDI',
          userRoles: [Role.UpdateAlert],
          caseLoads: CaseLoadsDummyDataA,
        },
        clientToken: 'CLIENT_TOKEN',
      },
      render: jest.fn(),
    }
    controller = new AlertsController(true, new PrisonerSearchService(null), new AlertsPageService(null))
  })

  it('should get active alerts', async () => {
    const getAlertsSpy = jest
      .spyOn<any, string>(controller['alertsPageService'], 'get')
      .mockResolvedValue(pagedActiveAlertsMock)
    const mapSpy = jest.spyOn(headerMappers, 'mapHeaderData')

    await controller.displayAlerts(req, res, PrisonerMockDataA, inmateDetailMock)

    expect(getAlertsSpy).toHaveBeenCalledWith(
      res.locals.clientToken,
      PrisonerMockDataA,
      {
        alertStatus: 'ACTIVE',
        page: 0,
        sort: 'dateCreated,ASC',
        alertType: 'R',
        from: '01/01/2023',
        to: '02/02/2023',
      },
      true,
    )
    expect(mapSpy).toHaveBeenCalledWith(PrisonerMockDataA, inmateDetailMock, res.locals.user, 'alerts')
  })

  it('should get inactive alerts', async () => {
    req.path = 'alerts/inactive'
    controller['isActive'] = false

    const getAlertsSpy = jest
      .spyOn<any, string>(controller['alertsPageService'], 'get')
      .mockResolvedValue(pagedInactiveAlertsMock)
    const mapSpy = jest.spyOn(headerMappers, 'mapHeaderData')

    await controller.displayAlerts(req, res, PrisonerMockDataA, inmateDetailMock)

    expect(getAlertsSpy).toHaveBeenCalledWith(
      res.locals.clientToken,
      PrisonerMockDataA,
      {
        alertStatus: 'INACTIVE',
        page: 0,
        sort: 'dateCreated,ASC',
        alertType: 'R',
        from: '01/01/2023',
        to: '02/02/2023',
      },
      true,
    )
    expect(mapSpy).toHaveBeenCalledWith(PrisonerMockDataA, inmateDetailMock, res.locals.user, 'alerts')
  })

  it('should set canUpdateAlert to true if user has role and caseload', async () => {
    const getAlertsSpy = jest
      .spyOn<any, string>(controller['alertsPageService'], 'get')
      .mockResolvedValue(pagedActiveAlertsMock)
    jest.spyOn(headerMappers, 'mapHeaderData')

    await controller.displayAlerts(req, res, PrisonerMockDataA, inmateDetailMock)

    expect(getAlertsSpy).toHaveBeenCalledWith(
      res.locals.clientToken,
      PrisonerMockDataA,
      {
        alertStatus: 'ACTIVE',
        page: 0,
        sort: 'dateCreated,ASC',
        alertType: 'R',
        from: '01/01/2023',
        to: '02/02/2023',
      },
      true,
    )
  })

  it('should set canUpdateAlert to false if user does not have role', async () => {
    const getAlertsSpy = jest
      .spyOn<any, string>(controller['alertsPageService'], 'get')
      .mockResolvedValue(pagedActiveAlertsMock)
    jest.spyOn(headerMappers, 'mapHeaderData')

    res.locals.user.userRoles = ['ROLE_OTHER']

    await controller.displayAlerts(req, res, PrisonerMockDataA, inmateDetailMock)

    expect(getAlertsSpy).toHaveBeenCalledWith(
      res.locals.clientToken,
      PrisonerMockDataA,
      {
        alertStatus: 'ACTIVE',
        page: 0,
        sort: 'dateCreated,ASC',
        alertType: 'R',
        from: '01/01/2023',
        to: '02/02/2023',
      },
      false,
    )
  })

  it('should set canUpdateAlert to false if user does not have caseload', async () => {
    const getAlertsSpy = jest
      .spyOn<any, string>(controller['alertsPageService'], 'get')
      .mockResolvedValue(pagedActiveAlertsMock)
    jest.spyOn(headerMappers, 'mapHeaderData')

    await controller.displayAlerts(req, res, { ...PrisonerMockDataA, prisonId: 'XYZ' }, inmateDetailMock)

    expect(getAlertsSpy).toHaveBeenCalledWith(
      res.locals.clientToken,
      { ...PrisonerMockDataA, prisonId: 'XYZ' },
      {
        alertStatus: 'ACTIVE',
        page: 0,
        sort: 'dateCreated,ASC',
        alertType: 'R',
        from: '01/01/2023',
        to: '02/02/2023',
      },
      false,
    )
  })

  it('should set canUpdateAlert to true if user does not have caseload but prisoner is OUT', async () => {
    res.locals.user.userRoles.push(Role.InactiveBookings)
    const getAlertsSpy = jest
      .spyOn<any, string>(controller['alertsPageService'], 'get')
      .mockResolvedValue(pagedActiveAlertsMock)
    jest.spyOn(headerMappers, 'mapHeaderData')

    await controller.displayAlerts(req, res, { ...PrisonerMockDataA, prisonId: 'OUT' }, inmateDetailMock)

    expect(getAlertsSpy).toHaveBeenCalledWith(
      res.locals.clientToken,
      { ...PrisonerMockDataA, prisonId: 'OUT' },
      {
        alertStatus: 'ACTIVE',
        page: 0,
        sort: 'dateCreated,ASC',
        alertType: 'R',
        from: '01/01/2023',
        to: '02/02/2023',
      },
      true,
    )
  })

  it('should set canUpdateAlert to true if user does not have caseload but prisoner is TRN', async () => {
    res.locals.user.userRoles.push(Role.InactiveBookings)
    const getAlertsSpy = jest
      .spyOn<any, string>(controller['alertsPageService'], 'get')
      .mockResolvedValue(pagedActiveAlertsMock)
    jest.spyOn(headerMappers, 'mapHeaderData')

    await controller.displayAlerts(req, res, { ...PrisonerMockDataA, prisonId: 'TRN' }, inmateDetailMock)

    expect(getAlertsSpy).toHaveBeenCalledWith(
      res.locals.clientToken,
      { ...PrisonerMockDataA, prisonId: 'TRN' },
      {
        alertStatus: 'ACTIVE',
        page: 0,
        sort: 'dateCreated,ASC',
        alertType: 'R',
        from: '01/01/2023',
        to: '02/02/2023',
      },
      true,
    )
  })
})
