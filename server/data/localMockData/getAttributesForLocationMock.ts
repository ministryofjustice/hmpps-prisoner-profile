import AttributesForLocation from '../interfaces/prisonApi/AttributesForLocation'

export const GetAttributesForLocation: AttributesForLocation = {
  id: 1,
  description: 'LEI-1-1',
  userDescription: 'LEI-1-1',
  capacity: 2,
  noOfOccupants: 2,
  attributes: [
    {
      code: 'LC',
      description: 'Listener Cell',
    },
  ],
}

export default {
  GetAttributesForLocation,
}
