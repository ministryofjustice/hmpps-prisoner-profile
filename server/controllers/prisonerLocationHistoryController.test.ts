import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import PrisonerLocationHistoryController from './prisonerLocationHistoryController'
import { GetDetailsMock } from '../data/localMockData/getDetailsMock'
import StaffDetailsMock from '../data/localMockData/staffDetails'
import { GetAttributesForLocation } from '../data/localMockData/getAttributesForLocationMock'
import { mockHistoryForLocation } from '../data/localMockData/getHistoryForLocationMock'
import { agencyDetailsMock } from '../data/localMockData/agency'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { getCellMoveReasonTypesMock } from '../data/localMockData/getCellMoveReasonTypesMock'
import { CellMoveReasonMock } from '../data/localMockData/getCellMoveReasonMock'
import { pagedCaseNotesMock } from '../data/localMockData/pagedCaseNotesMock'
import prisonerLocationHistoryService from '../services/prisonerLocationHistoryService'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { WhereaboutsApiClient } from '../data/interfaces/whereaboutsApiClient'

describe('Specific Prisoner Location History', () => {
  const offenderNo = 'ABC123'
  let req: any
  let res: any
  let controller: PrisonerLocationHistoryController

  beforeEach(() => {
    req = {
      middleware: {
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
        clientToken: 'CLIENT_TOKEN',
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
    const whereaboutsApiClient: WhereaboutsApiClient = {
      getCellMoveReason: jest.fn(),
      getUnacceptableAbsences: jest.fn(),
      addVideoLinkBooking: jest.fn(),
      createAppointments: jest.fn(),
      getCourts: jest.fn(),
    }

    const caseNotesApiClient = {
      getCaseNoteTypes: jest.fn(),
      getCaseNoteTypesForUser: jest.fn(),
      getCaseNotes: jest.fn(),
      addCaseNote: jest.fn(),
      getCaseNote: jest.fn(),
    }

    prisonApiClient.getDetails = jest.fn().mockResolvedValue(GetDetailsMock)
    prisonApiClient.getStaffDetails = jest.fn().mockResolvedValue(StaffDetailsMock)
    prisonApiClient.getAttributesForLocation = jest.fn().mockResolvedValue(GetAttributesForLocation)
    prisonApiClient.getHistoryForLocation = jest.fn().mockResolvedValue(mockHistoryForLocation())
    prisonApiClient.getAgencyDetails = jest.fn().mockResolvedValue(agencyDetailsMock)
    prisonApiClient.getUserCaseLoads = jest.fn().mockResolvedValue(CaseLoadsDummyDataA)
    prisonApiClient.getCellMoveReasonTypes = jest.fn().mockResolvedValue(getCellMoveReasonTypesMock)
    prisonApiClient.getInmateDetail = jest.fn().mockResolvedValue(inmateDetailMock)
    whereaboutsApiClient.getCellMoveReason = jest.fn().mockResolvedValue(CellMoveReasonMock)
    caseNotesApiClient.getCaseNote = jest.fn().mockResolvedValue(pagedCaseNotesMock.content[0])

    controller = new PrisonerLocationHistoryController(
      prisonerLocationHistoryService({
        prisonApiClientBuilder: () => prisonApiClient,
        whereaboutsApiClientBuilder: () => whereaboutsApiClient,
        caseNotesApiClientBuilder: () => caseNotesApiClient,
      }),
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
                code: 'LC',
                description: 'Listener Cell',
              },
            ],
            description: 'Leeds (HMP)',
            movedBy: 'John Smith',
            movedIn: undefined,
            movedOut: 'Current cell',
            reasonForMove: 'Not entered',
            whatHappened: 'Test tes',
          },
          locationName: undefined,
          locationSharingHistory: [],
          prisonerName: 'John Saunders',
          prisonerNumber: 'G6123VU',
        })
      })
    })
  })
})
