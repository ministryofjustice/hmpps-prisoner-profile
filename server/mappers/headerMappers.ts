import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { tabLinks } from '../data/profileBanner/profileBanner'
import {
  formatCategoryALabel,
  formatCategoryCodeDescription,
  formatName,
  isInUsersCaseLoad,
  prisonerIsTRN,
  userHasRoles,
} from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import config from '../config'
import { Role } from '../data/enums/role'
import { canViewCaseNotes } from '../utils/roleHelpers'
import InmateDetail from '../data/interfaces/prisonApi/InmateDetail'
import { HmppsUser } from '../interfaces/HmppsUser'
import { AlertSummaryData } from '../data/interfaces/alertsApi/Alert'

export function mapProfileBannerTopLinks(prisonerData: Prisoner, inmateDetail: InmateDetail, user: HmppsUser) {
  const { userRoles } = user
  const { prisonId } = prisonerData
  const profileBannerTopLinks = []
  const canViewCsraHistory =
    isInUsersCaseLoad(prisonId, user) || (prisonerIsTRN(prisonId) && userHasRoles([Role.GlobalSearch], userRoles))

  if (isInUsersCaseLoad(prisonId, user)) {
    const location = `${prisonerData.cellLocation}${prisonerData.inOutStatus === 'OUT' ? ' (Outside)' : ''}`
    profileBannerTopLinks.push({
      heading: 'Location',
      hiddenLabel: 'View location details',
      info: location,
      classes: '',
      url: `/prisoner/${prisonerData.prisonerNumber}/location-details`,
    })
  } else if (userHasRoles([Role.InactiveBookings], userRoles) && prisonId === 'OUT') {
    profileBannerTopLinks.push({
      heading: 'Location',
      hiddenLabel: 'View location details',
      info: 'Released',
      classes: '',
      url: `/prisoner/${prisonerData.prisonerNumber}/location-details`,
    })
  } else if (userHasRoles([Role.InactiveBookings], userRoles) && prisonId === 'TRN') {
    profileBannerTopLinks.push({
      heading: 'Location',
      hiddenLabel: 'View location details',
      info: 'Transfer',
      classes: '',
      url: `/prisoner/${prisonerData.prisonerNumber}/location-details`,
    })
  }

  profileBannerTopLinks.push({
    heading: 'Category',
    hiddenLabel: userHasRoles(
      [
        Role.CreateRecategorisation,
        Role.ApproveCategorisation,
        Role.CreateRecategorisation,
        Role.CategorisationSecurity,
      ],
      userRoles,
    )
      ? 'Manage category'
      : 'View category',
    // eslint-disable-next-line no-nested-ternary
    info: formatCategoryCodeDescription(prisonerData.category, inmateDetail.category),
    classes: '',
    url: `${config.serviceUrls.offenderCategorisation}/${prisonerData.bookingId}`,
  })
  profileBannerTopLinks.push({
    heading: 'CSRA',
    hiddenLabel: 'View CSRA history',
    info: prisonerData.csra ? prisonerData.csra : 'Not entered',
    classes: '',
    url: canViewCsraHistory ? `/prisoner/${prisonerData.prisonerNumber}/csra-history` : undefined,
  })
  profileBannerTopLinks.push({
    heading: 'Incentive level',
    hiddenLabel: 'View incentive level details',
    info: prisonerData.currentIncentive ? prisonerData.currentIncentive.level.description : 'Not entered',
    classes: 'remove-column-gutter-right',
    url: `${config.serviceUrls.incentives}/incentive-reviews/prisoner/${prisonerData.prisonerNumber}`,
  })
  return profileBannerTopLinks
}

export function mapHeaderData(
  prisonerData: Prisoner,
  inmateDetail: InmateDetail,
  alertSummaryData: AlertSummaryData,
  user?: HmppsUser,
  pageId?: string,
  hideBanner?: boolean,
) {
  const photoType = prisonerData.category === 'A' ? 'photoWithheld' : 'placeholder'
  const tabs = tabLinks(prisonerData.prisonerNumber, canViewCaseNotes(user, prisonerData))

  if (pageId && tabs.find(tab => tab.id === pageId)) {
    tabs.find(tab => tab.id === pageId).active = true
  }

  return {
    backLinkLabel: 'Back to search results',
    prisonerName: formatName(prisonerData.firstName, prisonerData.middleNames, prisonerData.lastName, {
      style: NameFormatStyle.lastCommaFirst,
    }),
    prisonerNumber: prisonerData.prisonerNumber,
    profileBannerTopLinks: mapProfileBannerTopLinks(prisonerData, inmateDetail, user),
    alertSummaryData,
    categoryLabel: formatCategoryALabel(prisonerData.category),
    tabLinks: tabs,
    photoType,
    prisonId: prisonerData.prisonId,
    restrictedPatient: prisonerData.restrictedPatient,
    hideBanner: hideBanner || false,
    newArrival24: prisonerData.newArrival24,
    newArrival72: prisonerData.newArrival72,
  }
}

export function mapHeaderNoBannerData(prisonerData: Prisoner) {
  return {
    prisonerName: formatName(prisonerData.firstName, prisonerData.middleNames, prisonerData.lastName, {
      style: NameFormatStyle.lastCommaFirst,
    }),
    prisonerNumber: prisonerData.prisonerNumber,
    prisonId: prisonerData.prisonId,
  }
}
