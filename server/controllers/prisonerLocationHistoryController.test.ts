import { Request, Response } from 'express'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import PrisonerLocationHistoryController from './prisonerLocationHistoryController'
import { GetDetailsMock } from '../data/localMockData/getDetailsMock'
import StaffDetailsMock from '../data/localMockData/staffDetails'
import { mockHistoryForLocation } from '../data/localMockData/getHistoryForLocationMock'
import { agencyDetailsMock } from '../data/localMockData/agency'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { getCellMoveReasonTypesMock } from '../data/localMockData/getCellMoveReasonTypesMock'
import { CellMovementReasonMock } from '../data/localMockData/cellMovementReasonMock'
import PrisonerLocationHistoryService from '../services/prisonerLocationHistoryService'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { CellMovementsApiClient } from '../data/interfaces/cellMovementsApi'
import { locationsInsidePrisonApiClientMock } from '../../tests/mocks/locationsInsidePrisonApiClientMock'
import { nomisSyncPrisonerMappingApiClientMock } from '../../tests/mocks/nomisSyncPrisonerMappingApiClientMock'

describe('Specific Prisoner Location History', () => {
  const offenderNo = 'A1234BC'
  let req: Request
  let res: Response
  let controller: PrisonerLocationHistoryController
  let historyForLocationMock: ReturnType<typeof mockHistoryForLocation>
  let cellMovementReasonMock: typeof CellMovementReasonMock | null

  beforeEach(() => {
    req = {
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
      },
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: { agencyId: 'MDI', locationId: '25762', fromDate: '2023-07-11T14:56:16', toDate: '2023-08-17T12:00:00' },
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
    } as unknown as Request
    res = {
      locals: {
        user: {
          userRoles: [],
          staffId: 487023,
          caseLoads: CaseLoadsDummyDataA,
          token: 'USER_TOKEN',
        },
      },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response

    const prisonApiClient = prisonApiClientMock()
    const locationsInsidePrisonApiClient = locationsInsidePrisonApiClientMock()
    const nomisSyncPrisonerMappingApiClient = nomisSyncPrisonerMappingApiClientMock()
    const cellMovementsApiClient: CellMovementsApiClient = {
      getCellMovementReason: jest.fn(),
    }

    prisonApiClient.getDetails = jest.fn().mockResolvedValue(GetDetailsMock)
    prisonApiClient.getStaffDetails = jest.fn().mockResolvedValue(StaffDetailsMock)
    historyForLocationMock = mockHistoryForLocation()
    prisonApiClient.getHistoryForLocation = jest.fn().mockImplementation(async () => historyForLocationMock)
    prisonApiClient.getAgencyDetails = jest.fn().mockResolvedValue(agencyDetailsMock)
    prisonApiClient.getUserCaseLoads = jest.fn().mockResolvedValue(CaseLoadsDummyDataA)
    prisonApiClient.getCellMoveReasonTypes = jest.fn().mockResolvedValue(getCellMoveReasonTypesMock)
    prisonApiClient.getInmateDetail = jest.fn().mockResolvedValue(inmateDetailMock)
    cellMovementReasonMock = CellMovementReasonMock
    cellMovementsApiClient.getCellMovementReason = jest.fn().mockImplementation(async () => cellMovementReasonMock)

    nomisSyncPrisonerMappingApiClient.getMappingUsingNomisLocationId = jest
      .fn()
      .mockResolvedValue({ dpsLocationId: 'abcdefg' })

    locationsInsidePrisonApiClient.getLocation = jest.fn().mockResolvedValue({
      localName: 'Cell 1',
      key: 'LEI-1-1',
    })

    locationsInsidePrisonApiClient.getLocationAttributes = jest.fn().mockResolvedValue([
      { code: 'LISTENER_CRISIS', description: 'Listener / crisis cell' },
      { code: 'SO', description: 'Single occupancy' },
    ])

    controller = new PrisonerLocationHistoryController(
      new PrisonerLocationHistoryService(
        () => prisonApiClient,
        () => cellMovementsApiClient,
        () => locationsInsidePrisonApiClient,
        () => nomisSyncPrisonerMappingApiClient,
      ),
    )
  })

  afterEach(() => {
    const spy = jest.spyOn(Date, 'now')
    spy.mockRestore()
  })

  describe('when visiting the page with no query', () => {
    describe('without data', () => {
      it('should render the template with the correct days of the week', async () => {
        await controller.displayPrisonerLocationHistory(req, res, PrisonerMockDataA)
        expect(res.render).toHaveBeenCalledWith('pages/prisonerLocationHistory.njk', {
          locationDetails: {
            attributes: [
              {
                code: 'LISTENER_CRISIS',
                description: 'Listener / crisis cell',
              },
              { code: 'SO', description: 'Single occupancy' },
            ],
            description: 'Leeds (HMP)',
            movedBy: 'John Smith',
            movedIn: undefined,
            movedOut: 'Current cell',
            reasonForMove: 'Not entered',
            whatHappened: 'Initial text for case note.',
          },
          locationName: undefined,
          locationSharingHistory: [],
        })
      })

      it('should show the reason for the move even when no explanation was recorded', async () => {
        // The reason code comes from prison-api's bed assignment history, independent of whether a
        // cell movement (and its explanation) was ever recorded through DPS.
        historyForLocationMock = mockHistoryForLocation([{ bookingId: PrisonerMockDataA.bookingId }])
        cellMovementReasonMock = null

        await controller.displayPrisonerLocationHistory(req, res, PrisonerMockDataA)

        expect(res.render).toHaveBeenCalledWith(
          'pages/prisonerLocationHistory.njk',
          expect.objectContaining({
            locationDetails: expect.objectContaining({
              reasonForMove: 'Some description',
              whatHappened: 'Not entered',
            }),
          }),
        )
      })
    })
  })
})
