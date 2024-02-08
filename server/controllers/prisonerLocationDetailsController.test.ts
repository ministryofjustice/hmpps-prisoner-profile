import { PrisonerMockDataA, PrisonerMockDataB } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import PrisonerLocationDetailsController from './prisonerLocationDetailsController'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { AuditService } from '../services/auditService'
import config from '../config'
import { prisonerLocationDetailsServiceMock } from '../../tests/mocks/prisonerLocationDetailsServiceMock'
import PrisonerLocationDetailsService from '../services/prisonerLocationDetailsService'
import {
  LocationDetails,
  LocationDetailsGroupedByPeriodAtAgency,
  LocationDetailsPageData,
} from '../interfaces/pages/locationDetailsPageData'
import { Role } from '../data/enums/role'

const profileUrl = `/prisoner/${PrisonerMockDataA.prisonerNumber}`

describe('Prisoner Location Details', () => {
  const offenderNo = 'ABC123'
  let req: any
  let res: any
  let controller: PrisonerLocationDetailsController
  let locationDetailsService: PrisonerLocationDetailsService
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

    locationDetailsService = prisonerLocationDetailsServiceMock() as PrisonerLocationDetailsService
    locationDetailsService.isReceptionFull = jest.fn().mockResolvedValue(false)
    locationDetailsService.getInmatesAtLocation = jest
      .fn()
      .mockResolvedValue([{ firstName: 'Mate', lastName: '1', offenderNo: PrisonerMockDataB.prisonerNumber }])
    auditServiceClient = auditServiceMock()
    locationDetailsService.getLocationDetailsByLatestFirst = jest
      .fn()
      .mockResolvedValue([currentLocation, ...previousLocations])
    locationDetailsService.getLocationDetailsGroupedByPeriodAtAgency = jest
      .fn()
      .mockReturnValue(locationDetailsGroupedByAgency)

    controller = new PrisonerLocationDetailsController(locationDetailsService, auditServiceClient)
  })

  afterEach(() => {
    const spy = jest.spyOn(Date, 'now')
    spy.mockRestore()
  })

  describe('displayPrisonerLocationDetails', () => {
    it('should render the page', async () => {
      await controller.displayPrisonerLocationDetails(req, res, PrisonerMockDataA)

      expect(res.render).toHaveBeenCalledWith('pages/prisonerLocationDetails', {
        ...locationDetailsPageData,
      })
    })

    describe('should provide "Change cell" and "Move to reception" functionality', () => {
      it('should not display the "Move to reception" or "Change cell" buttons when user does not have the CELL_MOVE role', async () => {
        res = { ...res, locals: { ...res.locals, user: { ...res.locals.user, userRoles: [] } } }
        await controller.displayPrisonerLocationDetails(req, res, PrisonerMockDataA)

        expect(locationDetailsService.isReceptionFull).not.toHaveBeenCalled()
        expect(res.render).toHaveBeenCalledWith('pages/prisonerLocationDetails', {
          ...locationDetailsPageData,
          canViewCellMoveButton: false,
          canViewMoveToReceptionButton: false,
        })
      })

      it('should not display the "Move to reception" button when prisoner is already in reception', async () => {
        locationDetailsService.getLocationDetailsByLatestFirst = jest
          .fn()
          .mockResolvedValue([
            { ...currentLocation, location: 'Reception', isTemporaryLocation: true },
            ...previousLocations,
          ])

        await controller.displayPrisonerLocationDetails(req, res, PrisonerMockDataA)

        expect(locationDetailsService.isReceptionFull).not.toHaveBeenCalled()
        expect(res.render).toHaveBeenCalledWith('pages/prisonerLocationDetails', {
          ...locationDetailsPageData,
          currentLocation: {
            ...currentLocation,
            isTemporaryLocation: true,
            location: 'Reception',
          },
          canViewMoveToReceptionButton: false,
        })
      })

      it('should display the "Move to reception" button with "consider risks" link when there is capacity', async () => {
        locationDetailsService.isReceptionFull = jest.fn().mockResolvedValue(false)
        await controller.displayPrisonerLocationDetails(req, res, PrisonerMockDataA)

        expect(res.render).toHaveBeenCalledWith('pages/prisonerLocationDetails', {
          ...locationDetailsPageData,
          canViewMoveToReceptionButton: true,
          moveToReceptionLink: `${config.apis.dpsHomePageUrl}${profileUrl}/reception-move/consider-risks-reception`,
        })
      })

      it('should display the "Move to reception" button with "reception full" link when reception is full', async () => {
        locationDetailsService.isReceptionFull = jest.fn().mockResolvedValue(true)

        await controller.displayPrisonerLocationDetails(req, res, PrisonerMockDataA)

        expect(res.render).toHaveBeenCalledWith('pages/prisonerLocationDetails', {
          ...locationDetailsPageData,
          canViewMoveToReceptionButton: true,
          moveToReceptionLink: `${config.apis.dpsHomePageUrl}${profileUrl}/reception-move/reception-full`,
        })
      })

      it('should not display the "Current location" section or action buttons for TRN prisoners', async () => {
        res = { ...res, locals: { ...res.locals, user: { ...res.locals.user, userRoles: [Role.InactiveBookings] } } }

        await controller.displayPrisonerLocationDetails(req, res, { ...PrisonerMockDataA, prisonId: 'TRN' })

        expect(res.render).toHaveBeenCalledWith('pages/prisonerLocationDetails', {
          ...locationDetailsPageData,
          prisonId: 'TRN',
          isTransfer: true,
          canViewCellMoveButton: false,
          canViewMoveToReceptionButton: false,
          locationDetailsGroupedByAgency,
        })
      })

      it('should not display the "Current location" section or action buttons for OUT prisoners', async () => {
        res = { ...res, locals: { ...res.locals, user: { ...res.locals.user, userRoles: [Role.InactiveBookings] } } }

        await controller.displayPrisonerLocationDetails(req, res, { ...PrisonerMockDataA, prisonId: 'OUT' })

        expect(res.render).toHaveBeenCalledWith('pages/prisonerLocationDetails', {
          ...locationDetailsPageData,
          prisonId: 'OUT',
          isReleased: true,
          canViewCellMoveButton: false,
          canViewMoveToReceptionButton: false,
          locationDetailsGroupedByAgency,
        })
      })
    })
  })

  const currentLocation: LocationDetails = {
    agencyId: 'MDI',
    assignmentDateTime: '2024-01-01T01:02:03',
    assignmentEndDateTime: null,
    establishment: 'Moorland (HMP & YOI)',
    isTemporaryLocation: false,
    livingUnitId: 1,
    location: '1-1-1',
    movedIn: '01/01/2024 - 01:02',
    movedOut: null,
    movedInBy: 'User 1',
  }

  const previousLocation1: LocationDetails = {
    agencyId: 'MDI',
    assignmentDateTime: '2023-12-01T10:20:30',
    assignmentEndDateTime: '2024-01-01T01:02:03',
    establishment: 'Moorland (HMP & YOI)',
    isTemporaryLocation: false,
    livingUnitId: 2,
    location: '1-1-2',
    movedIn: '01/12/2023 - 10:20',
    movedOut: '01/01/2024 - 01:02',
    movedInBy: 'User 2',
  }

  const previousLocation2: LocationDetails = {
    agencyId: 'MDI',
    assignmentDateTime: '2023-12-01T01:02:03',
    assignmentEndDateTime: '2023-12-01T10:20:30',
    establishment: 'Moorland (HMP & YOI)',
    isTemporaryLocation: true,
    livingUnitId: 0,
    location: 'Reception',
    movedIn: '01/12/2023 - 01:02',
    movedOut: '01/12/2023 - 10:20',
    movedInBy: 'User 3',
  }

  const previousLocation3: LocationDetails = {
    agencyId: 'LEI',
    assignmentDateTime: '2023-11-01T01:02:03',
    assignmentEndDateTime: '2023-12-01T01:02:03',
    establishment: 'Leeds (HMP)',
    isTemporaryLocation: false,
    livingUnitId: 321,
    location: '3-2-1',
    movedIn: '01/11/2023 - 01:02',
    movedOut: '01/12/2023 - 01:02',
    movedInBy: 'User 4',
  }

  const previousLocations: LocationDetails[] = [previousLocation1, previousLocation2, previousLocation3]

  const locationDetailsGroupedByAgency: LocationDetailsGroupedByPeriodAtAgency[] = [
    {
      name: 'Moorland (HMP & YOI)',
      fromDateString: '01/12/2023',
      toDateString: '01/01/2024',
      locationDetails: [previousLocation1, previousLocation2],
      isValidAgency: true,
    },
    {
      name: 'Leeds (HMP)',
      fromDateString: '01/11/2023',
      toDateString: '01/12/2023',
      locationDetails: [previousLocation3],
      isValidAgency: true,
    },
  ]

  const locationDetailsPageData: LocationDetailsPageData = {
    pageTitle: 'Location details',
    breadcrumbPrisonerName: 'John Saunders',
    name: 'John Saunders',
    prisonerName: 'Saunders, John',
    prisonerNumber: PrisonerMockDataA.prisonerNumber,
    profileUrl,
    canViewCellMoveButton: true,
    canViewMoveToReceptionButton: true,
    currentLocation,
    locationDetailsGroupedByAgency,
    dpsBaseUrl: `${config.apis.dpsHomePageUrl}${profileUrl}`,
    changeCellLink: `${config.apis.dpsHomePageUrl}${profileUrl}/cell-move/search-for-cell?returnUrl=${profileUrl}`,
    moveToReceptionLink: `${config.apis.dpsHomePageUrl}${profileUrl}/reception-move/consider-risks-reception`,
    occupants: [{ name: 'Mate 1', profileUrl: `/prisoner/${PrisonerMockDataB.prisonerNumber}` }],
    prisonId: 'MDI',
    isTransfer: false,
    isReleased: false,
  }
})
