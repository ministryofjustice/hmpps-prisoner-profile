import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'
import OverviewPageData from '../../interfaces/OverviewPageData'
import { AssessmentCode } from '../../../data/enums/assessmentCode'

export default function getCsraSummary({ assessments }: Prisoner): OverviewPageData['csraSummary'] {
  const csra = assessments?.find(assessment => assessment.assessmentDescription.includes(AssessmentCode.csra))

  return {
    classification: csra?.classification,
    assessmentDate: csra?.assessmentDate,
  }
}
