import CourtLocation from '../interfaces/whereaboutsApi/CourtLocation'
import { SelectOption } from '../../utils/utils'
import Court from '../interfaces/bookAVideoLinkApi/Court'

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

export const courtLocationsMockBavl: Court[] = [
  {
    courtId: 1,
    code: 'ABC',
    description: 'Leeds Court',
    enabled: true,
  },
  {
    courtId: 2,
    code: 'DEF',
    description: 'Barnsley Court',
    enabled: true,
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
