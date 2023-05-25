import { Alert, Prisoner } from '../interfaces/prisoner'
import { tabLinks } from '../data/profileBanner/profileBanner'
import { AlertFlagLabel } from '../interfaces/alertFlagLabels'
import { alertFlagLabels } from '../data/alertFlags/alertFlags'
import { formatName, prisonerBelongsToUsersCaseLoad } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { CaseLoad } from '../interfaces/caseLoad'

export const placeHolderImagePath = '/assets/images/prisoner-profile-photo.png'

export function mapProfileBannerTopLinks(prisonerData: Prisoner, userCaseLoads: CaseLoad[]) {
  const profileBannerTopLinks = []

  if (prisonerBelongsToUsersCaseLoad(prisonerData.prisonId, userCaseLoads)) {
    profileBannerTopLinks.push({
      heading: 'Location',
      hiddenLabel: 'View location details',
      info: prisonerData.cellLocation,
      classes: '',
    })
  }

  profileBannerTopLinks.push({
    heading: 'Category',
    hiddenLabel: 'Manage category',
    info: prisonerData.category === 'U' ? 'Unsentenced' : prisonerData.category,
    classes: '',
  })
  profileBannerTopLinks.push({
    heading: 'CSRA',
    hiddenLabel: 'View CSRA history',
    info: prisonerData.csra ? prisonerData.csra : 'Not entered',
    classes: '',
  })
  profileBannerTopLinks.push({
    heading: 'Incentive level',
    hiddenLabel: 'View incentive level details',
    info: prisonerData.currentIncentive ? prisonerData.currentIncentive.level.description : 'Not entered',
    classes: 'remove-column-gutter-right',
  })
  return profileBannerTopLinks
}

export function mapAlerts(prisonerData: Prisoner, alertFlags: AlertFlagLabel[]) {
  const alerts: AlertFlagLabel[] = []
  if (prisonerData.alerts) {
    prisonerData.alerts.forEach((alert: Alert) => {
      alertFlags.forEach((alertFlag: AlertFlagLabel) => {
        if (alert.alertCode === alertFlag.alertCodes[0]) {
          alerts.push(alertFlag)
        }
      })
    })
  }
  return alerts
}

export function mapHeaderData(
  prisonerData: Prisoner,
  userCaseLoads: CaseLoad[],
  canViewCaseNotes?: boolean,
  pageId?: string,
) {
  const photoType = prisonerData.category === 'A' ? 'photoWithheld' : 'placeholder'
  const tabs = tabLinks(prisonerData.prisonerNumber, canViewCaseNotes)

  if (pageId) {
    tabs.find(tab => tab.id === pageId).active = true
  }

  const headerData = {
    backLinkLabel: 'Back to search results',
    prisonerName: formatName(prisonerData.firstName, prisonerData.middleNames, prisonerData.lastName, {
      style: NameFormatStyle.lastCommaFirst,
    }),
    prisonerNumber: prisonerData.prisonerNumber,
    profileBannerTopLinks: mapProfileBannerTopLinks(prisonerData, userCaseLoads),
    alerts: mapAlerts(prisonerData, alertFlagLabels),
    tabLinks: tabs,
    photoType,
    prisonId: prisonerData.prisonId,
  }
  return headerData
}
