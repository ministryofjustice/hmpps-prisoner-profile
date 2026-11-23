import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'
import OverviewPageData from '../../interfaces/OverviewPageData'
import { AssessmentCode } from '../../../data/enums/assessmentCode'

export default function getCsraSummary({ assessments, currentCsra }: Prisoner): OverviewPageData['csraSummary'] {
  const csra = assessments?.find(assessment => assessment.assessmentDescription.includes(AssessmentCode.csra))

  return {
    classification: csra?.classification,
    assessmentDate: csra?.assessmentDate,
    currentCsra,
  }
}
