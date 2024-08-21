import Location from '../interfaces/prisonApi/Location'
import VideoLocation from '../interfaces/bookAVideoLinkApi/Location'
import { SelectOption } from '../../utils/utils'

export const locationsMock: Location[] = [
  {
    locationId: 27000,
    locationType: 'STOR',
    description: 'WORK_IND-CES',
    agencyId: 'MDI',
    parentLocationId: 26998,
    currentOccupancy: 0,
    locationPrefix: 'MDI-WORK_IND-CES',
    userDescription: 'CES',
  },
  {
    locationId: 26152,
    locationType: 'LOCA',
    description: 'PROG_ACT-CHAP',
    agencyId: 'MDI',
    parentLocationId: 26148,
    currentOccupancy: 0,
    locationPrefix: 'MDI-PROG_ACT-CHAP',
    userDescription: 'Chapel',
  },
]

export const locationsMockBavl: VideoLocation[] = [
  {
    key: 'VIDEO_LINK_ROOM',
    description: 'VIDEO_LINK_ROOM',
    enabled: true,
  },
]

export const locationsSelectOptionsMock: SelectOption[] = [
  {
    value: 27000,
    text: 'CES',
  },
  {
    value: 26152,
    text: 'Chapel',
  },
]
