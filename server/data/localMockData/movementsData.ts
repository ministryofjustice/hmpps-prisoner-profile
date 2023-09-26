import { startOfToday, format } from 'date-fns'
import { Movement } from '../../interfaces/prisonApi/movement'

export default function movementsMock(prisonerNumber: string, movementDate?: string): Movement[] {
  return [
    {
      offenderNo: prisonerNumber,
      createDateTime: '2023-05-24T16:06:43.980783',
      fromAgency: 'MDI',
      fromAgencyDescription: 'Moorland (HMP & YOI)',
      toAgency: 'HLI',
      toAgencyDescription: 'Hull (HMP)',
      fromCity: '',
      toCity: '',
      movementType: 'TRN',
      movementTypeDescription: 'Transfers',
      directionCode: 'OUT',
      movementDate: movementDate || format(startOfToday(), 'yyyy-MM-dd'),
      movementTime: '16:05:31',
      movementReason: 'Normal Transfer',
    },
  ]
}
