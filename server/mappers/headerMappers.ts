import { Alert, Prisoner } from '../interfaces/prisoner'
import { tabLinks } from '../data/profileBanner/profileBanner'
import { AlertFlagLabel } from '../interfaces/alertFlagLabels'
import { alertFlagLabels } from '../data/alertFlags/alertFlags'

export const placeHolderImagePath = '/assets/images/prisoner-profile-photo.png'

export function mapProfileBannerTopLinks(prisonerData: Prisoner) {
  const profileBannerTopLinks = [
    {
      heading: 'Location',
      hiddenLabel: 'View location details',
      info: prisonerData.cellLocation,
      classes: '',
    },
    {
      heading: 'Category',
      hiddenLabel: 'Manage category',
      info: prisonerData.category === 'U' ? 'Unsentenced' : prisonerData.category,
      classes: '',
    },
    {
      heading: 'CSRA',
      hiddenLabel: 'View CSRA history',
      info: prisonerData.csra,
      classes: '',
    },
    {
      heading: 'Incentive level',
      hiddenLabel: 'View incentive level details',
      info: prisonerData.currentIncentive ? prisonerData.currentIncentive.level.description : '',
      classes: 'remove-column-gutter-right',
    },
  ]
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

export function mapHeaderData(prisonerData: Prisoner) {
  const headerData = {
    backLinkLabel: 'Back to search results',
    prisonerName: `${prisonerData.lastName}, ${prisonerData.firstName}`,
    prisonerNumber: prisonerData.prisonerNumber,
    profileBannerTopLinks: mapProfileBannerTopLinks(prisonerData),
    alerts: mapAlerts(prisonerData, alertFlagLabels),
    tabLinks,
  }
  return headerData
}
