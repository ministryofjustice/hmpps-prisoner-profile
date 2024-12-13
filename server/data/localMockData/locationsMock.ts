import Location from '../interfaces/prisonApi/Location'
import { SelectOption } from '../../utils/utils'
import LocationsApiLocation from '../interfaces/locationsInsidePrisonApi/LocationsApiLocation'

export const locationsApiMock: LocationsApiLocation[] = [
  { id: 'location-1', localName: 'Local name one' },
  { id: 'location-2', localName: 'Local name two' },
]
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
