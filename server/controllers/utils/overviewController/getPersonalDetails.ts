import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'
import InmateDetail from '../../../data/interfaces/prisonApi/InmateDetail'
import PrisonerDetail from '../../../data/interfaces/prisonApi/PrisonerDetail'
import OverviewPageData from '../../interfaces/OverviewPageData'
import { calculateAge, convertToTitleCase } from '../../../utils/utils'
import { formatDate } from '../../../utils/dateHelpers'

export default function getPersonalDetails(
  prisonerData: Prisoner,
  inmateDetail: InmateDetail,
  prisonerDetail: PrisonerDetail,
): OverviewPageData['personalDetails'] {
  return {
    personalDetailsMain: {
      preferredName: prisonerData.firstName ? `${convertToTitleCase(prisonerData.firstName)}` : null,
      dateOfBirth: prisonerData.dateOfBirth ? formatDate(prisonerData.dateOfBirth, 'short') : null,
      age: prisonerData.dateOfBirth ? calculateAge(prisonerData.dateOfBirth) : null,
      nationality: prisonerData.nationality,
      spokenLanguage: inmateDetail.language,
    },
    personalDetailsSide: {
      ethnicGroup: getEthnicGroupText(prisonerDetail),
      religionOrBelief: prisonerData.religion,
      croNumber: prisonerData.croNumber,
      pncNumber: prisonerData.pncNumber,
    },
  }
}

function getEthnicGroupText(prisonerDetail: PrisonerDetail): string {
  const { ethnicity, ethnicityCode } = prisonerDetail

  if (ethnicity && ethnicityCode) return `${prisonerDetail?.ethnicity} (${prisonerDetail.ethnicityCode})`
  if (ethnicity) return prisonerDetail?.ethnicity
  return null
}
