import CourtLocation from '../interfaces/whereaboutsApi/CourtLocation'
import { SelectOption } from '../../utils/utils'

export const courtLocationsMock: CourtLocation[] = [
  {
    id: 'ABC',
    name: 'Leeds Court',
  },
  {
    id: 'DEF',
    name: 'Barnsley Court',
  },
]

export const courtLocationsSelectOptionsMock: SelectOption[] = [
  {
    value: 'ABC',
    text: 'Leeds Court',
  },
  {
    value: 'DEF',
    text: 'Barnsley Court',
  },
]
