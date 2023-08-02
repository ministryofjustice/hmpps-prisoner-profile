import { NonAssociation, NonAssociationDetail, NonAssociationDetails } from '../../interfaces/nonAssociationDetails'

const nonAssociationA: NonAssociation = {
  offenderNo: 'ABC123',
  firstName: 'John',
  lastName: 'Doe',
  reasonCode: 'VIC',
  reasonDescription: 'Victim',
  agencyId: 'MDI',
  agencyDescription: 'Moorland (HMP & YOI)',
  assignedLivingUnitDescription: 'NMI-RECP',
}

const nonAssociationDetailA: NonAssociationDetail = {
  reasonCode: 'VIC',
  reasonDescription: 'Victim',
  typeCode: 'LAND',
  typeDescription: 'Do Not Locate on Same Landing',
  effectiveDate: '1980-01-01T00:00:00',
  offenderNonAssociation: nonAssociationA,
  expiryDate: '2020-07-17T00:00:00',
  comments: 'Gang violence',
  authorisedBy: 'Someone',
}

const nonAssociationB: NonAssociation = {
  offenderNo: 'DEF321',
  firstName: 'Guy',
  lastName: 'Incognito',
  reasonCode: 'RIV',
  reasonDescription: 'Rival Gang',
  agencyId: 'MDI',
  agencyDescription: 'Moorland (HMP & YOI)',
  assignedLivingUnitDescription: 'NMI-RECP',
}

const nonAssociationDetailB: NonAssociationDetail = {
  reasonCode: 'VIC',
  reasonDescription: 'Victim',
  typeCode: 'LAND',
  typeDescription: 'Do Not Locate on Same Landing',
  effectiveDate: '2020-07-01T00:00:00',
  expiryDate: '2020-07-17T00:00:00',
  comments: 'hjkhjkhjkhkhkj hjkhjkhjkhjkhjk',
  authorisedBy: 'Jane Doe',
  offenderNonAssociation: nonAssociationB,
}

const nonAssociationDetailsDummyData: NonAssociationDetails = {
  offenderNo: 'G6123VU',
  firstName: 'John',
  lastName: 'Saunders',
  agencyId: 'MDI',
  agencyDescription: 'Moorland (HMP & YOI)',
  assignedLivingUnitDescription: 'MDI-5-1-A-012',
  nonAssociations: [nonAssociationDetailA, nonAssociationDetailB],
}

export default nonAssociationDetailsDummyData
