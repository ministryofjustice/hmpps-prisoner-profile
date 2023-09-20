import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { CsraAssessment } from '../interfaces/prisonApi/csraAssessment'
import { AgencyLocationDetails } from '../interfaces/prisonApi/agencies'
import { StaffDetails } from '../interfaces/prisonApi/staffDetails'
import { sortByDateTime } from '../utils/utils'

interface AssessmentViewModel {
  csraAssessment: CsraAssessment
  agencyDetails: AgencyLocationDetails
  staffDetails: StaffDetails
}
export default class CsraService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  async getCsraHistory(
    token: string,
    prisonerNumber: string,
    filters: {
      csra?: CsraAssessment['classificationCode']
      location?: string
    } = {},
  ): Promise<CsraAssessment[]> {
    const prisonApi = this.prisonApiClientBuilder(token)

    const csraAssessments = await prisonApi.getCsraAssessmentsForPrisoner(prisonerNumber)

    return csraAssessments
      .filter(assessment => {
        const { assessmentAgencyId, classificationCode } = assessment
        if (!classificationCode) return false
        if (filters.csra && filters.location)
          return classificationCode === filters.csra && assessmentAgencyId === filters.location
        if (filters.csra) return classificationCode === filters.csra
        if (filters.location) return assessmentAgencyId === filters.location

        return true
      })
      .sort((left, right) => sortByDateTime(right.assessmentDate, left.assessmentDate))
  }

  async getAgenciesForCsraAssessments(
    token: string,
    csraAssessments: CsraAssessment[],
  ): Promise<AgencyLocationDetails[]> {
    const agencyIds = [...new Set(csraAssessments.map(assessment => assessment.assessmentAgencyId))]
    return Promise.all(
      agencyIds
        .filter(agencyId => agencyId)
        .map(agencyId => this.prisonApiClientBuilder(token).getAgencyDetails(agencyId)),
    )
  }

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
