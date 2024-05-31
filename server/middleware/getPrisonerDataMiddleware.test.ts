import { NextFunction } from 'express'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { PrisonerSearchClient } from '../data/interfaces/prisonerSearchApi/prisonerSearchClient'
import { assessmentsMock } from '../data/localMockData/miniSummaryMock'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import getPrisonerData from './getPrisonerDataMiddleware'
import { Services } from '../services'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import NotFoundError from '../utils/notFoundError'
import { AlertsApiClient } from '../data/interfaces/alertsApi/alertsApiClient'
import { pagedActiveAlertsMock } from '../data/localMockData/pagedAlertsMock'
import config from '../config'

jest.mock('../data/prisonApiClient')
jest.mock('../data/prisonerSearchClient')
jest.mock('../data/alertsApiClient')

let req: any
let res: any
let next: NextFunction
let services: Services
let prisonApiClient: PrisonApiClient
let prisonerSearchApiClient: PrisonerSearchClient
let alertsApiClient: AlertsApiClient

describe('GetPrisonerDataMiddleware', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    req = {
      params: { prisonerNumber: 'G6123VU' },
      path: 'test/path',
      middleware: {
        clientToken: 'CLIENT_TOKEN',
      },
    }
    res = {
      locals: {
        user: {
          activeCaseLoadId: 'MDI',
          userRoles: [Role.PrisonUser],
          caseLoads: CaseLoadsDummyDataA,
        },
      },
      render: jest.fn(),
    }
    next = jest.fn()
    prisonerSearchApiClient = {
      getPrisonerDetails: jest.fn(async () => PrisonerMockDataA),
    }
    prisonApiClient = prisonApiClientMock()
    prisonApiClient.getAssessments = jest.fn(async () => assessmentsMock)
    prisonApiClient.getInmateDetail = jest.fn(async () => inmateDetailMock)
    alertsApiClient = {
      createAlert: jest.fn(async () => null),
      getAlertDetails: jest.fn(async () => null),
      getAlertTypes: jest.fn(async () => null),
      updateAlert: jest.fn(async () => null),
      getAlerts: jest.fn(async () => pagedActiveAlertsMock),
    }
    services = {
      dataAccess: {
        prisonerSearchApiClientBuilder: jest.fn(() => prisonerSearchApiClient),
        prisonApiClientBuilder: jest.fn(() => prisonApiClient),
        alertsApiClientBuilder: jest.fn(() => alertsApiClient),
      } as any,
    } as Services
  })

  it('should get prisonerNumber from the query if provided', async () => {
    req = {
      query: { prisonerNumber: 'G6123VU' },
      path: 'test/path',
      middleware: {
        clientToken: 'CLIENT_TOKEN',
      },
    }

    await getPrisonerData(services)(req, res, next)
    expect(prisonerSearchApiClient.getPrisonerDetails).toHaveBeenCalledWith('G6123VU')
  })

  it('should return NotFoundError if prisonerData.prisonerNumber is undefined', async () => {
    prisonerSearchApiClient.getPrisonerDetails = jest.fn(async () => ({
      ...PrisonerMockDataA,
      prisonerNumber: undefined,
    }))

    await getPrisonerData(services)(req, res, next)

    expect(prisonerSearchApiClient.getPrisonerDetails).toHaveBeenCalledWith('G6123VU')
    expect(next).toHaveBeenCalledWith(new NotFoundError())
    expect(prisonApiClient.getInmateDetail).not.toHaveBeenCalled()
    expect(prisonApiClient.getAssessments).not.toHaveBeenCalled()
    expect(req.middleware.prisonerData).toBeUndefined()
  })

  it('should populate prisonerData and inmateDetail in middleware', async () => {
    await getPrisonerData(services)(req, res, next)

    expect(prisonerSearchApiClient.getPrisonerDetails).toHaveBeenCalled()
    expect(prisonApiClient.getInmateDetail).toHaveBeenCalled()
    expect(prisonApiClient.getAssessments).toHaveBeenCalled()
    expect(alertsApiClient.getAlerts).toHaveBeenCalledTimes(0)
    expect(req.middleware.prisonerData).toEqual({
      ...PrisonerMockDataA,
      assessments: assessmentsMock,
      csra: assessmentsMock[1].classification,
    })
    expect(req.middleware.inmateDetail).toEqual(inmateDetailMock)
    expect(next).toHaveBeenCalledWith()
  })

  it('should populate prisonerData, inmateDetail and alertFlags in middleware when alerts API enabled', async () => {
    config.featureToggles.alertsApiEnabled = true

    await getPrisonerData(services)(req, res, next)

    expect(prisonerSearchApiClient.getPrisonerDetails).toHaveBeenCalled()
    expect(prisonApiClient.getInmateDetail).toHaveBeenCalled()
    expect(prisonApiClient.getAssessments).toHaveBeenCalled()
    expect(alertsApiClient.getAlerts).toHaveBeenCalled()
    expect(req.middleware.prisonerData).toEqual({
      ...PrisonerMockDataA,
      assessments: assessmentsMock,
      csra: assessmentsMock[1].classification,
    })
    expect(req.middleware.inmateDetail).toEqual(inmateDetailMock)
    expect(next).toHaveBeenCalledWith()

    config.featureToggles.alertsApiEnabled = false
  })
})
