import { SelectOption } from '../../utils/utils'
import Court, { ProbationTeam } from '../interfaces/bookAVideoLinkApi/Court'

export const courtLocationsMock: Court[] = [
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
  {
    courtId: 3,
    code: 'SHF',
    description: 'Sheffield Court',
    enabled: false,
  },
]

export const probationTeamsMock: ProbationTeam[] = [
  {
    probationTeamId: 1,
    code: 'ABC',
    description: 'Blackpool',
    enabled: true,
  },
  {
    probationTeamId: 2,
    code: 'DEF',
    description: 'Barnsley',
    enabled: true,
  },
  {
    probationTeamId: 3,
    code: 'SHF',
    description: 'Sheffield',
    enabled: false,
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
  {
    value: 'SHF',
    text: 'Sheffield Court',
  },
]
