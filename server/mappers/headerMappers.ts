import { CaseNotesPermission, isGranted, PrisonerPermissions } from '@ministryofjustice/hmpps-prison-permissions-lib'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { tabLinks } from '../data/profileBanner/profileBanner'
import {
  canViewCsraHistory,
  formatCategoryALabel,
  formatCategoryCodeDescription,
  isInUsersCaseLoad,
  userHasRoles,
} from '../utils/utils'
import config from '../config'
import { Role } from '../data/enums/role'
import InmateDetail from '../data/interfaces/prisonApi/InmateDetail'
import { HmppsUser } from '../interfaces/HmppsUser'
import { AlertSummaryData } from '../data/interfaces/alertsApi/Alert'

export function mapProfileBannerTopLinks(prisonerData: Prisoner, inmateDetail: InmateDetail, user: HmppsUser) {
  const { userRoles } = user
  const { prisonId } = prisonerData
  const profileBannerTopLinks = []

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

    info: formatCategoryCodeDescription(prisonerData.category, inmateDetail.category),
    classes: '',
    url: `${config.serviceUrls.offenderCategorisation}/${prisonerData.bookingId}`,
  })
  profileBannerTopLinks.push({
    heading: 'CSRA',
    hiddenLabel: 'View CSRA history',
    info: prisonerData.csra ? prisonerData.csra : 'Not entered',
    classes: '',
    url: canViewCsraHistory(prisonId, user) ? `/prisoner/${prisonerData.prisonerNumber}/csra-history` : undefined,
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
  prisonerPermissions?: PrisonerPermissions,
  pageId?: string,
  hideBanner?: boolean,
) {
  const tabs = tabLinks(prisonerData.prisonerNumber, isGranted(CaseNotesPermission.read, prisonerPermissions))

  if (pageId && tabs.find(tab => tab.id === pageId)) {
    tabs.find(tab => tab.id === pageId).active = true
  }

  return {
    backLinkLabel: 'Back to search results',
    profileBannerTopLinks: mapProfileBannerTopLinks(prisonerData, inmateDetail, user),
    alertSummaryData,
    categoryLabel: formatCategoryALabel(prisonerData.category),
    tabLinks: tabs,
    restrictedPatient: prisonerData.restrictedPatient,
    hideBanner: hideBanner || false,
    newArrival24: prisonerData.newArrival24,
    newArrival72: prisonerData.newArrival72,
  }
}
