import { Pom } from '../interfaces/pom'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import AllocationManagerClient from '../data/interfaces/allocationManagerClient'
import ProfessionalContactsService from './professionalContactsService'
import { Address } from '../interfaces/prisonApi/address'
import { AgenciesEmail } from '../interfaces/prisonApi/agencies'
import { Telephone } from '../interfaces/prisonApi/telephone'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { Contact, ContactDetail } from '../interfaces/staffContacts'
import { CommunityManager } from '../interfaces/prisonerProfileDeliusApi/communityManager'
import { PrisonerProfileDeliusApiClient } from '../data/interfaces/prisonerProfileDeliusApiClient'

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

const mockCommunityManager: CommunityManager = {
  code: 'a',
  name: {
    forename: 'Community',
    surname: 'Manager',
    email: 'com@email.com',
  },
  team: {
    code: 'team',
    description: 'team desc',
    email: 'teamEmail@email.com',
  },
  unallocated: false,
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
const expectedPomResponse = {
  relationship: 'Prison Offender Manager',
  contacts: [
    {
      jobTitle: 'Co-worker',
      name: 'Jane Jones',
    },
    {
      jobTitle: false,
      name: 'John Smith',
    },
  ],
}

const expectedComResponse = {
  contacts: [
    {
      code: 'team',
      emails: ['com@email.com', 'teamEmail@email.com'],
      firstName: 'Community',
      lastName: 'Manager',
      name: {
        forename: 'Community',
        surname: 'Manager',
      },
      relationshipDescription: 'Community Offender Manager',
      team: {
        code: 'team',
        description: 'team desc',
      },
      unallocated: false,
    },
  ],
  relationship: 'Community Offender Manager',
}
describe('professionalContactsService', () => {
  let prisonApiClient: PrisonApiClient
  let allocationManagerApiClient: AllocationManagerClient
  let professionalContactsClient: PrisonerProfileDeliusApiClient

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    prisonApiClient.getAddressesForPerson = jest.fn(async () => [mockAddress()])
    prisonApiClient.getPersonPhones = jest.fn(async () => mockPhone)
    prisonApiClient.getPersonEmails = jest.fn(async () => mockEmails)

    allocationManagerApiClient = {
      getPomByOffenderNo: jest.fn(async () => mockPom),
    }

    professionalContactsClient = {
      getCommunityManager: jest.fn(async () => mockCommunityManager),
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
      )

      const response = await service.getContacts('token', 'A1234AA', 1)

      expect(response).toEqual([
        expectedPomResponse,
        expectedComResponse,
        {
          relationship: 'Probation Officer',
          contacts: [
            {
              activeFlag: true,
              address: {
                label: 'Main address',
                noFixedAddress: false,
                premise: 'Address',
                primary: true,
              },
              approvedVisitorFlag: false,
              awareOfChargesFlag: false,
              bookingId: 1,
              canBeContactedFlag: true,
              commentText: 'Some comment',
              contactRootOffenderId: 1,
              contactType: 'O',
              contactTypeDescription: 'Responsible Officer',
              createDateTime: '2020-01-01',
              emails: ['e@mail.com'],
              emergencyContact: false,
              expiryDate: '2020-01-01',
              firstName: 'John',
              lastName: 'Smith',
              middleName: 'Paul',
              nextOfKin: false,
              personId: 1,
              phones: ['077111111'],
              relationship: 'PROBATION',
              relationshipDescription: 'Probation Officer',
              relationshipId: 1,
            },
          ],
        },
      ])
    })

    it('should group the contacts by relationship', async () => {
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
      )

      const response = await service.getContacts('token', 'A1234AA', 1)

      expect(response.length).toEqual(4)
      expect(response[0].relationship).toEqual('Prison Offender Manager')
      expect(response[0].contacts.length).toEqual(2)
      expect(response[1].relationship).toEqual('Community Offender Manager')
      expect(response[1].contacts.length).toEqual(1)
      expect(response[2].relationship).toEqual('Prison Guard')
      expect(response[2].contacts.length).toEqual(2)
      expect(response[3].relationship).toEqual('Responsible officer')
      expect(response[3].contacts.length).toEqual(1)
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
      )

      const response = await service.getContacts('token', 'A1234AA', 1)

      expect(response).toEqual([expectedPomResponse, expectedComResponse])
    })

    it('should return a contact for each address with valid or no endate', async () => {
      const mockPrisonerContacts: ContactDetail = {
        bookingId: 1,
        nextOfKin: [],
        otherContacts: [PrisonerContactBuilder()],
      }
      prisonApiClient.getAddressesForPerson = jest.fn(async () => [
        mockAddress({ endDate: '2050-01-01' }),
        mockAddress(),
      ])
      prisonApiClient.getBookingContacts = jest.fn(async () => mockPrisonerContacts)

      const service = new ProfessionalContactsService(
        () => prisonApiClient,
        () => allocationManagerApiClient,
        () => professionalContactsClient,
      )

      const response = await service.getContacts('token', 'A1234AA', 1)

      expect(response[2].contacts[0]).toMatchObject({
        address: mockAddress({ endDate: '2050-01-01' }),
      })
      expect(response[2].contacts[1]).toMatchObject({ address: mockAddress() })
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
      )

      const response = await service.getContacts('token', 'A1234AA', 1)

      expect(response).toEqual([expectedPomResponse, expectedComResponse])
    })
  })
})
