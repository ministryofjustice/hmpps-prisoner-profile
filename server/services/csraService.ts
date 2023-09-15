import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { CsraAssessment } from '../interfaces/prisonApi/csraAssessment'
import { AgencyLocationDetails } from '../interfaces/prisonApi/agencies'
import { StaffDetails } from '../interfaces/prisonApi/staffDetails'

interface AssessmentViewModel {
  csraAssessment: CsraAssessment
  agencyDetails: AgencyLocationDetails
  staffDetails: StaffDetails
}
export default class CsraService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  async getCsraAssessment(token: string, bookingId: number, assessmentSeq: number): Promise<AssessmentViewModel> {
    const prisonApi = this.prisonApiClientBuilder(token)
    const csraAssessment = await prisonApi.getCsraAssessment(bookingId, assessmentSeq)

    const { assessmentAgencyId, assessorUser } = csraAssessment
    const [agencyDetails, staffDetails] = await Promise.all([
      assessmentAgencyId ? prisonApi.getAgencyDetails(assessmentAgencyId) : null,
      assessorUser ? prisonApi.getStaffDetails(assessorUser) : null,
    ])

    return { csraAssessment, agencyDetails, staffDetails }
  }
}
