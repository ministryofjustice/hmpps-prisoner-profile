import { pagedActiveAlertsMock, pagedInactiveAlertsMock } from '../data/localMockData/pagedAlertsMock'
import AlertsController from './alertsController'
import * as headerMappers from '../mappers/headerMappers'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'

let req: any
let res: any
let controller: any

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
          userRoles: ['ROLE_UPDATE_ALERT'],
        },
        clientToken: 'CLIENT_TOKEN',
      },
      render: jest.fn(),
    }
    controller = new AlertsController(res.locals.clientToken, true)
  })

  it('should get active alerts', async () => {
    const getPrisonerDetailsSpy = jest
      .spyOn<any, string>(controller['prisonerSearchService'], 'getPrisonerDetails')
      .mockResolvedValue(PrisonerMockDataA)
    const getAlertsSpy = jest
      .spyOn<any, string>(controller['alertsPageService'], 'get')
      .mockResolvedValue(pagedActiveAlertsMock)
    const mapSpy = jest.spyOn(headerMappers, 'mapHeaderData')

    await controller.displayAlerts(req, res)

    expect(getPrisonerDetailsSpy).toHaveBeenCalledWith(req.params.prisonerNumber)
    expect(getAlertsSpy).toHaveBeenCalledWith(
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
    expect(mapSpy).toHaveBeenCalledWith(PrisonerMockDataA, true, 'alerts')
  })

  it('should get inactive alerts', async () => {
    req.path = 'alerts/inactive'
    controller['isActive'] = false

    const getPrisonerDetailsSpy = jest
      .spyOn<any, string>(controller['prisonerSearchService'], 'getPrisonerDetails')
      .mockResolvedValue(PrisonerMockDataA)
    const getAlertsSpy = jest
      .spyOn<any, string>(controller['alertsPageService'], 'get')
      .mockResolvedValue(pagedInactiveAlertsMock)
    const mapSpy = jest.spyOn(headerMappers, 'mapHeaderData')

    await controller.displayAlerts(req, res)

    expect(getPrisonerDetailsSpy).toHaveBeenCalledWith(req.params.prisonerNumber)
    expect(getAlertsSpy).toHaveBeenCalledWith(
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
    expect(mapSpy).toHaveBeenCalledWith(PrisonerMockDataA, true, 'alerts')
  })

  it('should set canUpdateAlert to true if user has role and active caseload', async () => {
    jest
      .spyOn<any, string>(controller['prisonerSearchService'], 'getPrisonerDetails')
      .mockResolvedValue(PrisonerMockDataA)
    const getAlertsSpy = jest
      .spyOn<any, string>(controller['alertsPageService'], 'get')
      .mockResolvedValue(pagedActiveAlertsMock)
    jest.spyOn(headerMappers, 'mapHeaderData')

    await controller.displayAlerts(req, res)

    expect(getAlertsSpy).toHaveBeenCalledWith(
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
    jest
      .spyOn<any, string>(controller['prisonerSearchService'], 'getPrisonerDetails')
      .mockResolvedValue(PrisonerMockDataA)
    const getAlertsSpy = jest
      .spyOn<any, string>(controller['alertsPageService'], 'get')
      .mockResolvedValue(pagedActiveAlertsMock)
    jest.spyOn(headerMappers, 'mapHeaderData')

    res.locals.user.userRoles = ['ROLE_OTHER']

    await controller.displayAlerts(req, res)

    expect(getAlertsSpy).toHaveBeenCalledWith(
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
    jest
      .spyOn<any, string>(controller['prisonerSearchService'], 'getPrisonerDetails')
      .mockResolvedValue({ ...PrisonerMockDataA, prisonId: 'XYZ' })
    const getAlertsSpy = jest
      .spyOn<any, string>(controller['alertsPageService'], 'get')
      .mockResolvedValue(pagedActiveAlertsMock)
    jest.spyOn(headerMappers, 'mapHeaderData')

    await controller.displayAlerts(req, res)

    expect(getAlertsSpy).toHaveBeenCalledWith(
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
    jest
      .spyOn<any, string>(controller['prisonerSearchService'], 'getPrisonerDetails')
      .mockResolvedValue({ ...PrisonerMockDataA, prisonId: 'OUT' })
    const getAlertsSpy = jest
      .spyOn<any, string>(controller['alertsPageService'], 'get')
      .mockResolvedValue(pagedActiveAlertsMock)
    jest.spyOn(headerMappers, 'mapHeaderData')

    await controller.displayAlerts(req, res)

    expect(getAlertsSpy).toHaveBeenCalledWith(
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
    jest
      .spyOn<any, string>(controller['prisonerSearchService'], 'getPrisonerDetails')
      .mockResolvedValue({ ...PrisonerMockDataA, prisonId: 'TRN' })
    const getAlertsSpy = jest
      .spyOn<any, string>(controller['alertsPageService'], 'get')
      .mockResolvedValue(pagedActiveAlertsMock)
    jest.spyOn(headerMappers, 'mapHeaderData')

    await controller.displayAlerts(req, res)

    expect(getAlertsSpy).toHaveBeenCalledWith(
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
