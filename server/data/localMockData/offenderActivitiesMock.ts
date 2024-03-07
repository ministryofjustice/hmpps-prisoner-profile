import OffenderActivitiesHistory from '../interfaces/prisonApi/OffenderActivitiesHistory'

export const OffenderActivitiesMock: OffenderActivitiesHistory = {
  content: [
    {
      bookingId: 1102484,
      agencyLocationId: 'MDI',
      agencyLocationDescription: 'Moorland (HMP & YOI)',
      description: 'Braille am',
      startDate: '2021-10-07',
      endDate: undefined,
      isCurrentActivity: true,
    },
    {
      bookingId: 1102484,
      agencyLocationId: 'MDI',
      agencyLocationDescription: 'Moorland (HMP & YOI)',
      description: 'Bricks PM',
      startDate: '2021-10-07',
      endDate: undefined,
      isCurrentActivity: true,
    },
  ],
  pageable: {
    sort: { empty: true, sorted: false, unsorted: true },
    offset: 0,
    pageSize: 20,
    pageNumber: 0,
    paged: true,
    unpaged: false,
  },
  totalPages: 1,
  last: true,
  totalElements: 2,
  size: 20,
  number: 0,
  sort: {
    empty: true,
    sorted: false,
    unsorted: true,
  },
  first: true,
  numberOfElements: 2,
  empty: false,
}

export const OffenderActivitiesEmptyMock: OffenderActivitiesHistory = {
  content: [],
  pageable: {
    sort: { empty: true, sorted: false, unsorted: true },
    offset: 0,
    pageSize: 20,
    pageNumber: 0,
    paged: true,
    unpaged: false,
  },
  totalPages: 1,
  last: true,
  totalElements: 0,
  size: 20,
  number: 0,
  sort: {
    empty: true,
    sorted: false,
    unsorted: true,
  },
  first: true,
  numberOfElements: 0,
  empty: false,
}

export default {
  OffenderActivitiesMock,
}
