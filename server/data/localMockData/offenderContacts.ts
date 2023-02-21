import { OffenderContact } from '../../interfaces/staffContacts'

export const offenderContact: OffenderContact = {
  bookingId: 0,
  nextOfKin: [
    {
      lastName: 'SMITH',
      firstName: 'JOHN',
      middleName: 'MARK',
      contactType: 'O',
      contactTypeDescription: 'Official',
      relationship: 'RO',
      relationshipDescription: 'Responsible Officer',
      commentText: 'Some additional information',
      emergencyContact: true,
      nextOfKin: false,
      relationshipId: 10466277,
      personId: 5871791,
      activeFlag: true,
      expiryDate: '2019-01-31',
      approvedVisitorFlag: true,
      canBeContactedFlag: false,
      awareOfChargesFlag: true,
      contactRootOffenderId: 5871791,
      bookingId: 2468081,
      createDateTime: '2021-07-05T10:35:17',
    },
  ],
  otherContacts: [
    {
      lastName: 'SMITH',
      firstName: 'JOHN',
      middleName: 'MARK',
      contactType: 'O',
      contactTypeDescription: 'Official',
      relationship: 'RO',
      relationshipDescription: 'Responsible Officer',
      commentText: 'Some additional information',
      emergencyContact: true,
      nextOfKin: false,
      relationshipId: 10466277,
      personId: 5871791,
      activeFlag: true,
      expiryDate: '2019-01-31',
      approvedVisitorFlag: true,
      canBeContactedFlag: false,
      awareOfChargesFlag: true,
      contactRootOffenderId: 5871791,
      bookingId: 2468081,
      createDateTime: '2021-07-05T10:35:17',
    },
  ],
}

export default {
  offenderContact,
}
