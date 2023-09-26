import { CsraAssessment } from '../interfaces/prisonApi/csraAssessment'
import { AgencyLocationDetails } from '../interfaces/prisonApi/agencies'
import getCsraClassificationName from './getCsraClassificationName'

export interface CsraSummary extends CsraAssessment {
  classification: string
  location: string
}
export default (csraAssessments: CsraAssessment[], agencies: AgencyLocationDetails[]): CsraSummary[] =>
  csraAssessments.map(csra => ({
    ...csra,
    assessmentComment: csra.assessmentComment || 'Not entered',
    classification: getCsraClassificationName(csra.classificationCode),
    location: agencies.find(agency => agency.agencyId === csra.assessmentAgencyId)?.description || 'Not entered',
  }))
