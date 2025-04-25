import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import ProfessionalContactsService from './professionalContactsService'
import Address from '../data/interfaces/prisonApi/Address'
import { AgenciesEmail } from '../data/interfaces/prisonApi/Agency'
import Telephone from '../data/interfaces/prisonApi/Telephone'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { Contact, ContactDetail } from '../data/interfaces/prisonApi/StaffContacts'
import { PrisonerProfileDeliusApiClient } from '../data/interfaces/deliusApi/prisonerProfileDeliusApiClient'
import KeyWorkerClient from '../data/interfaces/keyWorkerApi/keyWorkerClient'
import { keyWorkerMock } from '../data/localMockData/keyWorker'
import { communityManagerMock } from '../data/localMockData/communityManagerMock'
import Pom from '../data/interfaces/allocationManagerApi/Pom'
import AllocationManagerClient from '../data/interfaces/allocationManagerApi/allocationManagerClient'
import { ContactRelationship } from '../data/enums/ContactRelationship'
import { Result } from '../utils/result/result'
import ComplexityApiClient from '../data/interfaces/complexityApi/complexityApiClient'
import { complexityOfNeedHighMock } from '../data/localMockData/complexityOfNeedMock'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { mockContactDetail, mockContactDetailYouthEstate } from '../data/localMockData/contactDetail'

function PrisonerContactBuilder(overrides?: Partial<Contact>): Contact {
  return {
    lastName: 'Smith',
    firstName: 'John',
    middleName: 'Paul',
    contactType: 'O',
    contactTypeDescription: 'Responsible Officer',
    relationship: 'PROBATION',
    relationshipDescription: 'Probation Officer',
    commentText: 'Some comment',
    emergencyContact: false,
    nextOfKin: false,
    relationshipId: 1,
    personId: 1,
    activeFlag: true,
    expiryDate: '2020-01-01',
    approvedVisitorFlag: false,
    canBeContactedFlag: true,
    awareOfChargesFlag: false,
    contactRootOffenderId: 1,
    bookingId: 1,
    createDateTime: '2020-01-01',
    ...overrides,
  }
}

const mockAddress = (overrides?: Partial<Address>): Address => ({
  noFixedAddress: false,
  premise: 'Address',
  primary: true,
  mail: false,
  ...overrides,
})

const mockEmails: AgenciesEmail[] = [
  {
    email: 'e@mail.com',
  },
]

const mockPhone: Telephone[] = [
  {
    number: '077111111',
    type: 'Phone',
  },
]

const mockPom: Pom = {
  primary_pom: {
    staff_id: 1,
    name: 'Smith, John',
  },
  secondary_pom: {
    staff_id: 2,
    name: 'Jones, Jane',
  },
}

const expectedPomResponse = [
  Result.fulfilled({
    emails: [] as string[],
    firstName: 'John',
    lastName: 'Smith',
    phones: [] as string[],
    relationshipDescription: 'Prison Offender Manager',
    relationship: 'POM',
  }).toPromiseSettledResult(),
  Result.fulfilled({
    relationshipDescription: 'Co-working Prison Offender Manager',
    emails: [],
    firstName: 'Jane',
    lastName: 'Jones',
    phones: [],
    relationship: 'POM',
  }).toPromiseSettledResult(),
]

const expectedComResponse = [
  Result.fulfilled({
    emails: ['terry@email.com', 'team@email.com'],
    firstName: 'Terry',
    lastName: 'Scott',
    teamName: 'Probation Team',
    phones: ['07700000000', '07711111111'],
    relationshipDescription: 'Community Offender Manager',
    relationship: 'COM',
    unallocated: false,
  }).toPromiseSettledResult(),
]

const expectedKeyWorkerResponse = [
  Result.fulfilled({
    emails: ['1@1.com'],
    firstName: 'Dave',
    lastName: 'Stevens',
    phones: [] as string[],
    relationshipDescription: 'Key Worker',
    relationship: 'KW',
  }).toPromiseSettledResult(),
]

describe('professionalContactsService', () => {
  let prisonApiClient: PrisonApiClient
  let allocationManagerApiClient: AllocationManagerClient
  let professionalContactsClient: PrisonerProfileDeliusApiClient
  let keyWorkerApiClient: KeyWorkerClient
  let complexityApiClient: ComplexityApiClient

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    prisonApiClient.getAddressesForPerson = jest.fn(async () => [mockAddress()])
    prisonApiClient.getPersonPhones = jest.fn(async () => mockPhone)
    prisonApiClient.getPersonEmails = jest.fn(async () => mockEmails)

    allocationManagerApiClient = {
      getPomByOffenderNo: jest.fn(async () => mockPom),
    }

    professionalContactsClient = {
      getCommunityManager: jest.fn(async () => communityManagerMock),
      getProbationDocuments: jest.fn(),
    }

    keyWorkerApiClient = {
      getOffendersKeyWorker: jest.fn(async () => keyWorkerMock),
    }

    complexityApiClient = {
      getComplexityOfNeed: jest.fn(async () => complexityOfNeedHighMock),
    }
  })

  describe('getContacts', () => {
    it('should return a list of contacts', async () => {
      const mockPrisonerContacts: ContactDetail = {
        bookingId: 1,
        nextOfKin: [],
        otherContacts: [PrisonerContactBuilder()],
      }
      prisonApiClient.getBookingContacts = jest.fn(async () => mockPrisonerContacts)

      const service = new ProfessionalContactsService(
        () => prisonApiClient,
        () => allocationManagerApiClient,
        () => professionalContactsClient,
        () => keyWorkerApiClient,
        () => complexityApiClient,
      )

      const response = (await service.getContacts('token', 'A1234AA', 1, false)).map(contact =>
        contact.toPromiseSettledResult(),
      )

      expect(response).toEqual([
        ...expectedKeyWorkerResponse,
        ...expectedPomResponse,
        ...expectedComResponse,
        Result.fulfilled({
          address: {
            label: 'Main address',
            noFixedAddress: false,
            premise: 'Address',
            primary: true,
            mail: false,
          },
          emails: ['e@mail.com'],
          firstName: 'John',
          lastName: 'Smith',
          phones: ['077111111'],
          relationshipDescription: 'Probation Officer',
          relationship: 'PROBATION',
        }).toPromiseSettledResult(),
      ])
    })

    it('should sort the contacts by relationship', async () => {
      const mockPrisonerContacts: ContactDetail = {
        bookingId: 1,
        nextOfKin: [],
        otherContacts: [
          PrisonerContactBuilder({ personId: 1, relationshipDescription: 'Responsible officer' }),
          PrisonerContactBuilder({ personId: 2, relationshipDescription: 'Prison Guard' }),
          PrisonerContactBuilder({ personId: 3, relationshipDescription: 'Prison Guard' }),
        ],
      }
      prisonApiClient.getBookingContacts = jest.fn(async () => mockPrisonerContacts)

      const service = new ProfessionalContactsService(
        () => prisonApiClient,
        () => allocationManagerApiClient,
        () => professionalContactsClient,
        () => keyWorkerApiClient,
        () => complexityApiClient,
      )

      const response = (await service.getContacts('token', 'A1234AA', 1, false)).map(contact => contact.getOrThrow())

      expect(response.length).toEqual(7)
      expect(response[0].relationshipDescription).toEqual('Key Worker')
      expect(response[1].relationshipDescription).toEqual('Prison Offender Manager')
      expect(response[2].relationshipDescription).toEqual('Co-working Prison Offender Manager')
      expect(response[3].relationshipDescription).toEqual('Community Offender Manager')
      expect(response[4].relationshipDescription).toEqual('Prison Guard')
      expect(response[5].relationshipDescription).toEqual('Prison Guard')
      expect(response[6].relationshipDescription).toEqual('Responsible officer')
    })

    it('should handle keyworker API error', async () => {
      const mockPrisonerContacts: ContactDetail = {
        bookingId: 1,
        nextOfKin: [],
        otherContacts: [PrisonerContactBuilder()],
      }
      prisonApiClient.getBookingContacts = jest.fn(async () => mockPrisonerContacts)
      keyWorkerApiClient.getOffendersKeyWorker = jest.fn(async () => Promise.reject(Error('some error!')))

      const service = new ProfessionalContactsService(
        () => prisonApiClient,
        () => allocationManagerApiClient,
        () => professionalContactsClient,
        () => keyWorkerApiClient,
        () => complexityApiClient,
      )

      const response = (await service.getContacts('token', 'A1234AA', 1, false)).map(contact =>
        contact.toPromiseSettledResult(),
      )

      expect(response).toEqual([
        Result.rejected({ relationship: 'KW', relationshipDescription: 'Key Worker' }).toPromiseSettledResult(),
        ...expectedPomResponse,
        ...expectedComResponse,
        Result.fulfilled({
          address: {
            label: 'Main address',
            noFixedAddress: false,
            premise: 'Address',
            primary: true,
            mail: false,
          },
          emails: ['e@mail.com'],
          firstName: 'John',
          lastName: 'Smith',
          phones: ['077111111'],
          relationshipDescription: 'Probation Officer',
          relationship: 'PROBATION',
        }).toPromiseSettledResult(),
      ])
    })

    it('should handle allocation manager API error', async () => {
      const mockPrisonerContacts: ContactDetail = {
        bookingId: 1,
        nextOfKin: [],
        otherContacts: [PrisonerContactBuilder()],
      }
      prisonApiClient.getBookingContacts = jest.fn(async () => mockPrisonerContacts)
      allocationManagerApiClient.getPomByOffenderNo = jest.fn(async () => Promise.reject(Error('some error!')))

      const service = new ProfessionalContactsService(
        () => prisonApiClient,
        () => allocationManagerApiClient,
        () => professionalContactsClient,
        () => keyWorkerApiClient,
        () => complexityApiClient,
      )

      const response = (await service.getContacts('token', 'A1234AA', 1, false)).map(contact =>
        contact.toPromiseSettledResult(),
      )

      expect(response).toEqual([
        ...expectedKeyWorkerResponse,
        ...[
          Result.rejected({
            relationship: 'POM',
            relationshipDescription: 'Prison Offender Manager',
          }).toPromiseSettledResult(),
          Result.rejected({
            relationship: 'POM',
            relationshipDescription: 'Co-working Prison Offender Manager',
          }).toPromiseSettledResult(),
        ],
        ...expectedComResponse,
        Result.fulfilled({
          address: {
            label: 'Main address',
            noFixedAddress: false,
            premise: 'Address',
            primary: true,
            mail: false,
          },
          emails: ['e@mail.com'],
          firstName: 'John',
          lastName: 'Smith',
          phones: ['077111111'],
          relationshipDescription: 'Probation Officer',
          relationship: 'PROBATION',
        }).toPromiseSettledResult(),
      ])
    })

    it('should handle delius API error', async () => {
      const mockPrisonerContacts: ContactDetail = {
        bookingId: 1,
        nextOfKin: [],
        otherContacts: [PrisonerContactBuilder()],
      }
      prisonApiClient.getBookingContacts = jest.fn(async () => mockPrisonerContacts)
      professionalContactsClient.getCommunityManager = jest.fn(async () => Promise.reject(Error('some error!')))

      const service = new ProfessionalContactsService(
        () => prisonApiClient,
        () => allocationManagerApiClient,
        () => professionalContactsClient,
        () => keyWorkerApiClient,
        () => complexityApiClient,
      )

      const response = (await service.getContacts('token', 'A1234AA', 1, false)).map(contact =>
        contact.toPromiseSettledResult(),
      )

      expect(response).toEqual([
        ...expectedKeyWorkerResponse,
        ...expectedPomResponse,
        Result.rejected({
          relationship: 'COM',
          relationshipDescription: 'Community Offender Manager',
        }).toPromiseSettledResult(),
        Result.fulfilled({
          address: {
            label: 'Main address',
            noFixedAddress: false,
            premise: 'Address',
            primary: true,
            mail: false,
          },
          emails: ['e@mail.com'],
          firstName: 'John',
          lastName: 'Smith',
          phones: ['077111111'],
          relationshipDescription: 'Probation Officer',
          relationship: 'PROBATION',
        }).toPromiseSettledResult(),
      ])
    })

    it('should remove contacts with address with past the enddate', async () => {
      const mockPrisonerContacts: ContactDetail = {
        bookingId: 1,
        nextOfKin: [],
        otherContacts: [PrisonerContactBuilder()],
      }
      prisonApiClient.getAddressesForPerson = jest.fn(async () => [mockAddress({ endDate: '2020-01-01' })])
      prisonApiClient.getBookingContacts = jest.fn(async () => mockPrisonerContacts)

      const service = new ProfessionalContactsService(
        () => prisonApiClient,
        () => allocationManagerApiClient,
        () => professionalContactsClient,
        () => keyWorkerApiClient,
        () => complexityApiClient,
      )

      const response = (await service.getContacts('token', 'A1234AA', 1, false)).map(contact =>
        contact.toPromiseSettledResult(),
      )

      expect(response).toEqual([...expectedKeyWorkerResponse, ...expectedPomResponse, ...expectedComResponse])
    })

    it('should return a contact for each address with valid or no endate', async () => {
      const mockPrisonerContacts: ContactDetail = {
        bookingId: 1,
        nextOfKin: [],
        otherContacts: [PrisonerContactBuilder()],
      }
      prisonApiClient.getAddressesForPerson = jest.fn(async () => [
        mockAddress({ endDate: '2050-01-01' }),
        mockAddress({ addressId: 999 }),
      ])
      prisonApiClient.getBookingContacts = jest.fn(async () => mockPrisonerContacts)

      const service = new ProfessionalContactsService(
        () => prisonApiClient,
        () => allocationManagerApiClient,
        () => professionalContactsClient,
        () => keyWorkerApiClient,
        () => complexityApiClient,
      )

      const response = (await service.getContacts('token', 'A1234AA', 1, false)).map(contact => contact.getOrThrow())

      expect(response.find(contact => contact.address?.endDate === '2050-01-01')).toBeTruthy()
      expect(response.find(contact => contact.address?.addressId === 999)).toBeTruthy()
    })

    it('should remove com and pom contacts from prison api', async () => {
      const mockPrisonerContacts: ContactDetail = {
        bookingId: 1,
        nextOfKin: [],
        otherContacts: [
          PrisonerContactBuilder({ relationship: 'COM' }),
          PrisonerContactBuilder({ relationship: 'POM' }),
        ],
      }

      prisonApiClient.getBookingContacts = jest.fn(async () => mockPrisonerContacts)

      const service = new ProfessionalContactsService(
        () => prisonApiClient,
        () => allocationManagerApiClient,
        () => professionalContactsClient,
        () => keyWorkerApiClient,
        () => complexityApiClient,
      )

      const response = (await service.getContacts('token', 'A1234AA', 1, false)).map(contact =>
        contact.toPromiseSettledResult(),
      )

      expect(response).toEqual([...expectedKeyWorkerResponse, ...expectedPomResponse, ...expectedComResponse])
    })

    it('should return a "Not entered" contact if there are no addresses for a person', async () => {
      const mockPrisonerContacts: ContactDetail = {
        bookingId: 1,
        nextOfKin: [],
        otherContacts: [PrisonerContactBuilder()],
      }
      prisonApiClient.getAddressesForPerson = jest.fn(async (): Promise<Address[]> => [])
      prisonApiClient.getBookingContacts = jest.fn(async () => mockPrisonerContacts)

      const service = new ProfessionalContactsService(
        () => prisonApiClient,
        () => allocationManagerApiClient,
        () => professionalContactsClient,
        () => keyWorkerApiClient,
        () => complexityApiClient,
      )

      const response = (await service.getContacts('token', 'A1234AA', 1, false)).map(contact => contact.getOrThrow())

      expect(response.find(contact => contact.address?.label === 'Not entered')).toBeTruthy()
    })

    it('should return YOI contacts and not POM, COM, Key Worker if the prisoner is in a youthEstatePrison', async () => {
      const mockPrisonerContacts: ContactDetail = {
        bookingId: 1,
        nextOfKin: [],
        otherContacts: [
          PrisonerContactBuilder({
            personId: 1,
            relationship: ContactRelationship.CuspOfficer,
            relationshipDescription: 'CuSP Officer',
          }),
          PrisonerContactBuilder({
            personId: 2,
            relationship: ContactRelationship.CuspOfficerBackup,
            relationshipDescription: 'CuSP Officer (backup)',
          }),
          PrisonerContactBuilder({
            personId: 3,
            relationship: ContactRelationship.YouthJusticeWorker,
            relationshipDescription: 'Youth Justice Worker',
          }),
          PrisonerContactBuilder({
            personId: 4,
            relationship: ContactRelationship.ResettlementPractitioner,
            relationshipDescription: 'Resettlement Practitioner',
          }),
          PrisonerContactBuilder({
            personId: 5,
            relationship: ContactRelationship.YouthJusticeService,
            relationshipDescription: 'Youth Justice Service',
          }),
          PrisonerContactBuilder({
            personId: 6,
            relationship: ContactRelationship.YouthJusticeServiceCaseManager,
            relationshipDescription: 'Youth Justice Service Case Manager',
          }),
        ],
      }
      prisonApiClient.getBookingContacts = jest.fn(async () => mockPrisonerContacts)

      const service = new ProfessionalContactsService(
        () => prisonApiClient,
        () => allocationManagerApiClient,
        () => professionalContactsClient,
        () => keyWorkerApiClient,
        () => complexityApiClient,
      )

      const response = (await service.getContacts('token', 'A1234AA', 1, true)).map(result => result.getOrThrow())

      expect(response.find(contact => contact.relationshipDescription === 'Key Worker')).toBeFalsy()
      expect(response.find(contact => contact.relationshipDescription === 'Prison Offender Manager')).toBeFalsy()
      expect(
        response.find(contact => contact.relationshipDescription === 'Co-working Prison Offender Manager'),
      ).toBeFalsy()
      expect(response.find(contact => contact.relationshipDescription === 'Community Offender Manager')).toBeFalsy()

      expect(response.find(contact => contact.relationshipDescription === 'CuSP Officer')).toBeTruthy()
      expect(response.find(contact => contact.relationshipDescription === 'CuSP Officer (backup)')).toBeTruthy()
      expect(response.find(contact => contact.relationshipDescription === 'Youth Justice Worker')).toBeTruthy()
      expect(response.find(contact => contact.relationshipDescription === 'Resettlement Practitioner')).toBeTruthy()
      expect(response.find(contact => contact.relationshipDescription === 'Youth Justice Service')).toBeTruthy()
      expect(
        response.find(contact => contact.relationshipDescription === 'Youth Justice Service Case Manager'),
      ).toBeTruthy()
    })
  })

  describe('getProfessionalContactsOverview', () => {
    let professionalContactsService: ProfessionalContactsService
    const mockResettlementWorkerContacts: ContactDetail = {
      bookingId: 1,
      nextOfKin: [],
      otherContacts: [
        PrisonerContactBuilder({
          personId: 1,
          firstName: 'Ivan',
          lastName: 'Smirnov',
          relationship: ContactRelationship.ResettlementWorker,
          relationshipDescription: 'Resettlement Worker',
        }),
      ],
    }

    beforeEach(() => {
      professionalContactsService = new ProfessionalContactsService(
        () => prisonApiClient,
        () => allocationManagerApiClient,
        () => professionalContactsClient,
        () => keyWorkerApiClient,
        () => complexityApiClient,
      )
    })

    it('should get the staff contact details for an adult prisoner', async () => {
      prisonApiClient.getBookingContacts = jest.fn(async () => mockResettlementWorkerContacts)

      const result = await professionalContactsService.getProfessionalContactsOverview('token', PrisonerMockDataA)

      expect(result).toEqual({
        keyWorker: {
          status: 'fulfilled',
          value: {
            name: 'Dave Stevens',
            lastSession: '',
          },
        },
        prisonOffenderManager: { status: 'fulfilled', value: 'John Smith' },
        coworkingPrisonOffenderManager: { status: 'fulfilled', value: 'Jane Jones' },
        communityOffenderManager: { status: 'fulfilled', value: 'Terry Scott' },
        resettlementWorker: 'Ivan Smirnov',
      })
    })

    it('should get the staff contact details for a youth prisoner', async () => {
      prisonApiClient.getBookingContacts = jest.fn(async () => mockContactDetailYouthEstate)
      const result = await professionalContactsService.getProfessionalContactsOverview('token', {
        ...PrisonerMockDataA,
        prisonId: 'WYI',
      })

      expect(result).toEqual({
        cuspOfficer: 'Mike Tester',
        cuspOfficerBackup: 'Katie Testing',
        youthJusticeWorker: 'Emma Justice',
        resettlementPractitioner: 'Shauna Michaels',
        youthJusticeService: 'Outer York',
        youthJusticeServiceCaseManager: 'Barney Rubble',
      })
    })

    it('should get the staff contact details for a prisoner with complex needs', async () => {
      prisonApiClient.getBookingContacts = jest.fn(async () => mockContactDetail)
      complexityApiClient.getComplexityOfNeed = jest.fn().mockResolvedValue(complexityOfNeedHighMock)
      const result = await professionalContactsService.getProfessionalContactsOverview('token', {
        ...PrisonerMockDataA,
        prisonId: 'AGI',
      })

      expect(result).toEqual({
        keyWorker: {
          status: 'fulfilled',
          value: {
            name: 'None - high complexity of need',
            lastSession: '',
          },
        },
        prisonOffenderManager: { status: 'fulfilled', value: 'John Smith' },
        coworkingPrisonOffenderManager: { status: 'fulfilled', value: 'Jane Jones' },
        communityOffenderManager: { status: 'fulfilled', value: 'Terry Scott' },
      })
    })

    it('should handle error getting keyworkers name', async () => {
      prisonApiClient.getBookingContacts = jest.fn(async () => mockContactDetail)
      keyWorkerApiClient.getOffendersKeyWorker = jest.fn().mockRejectedValue('Some error')
      const result = await professionalContactsService.getProfessionalContactsOverview('token', PrisonerMockDataA)

      expect(result).toEqual({
        keyWorker: { status: 'rejected', reason: 'Some error' },
        prisonOffenderManager: { status: 'fulfilled', value: 'John Smith' },
        coworkingPrisonOffenderManager: { status: 'fulfilled', value: 'Jane Jones' },
        communityOffenderManager: { status: 'fulfilled', value: 'Terry Scott' },
      })
    })

    it('should handle error getting pom names', async () => {
      prisonApiClient.getBookingContacts = jest.fn(async () => mockContactDetail)
      allocationManagerApiClient.getPomByOffenderNo = jest.fn().mockRejectedValue('API error')
      const result = await professionalContactsService.getProfessionalContactsOverview('token', PrisonerMockDataA)

      expect(result).toEqual({
        keyWorker: {
          status: 'fulfilled',
          value: {
            name: 'Dave Stevens',
            lastSession: '',
          },
        },
        prisonOffenderManager: { status: 'rejected', reason: 'API error' },
        coworkingPrisonOffenderManager: { status: 'rejected', reason: 'API error' },
        communityOffenderManager: { status: 'fulfilled', value: 'Terry Scott' },
      })
    })

    it('should handle error getting com name', async () => {
      prisonApiClient.getBookingContacts = jest.fn(async () => mockContactDetail)
      professionalContactsClient.getCommunityManager = jest.fn().mockRejectedValue('API error')
      const result = await professionalContactsService.getProfessionalContactsOverview('token', PrisonerMockDataA)

      expect(result).toEqual({
        keyWorker: {
          status: 'fulfilled',
          value: {
            name: 'Dave Stevens',
            lastSession: '',
          },
        },
        prisonOffenderManager: { status: 'fulfilled', value: 'John Smith' },
        coworkingPrisonOffenderManager: { status: 'fulfilled', value: 'Jane Jones' },
        communityOffenderManager: { status: 'rejected', reason: 'API error' },
      })
    })
  })
})
