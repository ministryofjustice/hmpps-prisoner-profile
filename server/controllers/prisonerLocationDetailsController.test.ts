import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import PrisonerLocationDetailsController from './prisonerLocationDetailsController'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { AuditService } from '../services/auditService'
import {
  OffenderCellHistoryMock,
  OffenderCellHistoryReceptionMock,
} from '../data/localMockData/offenderCellHistoryMock'
import ReceptionsWithCapacityMock from '../data/localMockData/receptionsWithCapacityMock'
import StaffDetailsMock from '../data/localMockData/staffDetails'
import AgencyMock from '../data/localMockData/agency'
import config from '../config'
import { LocationDetailsCurrentLocation, LocationDetailsPageData } from '../interfaces/pages/locationDetailsPageData'

const profileUrl = `/prisoner/${PrisonerMockDataA.prisonerNumber}`

const currentLocation: LocationDetailsCurrentLocation = {
  agencyId: 'MDI',
  assignmentDateTime: '2021-07-05T10:35:17',
  assignmentEndDateTime: '2021-07-05T10:35:17',
  establishment: null,
  isTemporaryLocation: false,
  livingUnitId: 123123,
  location: '1-1-2',
  movedIn: '05/07/2021 - 10:35',
  movedInBy: 'John Smith',
  movedOut: '05/07/2021 - 10:35',
}

const prisonerCellHistoryPageData: LocationDetailsPageData = {
  pageTitle: 'Location details',
  breadcrumbPrisonerName: 'John Saunders',
  name: 'John Saunders',
  prisonerName: 'Saunders, John',
  prisonerNumber: PrisonerMockDataA.prisonerNumber,
  profileUrl,
  canViewCellMoveButton: true,
  canViewMoveToReceptionButton: true,
  cellHistoryGroupedByAgency: [],
  dpsBaseUrl: `${config.apis.dpsHomePageUrl}${profileUrl}`,
  changeCellLink: `${config.apis.dpsHomePageUrl}${profileUrl}/cell-move/search-for-cell?returnUrl=${profileUrl}`,
  moveToReceptionLink: `${config.apis.dpsHomePageUrl}${profileUrl}/reception-move/consider-risks-reception`,
  currentLocation,
  occupants: [],
  prisonId: 'MDI',
}

describe('Prisoner Location Details', () => {
  const offenderNo = 'ABC123'
  let req: any
  let res: any
  let controller: PrisonerLocationDetailsController
  let prisonApiClient: PrisonApiClient
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
    auditServiceClient = auditServiceMock()

    controller = new PrisonerLocationDetailsController(() => prisonApiClient, auditServiceClient)
  })

  afterEach(() => {
    const spy = jest.spyOn(Date, 'now')
    spy.mockRestore()
  })

  describe('displayPrisonerLocationDetails', () => {
    describe('should render the page', () => {
      it('should not display the "Move to reception" button when user does not have the CELL_MOVE role', async () => {
        res = { ...res, locals: { ...res.locals, user: { ...res.locals.user, userRoles: [] } } }
        prisonApiClient.getOffenderCellHistory = jest.fn().mockResolvedValue(OffenderCellHistoryMock)
        prisonApiClient.getStaffDetails = jest.fn().mockResolvedValue(StaffDetailsMock)
        prisonApiClient.getReceptionsWithCapacity = jest.fn().mockResolvedValue(ReceptionsWithCapacityMock)
        prisonApiClient.getAgencyDetails = jest.fn().mockResolvedValue(AgencyMock)
        await controller.displayPrisonerLocationDetails(req, res, PrisonerMockDataA)

        expect(res.render).toHaveBeenCalledWith('pages/prisonerLocationDetails', {
          ...prisonerCellHistoryPageData,
          canViewCellMoveButton: false,
          canViewMoveToReceptionButton: false,
        })
      })

      it('should not display the "Move to reception" button when prisoner is already in reception', async () => {
        prisonApiClient.getOffenderCellHistory = jest.fn().mockResolvedValue(OffenderCellHistoryReceptionMock)
        prisonApiClient.getStaffDetails = jest.fn().mockResolvedValue(StaffDetailsMock)
        prisonApiClient.getReceptionsWithCapacity = jest.fn().mockResolvedValue(ReceptionsWithCapacityMock)
        prisonApiClient.getAgencyDetails = jest.fn().mockResolvedValue(AgencyMock)
        await controller.displayPrisonerLocationDetails(req, res, PrisonerMockDataA)

        expect(res.render).toHaveBeenCalledWith('pages/prisonerLocationDetails', {
          ...prisonerCellHistoryPageData,
          currentLocation: {
            ...currentLocation,
            isTemporaryLocation: true,
            location: 'Reception',
          },
          canViewMoveToReceptionButton: false,
        })
      })

      it('should display the "Move to reception" button with "consider risks" link when there is capacity', async () => {
        prisonApiClient.getOffenderCellHistory = jest.fn().mockResolvedValue(OffenderCellHistoryMock)
        prisonApiClient.getStaffDetails = jest.fn().mockResolvedValue(StaffDetailsMock)
        prisonApiClient.getReceptionsWithCapacity = jest.fn().mockResolvedValue(ReceptionsWithCapacityMock)
        prisonApiClient.getAgencyDetails = jest.fn().mockResolvedValue(AgencyMock)
        await controller.displayPrisonerLocationDetails(req, res, PrisonerMockDataA)

        expect(res.render).toHaveBeenCalledWith('pages/prisonerLocationDetails', {
          ...prisonerCellHistoryPageData,
          canViewMoveToReceptionButton: true,
          moveToReceptionLink: `${config.apis.dpsHomePageUrl}${profileUrl}/reception-move/consider-risks-reception`,
        })
      })

      it('should display the "Move to reception" button with "reception full" link when there is no capacity', async () => {
        prisonApiClient.getOffenderCellHistory = jest.fn().mockResolvedValue(OffenderCellHistoryMock)
        prisonApiClient.getStaffDetails = jest.fn().mockResolvedValue(StaffDetailsMock)
        prisonApiClient.getReceptionsWithCapacity = jest.fn().mockResolvedValue([])
        prisonApiClient.getAgencyDetails = jest.fn().mockResolvedValue(AgencyMock)
        await controller.displayPrisonerLocationDetails(req, res, PrisonerMockDataA)

        expect(res.render).toHaveBeenCalledWith('pages/prisonerLocationDetails', {
          ...prisonerCellHistoryPageData,
          canViewMoveToReceptionButton: true,
          moveToReceptionLink: `${config.apis.dpsHomePageUrl}${profileUrl}/reception-move/reception-full`,
        })
      })
    })
  })
})
