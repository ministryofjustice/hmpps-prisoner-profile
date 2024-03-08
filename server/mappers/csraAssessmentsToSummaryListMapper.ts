import { AgencyDetails } from '../data/interfaces/prisonApi/Agency'
import getCsraClassificationName from './getCsraClassificationName'
import { CsraAssessmentSummary } from '../data/interfaces/prisonApi/CsraAssessment'

export interface CsraSummary extends CsraAssessmentSummary {
  classification: string
  location: string
}
export default (csraAssessments: CsraAssessmentSummary[], agencies: AgencyDetails[]): CsraSummary[] =>
  csraAssessments.map(csra => ({
    ...csra,
    assessmentComment: csra.assessmentComment || 'Not entered',
    classification: getCsraClassificationName(csra.classificationCode),
    location: agencies.find(agency => agency.agencyId === csra.assessmentAgencyId)?.description || 'Not entered',
  }))
