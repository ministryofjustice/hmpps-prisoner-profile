import type { Result } from '../../../utils/result/result'
import type { OverviewStatus } from '../../interfaces/OverviewPageData'
import type Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'
import type InmateDetail from '../../../data/interfaces/prisonApi/InmateDetail'
import type { HasNeed } from '../../../data/interfaces/supportForAdditionalNeedsApi/SupportForAdditionalNeeds'
import type { PrisonerPrisonSchedule } from '../../../data/interfaces/prisonApi/PrisonerSchedule'
import type { XrayBodyScanSummary } from './mapXrayBodyScanData'
import {
  getProfileInformationValue,
  ProfileInformationType,
} from '../../../data/interfaces/prisonApi/ProfileInformation'
import { BooleanString } from '../../../data/enums/booleanString'

export default function getOverviewStatuses(
  prisonerData: Prisoner,
  inmateDetail: InmateDetail,
  hasNeedsForAdditionalSupport: Result<HasNeed>,
  scheduledTransfers: PrisonerPrisonSchedule[] | null,
  xrayBodyScanSummary: Result<XrayBodyScanSummary> | null,
): OverviewStatus[] {
  return [
    getLocationStatus(prisonerData),
    getAdditionalSupportNeedsStatus(hasNeedsForAdditionalSupport),
    getListenerStatus(inmateDetail),
    getScheduledTransferStatus(scheduledTransfers),
    getXrayBodyScanLimitReachedStatus(xrayBodyScanSummary),
  ].filter(Boolean)
}

function getLocationStatus(prisonerData: Prisoner): OverviewStatus | null {
  if (prisonerData.inOutStatus === 'IN') {
    return { label: `In ${prisonerData.prisonName}` }
  }
  if (prisonerData.status === 'ACTIVE OUT') {
    return { label: `Out from ${prisonerData.prisonName}` }
  }
  if (prisonerData.status === 'INACTIVE OUT') {
    return { label: prisonerData.locationDescription }
  }
  if (prisonerData.inOutStatus === 'TRN') {
    return { label: 'Being transferred' }
  }
  return null
}

function getListenerStatus(inmateDetail: InmateDetail): OverviewStatus | null {
  const recognised = getProfileInformationValue(
    ProfileInformationType.RecognisedListener,
    inmateDetail.profileInformation,
  )
  const suitable = getProfileInformationValue(ProfileInformationType.SuitableListener, inmateDetail.profileInformation)

  if (recognised === BooleanString.Yes) {
    return { label: 'Recognised listener' }
  }

  if (suitable === BooleanString.Yes) {
    return { label: 'Suitable listener' }
  }

  return null
}

function getAdditionalSupportNeedsStatus(hasNeedsForAdditionalSupport: Result<HasNeed>): OverviewStatus | null {
  return hasNeedsForAdditionalSupport.handle({
    fulfilled(value: HasNeed): OverviewStatus | null {
      if (value?.hasNeed) {
        return {
          label: 'Additional needs',
          subText: 'View support for additional needs',
          subTextHref: value.url,
          style: 'prominent',
        }
      }
      return null
    },
    rejected(): OverviewStatus {
      return {
        label: 'Additional needs information is currently unavailable. Try again later.',
        style: 'error',
      }
    },
  })
}

function getScheduledTransferStatus(scheduledTransfers: PrisonerPrisonSchedule[] | null): OverviewStatus | null {
  return (
    (scheduledTransfers?.length > 0 && {
      label: 'Scheduled transfer',
      subText: `To ${scheduledTransfers[0].eventLocation}`,
    }) ??
    null
  )
}

function getXrayBodyScanLimitReachedStatus(
  xrayBodyScanSummary: Result<XrayBodyScanSummary> | null,
): OverviewStatus | null {
  return (
    xrayBodyScanSummary?.handle({
      fulfilled(summary): OverviewStatus | null {
        return summary.atScanLimit
          ? {
              label: `X-ray body scans in ${summary.fromScanDate.getFullYear()}`,
              subText: 'Scan limit reached',
              subTextHref: summary.viewHistoryUrl,
              style: 'warning',
            }
          : null
      },

      rejected(): OverviewStatus {
        return {
          label: 'X-ray body scan limit information is currently unavailable. Try again later.',
          style: 'error',
        }
      },
    }) ?? null
  )
}
