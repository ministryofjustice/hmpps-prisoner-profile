import { LocationDetails, LocationDetailsGroupedByPeriodAtAgency } from '../../services/interfaces/locationDetails'
import {
  GroupedLocationDetailsForDisplay,
  LocationDetailsForDisplay,
} from '../../interfaces/pages/locationDetailsPageData'
import { formatDate, formatDateTime, formatDateTimeISO } from '../../utils/dateHelpers'
import { formatName } from '../../utils/utils'
import config from '../../config'

export default class LocationDetailsConverter {
  constructor(private readonly getDateTimeNow: () => Date = () => new Date()) {}

  convertLocationDetails = (location: LocationDetails): LocationDetailsForDisplay => {
    if (!location) return null

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
      locationHistoryLink: this.generateLocationHistoryLink(location),
    }
  }

  convertGroupedLocationDetails = (
    groupedLocations: LocationDetailsGroupedByPeriodAtAgency,
  ): GroupedLocationDetailsForDisplay => {
    if (!groupedLocations) return null
    return {
      agencyName: groupedLocations.agencyName,
      fromDate: formatDate(groupedLocations.fromDate, 'short'),
      toDate: formatDate(groupedLocations.toDate, 'short') || 'Unknown',
      locationDetails: groupedLocations.locationDetails.map(this.convertLocationDetails),
    }
  }

  private generateLocationHistoryLink = (location: LocationDetails): string => {
    if (location.isTemporaryLocation || !location.assignmentDateTime) return null

    const locationHistoryLink = new URL(`/prisoner/${location.prisonerNumber}/location-history`, config.domain)
    const { searchParams } = locationHistoryLink

    searchParams.append('agencyId', location.agencyId)
    searchParams.append('locationId', String(location.livingUnitId))
    searchParams.append('fromDate', location.assignmentDateTime)
    searchParams.append('toDate', location.assignmentEndDateTime || formatDateTimeISO(this.getDateTimeNow()))

    return locationHistoryLink.pathname + locationHistoryLink.search
  }
}
