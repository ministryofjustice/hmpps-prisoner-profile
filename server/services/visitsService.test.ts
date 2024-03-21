import { startOfDay, subYears } from 'date-fns'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { VisitsListQueryParams } from '../data/interfaces/prisonApi/PagedList'
import { ReferenceCodeDomain } from '../data/interfaces/prisonApi/ReferenceCode'
import { Visitor } from '../data/interfaces/prisonApi/VisitWithVisitors'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { mockPagedVisits, pagedVisitsMock } from '../data/localMockData/pagedVisitsWithVisitors'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { VisitsService } from './visitsService'

describe('visitsService', () => {
  let prisoner: Prisoner
  let service: VisitsService
  let prisonApiClient: PrisonApiClient

  beforeEach(() => {
    prisoner = PrisonerMockDataA
    prisonApiClient = prisonApiClientMock()
    prisonApiClient.getVisitsForBookingWithVisitors = jest.fn(async () => pagedVisitsMock)
    prisonApiClient.getReferenceCodesByDomain = jest.fn(async (referenceCode: ReferenceCodeDomain) => {
      if (referenceCode === ReferenceCodeDomain.VisitCancellationReasons) {
        return [{ code: 'Cancellation', description: 'desc', activeFlag: 'Y' as 'Y' | 'N' }]
      }

      if (referenceCode === ReferenceCodeDomain.VisitCompletionReasons) {
        return [{ code: 'Completion', description: 'desc', activeFlag: 'Y' as 'Y' | 'N' }]
      }

      return []
    })
    service = new VisitsService(() => prisonApiClient)
  })

  describe('getVisits', () => {
    it('Gets the cancellation reasons from the prison api', async () => {
      const result = await service.getVisits('', prisoner, {} as VisitsListQueryParams)

      expect(prisonApiClient.getReferenceCodesByDomain).toHaveBeenCalledWith(
        ReferenceCodeDomain.VisitCancellationReasons,
      )
      expect(result.cancellationReasons[0].code).toEqual('Cancellation')
    })

    it('Gets the completion reasons from the prison api', async () => {
      const result = await service.getVisits('', prisoner, {} as VisitsListQueryParams)

      expect(prisonApiClient.getReferenceCodesByDomain).toHaveBeenCalledWith(ReferenceCodeDomain.VisitCompletionReasons)
      expect(result.completionReasons[0].code).toEqual('Completion')
    })

    it('Gets the visit prisons from the prison api', async () => {
      const result = await service.getVisits('', prisoner, {} as VisitsListQueryParams)

      expect(prisonApiClient.getVisitsPrisons).toHaveBeenCalledWith(prisoner.bookingId)
      expect(result.visitsWithPaginationInfo).toEqual(pagedVisitsMock)
    })

    it('Handles no visits', async () => {
      const mockVisits = mockPagedVisits([])
      prisonApiClient.getVisitsForBookingWithVisitors = jest.fn(async () => mockVisits)
      const result = await service.getVisits('', prisoner, {} as VisitsListQueryParams)
      expect(result.visitsWithPaginationInfo).toEqual(mockVisits)
    })
  })

  describe('Sort visitors', () => {
    const dateOfBirthForAge = (age: number) => startOfDay(subYears(new Date(), age)).toISOString()

    it('Sorts the visitors by age if no other criteria', () => {
      const mockVisitors: Visitor[] = [
        {
          attended: true,
          dateOfBirth: dateOfBirthForAge(21),
          firstName: 'Jane',
          lastName: 'Smith',
          leadVisitor: false,
          personId: 1,
          relationship: 'Sister',
        },
        {
          attended: true,
          dateOfBirth: dateOfBirthForAge(40),
          firstName: 'John',
          lastName: 'Smith',
          leadVisitor: false,
          personId: 2,
          relationship: 'Father',
        },
      ]

      const sortedVisitors = service.sortVisitors(mockVisitors)
      expect(sortedVisitors[0].personId).toEqual(2)
      expect(sortedVisitors[1].personId).toEqual(1)
    })

    it('Sorts visitors by lead visitor first if they are both over 18', () => {
      const mockVisitors: Visitor[] = [
        {
          attended: true,
          dateOfBirth: dateOfBirthForAge(40),
          firstName: 'John',
          lastName: 'Smith',
          leadVisitor: false,
          personId: 2,
          relationship: 'Father',
        },
        {
          attended: true,
          dateOfBirth: dateOfBirthForAge(21),
          firstName: 'Jane',
          lastName: 'Smith',
          leadVisitor: true,
          personId: 1,
          relationship: 'Sister',
        },
      ]

      const sortedVisitors = service.sortVisitors(mockVisitors)
      expect(sortedVisitors[0].personId).toEqual(1)
      expect(sortedVisitors[1].personId).toEqual(2)
    })

    it('Sorts visitors by name if same age', () => {
      const mockVisitors: Visitor[] = [
        {
          attended: true,
          dateOfBirth: dateOfBirthForAge(40),
          firstName: 'John',
          lastName: 'Smith',
          leadVisitor: false,
          personId: 2,
          relationship: 'Father',
        },
        {
          attended: true,
          dateOfBirth: dateOfBirthForAge(40),
          firstName: 'Jane',
          lastName: 'Smith',
          leadVisitor: false,
          personId: 1,
          relationship: 'Sister',
        },
      ]

      const sortedVisitors = service.sortVisitors(mockVisitors)
      expect(sortedVisitors[0].personId).toEqual(1)
      expect(sortedVisitors[1].personId).toEqual(2)
    })
  })
})
