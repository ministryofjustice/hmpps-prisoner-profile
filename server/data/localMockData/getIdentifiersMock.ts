import OffenderIdentifier, { OffenderIdentifierType } from '../interfaces/prisonApi/OffenderIdentifier'

export const GetIdentifiersMock: OffenderIdentifier[] = [
  {
    type: OffenderIdentifierType.PncNumber,
    value: '2017/0239598Q',
    offenderNo: 'AA1234A',
    bookingId: 1,
    issuedAuthorityText: 'Some comment',
  },
  {
    type: OffenderIdentifierType.PrisonLegacySystemNumber,
    value: '1234',
    offenderNo: 'AA1234A',
    bookingId: 1,
  },
  {
    type: OffenderIdentifierType.ParkrunNumber,
    value: '56',
    offenderNo: 'AA1234A',
    bookingId: 1,
  },
  {
    type: OffenderIdentifierType.HomeOfficeReferenceNumber,
    value: '7890',
    offenderNo: 'AA1234A',
    bookingId: 1,
  },
]

export default {
  GetIdentifiersMock,
}
