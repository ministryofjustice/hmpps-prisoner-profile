import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import PrisonerLocationHistoryController from './prisonerLocationHistoryController'
import { GetDetailsMock } from '../data/localMockData/getDetailsMock'
import StaffDetailsMock from '../data/localMockData/staffDetails'
import { mockHistoryForLocation } from '../data/localMockData/getHistoryForLocationMock'
import { agencyDetailsMock } from '../data/localMockData/agency'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { getCellMoveReasonTypesMock } from '../data/localMockData/getCellMoveReasonTypesMock'
import { CellMoveReasonMock } from '../data/localMockData/getCellMoveReasonMock'
import PrisonerLocationHistoryService from '../services/prisonerLocationHistoryService'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { WhereaboutsApiClient } from '../data/interfaces/whereaboutsApi/whereaboutsApiClient'
import { locationsInsidePrisonApiClientMock } from '../../tests/mocks/locationsInsidePrisonApiClientMock'
import { nomisSyncPrisonerMappingApiClientMock } from '../../tests/mocks/nomisSyncPrisonerMappingApiClientMock'
import { findCaseNotesMock } from '../data/localMockData/findCaseNotesMock'

describe('Specific Prisoner Location History', () => {
  const offenderNo = 'ABC123'
  let req: any
  let res: any
  let controller: PrisonerLocationHistoryController

  beforeEach(() => {
    req = {
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
      },
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: { agencyId: 'MDI', locationId: 25762, fromDate: '2023-07-11T14:56:16', toDate: '2023-08-17T12:00:00' },
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
    }
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
    }

    const prisonApiClient = prisonApiClientMock()
    const locationsInsidePrisonApiClient = locationsInsidePrisonApiClientMock()
    const nomisSyncPrisonerMappingApiClient = nomisSyncPrisonerMappingApiClientMock()
    const whereaboutsApiClient: WhereaboutsApiClient = {
      getAppointment: jest.fn(),
      getCellMoveReason: jest.fn(),
      getUnacceptableAbsences: jest.fn(),
      createAppointments: jest.fn(),
    }

    const caseNotesApiClient = {
      getCaseNoteTypes: jest.fn(),
      getCaseNoteTypesForUser: jest.fn(),
      getCaseNotes: jest.fn(),
      addCaseNote: jest.fn(),
      addCaseNoteAmendment: jest.fn(),
      getCaseNote: jest.fn(),
    }

    prisonApiClient.getDetails = jest.fn().mockResolvedValue(GetDetailsMock)
    prisonApiClient.getStaffDetails = jest.fn().mockResolvedValue(StaffDetailsMock)
    prisonApiClient.getHistoryForLocation = jest.fn().mockResolvedValue(mockHistoryForLocation())
    prisonApiClient.getAgencyDetails = jest.fn().mockResolvedValue(agencyDetailsMock)
    prisonApiClient.getUserCaseLoads = jest.fn().mockResolvedValue(CaseLoadsDummyDataA)
    prisonApiClient.getCellMoveReasonTypes = jest.fn().mockResolvedValue(getCellMoveReasonTypesMock)
    prisonApiClient.getInmateDetail = jest.fn().mockResolvedValue(inmateDetailMock)
    whereaboutsApiClient.getCellMoveReason = jest.fn().mockResolvedValue(CellMoveReasonMock)
    caseNotesApiClient.getCaseNote = jest.fn().mockResolvedValue(findCaseNotesMock.content[0])

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
        () => whereaboutsApiClient,
        () => caseNotesApiClient,
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
          prisonerBreadcrumbName: 'Saunders, John',
          prisonerName: 'John Saunders',
          prisonerNumber: 'G6123VU',
        })
      })
    })
  })
})
