import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { tabLinks } from '../data/profileBanner/profileBanner'
import {
  formatCategoryALabel,
  formatCategoryCodeDescription,
  formatName,
  prisonerBelongsToUsersCaseLoad,
  prisonerIsTRN,
  userHasRoles,
} from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import config from '../config'
import { Role } from '../data/enums/role'
import { canViewCaseNotes } from '../utils/roleHelpers'
import { User } from '../data/hmppsAuthClient'
import InmateDetail from '../data/interfaces/prisonApi/InmateDetail'
import AlertFlagLabel from '../interfaces/AlertFlagLabels'
import { alertFlagLabels } from '../data/alertFlags/alertFlags'
import PrisonApiAlert from '../data/interfaces/prisonApi/PrisonApiAlert'

export const placeHolderImagePath = '/assets/images/prisoner-profile-photo.png'

export function mapProfileBannerTopLinks(prisonerData: Prisoner, inmateDetail: InmateDetail, user: User) {
  const { userRoles, caseLoads } = user
  const { prisonId } = prisonerData
  const profileBannerTopLinks = []
  const canViewCsraHistory =
    prisonerBelongsToUsersCaseLoad(prisonId, caseLoads) ||
    (prisonerIsTRN(prisonId) && userHasRoles([Role.GlobalSearch], userRoles))

  if (prisonerBelongsToUsersCaseLoad(prisonId, caseLoads)) {
    profileBannerTopLinks.push({
      heading: 'Location',
      hiddenLabel: 'View location details',
      info: prisonerData.cellLocation,
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

export function mapAlerts(inmateDetail: InmateDetail, alertFlags: AlertFlagLabel[]) {
  return alertFlags
    .map(flag => {
      const alertIds = inmateDetail.alerts
        .filter((alert: PrisonApiAlert) => alert.active && !alert.expired && flag.alertCodes.includes(alert.alertCode))
        .map(alert => alert.alertId)
      return { ...flag, alertIds } as AlertFlagLabel
    })
    .filter(alert => alert.alertIds?.length)
}

export function mapHeaderData(
  prisonerData: Prisoner,
  inmateDetail: InmateDetail,
  user?: User,
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
    alerts: mapAlerts(inmateDetail, alertFlagLabels),
    categoryLabel: formatCategoryALabel(prisonerData.category),
    tabLinks: tabs,
    photoType,
    prisonId: prisonerData.prisonId,
    restrictedPatient: prisonerData.restrictedPatient,
    hideBanner: hideBanner || false,
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
