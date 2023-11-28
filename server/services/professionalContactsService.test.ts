import { Pom } from '../interfaces/pom'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import AllocationManagerClient from '../data/interfaces/allocationManagerClient'
import ProfessionalContactsService from './professionalContactsService'
import { Address } from '../interfaces/prisonApi/address'
import { AgenciesEmail } from '../interfaces/prisonApi/agencies'
import { Telephone } from '../interfaces/prisonApi/telephone'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { Contact, ContactDetail } from '../interfaces/staffContacts'
import { PrisonerProfileDeliusApiClient } from '../data/interfaces/prisonerProfileDeliusApiClient'
import KeyWorkerClient from '../data/interfaces/keyWorkerClient'
import { keyWorkerMock } from '../data/localMockData/keyWorker'
import { communityManagerMock } from '../data/localMockData/communityManagerMock'

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
  {
    emails: [] as string[],
    firstName: 'John',
    lastName: 'Smith',
    phones: [] as string[],
    relationshipDescription: 'Prison Offender Manager',
    relationship: 'POM',
  },
  {
    relationshipDescription: 'Co-working Prison Offender Manager',
    emails: [],
    firstName: 'Jane',
    lastName: 'Jones',
    phones: [],
    relationship: 'POM',
  },
]

const expectedComResponse = [
  {
    emails: ['terry@email.com', 'team@email.com'],
    firstName: 'Terry',
    lastName: 'Scott',
    phones: ['07700000000', '07711111111'],
    relationshipDescription: 'Community Offender Manager',
    relationship: 'COM',
  },
]

const expectedKeyWorkerResponse = [
  {
    emails: ['1@1.com'],
    firstName: 'Dave',
    lastName: 'Stevens',
    phones: [] as string[],
    relationshipDescription: 'Key Worker',
    relationship: 'KW',
  },
]
describe('professionalContactsService', () => {
  let prisonApiClient: PrisonApiClient
  let allocationManagerApiClient: AllocationManagerClient
  let professionalContactsClient: PrisonerProfileDeliusApiClient
  let keyWorkerApiClient: KeyWorkerClient

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
    }

    keyWorkerApiClient = {
      getOffendersKeyWorker: jest.fn(async () => keyWorkerMock),
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
      )

      const response = await service.getContacts('token', 'A1234AA', 1)

      expect(response).toEqual([
        ...expectedPomResponse,
        ...expectedComResponse,
        ...expectedKeyWorkerResponse,
        {
          address: {
            label: 'Main address',
            noFixedAddress: false,
            premise: 'Address',
            primary: true,
          },
          emails: ['e@mail.com'],
          firstName: 'John',
          lastName: 'Smith',
          phones: ['077111111'],
          relationshipDescription: 'Probation Officer',
          relationship: 'PROBATION',
        },
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
      )

      const response = await service.getContacts('token', 'A1234AA', 1)

      expect(response.length).toEqual(7)
      expect(response[0].relationshipDescription).toEqual('Prison Offender Manager')
      expect(response[1].relationshipDescription).toEqual('Co-working Prison Offender Manager')
      expect(response[2].relationshipDescription).toEqual('Community Offender Manager')
      expect(response[3].relationshipDescription).toEqual('Key Worker')
      expect(response[4].relationshipDescription).toEqual('Prison Guard')
      expect(response[5].relationshipDescription).toEqual('Prison Guard')
      expect(response[6].relationshipDescription).toEqual('Responsible officer')
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
      )

      const response = await service.getContacts('token', 'A1234AA', 1)

      expect(response).toEqual([...expectedPomResponse, ...expectedComResponse, ...expectedKeyWorkerResponse])
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
      )

      const response = await service.getContacts('token', 'A1234AA', 1)

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
      )

      const response = await service.getContacts('token', 'A1234AA', 1)

      expect(response).toEqual([...expectedPomResponse, ...expectedComResponse, ...expectedKeyWorkerResponse])
    })
  })
})
