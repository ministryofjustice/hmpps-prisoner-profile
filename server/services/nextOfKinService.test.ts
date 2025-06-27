import NextOfKinService from './nextOfKinService'
import { RestClientBuilder } from '../data'
import MetricsService from './metrics/metricsService'
import ReferenceDataService from './referenceData/referenceDataService'
import {
  PersonalRelationshipsApiClient,
  PersonalRelationshipsContact,
  PersonalRelationshipsContactRequest,
  PersonalRelationshipsReferenceDataDomain,
} from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import { PrisonUser } from '../interfaces/HmppsUser'
import { prisonUserMock } from '../data/localMockData/user'

jest.mock('./metrics/metricsService')
jest.mock('./referenceData/referenceDataService')

describe('NextOfKinService', () => {
  let nextOfKinService: NextOfKinService
  let personalRelationshipsApiClient: jest.Mocked<PersonalRelationshipsApiClient>
  let personalRelationshipsApiClientBuilder: jest.MockedFunction<RestClientBuilder<PersonalRelationshipsApiClient>>
  let referenceDataService: jest.Mocked<ReferenceDataService>
  let metricsService: jest.Mocked<MetricsService>

  beforeEach(() => {
    personalRelationshipsApiClient = {
      getContacts: jest.fn(),
      createContact: jest.fn(),
    } as unknown as jest.Mocked<PersonalRelationshipsApiClient>

    personalRelationshipsApiClientBuilder = jest.fn().mockReturnValue(personalRelationshipsApiClient)

    referenceDataService = new ReferenceDataService(null, null) as jest.Mocked<ReferenceDataService>
    jest.spyOn(referenceDataService, 'getActiveReferenceDataCodes').mockResolvedValue([])

    metricsService = new MetricsService(null) as jest.Mocked<MetricsService>
    jest.spyOn(metricsService, 'trackPersonalRelationshipsUpdate').mockImplementation()

    nextOfKinService = new NextOfKinService(personalRelationshipsApiClientBuilder, referenceDataService, metricsService)
  })

  describe('getNextOfKinEmergencyContacts', () => {
    it('should fetch and sort contacts correctly', async () => {
      const clientToken = 'CLIENT_TOKEN'
      const prisonerNumber = 'A1234BC'
      const mockContacts: PersonalRelationshipsContact[] = [
        {
          isNextOfKin: true,
          isEmergencyContact: false,
          firstName: 'Charlie',
          lastName: 'Brown',
          relationshipToPrisonerCode: 'REL1',
          relationshipToPrisonerDescription: 'Sibling',
          prisonerContactId: 0,
          contactId: 0,
          prisonerNumber: '',
          relationshipTypeCode: '',
          relationshipTypeDescription: '',
          isApprovedVisitor: false,
          isRelationshipActive: false,
          currentTerm: false,
          restrictionSummary: undefined,
        },
        {
          isNextOfKin: false,
          isEmergencyContact: true,
          firstName: 'Alice',
          lastName: 'Smith',
          relationshipToPrisonerCode: 'REL2',
          relationshipToPrisonerDescription: 'Friend',
          prisonerContactId: 0,
          contactId: 0,
          prisonerNumber: '',
          relationshipTypeCode: '',
          relationshipTypeDescription: '',
          isApprovedVisitor: false,
          isRelationshipActive: false,
          currentTerm: false,
          restrictionSummary: undefined,
        },
        {
          isNextOfKin: true,
          isEmergencyContact: true,
          firstName: 'Bob',
          lastName: 'Jones',
          relationshipToPrisonerCode: 'REL3',
          relationshipToPrisonerDescription: 'Parent',
          prisonerContactId: 0,
          contactId: 0,
          prisonerNumber: '',
          relationshipTypeCode: '',
          relationshipTypeDescription: '',
          isApprovedVisitor: false,
          isRelationshipActive: false,
          currentTerm: false,
          restrictionSummary: undefined,
        },
      ]

      personalRelationshipsApiClient.getContacts.mockResolvedValue({ content: mockContacts })

      const result = await nextOfKinService.getNextOfKinEmergencyContacts(clientToken, prisonerNumber)

      expect(personalRelationshipsApiClientBuilder).toHaveBeenCalledWith(clientToken)
      expect(personalRelationshipsApiClient.getContacts).toHaveBeenCalledWith(prisonerNumber, {
        emergencyContactOrNextOfKin: true,
        isRelationshipActive: true,
        size: 50,
      })

      expect(result).toEqual([
        expect.objectContaining({ firstName: 'Charlie', isNextOfKin: true, isEmergencyContact: false }),
        expect.objectContaining({ firstName: 'Bob', isNextOfKin: true, isEmergencyContact: true }),
        expect.objectContaining({ firstName: 'Alice', isNextOfKin: false, isEmergencyContact: true }),
      ])
    })
  })

  describe('getReferenceData', () => {
    it('should fetch reference data for all domains and return in mapped format', async () => {
      const clientToken = 'CLIENT_TOKEN'
      const domains = [
        'DOMAIN1' as PersonalRelationshipsReferenceDataDomain,
        'DOMAIN2' as PersonalRelationshipsReferenceDataDomain,
      ]
      const mockReferenceData = [
        [{ code: 'CODE1', description: 'Description 1', id: '', listSequence: 0, isActive: true }],
        [{ code: 'CODE2', description: 'Description 2', id: '', listSequence: 0, isActive: true }],
      ]

      jest
        .spyOn(referenceDataService, 'getActiveReferenceDataCodes')
        .mockResolvedValueOnce(mockReferenceData[0])
        .mockResolvedValueOnce(mockReferenceData[1])

      const result = await nextOfKinService.getReferenceData(clientToken, domains)

      expect(referenceDataService.getActiveReferenceDataCodes).toHaveBeenCalledTimes(domains.length)
      expect(referenceDataService.getActiveReferenceDataCodes).toHaveBeenCalledWith('DOMAIN1', clientToken)
      expect(referenceDataService.getActiveReferenceDataCodes).toHaveBeenCalledWith('DOMAIN2', clientToken)

      expect(result).toEqual({
        DOMAIN1: mockReferenceData[0],
        DOMAIN2: mockReferenceData[1],
      })
    })
  })

  describe('createContact', () => {
    it('should create a contact and send correct metrics', async () => {
      const clientToken = 'CLIENT_TOKEN'
      const user: PrisonUser = prisonUserMock
      const contactRequest: PersonalRelationshipsContactRequest = {
        firstName: 'John',
        lastName: 'Doe',
        isStaff: false,
        relationship: {
          prisonerNumber: 'A1234BC',
          relationshipTypeCode: 'REL1',
          relationshipToPrisonerCode: 'BRO',
          isNextOfKin: true,
          isEmergencyContact: false,
          isApprovedVisitor: false,
        },
        createdBy: 'testUser',
      }

      personalRelationshipsApiClient.createContact.mockResolvedValue(null)

      await nextOfKinService.createContact(clientToken, user, contactRequest)

      expect(personalRelationshipsApiClientBuilder).toHaveBeenCalledWith(clientToken)
      expect(personalRelationshipsApiClient.createContact).toHaveBeenCalledWith(contactRequest)
      expect(metricsService.trackPersonalRelationshipsUpdate).toHaveBeenCalledWith({
        fieldsUpdated: ['nextOfKin'],
        prisonerNumber: 'A1234BC',
        user,
      })
    })
  })

  describe('nextOfKinSorter', () => {
    it('should correctly sort contacts by priority and name', () => {
      const contacts: PersonalRelationshipsContact[] = [
        {
          isNextOfKin: true,
          isEmergencyContact: true,
          firstName: 'Charlie',
          lastName: '',
          relationshipToPrisonerCode: '',
          relationshipToPrisonerDescription: '',
          prisonerContactId: 0,
          contactId: 0,
          prisonerNumber: '',
          relationshipTypeCode: '',
          relationshipTypeDescription: '',
          isApprovedVisitor: false,
          isRelationshipActive: false,
          currentTerm: false,
          restrictionSummary: undefined,
        },
        {
          isNextOfKin: true,
          isEmergencyContact: false,
          firstName: 'Bob',
          lastName: '',
          relationshipToPrisonerCode: '',
          relationshipToPrisonerDescription: '',
          prisonerContactId: 0,
          contactId: 0,
          prisonerNumber: '',
          relationshipTypeCode: '',
          relationshipTypeDescription: '',
          isApprovedVisitor: false,
          isRelationshipActive: false,
          currentTerm: false,
          restrictionSummary: undefined,
        },
        {
          isNextOfKin: false,
          isEmergencyContact: true,
          firstName: 'Alice',
          lastName: '',
          relationshipToPrisonerCode: '',
          relationshipToPrisonerDescription: '',
          prisonerContactId: 0,
          contactId: 0,
          prisonerNumber: '',
          relationshipTypeCode: '',
          relationshipTypeDescription: '',
          isApprovedVisitor: false,
          isRelationshipActive: false,
          currentTerm: false,
          restrictionSummary: undefined,
        },
      ]

      const result = [...contacts].sort(nextOfKinService['nextOfKinSorter'])

      expect(result.map(c => c.firstName)).toEqual(['Bob', 'Charlie', 'Alice'])
    })
  })
})
