import { Alert, Prisoner } from '../interfaces/prisoner'
import { tabLinks } from '../data/profileBanner/profileBanner'
import { AlertFlagLabel } from '../interfaces/alertFlagLabels'
import { alertFlagLabels } from '../data/alertFlags/alertFlags'

export const placeHolderImagePath = '/assets/images/prisoner-profile-photo.png'

export function mapProfileBannerTopLinks(prisonerData: Prisoner) {
  const profileBannerTopLinks = [
    {
      heading: 'Location',
      info: prisonerData.cellLocation,
      classes: '',
    },
    {
      heading: 'Category',
      info: prisonerData.category,
      classes: '',
    },
    {
      heading: 'CSRA',
      info: prisonerData.csra,
      classes: '',
    },
    {
      heading: 'Incentive level',
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

export function mapHeaderData(prisonerData: Prisoner, imagePath: string) {
  const headerData = {
    backLinkLabel: 'Back to search results',
    prisonerName: `${prisonerData.lastName}, ${prisonerData.firstName}`,
    prisonId: prisonerData.prisonerNumber,
    profileBannerTopLinks: mapProfileBannerTopLinks(prisonerData),
    alerts: mapAlerts(prisonerData, alertFlagLabels),
    tabLinks,
    photoSrc: imagePath,
  }
  return headerData
}
