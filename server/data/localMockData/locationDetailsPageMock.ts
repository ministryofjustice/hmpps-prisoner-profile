import { LocationDetails, LocationDetailsPageData } from '../../interfaces/pages/locationDetailsPageData'
import { PrisonerMockDataA } from './prisoner'
import config from '../../config'

const profileUrl = `/prisoner/${PrisonerMockDataA.prisonerNumber}`

export const locationDetailsMock: LocationDetails = {
  agencyId: 'MDI',
  assignmentDateTime: '2021-07-05T10:35:17',
  assignmentEndDateTime: '2021-07-05T10:35:17',
  establishment: null,
  isTemporaryLocation: false,
  livingUnitId: 123123,
  location: '1-1-2',
  movedIn: '05/07/2021 - 10:35',
  movedInBy: 'John Smith',
  movedOut: '05/07/2021 - 10:35',
}

export const locationDetailsPageData: LocationDetailsPageData = {
  pageTitle: 'Location details',
  breadcrumbPrisonerName: 'John Saunders',
  name: 'John Saunders',
  prisonerName: 'Saunders, John',
  prisonerNumber: PrisonerMockDataA.prisonerNumber,
  profileUrl,
  canViewCellMoveButton: true,
  canViewMoveToReceptionButton: true,
  locationDetailsGroupedByAgency: [],
  dpsBaseUrl: `${config.apis.dpsHomePageUrl}${profileUrl}`,
  changeCellLink: `${config.apis.dpsHomePageUrl}${profileUrl}/cell-move/search-for-cell?returnUrl=${profileUrl}`,
  moveToReceptionLink: `${config.apis.dpsHomePageUrl}${profileUrl}/reception-move/consider-risks-reception`,
  currentLocation: locationDetailsMock,
  occupants: [],
  prisonId: 'MDI',
}
