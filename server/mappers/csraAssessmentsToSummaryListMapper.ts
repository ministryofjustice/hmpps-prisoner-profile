import { AgencyDetails } from '../interfaces/prisonApi/agencies'
import getCsraClassificationName from './getCsraClassificationName'
import { CsraAssessmentSummary } from '../interfaces/prisonApi/csraAssessmentSummary'

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
