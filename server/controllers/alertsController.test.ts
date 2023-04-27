import { prisonerDetailMock } from '../data/localMockData/prisonerDetailMock'
import { pagedActiveAlertsMock, pagedInactiveAlertsMock } from '../data/localMockData/pagedAlertsMock'
import AlertsController from './alertsController'
import * as headerMappers from '../mappers/headerMappers'

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
        clientToken: 'CLIENT_TOKEN',
      },
      render: jest.fn(),
    }
    controller = new AlertsController(res.locals.clientToken, true)
  })

  it('should get active alerts', async () => {
    const getPrisonerDetailsSpy = jest
      .spyOn<any, string>(controller['prisonerSearchService'], 'getPrisonerDetails')
      .mockResolvedValue(prisonerDetailMock)
    const getAlertsSpy = jest
      .spyOn<any, string>(controller['alertsPageService'], 'get')
      .mockResolvedValue(pagedActiveAlertsMock)
    const mapSpy = jest.spyOn(headerMappers, 'mapHeaderData')

    await controller.displayAlerts(req, res)
    expect(getPrisonerDetailsSpy).toHaveBeenCalledWith(req.params.prisonerNumber)
    expect(getAlertsSpy).toHaveBeenCalledWith(prisonerDetailMock, {
      alertStatus: 'ACTIVE',
      page: 0,
      sort: 'dateCreated,ASC',
      alertType: 'R',
      from: '01/01/2023',
      to: '02/02/2023',
    })
    expect(mapSpy).toHaveBeenCalledWith(prisonerDetailMock, 'alerts')
  })

  it('should get inactive alerts', async () => {
    req.path = 'alerts/inactive'
    controller['isActive'] = false

    const getPrisonerDetailsSpy = jest
      .spyOn<any, string>(controller['prisonerSearchService'], 'getPrisonerDetails')
      .mockResolvedValue(prisonerDetailMock)
    const getAlertsSpy = jest
      .spyOn<any, string>(controller['alertsPageService'], 'get')
      .mockResolvedValue(pagedInactiveAlertsMock)
    const mapSpy = jest.spyOn(headerMappers, 'mapHeaderData')

    await controller.displayAlerts(req, res)

    expect(getPrisonerDetailsSpy).toHaveBeenCalledWith(req.params.prisonerNumber)
    expect(getAlertsSpy).toHaveBeenCalledWith(prisonerDetailMock, {
      alertStatus: 'INACTIVE',
      page: 0,
      sort: 'dateCreated,ASC',
      alertType: 'R',
      from: '01/01/2023',
      to: '02/02/2023',
    })
    expect(mapSpy).toHaveBeenCalledWith(prisonerDetailMock, 'alerts')
  })
})
