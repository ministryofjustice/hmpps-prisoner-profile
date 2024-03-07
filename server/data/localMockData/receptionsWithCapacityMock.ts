import Reception from '../interfaces/prisonApi/Reception'

const ReceptionsWithCapacityMock: Reception[] = [
  {
    id: 1,
    description: 'LEI-1-1',
    userDescription: 'LEI-1-1',
    capacity: 25,
    noOfOccupants: 21,
    attributes: [
      {
        code: 'LC',
        description: 'Listener Cell',
      },
    ],
  },
]

export default ReceptionsWithCapacityMock
