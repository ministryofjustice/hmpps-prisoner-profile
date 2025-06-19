import OffenderIdentifier from '../interfaces/prisonApi/OffenderIdentifier'
import { OffenderIdentifierType } from '../interfaces/prisonApi/OffenderIdentifierType'

export const GetIdentifiersMock: OffenderIdentifier[] = [
  {
    type: OffenderIdentifierType.PncNumber,
    value: '2017/0239598Q',
    offenderId: 1,
    offenderIdSeq: 1,
    offenderNo: 'AA1234A',
    bookingId: 1,
    issuedAuthorityText: 'Some comment',
  },
  {
    type: OffenderIdentifierType.PrisonLegacySystemNumber,
    value: '1234',
    offenderId: 1,
    offenderIdSeq: 2,
    offenderNo: 'AA1234A',
    bookingId: 1,
  },
  {
    type: OffenderIdentifierType.ParkrunNumber,
    value: '56',
    offenderId: 1,
    offenderIdSeq: 3,
    offenderNo: 'AA1234A',
    bookingId: 1,
  },
  {
    type: OffenderIdentifierType.HomeOfficeReferenceNumber,
    value: '7890',
    offenderId: 1,
    offenderIdSeq: 4,
    offenderNo: 'AA1234A',
    bookingId: 1,
  },
]

export const GetIdentifierMock: OffenderIdentifier = {
  type: OffenderIdentifierType.PncNumber,
  value: '2017/0239598Q',
  offenderId: 1,
  offenderIdSeq: 1,
  offenderNo: 'AA1234A',
  bookingId: 1,
  issuedAuthorityText: 'Some comment',
}
