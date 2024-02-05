import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import PrisonerLocationDetailsController from './prisonerLocationDetailsController'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { AuditService } from '../services/auditService'
import config from '../config'
import { locationDetailsMock, locationDetailsPageData } from '../data/localMockData/locationDetailsPageMock'
import { prisonerLocationDetailsPageServiceMock } from '../../tests/mocks/prisonerLocationDetailsPageServiceMock'
import PrisonerLocationDetailsPageService from '../services/prisonerLocationDetailsPageService'

const profileUrl = `/prisoner/${PrisonerMockDataA.prisonerNumber}`

describe('Prisoner Location Details', () => {
  const offenderNo = 'ABC123'
  let req: any
  let res: any
  let controller: PrisonerLocationDetailsController
  let prisonApiClient: PrisonApiClient
  let prisonerLocationDetailsPageService: PrisonerLocationDetailsPageService
  let auditServiceClient: AuditService

  beforeEach(() => {
    req = {
      middleware: {
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
      },
      originalUrl: 'http://localhost',
      params: { offenderNo },
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
    }
    res = {
      locals: {
        clientToken: 'CLIENT_TOKEN',
        user: {
          userRoles: ['CELL_MOVE'],
          staffId: 487023,
          caseLoads: CaseLoadsDummyDataA,
          token: 'USER_TOKEN',
        },
      },
      render: jest.fn(),
      redirect: jest.fn(),
    }

    prisonApiClient = prisonApiClientMock()
    prisonerLocationDetailsPageService = prisonerLocationDetailsPageServiceMock() as PrisonerLocationDetailsPageService
    auditServiceClient = auditServiceMock()

    controller = new PrisonerLocationDetailsController(
      () => prisonApiClient,
      prisonerLocationDetailsPageService,
      auditServiceClient,
    )
  })

  afterEach(() => {
    const spy = jest.spyOn(Date, 'now')
    spy.mockRestore()
  })

  describe('displayPrisonerLocationDetails', () => {
    describe('should render the page', () => {
      it('should not display the "Move to reception" button when user does not have the CELL_MOVE role', async () => {
        res = { ...res, locals: { ...res.locals, user: { ...res.locals.user, userRoles: [] } } }
        prisonerLocationDetailsPageService.getLocationDetailsByLatestFirst = jest
          .fn()
          .mockResolvedValue([locationDetailsMock])

        await controller.displayPrisonerLocationDetails(req, res, PrisonerMockDataA)

        expect(prisonerLocationDetailsPageService.isReceptionFull).not.toHaveBeenCalled()
        expect(res.render).toHaveBeenCalledWith('pages/prisonerLocationDetails', {
          ...locationDetailsPageData,
          canViewCellMoveButton: false,
          canViewMoveToReceptionButton: false,
        })
      })

      it('should not display the "Move to reception" button when prisoner is already in reception', async () => {
        prisonerLocationDetailsPageService.getLocationDetailsByLatestFirst = jest
          .fn()
          .mockResolvedValue([{ ...locationDetailsMock, location: 'Reception', isTemporaryLocation: true }])

        await controller.displayPrisonerLocationDetails(req, res, PrisonerMockDataA)

        expect(prisonerLocationDetailsPageService.isReceptionFull).not.toHaveBeenCalled()
        expect(res.render).toHaveBeenCalledWith('pages/prisonerLocationDetails', {
          ...locationDetailsPageData,
          currentLocation: {
            ...locationDetailsMock,
            isTemporaryLocation: true,
            location: 'Reception',
          },
          canViewMoveToReceptionButton: false,
        })
      })

      it('should display the "Move to reception" button with "consider risks" link when there is capacity', async () => {
        prisonerLocationDetailsPageService.isReceptionFull = jest.fn().mockResolvedValue(false)
        prisonerLocationDetailsPageService.getLocationDetailsByLatestFirst = jest
          .fn()
          .mockResolvedValue([locationDetailsMock])

        await controller.displayPrisonerLocationDetails(req, res, PrisonerMockDataA)

        expect(res.render).toHaveBeenCalledWith('pages/prisonerLocationDetails', {
          ...locationDetailsPageData,
          canViewMoveToReceptionButton: true,
          moveToReceptionLink: `${config.apis.dpsHomePageUrl}${profileUrl}/reception-move/consider-risks-reception`,
        })
      })

      it('should display the "Move to reception" button with "reception full" link when reception is full', async () => {
        prisonerLocationDetailsPageService.isReceptionFull = jest.fn().mockResolvedValue(true)
        prisonerLocationDetailsPageService.getLocationDetailsByLatestFirst = jest
          .fn()
          .mockResolvedValue([locationDetailsMock])

        await controller.displayPrisonerLocationDetails(req, res, PrisonerMockDataA)

        expect(res.render).toHaveBeenCalledWith('pages/prisonerLocationDetails', {
          ...locationDetailsPageData,
          canViewMoveToReceptionButton: true,
          moveToReceptionLink: `${config.apis.dpsHomePageUrl}${profileUrl}/reception-move/reception-full`,
        })
      })
    })
  })
})
