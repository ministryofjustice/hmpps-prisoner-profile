import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'
import InmateDetail from '../../../data/interfaces/prisonApi/InmateDetail'
import { Result } from '../../../utils/result/result'
import LearnerNeurodivergence from '../../../data/interfaces/curiousApi/LearnerNeurodivergence'
import { HasNeed } from '../../../data/interfaces/supportForAdditionalNeedsApi/SupportForAdditionalNeeds'
import { PrisonerPrisonSchedule } from '../../../data/interfaces/prisonApi/PrisonerSchedule'
import { OverviewStatus } from '../../interfaces/OverviewPageData'
import {
  getProfileInformationValue,
  ProfileInformationType,
} from '../../../data/interfaces/prisonApi/ProfileInformation'
import { BooleanString } from '../../../data/enums/booleanString'

export default function getOverviewStatuses(
  prisonerData: Prisoner,
  inmateDetail: InmateDetail,
  learnerNeurodivergence: Result<LearnerNeurodivergence[]>,
  hasNeedsForAdditionalSupport: Result<HasNeed>,
  scheduledTransfers: PrisonerPrisonSchedule[] | null,
): OverviewStatus[] {
  return [
    getLocationStatus(prisonerData),
    getListenerStatus(inmateDetail),
    getNeurodiversitySupportStatus(learnerNeurodivergence),
    getAdditionalSupportNeedsStatus(hasNeedsForAdditionalSupport),
    getScheduledTransferStatus(scheduledTransfers),
  ].filter(Boolean)
}

function getLocationStatus(prisonerData: Prisoner): OverviewStatus {
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

function getListenerStatus(inmateDetail: InmateDetail): OverviewStatus {
  const recognised = getProfileInformationValue(
    ProfileInformationType.RecognisedListener,
    inmateDetail.profileInformation,
  )
  const suitable = getProfileInformationValue(ProfileInformationType.SuitableListener, inmateDetail.profileInformation)

  if (recognised === BooleanString.Yes) {
    return { label: 'Recognised Listener' }
  }

  if (suitable === BooleanString.Yes) {
    return { label: 'Suitable Listener' }
  }

  return null
}

function getNeurodiversitySupportStatus(learnerNeurodivergence: Result<LearnerNeurodivergence[]>): OverviewStatus {
  const supportNeededStatus = { label: 'Support needed', subText: 'Has neurodiversity needs' }
  const supportNeededErrorStatus = { label: 'Support needs unavailable', subText: 'Try again later', error: true }
  return learnerNeurodivergence.handle({
    fulfilled: it => it?.length && supportNeededStatus,
    rejected: () => supportNeededErrorStatus,
  })
}

function getAdditionalSupportNeedsStatus(hasNeedsForAdditionalSupport: Result<HasNeed>): OverviewStatus | null {
  return hasNeedsForAdditionalSupport.handle({
    fulfilled(value: HasNeed): OverviewStatus | null {
      if (value?.hasNeed) {
        return {
          label: 'Has additional needs',
          subText: 'View details',
          subTextHref: value.url,
        }
      }
      return null
    },
    rejected(): OverviewStatus {
      return {
        label: 'Additional needs unavailable',
        subText: 'Try again later',
        error: true,
      }
    },
  })
}

function getScheduledTransferStatus(scheduledTransfers: PrisonerPrisonSchedule[] | null): OverviewStatus {
  return (
    scheduledTransfers?.length > 0 && {
      label: 'Scheduled transfer',
      subText: `To ${scheduledTransfers[0].eventLocation}`,
    }
  )
}
