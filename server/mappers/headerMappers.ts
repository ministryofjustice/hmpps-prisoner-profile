import {
  isGranted,
  PersonPrisonCategoryPermission,
  PrisonerBaseLocationPermission,
  PrisonerIncentivesPermission,
  PrisonerPermissions,
  PrisonerSpecificRisksPermission,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import config from '../config'
import type { AlertSummaryData } from '../data/interfaces/alertsApi/Alert'
import type InmateDetail from '../data/interfaces/prisonApi/InmateDetail'
import type Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { type TabLink, tabLinks } from '../data/profileBanner/profileBanner'
import { formatCategoryALabel, formatCategoryCodeDescription, prisonerIsOut, prisonerIsTRN } from '../utils/utils'

interface HeaderData {
  backLinkLabel: string
  profileBannerTopLinks: ProfileBannerTopLink[]
  alertSummaryData: AlertSummaryData
  categoryLabel: string | undefined
  tabLinks: TabLink[]
  restrictedPatient: boolean
  hideBanner: boolean
  newArrival24: boolean | undefined
  newArrival72: boolean | undefined
}

interface ProfileBannerTopLink {
  heading: string
  hiddenLabel: string
  info: string
  classes: string
  url: string | undefined
}

export function mapProfileBannerTopLinks({
  prisonerData,
  inmateDetail,
  prisonerPermissions,
  isHighProfilePrisonerOutsideCaseloads, // TODO: remove once folded into permissions library
}: {
  prisonerData: Prisoner
  inmateDetail: InmateDetail
  prisonerPermissions: PrisonerPermissions
  isHighProfilePrisonerOutsideCaseloads: boolean
}): ProfileBannerTopLink[] {
  const { prisonId } = prisonerData
  const profileBannerTopLinks: ProfileBannerTopLink[] = []

  if (isGranted(PrisonerBaseLocationPermission.read_location_details, prisonerPermissions)) {
    // eslint-disable-next-line no-nested-ternary
    const transferOrReleased = prisonerIsTRN(prisonId) ? 'Transfer' : prisonerIsOut(prisonId) ? 'Released' : null

    const location =
      transferOrReleased || `${prisonerData.cellLocation}${prisonerData.inOutStatus === 'OUT' ? ' (Outside)' : ''}`

    profileBannerTopLinks.push({
      heading: 'Location',
      hiddenLabel: 'location',
      info: location,
      classes: '',
      url: `/prisoner/${prisonerData.prisonerNumber}/location-details`,
    })
  }

  if (isGranted(PersonPrisonCategoryPermission.read, prisonerPermissions)) {
    profileBannerTopLinks.push({
      heading: 'Category',
      hiddenLabel: 'category',
      info: formatCategoryCodeDescription(prisonerData.category, inmateDetail.category),
      classes: '',
      url: `${config.serviceUrls.offenderCategorisation}/${prisonerData.bookingId}`,
    })
  }

  if (isGranted(PrisonerSpecificRisksPermission.read_csra_rating, prisonerPermissions)) {
    let csraUrl: string | undefined
    if (config.featureToggles.csraServiceEnabled) {
      csraUrl = `${config.serviceUrls.csraService}/prisoner/${prisonerData.prisonerNumber}`
    } else if (isGranted(PrisonerSpecificRisksPermission.read_csra_assessment_history, prisonerPermissions)) {
      csraUrl = `/prisoner/${prisonerData.prisonerNumber}/csra-history`
    }

    profileBannerTopLinks.push({
      heading: 'CSRA',
      hiddenLabel: 'CSRA',
      info: prisonerData.csra ? prisonerData.csra : 'Not entered',
      classes: '',
      url: csraUrl,
    })
  }

  if (
    isGranted(PrisonerIncentivesPermission.read_incentive_level, prisonerPermissions) &&
    !isHighProfilePrisonerOutsideCaseloads
  ) {
    profileBannerTopLinks.push({
      heading: 'Incentive level',
      hiddenLabel: 'incentive level',
      info: prisonerData.currentIncentive ? prisonerData.currentIncentive.level.description : 'Not entered',
      classes: 'remove-column-gutter-right',
      url: isGranted(PrisonerIncentivesPermission.read_incentive_level_history, prisonerPermissions)
        ? `${config.serviceUrls.incentives}/incentive-reviews/prisoner/${prisonerData.prisonerNumber}`
        : undefined,
    })
  }

  return profileBannerTopLinks
}

export function mapHeaderData({
  prisonerData,
  inmateDetail,
  alertSummaryData,
  prisonerPermissions,
  isHighProfilePrisonerOutsideCaseloads, // TODO: remove once folded into permissions library
  pageId,
  hideBanner = false,
}: {
  prisonerData: Prisoner
  inmateDetail: InmateDetail
  alertSummaryData: AlertSummaryData
  prisonerPermissions?: PrisonerPermissions
  isHighProfilePrisonerOutsideCaseloads: boolean
  pageId?: string
  hideBanner?: boolean
}): HeaderData {
  const tabs = tabLinks({
    prisonerNumber: prisonerData.prisonerNumber,
    prisonerPermissions,
    isHighProfilePrisonerOutsideCaseloads,
  })

  if (pageId && tabs.find(tab => tab.id === pageId)) {
    tabs.find(tab => tab.id === pageId).active = true
  }

  return {
    backLinkLabel: 'Back to search results',
    profileBannerTopLinks: mapProfileBannerTopLinks({
      prisonerData,
      inmateDetail,
      prisonerPermissions,
      isHighProfilePrisonerOutsideCaseloads,
    }),
    alertSummaryData,
    categoryLabel: formatCategoryALabel(prisonerData.category),
    tabLinks: tabs,
    restrictedPatient: prisonerData.restrictedPatient,
    hideBanner,
    newArrival24: prisonerData.newArrival24,
    newArrival72: prisonerData.newArrival72,
  }
}
