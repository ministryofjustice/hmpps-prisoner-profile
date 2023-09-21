import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { CsraAssessment } from '../interfaces/prisonApi/csraAssessment'
import { AgencyLocationDetails } from '../interfaces/prisonApi/agencies'
import { StaffDetails } from '../interfaces/prisonApi/staffDetails'
import { sortByDateTime } from '../utils/utils'
import { CsraSummary } from '../mappers/csraAssessmentsToSummaryListMapper'
import { parseDate } from '../utils/dateHelpers'

interface AssessmentViewModel {
  csraAssessment: CsraAssessment
  agencyDetails: AgencyLocationDetails
  staffDetails: StaffDetails
}
export default class CsraService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  async getCsraHistory(token: string, prisonerNumber: string): Promise<CsraAssessment[]> {
    const prisonApi = this.prisonApiClientBuilder(token)

    const csraAssessments = await prisonApi.getCsraAssessmentsForPrisoner(prisonerNumber)

    return csraAssessments
      .filter(assessment => !!assessment.classificationCode)
      .sort((left, right) => sortByDateTime(right.assessmentDate, left.assessmentDate))
  }

  filterCsraAssessments(
    csraAssessments: CsraSummary[],
    filters: {
      csra?: CsraAssessment['classificationCode'] | CsraAssessment['classificationCode'][]
      location?: string | string[]
      from?: string
      to?: string
    },
  ): CsraSummary[] {
    return csraAssessments.filter(assessment => {
      const { assessmentAgencyId, classificationCode, assessmentDate } = assessment
      const csraFilters = [filters.csra].flat()
      const locationFilters = [filters.location].flat()
      const csraDate = new Date(assessmentDate)

      if (filters.from && parseDate(filters.from) > csraDate) return false
      if (filters.to && parseDate(filters.to) < csraDate) return false
      if (filters.csra && !csraFilters.includes(classificationCode)) return false
      if (filters.location && !locationFilters.includes(assessmentAgencyId)) return false

      return true
    })
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
