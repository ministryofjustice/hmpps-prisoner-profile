import { NextFunction, Request, Response } from 'express'
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
import { alertsApiClientMock } from '../../tests/mocks/alertsApiClientMock'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { prisonerSearchClientMock } from '../../tests/mocks/prisonerSearchClientMock'
import NotFoundError from '../utils/notFoundError'
import { AlertsApiClient } from '../data/interfaces/alertsApi/alertsApiClient'
import { pagedActiveAlertsMock } from '../data/localMockData/pagedAlertsMock'
import FeatureToggleService from '../services/featureToggleService'
import FeatureToggleStore from '../data/featureToggleStore/featureToggleStore'
import { formatDateISO } from '../utils/dateHelpers'
import { DataAccess } from '../data'
import Assessment from '../data/interfaces/prisonApi/Assessment'
import config from '../config'

jest.mock('../data/prisonApiClient')
jest.mock('../data/prisonerSearchClient')
jest.mock('../data/alertsApiClient')

let req: Request
let res: Response
let next: NextFunction
let services: Services
let prisonApiClient: jest.Mocked<PrisonApiClient>
let prisonerSearchApiClient: jest.Mocked<PrisonerSearchClient>
let alertsApiClient: jest.Mocked<AlertsApiClient>
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
    } as unknown as Request
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
    } as unknown as Response
    next = jest.fn()
    prisonerSearchApiClient = prisonerSearchClientMock()
    prisonApiClient = prisonApiClientMock()
    prisonApiClient.getAssessments.mockResolvedValue(assessmentsMock)
    prisonApiClient.getInmateDetail.mockResolvedValue(inmateDetailMock)
    alertsApiClient = alertsApiClientMock()
    alertsApiClient.getAlerts.mockResolvedValue(pagedActiveAlertsMock)

    services = {
      dataAccess: {
        prisonerSearchApiClientBuilder: () => prisonerSearchApiClient,
        prisonApiClientBuilder: () => prisonApiClient,
        alertsApiClientBuilder: () => alertsApiClient,
      } as unknown as DataAccess,
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
    } as unknown as Request

    await getPrisonerData(services)(req, res, next)
    expect(prisonerSearchApiClient.getPrisonerDetails).toHaveBeenCalledWith('G6123VU')
  })

  it.each([undefined, null, '', 'ABC123', 'G6123VUT'])(
    'should return NotFoundError if a valid prisonerNumber is not provided: %s',
    async prisonerNumber => {
      req = {
        ...req,
        params: { prisonerNumber },
      } as unknown as Request

      await getPrisonerData(services)(req, res, next)

      expect(next).toHaveBeenCalledWith(new NotFoundError())
      expect(prisonerSearchApiClient.getPrisonerDetails).not.toHaveBeenCalled()
      expect(prisonApiClient.getInmateDetail).not.toHaveBeenCalled()
      expect(prisonApiClient.getAssessments).not.toHaveBeenCalled()
    },
  )

  it('should return NotFoundError if prisonerData.prisonerNumber is undefined', async () => {
    prisonerSearchApiClient.getPrisonerDetails.mockResolvedValue({
      ...PrisonerMockDataA,
      prisonerNumber: undefined,
    })

    await getPrisonerData(services)(req, res, next)

    expect(prisonerSearchApiClient.getPrisonerDetails).toHaveBeenCalledWith('G6123VU')
    expect(next).toHaveBeenCalledWith(new NotFoundError())
    expect(prisonApiClient.getInmateDetail).not.toHaveBeenCalled()
    expect(prisonApiClient.getAssessments).not.toHaveBeenCalled()
    expect(req.middleware.prisonerData).toBeUndefined()
  })

  it.each([
    { scenario: 'full already loaded', firstMiddlewareIsMinimal: false, secondMiddlewareIsMinimal: false },
    { scenario: 'minimal already loaded', firstMiddlewareIsMinimal: true, secondMiddlewareIsMinimal: true },
    { scenario: 'full loaded but minimal required', firstMiddlewareIsMinimal: false, secondMiddlewareIsMinimal: true },
  ])('should not repopulate details if $scenario', async ({ firstMiddlewareIsMinimal, secondMiddlewareIsMinimal }) => {
    await getPrisonerData(services, { minimal: firstMiddlewareIsMinimal })(req, res, async (error?: unknown) => {
      expect(error).toBeUndefined()
      await getPrisonerData(services, { minimal: secondMiddlewareIsMinimal })(req, res, next)
    })

    expect(prisonerSearchApiClient.getPrisonerDetails).toHaveBeenCalledWith('G6123VU')
    expect(prisonerSearchApiClient.getPrisonerDetails).toHaveBeenCalledTimes(1)
    if (firstMiddlewareIsMinimal && secondMiddlewareIsMinimal) {
      expect(prisonApiClient.getInmateDetail).not.toHaveBeenCalled()
    } else {
      expect(prisonApiClient.getInmateDetail).toHaveBeenCalledTimes(1)
    }
  })

  it('should only populate full details if only minimal were loaded', async () => {
    await getPrisonerData(services, { minimal: true })(req, res, async (error?: unknown) => {
      expect(error).toBeUndefined()
      await getPrisonerData(services)(req, res, next)
    })

    expect(prisonerSearchApiClient.getPrisonerDetails).toHaveBeenCalledWith('G6123VU')
    expect(prisonerSearchApiClient.getPrisonerDetails).toHaveBeenCalledTimes(1)
    expect(prisonApiClient.getInmateDetail).toHaveBeenCalledTimes(1)
  })

  it.each([
    { scenario: 'full', minimal: false },
    { scenario: 'minimal', minimal: true },
  ])('should still repopulate $scenario details if prisoner number doesn’t match', async ({ minimal }) => {
    await getPrisonerData(services, { minimal })(req, res, async (error?: unknown) => {
      expect(error).toBeUndefined()

      const secondReq = {
        ...req,
        params: { ...req.params },
      } as Request
      secondReq.params.prisonerNumber = 'A1234AA'
      await getPrisonerData(services, { minimal })(secondReq, res, next)
    })

    expect(prisonerSearchApiClient.getPrisonerDetails).toHaveBeenCalledWith('A1234AA')
    expect(prisonerSearchApiClient.getPrisonerDetails).toHaveBeenCalledWith('G6123VU')
    expect(prisonerSearchApiClient.getPrisonerDetails).toHaveBeenCalledTimes(2)
    if (minimal) {
      expect(prisonApiClient.getInmateDetail).not.toHaveBeenCalled()
    } else {
      expect(prisonApiClient.getInmateDetail).toHaveBeenCalledTimes(2)
    }
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

  it('should sort assessments by date first and then by assessmentSeq descending', async () => {
    const assessments = [
      { assessmentDate: '2024-01-01', assessmentSeq: 2, classification: 'A', assessmentDescription: 'CSR Rating' },
      { assessmentDate: '2024-01-01', assessmentSeq: 5, classification: 'B', assessmentDescription: 'CSR Rating' },
      { assessmentDate: '2023-12-31', assessmentSeq: 1, classification: 'C', assessmentDescription: 'CSR Rating' },
    ] as Assessment[]

    prisonApiClient.getAssessments.mockResolvedValue([...assessments])

    await getPrisonerData(services)(req, res, next)

    expect(req.middleware.prisonerData.assessments).toEqual([
      { assessmentDate: '2024-01-01', assessmentSeq: 5, classification: 'B', assessmentDescription: 'CSR Rating' },
      { assessmentDate: '2024-01-01', assessmentSeq: 2, classification: 'A', assessmentDescription: 'CSR Rating' },
      { assessmentDate: '2023-12-31', assessmentSeq: 1, classification: 'C', assessmentDescription: 'CSR Rating' },
    ])
  })

  it('should populate commonly used data in res.locals for use in template (minimal)', async () => {
    await getPrisonerData(services, { minimal: true })(req, res, next)

    expect(res.locals.prisonerNumber).toEqual('G6123VU')
    expect(res.locals.prisonId).toEqual('MDI')
    expect(res.locals.prisonerName).toEqual({
      firstLast: 'John Saunders',
      lastCommaFirst: 'Saunders, John',
      full: 'John Middle Names Saunders',
    })
    expect(res.locals.prisonerImageUrl).toBeUndefined()
  })

  it('should populate commonly used data in res.locals for use in template', async () => {
    await getPrisonerData(services)(req, res, next)

    expect(res.locals.prisonerNumber).toEqual('G6123VU')
    expect(res.locals.prisonId).toEqual('MDI')
    expect(res.locals.prisonerName).toEqual({
      firstLast: 'John Saunders',
      lastCommaFirst: 'Saunders, John',
      full: 'John Middle Names Saunders',
    })
    expect(res.locals.prisonerImageUrl).toEqual('/api/prisoner/G6123VU/image?imageId=1413311')
  })

  it('should add a cachebusting query param for undefined imageIds', async () => {
    prisonApiClient.getInmateDetail.mockResolvedValue({ ...inmateDetailMock, facialImageId: undefined as number })

    await getPrisonerData(services)(req, res, next)

    expect(res.locals.prisonerImageUrl).toEqual('/api/prisoner/G6123VU/image?imageId=undefined&cache=v2')
  })

  it('should set the newArrival24 flag if latest arrival date is today', async () => {
    const arrivalDate = new Date()
    const arrivalDateString = formatDateISO(arrivalDate)
    prisonApiClient.getLatestArrivalDate.mockResolvedValue(arrivalDateString)

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
    prisonApiClient.getLatestArrivalDate.mockResolvedValue(arrivalDateString)

    await getPrisonerData(services)(req, res, next)

    expect(prisonApiClient.getLatestArrivalDate).toHaveBeenCalledWith('G6123VU')
    expect(req.middleware.prisonerData.newArrival72).toBe(true)
  })

  describe('CSRA rating', () => {
    const originalCsraServiceEnabled = config.featureToggles.csraServiceEnabled

    beforeEach(() => {
      prisonerSearchApiClient.getPrisonerDetails.mockResolvedValue({
        ...PrisonerMockDataA,
        csra: 'High - general',
      })
      prisonApiClient.getAssessments.mockResolvedValue([
        {
          assessmentDate: '2024-01-01',
          assessmentSeq: 2,
          classification: 'Standard',
          assessmentDescription: 'CSR Rating',
        },
      ] as Assessment[])
    })

    afterEach(() => {
      config.featureToggles.csraServiceEnabled = originalCsraServiceEnabled
    })

    it('should overwrite csra with the Prison API classification when the CSRA service setting is off', async () => {
      config.featureToggles.csraServiceEnabled = false

      await getPrisonerData(services)(req, res, next)

      expect(req.middleware.prisonerData.csra).toEqual('Standard')
    })

    it('should keep the Prisoner Search csra when the CSRA setting is on', async () => {
      config.featureToggles.csraServiceEnabled = true

      await getPrisonerData(services)(req, res, next)

      expect(req.middleware.prisonerData.csra).toEqual('High - general')
      expect(prisonApiClient.getAssessments).toHaveBeenCalled()
    })
  })
})
