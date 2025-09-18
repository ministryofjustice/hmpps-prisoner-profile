import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import CsraAssessment, { CsraAssessmentSummary } from '../data/interfaces/prisonApi/CsraAssessment'
import { AgencyDetails } from '../data/interfaces/prisonApi/Agency'
import StaffDetails from '../data/interfaces/prisonApi/StaffDetails'
import { sortByDateTime } from '../utils/utils'
import { CsraSummary } from '../mappers/csraAssessmentsToSummaryListMapper'
import { parseDate } from '../utils/dateHelpers'

interface AssessmentViewModel {
  csraAssessment: CsraAssessment
  agencyDetails: AgencyDetails
  staffDetails: StaffDetails
}

interface AssessmentListViewModel extends CsraAssessment {
  classification: string
  location: string
}

export default class CsraService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  async getCsraHistory(token: string, prisonerNumber: string): Promise<CsraAssessmentSummary[]> {
    const prisonApi = this.prisonApiClientBuilder(token)

    const csraAssessments = await prisonApi.getCsraAssessmentsForPrisoner(prisonerNumber)

    return csraAssessments
      .filter(assessment => assessment.classificationCode)
      .sort((left, right) => sortByDateTime(right.assessmentDate, left.assessmentDate))
  }

  filterCsraAssessments(
    csraAssessments: CsraSummary[],
    filters: {
      csra?: CsraAssessmentSummary['classificationCode'] | CsraAssessmentSummary['classificationCode'][]
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
      return !(filters.location && !locationFilters.includes(assessmentAgencyId))
    })
  }

  async getDetailsForAssessments(token: string, summaries: CsraSummary[]): Promise<AssessmentListViewModel[]> {
    const prisonApi = this.prisonApiClientBuilder(token)
    return Promise.all(
      summaries.map(async summary => {
        const { location, classification } = summary
        const assessment = await prisonApi.getCsraAssessment(summary.bookingId, summary.assessmentSeq)
        return { ...assessment, location, classification }
      }),
    )
  }

  async getAgenciesForCsraAssessments(
    token: string,
    csraAssessments: CsraAssessmentSummary[],
  ): Promise<AgencyDetails[]> {
    const prisonApiClient = this.prisonApiClientBuilder(token)
    const agencyIds = [...new Set(csraAssessments.map(assessment => assessment.assessmentAgencyId))]

    return Promise.all(
      agencyIds.filter(agencyId => agencyId).map(agencyId => prisonApiClient.getAgencyDetails(agencyId)),
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
