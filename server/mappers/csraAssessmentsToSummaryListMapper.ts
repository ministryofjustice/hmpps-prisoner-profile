import { CsraAssessment } from '../interfaces/prisonApi/csraAssessment'
import { AgencyLocationDetails } from '../interfaces/prisonApi/agencies'
import getCsraClassificationName from './getCsraClassificationName'

interface CsraSummary {
  classification: string
  assessmentDate: string
  assessmentComment: string
  location: string
  assessmentSeq: number
  bookingId: number
  offenderNo: string
}
export default (csraAssessments: CsraAssessment[], agencies: AgencyLocationDetails[]): CsraSummary[] =>
  csraAssessments.map(csra => ({
    assessmentDate: csra.assessmentDate,
    assessmentComment: csra.assessmentComment || 'Not entered',
    classification: getCsraClassificationName(csra.classificationCode),
    location: agencies.find(agency => agency.agencyId === csra.assessmentAgencyId)?.description || 'Not entered',
    assessmentSeq: csra.assessmentSeq,
    bookingId: csra.bookingId,
    offenderNo: csra.offenderNo,
  }))
