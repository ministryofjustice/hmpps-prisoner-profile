import type { ErrorRequestHandler } from 'express'
import request from 'supertest'
import config from '../config'
import type { DataAccess } from '../data'
import { PrisonerMockDataA as prisonerInCaseloads } from '../data/localMockData/prisoner'
import { prisonUserMock } from '../data/localMockData/user'
import { appWithAllRoutes, flashProvider } from './testutils/appSetup'
import { aliasServiceMock } from '../../tests/mocks/aliasServiceMock'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { commonApiRoutesMock } from '../../tests/mocks/comonApiRoutesMock'
import { permissionsApiClientMock } from '../../tests/mocks/permissionsApiClientMock'
import { prisonerSearchClientMock } from '../../tests/mocks/prisonerSearchClientMock'
import errorHandler from '../errorHandler'

jest.mock('../errorHandler')

const { prisonerNumber } = prisonerInCaseloads
const prisonerOutsideCaseloads = { ...prisonerInCaseloads, prisonId: 'BXI' }

// NB: using a missing page in order to not couple to route-specific permission checks and api calls
const url = `/prisoner/${prisonerNumber}/unknown-section`

describe('Justify access checks are correctly wired up', () => {
  let wasHighProfilePrisonersEnabled: boolean
  beforeAll(() => {
    wasHighProfilePrisonersEnabled = config.featureToggles.highProfilePrisonersEnabled
  })
  afterAll(() => {
    config.featureToggles.highProfilePrisonersEnabled = wasHighProfilePrisonersEnabled
  })

  const auditService = auditServiceMock()
  const permissionsApiClient = permissionsApiClientMock()
  const prisonerSearchClient = prisonerSearchClientMock()

  const makeApp = () =>
    appWithAllRoutes({
      services: {
        dataAccess: {
          permissionsApiClientBuilder: () => permissionsApiClient,
          prisonerSearchApiClientBuilder: () => prisonerSearchClient,
        } as unknown as DataAccess,
        auditService,
        commonApiRoutes: commonApiRoutesMock(),
        aliasService: aliasServiceMock(),
      },
      userSupplier: () => prisonUserMock,
    })

  // reaching the error handler means all access justification checks have passed
  const errorRoute: jest.Mocked<ErrorRequestHandler> = jest.fn((error, _req, res, _next) => {
    expect(error).toHaveProperty('status', 404)
    res.status(418)
    res.send('END')
  })
  jest.mocked(errorHandler).mockReturnValue(errorRoute)
  const expectNoRoutesMatched = (res: request.Response) => {
    expect(errorRoute).toHaveBeenCalledTimes(1)
    expect(res.status).toEqual(418)
    expect(res.text).toEqual('END')
  }
  const expectJustifyAccessForm = (res: request.Response) => {
    expect(res.text).toContain('data-qa="justify-access"')
  }

  beforeEach(() => {
    prisonerSearchClient.getPrisonerDetails.mockResolvedValue(prisonerOutsideCaseloads)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be disabled by default', () => {
    return request(makeApp())
      .get(url)
      .expect(res => {
        expectNoRoutesMatched(res)
        expect(permissionsApiClient.checkHighProfilePrisonerStatus).not.toHaveBeenCalled()
      })
  })

  describe('when enabled', () => {
    beforeAll(() => {
      config.featureToggles.highProfilePrisonersEnabled = true
    })

    it.each([
      {
        scenario: 'not high-profile',
        setup() {
          permissionsApiClient.checkHighProfilePrisonerStatus.mockResolvedValue(false)
        },
      },
      {
        scenario: 'high-profile and in caseloads',
        setup() {
          permissionsApiClient.checkHighProfilePrisonerStatus.mockResolvedValue(true)
          prisonerSearchClient.getPrisonerDetails.mockResolvedValue(prisonerInCaseloads)
        },
      },
    ])('should not ask for justification when accessing a prisoner who is $scenario', ({ setup }) => {
      setup()

      return request(makeApp())
        .get(url)
        .expect(res => {
          expectNoRoutesMatched(res)
          expect(permissionsApiClient.checkHighProfilePrisonerStatus).toHaveBeenCalledWith(prisonerNumber)
        })
    })

    describe('accessing high-profile prisoner outside of caseloads', () => {
      beforeEach(() => {
        permissionsApiClient.checkHighProfilePrisonerStatus.mockResolvedValue(true)
      })

      it('should ask for justification', () => {
        return request
          .agent(makeApp())
          .get(url)
          .expect(200)
          .expect(res => {
            expectJustifyAccessForm(res)
            expect(permissionsApiClient.checkHighProfilePrisonerStatus).toHaveBeenCalledWith(prisonerNumber)
            expect(flashProvider).not.toHaveBeenCalledWith(
              'errors',
              expect.arrayContaining([
                expect.objectContaining({ href: '#confirmation' }),
                expect.objectContaining({ href: '#justification' }),
              ]),
            )
          })
      })

      it('should redirect back to page being accessed when justification was incorrectly submitted', () => {
        permissionsApiClient.checkHighProfilePrisonerStatus.mockResolvedValue(true)

        return request
          .agent(makeApp())
          .post(url)
          .send({})
          .redirects(1)
          .expect(res => {
            expect(res.redirects).toHaveLength(1)
            expect(res.request.url).toMatch(url)
            expectJustifyAccessForm(res)
            expect(permissionsApiClient.checkHighProfilePrisonerStatus).toHaveBeenCalledWith(prisonerNumber)
            expect(flashProvider).toHaveBeenCalledWith(
              'errors',
              expect.arrayContaining([
                expect.objectContaining({ href: '#confirmation' }),
                expect.objectContaining({ href: '#justification' }),
              ]),
            )
          })
      })

      it('should redirect back to page being accessed when justification was correctly submitted', () => {
        permissionsApiClient.checkHighProfilePrisonerStatus.mockResolvedValue(true)

        return request
          .agent(makeApp())
          .post(url)
          .send({ confirmation: 'yes', justification: 'checking non-associations for work' })
          .redirects(1)
          .expect(res => {
            expect(res.redirects).toHaveLength(1)
            expect(res.request.url).toMatch(url)
            expectNoRoutesMatched(res)
            expect(permissionsApiClient.checkHighProfilePrisonerStatus).toHaveBeenCalledWith(prisonerNumber)
            expect(flashProvider).not.toHaveBeenCalled()
          })
      })
    })
  })
})
