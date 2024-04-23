import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'
import InmateDetail from '../../../data/interfaces/prisonApi/InmateDetail'
import OverviewPageData from '../../interfaces/OverviewPageData'
import { AssessmentCode } from '../../../data/enums/assessmentCode'
import { formatCategoryCodeDescription, userHasRoles } from '../../../utils/utils'
import { Role } from '../../../data/enums/role'

export default function getCategorySummary(
  { assessments }: Prisoner,
  inmateDetail: InmateDetail,
  userRoles: string[],
): OverviewPageData['categorySummary'] {
  const category = assessments?.find(assessment => assessment.assessmentCode === AssessmentCode.category)
  const userCanManage = userHasRoles(
    [Role.CreateRecategorisation, Role.ApproveCategorisation, Role.CreateRecategorisation, Role.CategorisationSecurity],
    userRoles,
  )

  return {
    codeDescription: formatCategoryCodeDescription(category?.classificationCode, inmateDetail.category),
    nextReviewDate: category?.nextReviewDate,
    userCanManage,
  }
}
