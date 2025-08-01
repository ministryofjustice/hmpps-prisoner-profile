import OffenderIdentifier from '../interfaces/prisonApi/OffenderIdentifier'

export const identifiersMock: OffenderIdentifier[] = [
  {
    type: 'CRO',
    value: '400862/08W',
    offenderId: 1,
    offenderIdSeq: 1,
    offenderNo: 'G6123VU',
    issuedAuthorityText: 'P/CONS',
    caseloadType: 'INST',
    whenCreated: '2012-02-13T13:48:31.650303',
  },
  {
    type: 'PNC',
    value: '08/359381C',
    offenderId: 1,
    offenderIdSeq: 2,
    offenderNo: 'G6123VU',
    issuedAuthorityText: 'P/CONS',
    caseloadType: 'INST',
    whenCreated: '2012-02-13T13:48:31.664201',
  },
  {
    type: 'PNC',
    value: '8/359381C',
    offenderId: 1,
    offenderIdSeq: 3,
    offenderNo: 'G6123VU',
    issuedAuthorityText: 'P/CONS - fixed',
    caseloadType: 'INST',
    whenCreated: '2012-02-13T13:48:31.664201',
  },
  {
    type: 'MERGED',
    value: 'A0596CL',
    offenderId: 1,
    offenderIdSeq: 4,
    offenderNo: 'G6123VU',
    caseloadType: 'INST',
    whenCreated: '2012-02-13T13:48:43.632903',
  },
  {
    type: 'MERGE_HMPS',
    value: 'JK7713',
    offenderId: 1,
    offenderIdSeq: 5,
    offenderNo: 'G6123VU',
    caseloadType: 'INST',
    whenCreated: '2012-02-13T13:48:43.636262',
  },
  {
    type: 'DL',
    value: 'ABCD/123456/AB9DE',
    offenderId: 1,
    offenderIdSeq: 6,
    offenderNo: 'G6123VU',
    issuedDate: '2016-09-08',
    caseloadType: 'INST',
    whenCreated: '2016-09-08T09:15:32.160802',
  },
  {
    type: 'NINO',
    value: 'QQ123456C',
    offenderId: 1,
    offenderIdSeq: 7,
    offenderNo: 'G6123VU',
    issuedDate: '2014-06-25',
    caseloadType: 'INST',
    whenCreated: '2014-06-25T10:36:35.515111',
  },
  {
    type: 'HOREF',
    value: 'A1234567',
    offenderId: 1,
    offenderIdSeq: 8,
    offenderNo: 'G6123VU',
    issuedDate: '2016-11-17',
    caseloadType: 'INST',
    whenCreated: '2016-11-17T14:21:20.88026',
  },
]
