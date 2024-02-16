import { LocationDetails, LocationDetailsGroupedByPeriodAtAgency } from '../../services/interfaces/locationDetails'
import {
  GroupedLocationDetailsForDisplay,
  LocationDetailsForDisplay,
} from '../../interfaces/pages/locationDetailsPageData'
import { formatDate, formatDateTime, formatDateTimeISO } from '../../utils/dateHelpers'
import { formatName } from '../../utils/utils'
import config from '../../config'

export function locationDetailsConverter(
  prisonerNumber: string,
  defaultLocationHistoryToDate: Date = new Date(),
): (location: LocationDetails) => LocationDetailsForDisplay {
  return location => {
    if (!location || !prisonerNumber) return null

    const staffDetails = location.movementMadeByStaffDetails
    const fromDateTime = location.assignmentDateTime
    const endDateTime = location.assignmentEndDateTime

    return {
      establishment: location.agencyName,
      location: location.location,
      movedIn: fromDateTime && formatDateTime(fromDateTime, 'short', ' - '),
      movedOut: endDateTime && formatDateTime(endDateTime, 'short', ' - '),
      movedInBy: location.movementMadeByStaffDetails
        ? formatName(staffDetails.firstName, '', staffDetails.lastName)
        : location.movementMadeByUsername,
      locationHistoryLink: generateLocationHistoryLink(location, prisonerNumber, defaultLocationHistoryToDate),
    }
  }
}

export function groupedLocationDetailsConverter(
  prisonerNumber: string,
  defaultLocationHistoryToDate: Date = new Date(),
): (groupedLocations: LocationDetailsGroupedByPeriodAtAgency) => GroupedLocationDetailsForDisplay {
  return (groupedLocations: LocationDetailsGroupedByPeriodAtAgency) => {
    if (!groupedLocations) return null
    const convertLocationDetails = locationDetailsConverter(prisonerNumber, defaultLocationHistoryToDate)
    return {
      agencyName: groupedLocations.agencyName,
      fromDate: formatDate(groupedLocations.fromDate, 'short'),
      toDate: formatDate(groupedLocations.toDate, 'short') || 'Unknown',
      locationDetails: groupedLocations.locationDetails.map(convertLocationDetails),
    }
  }
}

function generateLocationHistoryLink(
  location: LocationDetails,
  prisonerNumber: string,
  defaultLocationHistoryToDate: Date,
): string {
  if (location.isTemporaryLocation || !location.assignmentDateTime) return null

  const locationHistoryLink = new URL(`/prisoner/${prisonerNumber}/location-history`, config.domain)
  const { searchParams } = locationHistoryLink

  searchParams.append('agencyId', location.agencyId)
  searchParams.append('locationId', String(location.livingUnitId))
  searchParams.append('fromDate', location.assignmentDateTime)
  searchParams.append('toDate', location.assignmentEndDateTime || formatDateTimeISO(defaultLocationHistoryToDate))

  return locationHistoryLink.pathname + locationHistoryLink.search
}
