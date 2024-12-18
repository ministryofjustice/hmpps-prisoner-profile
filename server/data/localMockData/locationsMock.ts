import Location from '../interfaces/prisonApi/Location'
import { SelectOption } from '../../utils/utils'
import LocationsApiLocation from '../interfaces/locationsInsidePrisonApi/LocationsApiLocation'

export const locationsApiMock: LocationsApiLocation[] = [
  { id: 'location-1', localName: 'Local name one', key: 'ABC' },
  { id: 'location-2', localName: 'Local name two', key: 'ABC' },
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

export const locationsApiSelectOptionsMock: SelectOption[] = [
  {
    text: 'Local name one',
    value: 'location-1',
  },
  {
    text: 'Local name two',
    value: 'location-2',
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
