import { ContactsDto } from '../interfaces/personalRelationshipsApi/personalRelationshipsApiClient'

export const personalRelationshipsOfficialMock: ContactsDto = {
  content: [
    {
      prisonerContactId: 1,
      contactId: 2,
      prisonerNumber: 'A1234AA',
      firstName: 'John',
      lastName: 'Smith',
      relationshipTypeCode: 'O',
      relationshipTypeDescription: 'Friend',
      relationshipToPrisonerCode: 'FRI',
      relationshipToPrisonerDescription: 'Friend',
      isApprovedVisitor: true,
      isEmergencyContact: false,
      isNextOfKin: false,
      isRelationshipActive: true,
      currentTerm: true,
      restrictionSummary: {
        active: [],
        totalActive: 0,
        totalExpired: 0,
      },
    },
  ],
  page: {
    size: 20,
    number: 0,
    totalPages: 1,
    totalElements: 2,
  },
}

export const personalRelationshipsSocialMock: ContactsDto = {
  content: [
    {
      prisonerContactId: 1,
      contactId: 2,
      prisonerNumber: 'A1234AA',
      firstName: 'John',
      lastName: 'Smith',
      relationshipTypeCode: 'S',
      relationshipTypeDescription: 'Friend',
      relationshipToPrisonerCode: 'FRI',
      relationshipToPrisonerDescription: 'Friend',
      isApprovedVisitor: true,
      isEmergencyContact: false,
      isNextOfKin: false,
      isRelationshipActive: true,
      currentTerm: true,
      restrictionSummary: {
        active: [],
        totalActive: 0,
        totalExpired: 0,
      },
    },
  ],
  page: {
    size: 20,
    number: 0,
    totalPages: 1,
    totalElements: 1,
  },
}
