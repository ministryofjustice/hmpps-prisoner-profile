import {
  CaseNotesPermission,
  isGranted,
  PersonPrisonCategoryPermission,
  PrisonerBaseLocationPermission,
  PrisonerIncentivesPermission,
  PrisonerPermissions,
  PrisonerSpecificRisksPermission,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { tabLinks } from '../data/profileBanner/profileBanner'
import { formatCategoryALabel, formatCategoryCodeDescription, prisonerIsOut, prisonerIsTRN } from '../utils/utils'
import config from '../config'
import InmateDetail from '../data/interfaces/prisonApi/InmateDetail'
import { AlertSummaryData } from '../data/interfaces/alertsApi/Alert'

export function mapProfileBannerTopLinks(
  prisonerData: Prisoner,
  inmateDetail: InmateDetail,
  prisonerPermissions: PrisonerPermissions,
) {
  const { prisonId } = prisonerData
  const profileBannerTopLinks = []

  if (isGranted(PrisonerBaseLocationPermission.read_location_details, prisonerPermissions)) {
    // eslint-disable-next-line no-nested-ternary
    const transferOrReleased = prisonerIsTRN(prisonId) ? 'Transfer' : prisonerIsOut(prisonId) ? 'Released' : null

    const location =
      transferOrReleased || `${prisonerData.cellLocation}${prisonerData.inOutStatus === 'OUT' ? ' (Outside)' : ''}`

    profileBannerTopLinks.push({
      heading: 'Location',
      hiddenLabel: 'View location details',
      info: location,
      classes: '',
      url: `/prisoner/${prisonerData.prisonerNumber}/location-details`,
    })
  }

  if (isGranted(PersonPrisonCategoryPermission.read, prisonerPermissions)) {
    profileBannerTopLinks.push({
      heading: 'Category',
      hiddenLabel: isGranted(PersonPrisonCategoryPermission.edit, prisonerPermissions)
        ? 'Manage category'
        : 'View category',
      info: formatCategoryCodeDescription(prisonerData.category, inmateDetail.category),
      classes: '',
      url: `${config.serviceUrls.offenderCategorisation}/${prisonerData.bookingId}`,
    })
  }

  if (isGranted(PrisonerSpecificRisksPermission.read_csra_rating, prisonerPermissions)) {
    profileBannerTopLinks.push({
      heading: 'CSRA',
      hiddenLabel: isGranted(PrisonerSpecificRisksPermission.read_csra_assessment_history, prisonerPermissions)
        ? 'View CSRA history'
        : undefined,
      info: prisonerData.csra ? prisonerData.csra : 'Not entered',
      classes: '',
      url: isGranted(PrisonerSpecificRisksPermission.read_csra_assessment_history, prisonerPermissions)
        ? `/prisoner/${prisonerData.prisonerNumber}/csra-history`
        : undefined,
    })
  }

  if (isGranted(PrisonerIncentivesPermission.read_incentive_level, prisonerPermissions)) {
    profileBannerTopLinks.push({
      heading: 'Incentive level',
      hiddenLabel: isGranted(PrisonerIncentivesPermission.read_incentive_level_history, prisonerPermissions)
        ? 'View incentive level details'
        : undefined,
      info: prisonerData.currentIncentive ? prisonerData.currentIncentive.level.description : 'Not entered',
      classes: 'remove-column-gutter-right',
      url: isGranted(PrisonerIncentivesPermission.read_incentive_level_history, prisonerPermissions)
        ? `${config.serviceUrls.incentives}/incentive-reviews/prisoner/${prisonerData.prisonerNumber}`
        : undefined,
    })
  }

  return profileBannerTopLinks
}

export function mapHeaderData(
  prisonerData: Prisoner,
  inmateDetail: InmateDetail,
  alertSummaryData: AlertSummaryData,
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
    profileBannerTopLinks: mapProfileBannerTopLinks(prisonerData, inmateDetail, prisonerPermissions),
    alertSummaryData,
    categoryLabel: formatCategoryALabel(prisonerData.category),
    tabLinks: tabs,
    restrictedPatient: prisonerData.restrictedPatient,
    hideBanner: hideBanner || false,
    newArrival24: prisonerData.newArrival24,
    newArrival72: prisonerData.newArrival72,
  }
}
