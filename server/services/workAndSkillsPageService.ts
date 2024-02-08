import { format, startOfToday, sub } from 'date-fns'
import { AbsenceOutcomeCodes } from '../data/enums/absenceOutcomeCodes'
import { CuriousApiClient } from '../data/interfaces/curiousApiClient'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { GovSummaryGroup, GovSummaryItem } from '../interfaces/govSummaryItem'
import { LearnerEducation } from '../interfaces/learnerEducation'
import { LearnerEmployabilitySkills } from '../interfaces/learnerEmployabilitySkills'
import { LearnerLatestAssessment } from '../interfaces/learnerLatestAssessments'
import { LearnerNeurodivergence } from '../interfaces/learnerNeurodivergence'
import { LearnerProfile } from '../interfaces/learnerProfile'
import { OffenderActivitiesHistory } from '../interfaces/offenderActivitiesHistory'
import { Prisoner } from '../interfaces/prisoner'
import { properCaseName } from '../utils/utils'
import { formatDate } from '../utils/dateHelpers'
import { RestClientBuilder } from '../data'
import PersonalLearningPlanService from './personalLearningPlanService'
import { PersonalLearningPlanActionPlan } from '../interfaces/personalLearningPlanGoals'
import logger from '../../logger'
import { CuriousGoals } from '../interfaces/curiousGoals'
import toCuriousGoals from '../interfaces/mappers/curiousGoalsMapper'

interface WorkAndSkillsData {
  learnerEmployabilitySkills: LearnerEmployabilitySkills
  learnerProfiles: Array<LearnerProfile>
  learnerEducation: Array<GovSummaryItem>
  learnerLatestAssessments: Array<Array<GovSummaryGroup>>
  curiousGoals: CuriousGoals
  learnerNeurodivergence: Array<LearnerNeurodivergence>
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
    private readonly curiousApiClientBuilder: RestClientBuilder<CuriousApiClient>,
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly personalLearningPlanService: PersonalLearningPlanService,
  ) {}

  public async get(token: string, prisonerData: Prisoner): Promise<WorkAndSkillsData> {
    const curiousApiClient = this.curiousApiClientBuilder(token)
    const prisonApiClient = this.prisonApiClientBuilder(token)
    const { prisonerNumber, firstName, lastName } = prisonerData
    const workAndSkillsPrisonerName = `${properCaseName(firstName)} ${properCaseName(lastName)}`

    const [
      learnerEmployabilitySkills,
      learnerProfiles,
      learnerEducation,
      learnerLatestAssessments,
      curiousGoals,
      learnerNeurodivergence,
      offenderActivitiesHistory,
      unacceptableAbsences,
      personalLearningPlanActionPlan,
    ] = await Promise.all([
      this.getLearnerEmployabilitySkills(prisonerNumber, curiousApiClient),
      this.getLearnerProfiles(prisonerNumber, curiousApiClient),
      this.getLearnerEducation(prisonerNumber, curiousApiClient),
      this.getLearnerLatestAssessments(prisonerNumber, curiousApiClient),
      this.getCuriousGoals(prisonerNumber, curiousApiClient),
      this.getLearnerNeurodivergence(prisonerNumber, curiousApiClient),
      this.getOffenderActivitiesHistory(prisonerNumber, prisonApiClient),
      this.getOffenderAttendanceHistoryStats(prisonerNumber, prisonApiClient),
      this.getPersonalLearningPlanActionPlan(prisonerNumber, token),
    ])

    return {
      learnerEmployabilitySkills,
      learnerProfiles,
      learnerEducation,
      learnerLatestAssessments,
      curiousGoals,
      learnerNeurodivergence,
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
  ): Promise<LearnerEmployabilitySkills> {
    const learnerEmployabilitySkills: LearnerEmployabilitySkills =
      await curiousApiClient.getLearnerEmployabilitySkills(prisonerNumber)
    return learnerEmployabilitySkills
  }

  private async getLearnerProfiles(
    prisonerNumber: string,
    curiousApiClient: CuriousApiClient,
  ): Promise<LearnerProfile[]> {
    const learnerProfiles: LearnerProfile[] = await curiousApiClient.getLearnerProfile(prisonerNumber)
    return learnerProfiles
  }

  private async getLearnerEducation(
    prisonerNumber: string,
    curiousApiClient: CuriousApiClient,
  ): Promise<GovSummaryItem[]> {
    const learnerEducation: LearnerEducation = await curiousApiClient.getLearnerEducation(prisonerNumber)
    const coursesAndQualifications: GovSummaryItem[] = []
    learnerEducation?.content?.forEach(content => {
      const item = {
        key: { text: content.courseName },
        value: { text: `Planned end date on ${formatDate(content.learningPlannedEndDate, 'long')}` },
      }
      coursesAndQualifications.push(item)
    })
    return coursesAndQualifications
  }

  private async getLearnerLatestAssessments(
    prisonerNumber: string,
    curiousApiClient: CuriousApiClient,
  ): Promise<GovSummaryGroup[][]> {
    const learnerLatestAssessments: LearnerLatestAssessment[] =
      await curiousApiClient.getLearnerLatestAssessments(prisonerNumber)

    const multiListArray: GovSummaryGroup[][] = []

    if (learnerLatestAssessments) {
      const list: GovSummaryGroup[] = []
      learnerLatestAssessments[0]?.qualifications?.forEach(content => {
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

  private async getCuriousGoals(prisonerNumber: string, curiousApiClient: CuriousApiClient): Promise<CuriousGoals> {
    try {
      const learnerGoals = await curiousApiClient.getLearnerGoals(prisonerNumber)
      return learnerGoals ? toCuriousGoals(learnerGoals) : emptyCuriousGoals(prisonerNumber)
    } catch (error) {
      logger.error(`Error calling the Curious API to get the prisoner's goals`, error)
      return { problemRetrievingData: true } as CuriousGoals
    }
  }

  private async getPersonalLearningPlanActionPlan(
    prisonerNumber: string,
    token: string,
  ): Promise<PersonalLearningPlanActionPlan> {
    return this.personalLearningPlanService.getPrisonerActionPlan(prisonerNumber, token)
  }

  private async getLearnerNeurodivergence(
    prisonerNumber: string,
    curiousApiClient: CuriousApiClient,
  ): Promise<LearnerNeurodivergence[]> {
    const learnerNeurodivergence: LearnerNeurodivergence[] =
      await curiousApiClient.getLearnerNeurodivergence(prisonerNumber)
    return learnerNeurodivergence
  }
}

const emptyCuriousGoals = (prisonerNumber: string): CuriousGoals => {
  return {
    prisonerNumber,
    employmentGoals: [],
    personalGoals: [],
    longTermGoals: [],
    shortTermGoals: [],
    problemRetrievingData: false,
  }
}
