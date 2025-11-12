import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'
import InmateDetail from '../../../data/interfaces/prisonApi/InmateDetail'
import OverviewPageData from '../../interfaces/OverviewPageData'
import { calculateAge } from '../../../utils/utils'
import { formatDate } from '../../../utils/dateHelpers'
import PhysicalAttributes from '../../../data/interfaces/prisonApi/PhysicalAttributes'

export default function getPersonalDetails(
  prisonerData: Prisoner,
  inmateDetail: InmateDetail,
): OverviewPageData['personalDetails'] {
  return {
    personalDetailsMain: {
      dateOfBirth: prisonerData.dateOfBirth ? formatDate(prisonerData.dateOfBirth, 'short') : null,
      age: prisonerData.dateOfBirth ? calculateAge(prisonerData.dateOfBirth) : null,
      nationality: prisonerData.nationality,
      spokenLanguage: inmateDetail.language,
    },
    personalDetailsSide: {
      ethnicGroup: getEthnicGroupText(inmateDetail.physicalAttributes),
      religionOrBelief: prisonerData.religion,
      croNumber: prisonerData.croNumber,
      pncNumber: prisonerData.pncNumber,
    },
  }
}

function getEthnicGroupText({ ethnicity, raceCode: ethnicityCode }: PhysicalAttributes): string {
  if (ethnicity && ethnicityCode) return `${ethnicity} (${ethnicityCode})`
  if (ethnicity) return ethnicity
  return null
}
