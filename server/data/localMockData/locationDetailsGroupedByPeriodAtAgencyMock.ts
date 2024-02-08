import { LocationDetailsGroupedByPeriodAtAgency } from '../../interfaces/pages/locationDetailsPageData'

export const locationDetailsGroupedByPeriodAtAgencyMock: LocationDetailsGroupedByPeriodAtAgency[] = [
  {
    name: 'Moorland (HMP & YOI)',
    fromDateString: '01/01/2024',
    toDateString: '02/01/2024',
    locationDetails: [
      {
        agencyId: 'MDI',
        assignmentDateTime: '2021-07-05T10:35:17',
        assignmentEndDateTime: '2021-07-05T10:35:17',
        establishment: 'Moorland (HMP & YOI)',
        isTemporaryLocation: false,
        livingUnitId: 123123,
        location: '1-1-2',
        movedIn: '05/07/2021 - 10:35',
        movedInBy: 'John Smith',
        movedOut: '05/07/2021 - 10:35',
      },
    ],
    isValidAgency: true,
  },
]

export default {
  locationDetailsGroupedByPeriodAtAgencyMock,
}
