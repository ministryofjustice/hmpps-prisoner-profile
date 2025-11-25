import { format, startOfToday, sub } from 'date-fns'
import { AbsenceOutcomeCodes } from '../data/enums/absenceOutcomeCodes'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import GovSummaryItem, { GovSummaryGroup } from '../interfaces/GovSummaryItem'

import OffenderActivitiesHistory from '../data/interfaces/prisonApi/OffenderActivitiesHistory'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { properCaseName } from '../utils/utils'
import { formatDate } from '../utils/dateHelpers'
import { CuriousRestClientBuilder, RestClientBuilder } from '../data'
import PersonalLearningPlanService from './personalLearningPlanService'
import { PersonalLearningPlanActionPlan } from './interfaces/educationAndWorkPlanApiPersonalLearningPlanService/PersonalLearningPlanGoals'
import CuriousGoals from './interfaces/workAndSkillsPageService/CuriousGoals'
import toCuriousGoals from './mappers/curiousGoalsMapper'
import LearnerEmployabilitySkills from '../data/interfaces/curiousApi/LearnerEmployabilitySkills'
import CuriousApiClient from '../data/interfaces/curiousApi/curiousApiClient'
import { Assessment, LearnerLatestAssessment } from '../data/interfaces/curiousApi/LearnerLatestAssessment'
import { Result } from '../utils/result/result'
import { CuriousApiToken } from '../data/hmppsAuthClient'

export interface WorkAndSkillsData {
  learnerEmployabilitySkills: Result<LearnerEmployabilitySkills>
  learnerLatestAssessments: Result<Array<Array<GovSummaryGroup>>>
  curiousGoals: Result<CuriousGoals>
  workAndSkillsPrisonerName: string
  offenderActivitiesHistory: ActivitiesHistoryData
  unacceptableAbsences: UnacceptableAttendanceData
  personalLearningPlanActionPlan: PersonalLearningPlanActionPlan
}

interface ActivitiesHistoryData {
  activitiesHistory: Array<GovSummaryItem>
}

interface UnacceptableAttendanceData {
  unacceptableAbsenceLastSixMonths: number
  unacceptableAbsenceLastMonth: number
}

export default class WorkAndSkillsPageService {
  constructor(
    private readonly curiousApiClientBuilder: CuriousRestClientBuilder<CuriousApiClient>,
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly personalLearningPlanService: PersonalLearningPlanService,
    private readonly curiousApiTokenBuilder: () => Promise<CuriousApiToken>,
  ) {}

  public async get(
    token: string,
    prisonerData: Prisoner,
    apiErrorCallback: (error: Error) => void = () => null,
  ): Promise<WorkAndSkillsData> {
    const curiousApiToken = await this.curiousApiTokenBuilder()
    const curiousApiClient = this.curiousApiClientBuilder(curiousApiToken)
    const prisonApiClient = this.prisonApiClientBuilder(token)
    const { prisonerNumber, firstName, lastName } = prisonerData
    const workAndSkillsPrisonerName = `${properCaseName(firstName)} ${properCaseName(lastName)}`

    const [
      learnerEmployabilitySkills,
      learnerLatestAssessments,
      curiousGoals,
      offenderActivitiesHistory,
      unacceptableAbsences,
      personalLearningPlanActionPlan,
    ] = await Promise.all([
      this.getLearnerEmployabilitySkills(prisonerNumber, curiousApiClient, apiErrorCallback),
      this.getLearnerLatestAssessments(prisonerNumber, curiousApiClient, apiErrorCallback),
      this.getCuriousGoals(prisonerNumber, curiousApiClient, apiErrorCallback),
      this.getOffenderActivitiesHistory(prisonerNumber, prisonApiClient),
      this.getOffenderAttendanceHistoryStats(prisonerNumber, prisonApiClient),
      this.getPersonalLearningPlanActionPlan(prisonerNumber, token),
    ])

    return {
      learnerEmployabilitySkills,
      learnerLatestAssessments,
      curiousGoals,
      workAndSkillsPrisonerName,
      offenderActivitiesHistory,
      unacceptableAbsences,
      personalLearningPlanActionPlan,
    }
  }

  private async getOffenderAttendanceHistoryStats(
    prisonerNumber: string,
    prisonApiClient: PrisonApiClient,
  ): Promise<UnacceptableAttendanceData> {
    const todaysDate = format(startOfToday(), 'yyyy-MM-dd')
    const sixMonthsAgo = format(sub(startOfToday(), { months: 6 }), 'yyyy-MM-dd')
    const oneMonthAgo = format(sub(startOfToday(), { months: 1 }), 'yyyy-MM-dd')
    const offenderAttendanceHistory = await prisonApiClient.getOffenderAttendanceHistory(
      prisonerNumber,
      sixMonthsAgo,
      todaysDate,
    )

    let unacceptableAbsenceLastSixMonths = 0
    let unacceptableAbsenceLastMonth = 0

    if (offenderAttendanceHistory !== undefined && offenderAttendanceHistory.content.length) {
      offenderAttendanceHistory.content.forEach(absence => {
        if (absence.outcome !== undefined && absence.outcome === AbsenceOutcomeCodes.UNACAB) {
          unacceptableAbsenceLastSixMonths += 1
          if (absence.eventDate > oneMonthAgo) {
            unacceptableAbsenceLastMonth += 1
          }
        }
      })
    }

    return { unacceptableAbsenceLastSixMonths, unacceptableAbsenceLastMonth }
  }

  private async getOffenderActivitiesHistory(
    prisonerNumber: string,
    prisonApiClient: PrisonApiClient,
  ): Promise<ActivitiesHistoryData> {
    const today = format(startOfToday(), 'yyyy-MM-dd')
    // API returns results that have not ended or have an end date after the given date
    const offenderActivitiesHistory: OffenderActivitiesHistory = await prisonApiClient.getOffenderActivitiesHistory(
      prisonerNumber,
      today,
    )
    const activitiesHistory: GovSummaryItem[] = []
    if (offenderActivitiesHistory !== undefined && offenderActivitiesHistory.content?.length) {
      offenderActivitiesHistory.content.forEach(content => {
        const item = {
          key: { text: content.description },
          value: { text: `Started on ${formatDate(content.startDate, 'long')}` },
        }
        activitiesHistory.push(item)
      })
    }
    return { activitiesHistory }
  }

  private async getLearnerEmployabilitySkills(
    prisonerNumber: string,
    curiousApiClient: CuriousApiClient,
    apiErrorCallback: (error: Error) => void,
  ): Promise<Result<LearnerEmployabilitySkills>> {
    return Result.wrap(curiousApiClient.getLearnerEmployabilitySkills(prisonerNumber), apiErrorCallback)
  }

  private async getLearnerLatestAssessments(
    prisonerNumber: string,
    curiousApiClient: CuriousApiClient,
    apiErrorCallback: (error: Error) => void,
  ): Promise<Result<GovSummaryGroup[][]>> {
    return (await Result.wrap(curiousApiClient.getLearnerLatestAssessments(prisonerNumber), apiErrorCallback)).map(
      assessments => (assessments ? this.mapAssessmentsToSummaryGroups(assessments) : []),
    )
  }

  private mapAssessmentsToSummaryGroups(learnerLatestAssessments: LearnerLatestAssessment[]): GovSummaryGroup[][] {
    const multiListArray: GovSummaryGroup[][] = []

    if (learnerLatestAssessments) {
      const list: GovSummaryGroup[] = []
      ;((learnerLatestAssessments?.at(0)?.qualifications || []) as Array<Assessment>).forEach(content => {
        const type = {
          key: { text: content.qualification.qualificationType },
          value: { text: content.qualification.qualificationGrade },
        }
        const date = {
          key: { text: 'Assessment date' },
          value: { text: formatDate(content.qualification.assessmentDate, 'long') },
        }
        const location = { key: { text: 'Assessment location' }, value: { text: content.establishmentName } }
        list.push({ type, date, location })
      })
      multiListArray.push(list)
    }

    return multiListArray
  }

  private async getCuriousGoals(
    prisonerNumber: string,
    curiousApiClient: CuriousApiClient,
    apiErrorCallback: (error: Error) => void,
  ): Promise<Result<CuriousGoals>> {
    return (await Result.wrap(curiousApiClient.getLearnerGoals(prisonerNumber), apiErrorCallback)).map(goals =>
      goals ? toCuriousGoals(goals) : emptyCuriousGoals(prisonerNumber),
    )
  }

  private async getPersonalLearningPlanActionPlan(
    prisonerNumber: string,
    token: string,
  ): Promise<PersonalLearningPlanActionPlan> {
    return this.personalLearningPlanService.getPrisonerActionPlan(prisonerNumber, token)
  }
}

const emptyCuriousGoals = (prisonerNumber: string): CuriousGoals => {
  return {
    prisonerNumber,
    employmentGoals: [],
    personalGoals: [],
    longTermGoals: [],
    shortTermGoals: [],
  }
}
