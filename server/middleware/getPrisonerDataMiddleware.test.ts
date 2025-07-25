import { NextFunction } from 'express'
import { startOfToday, subDays } from 'date-fns'
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
import FeatureToggleService from '../services/featureToggleService'
import FeatureToggleStore from '../data/featureToggleStore/featureToggleStore'
import { Alert, AlertType } from '../data/interfaces/alertsApi/Alert'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { formatDateISO } from '../utils/dateHelpers'

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
let featureToggleStoreMock: FeatureToggleStore

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
          authSource: 'nomis',
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
      createAlert: jest.fn(async (): Promise<Alert> => null),
      getAlertDetails: jest.fn(async (): Promise<Alert> => null),
      getAlertTypes: jest.fn(async (): Promise<AlertType[]> => null),
      updateAlert: jest.fn(async (): Promise<Alert> => null),
      getAlerts: jest.fn(async () => pagedActiveAlertsMock),
    }

    services = {
      dataAccess: {
        prisonerSearchApiClientBuilder: jest.fn(() => prisonerSearchApiClient),
        prisonApiClientBuilder: jest.fn(() => prisonApiClient),
        alertsApiClientBuilder: jest.fn(() => alertsApiClient),
      } as any,
    } as Services

    featureToggleStoreMock = {
      getToggle: jest.fn(async () => false),
      setToggle: jest.fn(),
    }
    services.featureToggleService = new FeatureToggleService(featureToggleStoreMock)
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
    prisonerSearchApiClient.getPrisonerDetails = jest.fn(
      async (): Promise<Prisoner> => ({
        ...PrisonerMockDataA,
        prisonerNumber: undefined,
      }),
    )

    await getPrisonerData(services)(req, res, next)

    expect(prisonerSearchApiClient.getPrisonerDetails).toHaveBeenCalledWith('G6123VU')
    expect(next).toHaveBeenCalledWith(new NotFoundError())
    expect(prisonApiClient.getInmateDetail).not.toHaveBeenCalled()
    expect(prisonApiClient.getAssessments).not.toHaveBeenCalled()
    expect(req.middleware.prisonerData).toBeUndefined()
  })

  it('should populate prisonerData, inmateDetail and alertSummaryData in middleware', async () => {
    featureToggleStoreMock = {
      getToggle: jest.fn(async () => true),
      setToggle: jest.fn(),
    }

    services.featureToggleService = new FeatureToggleService(featureToggleStoreMock)

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
    expect(req.middleware.alertSummaryData).toEqual({
      apiUnavailable: false,
      activeAlertCount: 20,
      inactiveAlertCount: 0,
      alertFlags: expect.anything(),
      activeAlertTypesFilter: expect.anything(),
      inactiveAlertTypesFilter: {},
      highPublicInterestPrisoner: false,
    })
    expect(next).toHaveBeenCalledWith()
  })

  it('should populate commonly used data in res.locals for use in template', async () => {
    await getPrisonerData(services)(req, res, next)

    expect(res.locals.prisonerImageUrl).toEqual('/api/prisoner/G6123VU/image?imageId=1413311')
    expect(res.locals.prisonerThumbnailImageUrl).toEqual(
      '/api/prisoner/G6123VU/image?imageId=1413311&fullSizeImage=false',
    )
  })

  it('should set the newArrival24 flag if latest arrival date is today', async () => {
    const arrivalDate = new Date()
    const arrivalDateString = formatDateISO(arrivalDate)
    prisonApiClient.getLatestArrivalDate = jest.fn(async () => arrivalDateString)
    prisonApiClient.getLatestArrivalDate = jest.fn(async () => arrivalDateString)

    await getPrisonerData(services)(req, res, next)

    expect(prisonApiClient.getLatestArrivalDate).toHaveBeenCalled()
    expect(req.middleware.prisonerData.newArrival24).toBe(true)
  })

  it.each([
    ['today', new Date()],
    ['yesterday', subDays(startOfToday(), 1)],
    ['day before yesterday', subDays(startOfToday(), 2)],
  ])('should set newArrival72 to true when arrival date is %s', async (_label, arrivalDate) => {
    const arrivalDateString = formatDateISO(arrivalDate)
    prisonApiClient.getLatestArrivalDate = jest.fn(async () => arrivalDateString)

    await getPrisonerData(services)(req, res, next)

    expect(prisonApiClient.getLatestArrivalDate).toHaveBeenCalledWith('G6123VU')
    expect(req.middleware.prisonerData.newArrival72).toBe(true)
  })
})
