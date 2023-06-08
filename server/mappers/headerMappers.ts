import { Alert, Prisoner } from '../interfaces/prisoner'
import { tabLinks } from '../data/profileBanner/profileBanner'
import { AlertFlagLabel } from '../interfaces/alertFlagLabels'
import { alertFlagLabels } from '../data/alertFlags/alertFlags'
import { formatCategoryCodeDescription, formatName, prisonerBelongsToUsersCaseLoad, userHasRoles } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import config from '../config'
import { Role } from '../data/enums/role'
import { canViewCaseNotes } from '../utils/roleHelpers'
import { User } from '../data/hmppsAuthClient'

export const placeHolderImagePath = '/assets/images/prisoner-profile-photo.png'

export function mapProfileBannerTopLinks(prisonerData: Prisoner, user: User) {
  const { userRoles, caseLoads } = user
  const profileBannerTopLinks = []

  if (prisonerBelongsToUsersCaseLoad(prisonerData.prisonId, caseLoads)) {
    profileBannerTopLinks.push({
      heading: 'Location',
      hiddenLabel: 'View location details',
      info: prisonerData.cellLocation,
      classes: '',
      url: `${config.serviceUrls.digitalPrison}/prisoner/${prisonerData.prisonerNumber}/cell-history`,
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
    info: formatCategoryCodeDescription(prisonerData.category),
    classes: '',
    url: `${config.serviceUrls.offenderCategorisation}/${prisonerData.bookingId}`,
  })
  profileBannerTopLinks.push({
    heading: 'CSRA',
    hiddenLabel: 'View CSRA history',
    info: prisonerData.csra ? prisonerData.csra : 'Not entered',
    classes: '',
    url: `${config.serviceUrls.digitalPrison}/prisoner/${prisonerData.prisonerNumber}/csra-history`,
  })
  profileBannerTopLinks.push({
    heading: 'Incentive level',
    hiddenLabel: 'View incentive level details',
    info: prisonerData.currentIncentive ? prisonerData.currentIncentive.level.description : 'Not entered',
    classes: 'remove-column-gutter-right',
    url: `${config.serviceUrls.digitalPrison}/prisoner/${prisonerData.prisonerNumber}/incentive-level-details`,
  })
  return profileBannerTopLinks
}

export function mapAlerts(prisonerData: Prisoner, alertFlags: AlertFlagLabel[]) {
  const alerts: AlertFlagLabel[] = []
  if (prisonerData.alerts) {
    prisonerData.alerts.forEach((alert: Alert) => {
      alertFlags.forEach((alertFlag: AlertFlagLabel) => {
        if (alertFlag.alertCodes.includes(alert.alertCode)) {
          alerts.push(alertFlag)
        }
      })
    })
  }
  return [...new Set(alerts)]
}

export function mapHeaderData(prisonerData: Prisoner, user?: User, pageId?: string, hideBanner?: boolean) {
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
    profileBannerTopLinks: mapProfileBannerTopLinks(prisonerData, user),
    alerts: mapAlerts(prisonerData, alertFlagLabels),
    tabLinks: tabs,
    photoType,
    prisonId: prisonerData.prisonId,
    hideBanner: hideBanner || false,
  }
}
