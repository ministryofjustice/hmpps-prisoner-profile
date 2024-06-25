import { PrisonerMockDataA, PrisonerMockDataB } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import LocationDetailsController from './locationDetailsController'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { AuditService } from '../services/auditService'
import config from '../config'
import { prisonerLocationDetailsServiceMock } from '../../tests/mocks/prisonerLocationDetailsServiceMock'
import LocationDetailsService from '../services/locationDetailsService'
import LocationDetailsPageData from '../services/interfaces/locationDetailsService/LocationDetailsPageData'
import { Role } from '../data/enums/role'
import LocationDetails, {
  LocationDetailsGroupedByPeriodAtAgency,
} from '../services/interfaces/locationDetailsService/LocationDetails'
import StaffDetails from '../data/interfaces/prisonApi/StaffDetails'
import LocationDetailsConverter from './converters/locationDetailsConverter'

describe('Prisoner Location Details', () => {
  const offenderNo = 'ABC123'
  let req: any
  let res: any
  let controller: LocationDetailsController
  let locationDetailsService: LocationDetailsService
  let auditServiceClient: AuditService

  beforeEach(() => {
    req = {
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
        permissions: { cellMove: { edit: true } },
      },
      originalUrl: 'http://localhost',
      params: { offenderNo },
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
    }
    res = {
      locals: {
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

    locationDetailsService = prisonerLocationDetailsServiceMock() as LocationDetailsService
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

    controller = new LocationDetailsController(locationDetailsService, auditServiceClient, locationDetailsConverter)
  })

  afterEach(() => {
    const spy = jest.spyOn(Date, 'now')
    spy.mockRestore()
  })

  describe('displayPrisonerLocationDetails', () => {
    it('should render the page', async () => {
      await controller.displayLocationDetails(req, res, PrisonerMockDataA)

      expect(res.render).toHaveBeenCalledWith('pages/locationDetails', {
        ...locationDetailsPageData,
      })
    })

    describe('should provide "Change cell" and "Move to reception" functionality', () => {
      it('should not display the "Move to reception" or "Change cell" buttons when user does not have cellMove.edit permissions', async () => {
        res = { ...res, locals: { ...res.locals, user: { ...res.locals.user, userRoles: [] } } }
        const reqNoPermission = {
          ...req,
          middleware: {
            ...req.middleware,
            permissions: {
              cellMove: {
                edit: false,
              },
            },
          },
        }
        await controller.displayLocationDetails(reqNoPermission, res, PrisonerMockDataA)

        expect(locationDetailsService.isReceptionFull).not.toHaveBeenCalled()
        expect(res.render).toHaveBeenCalledWith('pages/locationDetails', {
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

        await controller.displayLocationDetails(req, res, PrisonerMockDataA)

        expect(locationDetailsService.isReceptionFull).not.toHaveBeenCalled()
        expect(res.render).toHaveBeenCalledWith('pages/locationDetails', {
          ...locationDetailsPageData,
          currentLocation: {
            ...locationDetailsPageData.currentLocation,
            location: 'Reception',
            locationHistoryLink: null,
          },
          canViewMoveToReceptionButton: false,
        })
      })

      it('should display the "Move to reception" button with "consider risks" link when there is capacity', async () => {
        locationDetailsService.isReceptionFull = jest.fn().mockResolvedValue(false)
        await controller.displayLocationDetails(req, res, PrisonerMockDataA)

        expect(res.render).toHaveBeenCalledWith('pages/locationDetails', {
          ...locationDetailsPageData,
          canViewMoveToReceptionButton: true,
          moveToReceptionLink: `${config.serviceUrls.changeSomeonesCell}${profileUrl}/reception-move/consider-risks-reception?returnToService=prisonerProfile`,
        })
      })

      it('should display the "Move to reception" button with "reception full" link when reception is full', async () => {
        locationDetailsService.isReceptionFull = jest.fn().mockResolvedValue(true)

        await controller.displayLocationDetails(req, res, PrisonerMockDataA)

        expect(res.render).toHaveBeenCalledWith('pages/locationDetails', {
          ...locationDetailsPageData,
          canViewMoveToReceptionButton: true,
          moveToReceptionLink: `${config.serviceUrls.changeSomeonesCell}${profileUrl}/reception-move/reception-full?returnToService=prisonerProfile`,
        })
      })

      it('should not display the "Current location" section or action buttons for users without cellMove.edit permission', async () => {
        res = { ...res, locals: { ...res.locals, user: { ...res.locals.user, userRoles: [Role.InactiveBookings] } } }
        const reqNoPermission = {
          ...req,
          middleware: {
            ...req.middleware,
            permissions: {
              cellMove: {
                edit: false,
              },
            },
          },
        }

        await controller.displayLocationDetails(reqNoPermission, res, { ...PrisonerMockDataA, prisonId: 'TRN' })

        expect(res.render).toHaveBeenCalledWith('pages/locationDetails', {
          ...locationDetailsPageData,
          prisonId: 'TRN',
          isTransfer: true,
          canViewCellMoveButton: false,
          canViewMoveToReceptionButton: false,
          currentLocation: null,
          occupants: [],
        })
      })
    })
  })

  const { prisonerNumber } = PrisonerMockDataA
  const profileUrl = `/prisoner/${prisonerNumber}`
  const now = new Date('2024-02-03T11:22:33')
  const locationDetailsConverter = new LocationDetailsConverter(() => now)

  const currentLocation: LocationDetails = {
    prisonerNumber,
    agencyId: 'MDI',
    agencyName: 'Moorland (HMP & YOI)',
    assignmentDateTime: '2024-01-01T01:02:03',
    assignmentEndDateTime: null,
    isTemporaryLocation: false,
    livingUnitId: 1,
    location: '1-1-1',
    movementMadeByUsername: 'USER_1',
    movementMadeByStaffDetails: { firstName: 'User', lastName: '1' } as StaffDetails,
  }

  const previousLocation1: LocationDetails = {
    prisonerNumber,
    agencyId: 'MDI',
    agencyName: 'Moorland (HMP & YOI)',
    assignmentDateTime: '2023-12-01T10:20:30',
    assignmentEndDateTime: '2024-01-01T01:02:03',
    isTemporaryLocation: false,
    livingUnitId: 2,
    location: '1-1-2',
    movementMadeByUsername: 'USER_2',
    movementMadeByStaffDetails: { firstName: 'User', lastName: '2' } as StaffDetails,
  }

  const previousLocation2: LocationDetails = {
    prisonerNumber,
    agencyId: 'MDI',
    agencyName: 'Moorland (HMP & YOI)',
    assignmentDateTime: '2023-12-01T01:02:03',
    assignmentEndDateTime: '2023-12-01T10:20:30',
    isTemporaryLocation: true,
    livingUnitId: 0,
    location: 'Reception',
    movementMadeByUsername: 'USER_3',
    movementMadeByStaffDetails: { firstName: 'User', lastName: '3' } as StaffDetails,
  }

  const previousLocation3: LocationDetails = {
    prisonerNumber,
    agencyId: 'LEI',
    agencyName: 'Leeds (HMP)',
    assignmentDateTime: '2023-11-01T01:02:03',
    assignmentEndDateTime: '2023-12-01T01:02:03',
    isTemporaryLocation: false,
    livingUnitId: 321,
    location: '3-2-1',
    movementMadeByUsername: 'USER_4',
    movementMadeByStaffDetails: { firstName: 'User', lastName: '4' } as StaffDetails,
  }

  const previousLocations: LocationDetails[] = [previousLocation1, previousLocation2, previousLocation3]

  const locationDetailsGroupedByAgency: LocationDetailsGroupedByPeriodAtAgency[] = [
    {
      agencyName: 'Moorland (HMP & YOI)',
      fromDate: '2023-12-01T01:02:03',
      toDate: '2024-01-01T01:02:03',
      locationDetails: [previousLocation1, previousLocation2],
    },
    {
      agencyName: 'Leeds (HMP)',
      fromDate: '2023-11-01T01:02:03',
      toDate: '2023-12-01T01:02:03',
      locationDetails: [previousLocation3],
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
    currentLocation: locationDetailsConverter.convertLocationDetails(currentLocation),
    locationDetailsGroupedByAgency: locationDetailsGroupedByAgency.map(
      locationDetailsConverter.convertGroupedLocationDetails,
    ),
    changeCellLink: `${config.serviceUrls.changeSomeonesCell}${profileUrl}/cell-move/search-for-cell?returnToService=prisonerProfile`,
    moveToReceptionLink: `${config.serviceUrls.changeSomeonesCell}${profileUrl}/reception-move/consider-risks-reception?returnToService=prisonerProfile`,
    occupants: [{ name: 'Mate 1', profileUrl: `/prisoner/${PrisonerMockDataB.prisonerNumber}` }],
    prisonId: 'MDI',
    isTransfer: false,
    isReleased: false,
  }
})
