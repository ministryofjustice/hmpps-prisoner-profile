import { LocationDetails, LocationDetailsGroupedByPeriodAtAgency } from '../../services/interfaces/locationDetails'
import {
  GroupedLocationDetailsForDisplay,
  LocationDetailsForDisplay,
} from '../../interfaces/pages/locationDetailsPageData'
import { formatDate, formatDateTime } from '../../utils/dateHelpers'
import { formatName } from '../../utils/utils'

export function convertLocationDetails(locationDetails: LocationDetails): LocationDetailsForDisplay {
  if (!locationDetails) return null

  const staffDetails = locationDetails.movementMadeByStaffDetails
  const fromDateTime = locationDetails.assignmentDateTime
  const endDateTime = locationDetails.assignmentEndDateTime

  return {
    agencyId: locationDetails.agencyId,
    establishment: locationDetails.agencyName,
    location: locationDetails.location,
    livingUnitId: locationDetails.livingUnitId,
    isTemporaryLocation: locationDetails.isTemporaryLocation,
    movedIn: fromDateTime && formatDateTime(fromDateTime, 'short', ' - '),
    movedOut: endDateTime && formatDateTime(endDateTime, 'short', ' - '),
    movedInBy: locationDetails.movementMadeByStaffDetails
      ? formatName(staffDetails.firstName, '', staffDetails.lastName)
      : locationDetails.movementMadeByUsername,
  }
}

export function convertGroupedLocationDetails(
  groupedLocationDetails: LocationDetailsGroupedByPeriodAtAgency,
): GroupedLocationDetailsForDisplay {
  if (!groupedLocationDetails) return null
  return {
    agencyName: groupedLocationDetails.agencyName,
    fromDate: formatDate(groupedLocationDetails.fromDate, 'short'),
    toDate: formatDate(groupedLocationDetails.toDate, 'short') || 'Unknown',
    locationDetails: groupedLocationDetails.locationDetails.map(convertLocationDetails),
  }
}
