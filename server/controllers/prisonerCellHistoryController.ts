import { Request, Response } from 'express'

import { mapHeaderNoBannerData } from '../mappers/headerMappers'
import { Prisoner } from '../interfaces/prisoner'
import { extractLocation, formatName, groupBy, hasLength, isTemporaryLocation, userHasRoles } from '../utils/utils'
import { formatDate, formatDateTime } from '../utils/dateHelpers'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { LocationsInmate } from '../interfaces/prisonApi/locationsInmates'
import config from '../config'

/**
 * Parse request for alerts page and orchestrate response
 */
export default class PrisonerCellHistoryController {
  private prisonApiClient: PrisonApiClient

  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  public async displayPrisonerCellHistory(req: Request, res: Response, prisonerData: Prisoner) {
    const offenderNo = prisonerData.prisonerNumber

    const enrichLocationsWithAgencyLeaveDate = (locations: LocationsInmate[]) => {
      const locationsWithAgencyLeaveDate: object[] = []
      let previousLocationEstablishmentName = locations[0].establishment
      let previousLocationEstablishmentNameAndLeaveDate =
        previousLocationEstablishmentName + locations[0].assignmentEndDateTime
      locations.forEach(location => {
        const locationEstablishmentNameAndLeaveDate =
          previousLocationEstablishmentName !== location.establishment
            ? (previousLocationEstablishmentNameAndLeaveDate = location.establishment + location.assignmentEndDateTime)
            : previousLocationEstablishmentNameAndLeaveDate
        locationsWithAgencyLeaveDate.push({
          ...location,
          establishmentWithAgencyLeaveDate: locationEstablishmentNameAndLeaveDate,
        })
        previousLocationEstablishmentName = location.establishment
        previousLocationEstablishmentNameAndLeaveDate = locationEstablishmentNameAndLeaveDate
      })
      return locationsWithAgencyLeaveDate
    }

    const getCellHistoryGroupedByPeriodAtAgency = (locations: LocationsInmate[]) => {
      const locationsWithAgencyLeaveDate = enrichLocationsWithAgencyLeaveDate(locations)
      return Object.entries(groupBy(locationsWithAgencyLeaveDate, 'establishmentWithAgencyLeaveDate')).map(
        // eslint-disable-next-line no-unused-vars
        ([key, value]) => {
          const fromDateString = formatDate(value.slice(-1)[0].assignmentDateTime, 'short')
          const toDateString = formatDate(value[0].assignmentEndDateTime, 'short') || 'Unknown'

          return {
            isValidAgency: !!value[0].establishment,
            name: value[0].establishment,
            datePeriod: `from ${fromDateString} to ${toDateString}`,
            cellHistory: value,
            key,
          }
        },
      )
    }

    try {
      // Parse query params for paging, sorting and filtering data
      const { clientToken } = res.locals

      const { bookingId, firstName, middleNames, lastName } = prisonerData
      const name = formatName(firstName, middleNames, lastName, { style: NameFormatStyle.firstLast })

      this.prisonApiClient = this.prisonApiClientBuilder(clientToken)

      const page = 0
      const cells = await this.prisonApiClient.getOffenderCellHistory(bookingId, { page, size: 10000 })
      const agencyData = await this.prisonApiClient.getAgencyDetails((await cells).content[page].agencyId)
      const staff = await Promise.all(
        (await cells).content.map(cell => this.prisonApiClient.getStaffDetails(cell.movementMadeBy)),
      )

      const cellData = cells.content.map(cell => {
        const staffDetails = staff.find(user => cell.movementMadeBy === user.username)
        const agencyName = cell.agencyId
        const agency = agencyData
        const agencyDescription = agency ? agency.description : null

        return {
          establishment: agencyDescription,
          location: extractLocation(cell.description, agencyName),
          isTemporaryLocation: isTemporaryLocation(cell.description),
          movedIn: cell.assignmentDateTime && formatDateTime(cell.assignmentDateTime, 'short'),
          movedOut: cell.assignmentEndDateTime && formatDateTime(cell.assignmentEndDateTime, 'short'),
          assignmentDateTime: cell.assignmentDateTime && formatDateTime(cell.assignmentDateTime, 'short'),
          assignmentEndDateTime: cell.assignmentEndDateTime
            ? cell.assignmentEndDateTime && formatDateTime(cell.assignmentEndDateTime, 'short')
            : undefined,
          livingUnitId: cell.livingUnitId,
          agencyId: agencyName,
          movedInBy: formatName(staffDetails.firstName, '', staffDetails.lastName),
        }
      })

      const cellDataLatestFirst = cellData.sort(
        (a, b) => new Date(a.assignmentDateTime).getTime() - new Date(b.assignmentDateTime).getTime(),
      )

      const currentLocation = cellDataLatestFirst[0]
      const occupants =
        (currentLocation && (await this.prisonApiClient.getInmatesAtLocation(currentLocation.livingUnitId, {}))) || []

      const previousLocations = cellDataLatestFirst.slice(1)
      const prisonerProfileUrl = `/prisoner/${offenderNo}`

      // Render page
      return res.render('pages/prisonerCellHistoryPage', {
        pageTitle: 'Location details',
        ...mapHeaderNoBannerData(prisonerData),
        name,
        cellHistoryGroupedByAgency: hasLength(previousLocations)
          ? getCellHistoryGroupedByPeriodAtAgency(previousLocations)
          : [],
        currentLocation: {
          ...currentLocation,
          assignmentEndDateTime: undefined,
        },
        occupants: occupants
          .filter(occupant => occupant.offenderNo !== offenderNo)
          .map(occupant => ({
            name: formatName(occupant.firstName, '', occupant.lastName, { style: NameFormatStyle.firstLast }),
            profileUrl: `/prisoner/${occupant.offenderNo}`,
          })),
        prisonerName: formatName(firstName, '', lastName),
        profileUrl: `/prisoner/${offenderNo}`,
        breadcrumbPrisonerName: formatName(firstName, '', lastName, { style: NameFormatStyle.firstLast }),
        changeCellLink: `${config.serviceUrls.digitalPrison}/prisoner/${offenderNo}/cell-move/search-for-cell?returnUrl=${prisonerProfileUrl}`,
        canViewCellMoveButton: userHasRoles(['CELL_MOVE'], res.locals.user.userRoles),
        prisonerNumber: offenderNo,
        dpsBaseUrl: `${config.serviceUrls.digitalPrison}/prisoner/${offenderNo}`,
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
}
