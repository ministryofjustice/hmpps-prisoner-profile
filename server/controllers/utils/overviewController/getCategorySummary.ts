import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'
import InmateDetail from '../../../data/interfaces/prisonApi/InmateDetail'
import OverviewPageData from '../../interfaces/OverviewPageData'
import { AssessmentCode } from '../../../data/enums/assessmentCode'
import { formatCategoryCodeDescription } from '../../../utils/utils'

export default function getCategorySummary(
  { assessments }: Prisoner,
  inmateDetail: InmateDetail,
  userCanManage: boolean | undefined,
): OverviewPageData['categorySummary'] {
  const category = assessments?.find(assessment => assessment.assessmentCode === AssessmentCode.category)

  return {
    codeDescription: formatCategoryCodeDescription(category?.classificationCode, inmateDetail.category),
    nextReviewDate: category?.nextReviewDate,
    userCanManage: !!userCanManage,
  }
}
