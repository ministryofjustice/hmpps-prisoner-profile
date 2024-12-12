import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { WhereaboutsApiClient } from '../data/interfaces/whereaboutsApi/whereaboutsApiClient'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import PrisonerLocationHistoryService from './prisonerLocationHistoryService'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { GetAttributesForLocation } from '../data/localMockData/getAttributesForLocationMock'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { mockHistoryForLocation } from '../data/localMockData/getHistoryForLocationMock'
import StaffDetailsMock from '../data/localMockData/staffDetails'
import { GetDetailsMock } from '../data/localMockData/getDetailsMock'
import { agencyDetailsMock } from '../data/localMockData/agency'
import { getCellMoveReasonTypesMock } from '../data/localMockData/getCellMoveReasonTypesMock'
import { inmateDetailMock, inmateDetailMockOverride } from '../data/localMockData/inmateDetailMock'
import { CellMoveReasonMock } from '../data/localMockData/getCellMoveReasonMock'
import { pagedCaseNotesMock } from '../data/localMockData/pagedCaseNotesMock'
import CaseNotesApiClient from '../data/interfaces/caseNotesApi/caseNotesApiClient'
import CellMoveReason from '../data/interfaces/whereaboutsApi/CellMoveReason'
import CaseNote from '../data/interfaces/caseNotesApi/CaseNote'

describe('prisonerLocationHistoryService', () => {
  let prisonApiClient: PrisonApiClient
  let whereaboutsApiClient: WhereaboutsApiClient
  let caseNotesApiClient: CaseNotesApiClient
  let service: PrisonerLocationHistoryService

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    whereaboutsApiClient = {
      getCellMoveReason: jest.fn(),
      getUnacceptableAbsences: jest.fn(),
      createAppointments: jest.fn(),
    }

    caseNotesApiClient = {
      getCaseNoteTypes: jest.fn(),
      getCaseNotes: jest.fn(),
      addCaseNote: jest.fn(),
      addCaseNoteAmendment: jest.fn(),
      getCaseNote: jest.fn(),
    }

    prisonApiClient.getDetails = jest.fn().mockResolvedValue(GetDetailsMock)
    prisonApiClient.getStaffDetails = jest.fn().mockResolvedValue(StaffDetailsMock)
    prisonApiClient.getAttributesForLocation = jest.fn().mockResolvedValue(GetAttributesForLocation)
    prisonApiClient.getHistoryForLocation = jest
      .fn()
      .mockResolvedValue(mockHistoryForLocation([{ bookingId: PrisonerMockDataA.bookingId }]))
    prisonApiClient.getAgencyDetails = jest.fn().mockResolvedValue(agencyDetailsMock)
    prisonApiClient.getUserCaseLoads = jest.fn().mockResolvedValue(CaseLoadsDummyDataA)
    prisonApiClient.getCellMoveReasonTypes = jest.fn().mockResolvedValue(getCellMoveReasonTypesMock)
    prisonApiClient.getInmateDetail = jest.fn().mockResolvedValue(inmateDetailMock)
    whereaboutsApiClient.getCellMoveReason = jest.fn().mockResolvedValue(CellMoveReasonMock)
    caseNotesApiClient.getCaseNote = jest.fn().mockResolvedValue(pagedCaseNotesMock.content[0])

    const prisonApiClientBuilder = () => prisonApiClient
    const caseNotesApiClientBuilder = () => caseNotesApiClient
    const whereaboutsApiClientBuilder = () => whereaboutsApiClient

    service = new PrisonerLocationHistoryService(
      prisonApiClientBuilder,
      whereaboutsApiClientBuilder,
      caseNotesApiClientBuilder,
    )
  })

  it('Returns the agency details from the API', async () => {
    const res = await service.getPrisonerLocationHistory(
      'token',
      PrisonerMockDataA,
      'LEI',
      'locationId',
      '2023-01-01',
      '2024-01-01',
    )

    expect(prisonApiClient.getAgencyDetails).toHaveBeenCalledWith('LEI')
    expect(res.agencyDetails).toEqual(agencyDetailsMock)
  })

  it('Returns the cell move reason types', async () => {
    const { cellMoveReasonTypes } = await service.getPrisonerLocationHistory(
      'token',
      PrisonerMockDataA,
      'LEI',
      'locationId',
      '2023-01-01',
      '2024-01-01',
    )

    expect(cellMoveReasonTypes).toEqual(getCellMoveReasonTypesMock)
  })

  it('Returns the details of the current prisoner', async () => {
    prisonApiClient.getHistoryForLocation = jest.fn(async () =>
      mockHistoryForLocation([
        { bookingId: PrisonerMockDataA.bookingId, livingUnitId: 1234321 },
        { bookingId: 1 },
        { bookingId: 2 },
        { bookingId: 3 },
      ]),
    )

    const { currentPrisonerDetails } = await service.getPrisonerLocationHistory(
      'token',
      PrisonerMockDataA,
      'LEI',
      'locationId',
      '2023-01-01',
      '2024-01-01',
    )

    expect(currentPrisonerDetails.livingUnitId).toEqual(1234321)
  })

  it('Returns the location attributes from the API', async () => {
    const res = await service.getPrisonerLocationHistory(
      'token',
      PrisonerMockDataA,
      'LEI',
      'locationId',
      '2023-01-01',
      '2024-01-01',
    )

    expect(prisonApiClient.getAttributesForLocation).toHaveBeenCalledWith('locationId')
    expect(res.locationAttributes).toEqual(GetAttributesForLocation)
  })

  it('Gets the location history and populates it with details of the prisoner', async () => {
    prisonApiClient.getHistoryForLocation = jest.fn(async () =>
      mockHistoryForLocation([
        { bookingId: PrisonerMockDataA.bookingId },
        { bookingId: 1 },
        { bookingId: 2 },
        { bookingId: 3 },
      ]),
    )
    prisonApiClient.getInmateDetail = jest.fn(async (bookingId: number) => {
      switch (bookingId) {
        case 1:
          return inmateDetailMockOverride({ bookingId: 1, firstName: 'BookingId1' })
        case 2:
          return inmateDetailMockOverride({ bookingId: 2, firstName: 'BookingId2' })
        case 3:
          return inmateDetailMockOverride({ bookingId: 3, firstName: 'BookingId3' })
        default:
          return inmateDetailMock
      }
    })

    const res = await service.getPrisonerLocationHistory(
      'token',
      PrisonerMockDataA,
      'LEI',
      'locationId',
      '2023-01-01',
      '2024-01-01',
    )

    expect(prisonApiClient.getInmateDetail).toHaveBeenCalledWith(1)
    expect(prisonApiClient.getInmateDetail).toHaveBeenCalledWith(2)
    expect(prisonApiClient.getInmateDetail).toHaveBeenCalledWith(3)
    expect(res.locationHistoryWithPrisoner).toEqual(
      expect.arrayContaining([expect.objectContaining({ firstName: 'BookingId1' })]),
    )
    expect(res.locationHistoryWithPrisoner).toEqual(
      expect.arrayContaining([expect.objectContaining({ firstName: 'BookingId2' })]),
    )
    expect(res.locationHistoryWithPrisoner).toEqual(
      expect.arrayContaining([expect.objectContaining({ firstName: 'BookingId3' })]),
    )
  })

  it('Returns the staff name of the staff member who made the movement', async () => {
    const res = await service.getPrisonerLocationHistory(
      'token',
      PrisonerMockDataA,
      'LEI',
      'locationId',
      '2023-01-01',
      '2024-01-01',
    )

    expect(prisonApiClient.getAgencyDetails).toHaveBeenCalledWith('LEI')
    expect(res.agencyDetails).toEqual(agencyDetailsMock)
  })

  describe('whatHappened', () => {
    beforeEach(() => {
      prisonApiClient.getHistoryForLocation = jest.fn(async () =>
        mockHistoryForLocation([{ bookingId: PrisonerMockDataA.bookingId, bedAssignmentHistorySequence: 10 }]),
      )
    })

    describe('Given no cell move reason', () => {
      it('Returns null', async () => {
        whereaboutsApiClient.getCellMoveReason = jest.fn(async (): Promise<CellMoveReason> => null)
        const res = await service.getPrisonerLocationHistory(
          'token',
          PrisonerMockDataA,
          'LEI',
          'locationId',
          '2023-01-01',
          '2024-01-01',
        )

        expect(res.whatHappenedDetails).toEqual(null)
      })
    })

    describe('Given a cell move reason', () => {
      describe('and no relevant case note', () => {
        it('Returns null', async () => {
          caseNotesApiClient.getCaseNote = jest.fn(async (): Promise<CaseNote> => null)
          const res = await service.getPrisonerLocationHistory(
            'token',
            PrisonerMockDataA,
            'LEI',
            'locationId',
            '2023-01-01',
            '2024-01-01',
          )

          expect(res.whatHappenedDetails).toEqual(null)
        })
      })

      describe('and a relevant case note', () => {
        it('Returns the text of the case note', async () => {
          const res = await service.getPrisonerLocationHistory(
            'token',
            PrisonerMockDataA,
            'LEI',
            'locationId',
            '2023-01-01',
            '2024-01-01',
          )

          expect(whereaboutsApiClient.getCellMoveReason).toHaveBeenCalledWith(PrisonerMockDataA.bookingId, 10, true)
          expect(caseNotesApiClient.getCaseNote).toHaveBeenCalledWith(
            PrisonerMockDataA.prisonerNumber,
            PrisonerMockDataA.prisonId,
            CellMoveReasonMock.cellMoveReason.caseNoteId.toString(),
            true,
          )
          expect(res.whatHappenedDetails).toEqual(pagedCaseNotesMock.content[0].text)
        })
      })
    })
  })
})
