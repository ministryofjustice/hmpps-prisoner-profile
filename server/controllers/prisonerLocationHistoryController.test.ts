import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { dataAccess } from '../data'
import PrisonerLocationHistoryController from './prisonerLocationHistoryController'
import { GetDetailsMock } from '../data/localMockData/getDetailsMock'
import StaffDetailsMock from '../data/localMockData/staffDetails'
import { GetAttributesForLocation } from '../data/localMockData/getAttributesForLocationMock'
import { GetHistoryForLocation } from '../data/localMockData/getHistoryForLocationMock'
import { agencyDetailsMock } from '../data/localMockData/agency'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { getCellMoveReasonTypesMock } from '../data/localMockData/getCellMoveReasonTypesMock'
import { CellMoveReasonMock } from '../data/localMockData/getCellMoveReasonMock'
import { pagedCaseNotesMock } from '../data/localMockData/pagedCaseNotesMock'

describe('Specific Prisoner Location History', () => {
  const offenderNo = 'ABC123'
  const prisonApi = {
    getDetails: jest.fn(),
    getStaffDetails: jest.fn(),
    getAttributesForLocation: jest.fn(),
    getHistoryForLocation: jest.fn(),
    getAgencyDetails: jest.fn(),
    getUserCaseLoads: jest.fn(),
    getCellMoveReasonTypes: jest.fn(),
    getInmateDetail: jest.fn(),
  }

  const whereaboutsApi = {
    getCellMoveReason: jest.fn(),
  }

  const caseNotesApi = {
    getCaseNote: jest.fn(),
  }

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

    prisonApi.getDetails = jest.fn().mockResolvedValue(GetDetailsMock)
    prisonApi.getStaffDetails = jest.fn().mockResolvedValue(StaffDetailsMock)
    prisonApi.getAttributesForLocation = jest.fn().mockResolvedValue(GetAttributesForLocation)
    prisonApi.getHistoryForLocation = jest.fn().mockResolvedValue(GetHistoryForLocation)
    prisonApi.getAgencyDetails = jest.fn().mockResolvedValue(agencyDetailsMock)
    prisonApi.getUserCaseLoads = jest.fn().mockResolvedValue(CaseLoadsDummyDataA)
    prisonApi.getCellMoveReasonTypes = jest.fn().mockResolvedValue(getCellMoveReasonTypesMock)
    prisonApi.getInmateDetail = jest.fn().mockResolvedValue(inmateDetailMock)

    whereaboutsApi.getCellMoveReason = jest.fn().mockResolvedValue(CellMoveReasonMock)

    caseNotesApi.getCaseNote = jest.fn().mockResolvedValue(pagedCaseNotesMock.content[0])

    controller = new PrisonerLocationHistoryController(
      dataAccess.prisonApiClientBuilder,
      dataAccess.whereAboutsApiClientBuilder,
      dataAccess.caseNotesApiClientBuilder,
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
          breadcrumbPrisonerName: null,
          locationDetails: {
            attributes: undefined,
            description: undefined,
            movedBy: '',
            movedIn: undefined,
            movedOut: 'Current cell',
            reasonForMove: 'Not entered',
            whatHappened: 'Not entered',
          },
          locationName: undefined,
          locationSharingHistory: false,
          prisonerName: '',
          prisonerNumber: 'G6123VU',
          profileUrl: '/prisoner/G6123VU',
        })
      })
    })
  })
})
