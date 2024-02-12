import { DamageObligation, DamageObligationContainer } from '../../interfaces/prisonApi/damageObligation'

export const damageObligationsMock: DamageObligation[] = [
  {
    id: 1,
    offenderNo: 'G6123VU',
    referenceNumber: '1234567',
    startDateTime: '2023-09-09 10:10:10',
    endDateTime: '2025-09-09 10:10:10',
    prisonId: 'MDI',
    amountToPay: 50,
    amountPaid: 25,
    status: 'ACTIVE',
    comment: 'Comment',
    currency: 'GBP',
  },
  {
    id: 2,
    offenderNo: 'G6123VU',
    referenceNumber: '98765456',
    startDateTime: '2023-09-10 10:10:10',
    endDateTime: '2025-09-10 10:10:10',
    prisonId: 'MDI',
    amountToPay: 10,
    amountPaid: 0,
    status: 'ACTIVE',
    comment: 'Comment',
    currency: 'GBP',
  },
]

export const damageObligationContainerMock: DamageObligationContainer = {
  damageObligations: damageObligationsMock,
}
