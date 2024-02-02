import { format, startOfToday, sub } from 'date-fns'
import { AbsenceOutcomeCodes } from '../data/enums/absenceOutcomeCodes'
import { CuriousApiClient } from '../data/interfaces/curiousApiClient'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { GovSummaryGroup, GovSummaryItem } from '../interfaces/govSummaryItem'
import { LearnerEducation } from '../interfaces/learnerEducation'
import { LearnerEmployabilitySkills } from '../interfaces/learnerEmployabilitySkills'
import { LearnerGoals } from '../interfaces/learnerGoals'
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

interface WorkAndSkillsData {
  learnerEmployabilitySkills: LearnerEmployabilitySkills
  learnerProfiles: Array<LearnerProfile>
  learnerEducation: Array<GovSummaryItem>
  learnerLatestAssessments: Array<Array<GovSummaryGroup>>
  learnerGoals: LearnerGoalsData
  learnerNeurodivergence: Array<LearnerNeurodivergence>
  workAndSkillsPrisonerName: string
  offenderActivitiesHistory: ActivitiesHistoryData
  unacceptableAbsences: UnacceptableAttendanceData
  personalLearningPlanActionPlan: PersonalLearningPlanActionPlan
}

interface LearnerGoalsData {
  employmentGoals: Array<GovSummaryItem>
  personalGoals: Array<GovSummaryItem>
  longTermGoals: Array<GovSummaryItem>
  shortTermGoals: Array<GovSummaryItem>
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
      learnerGoals: curiousGoals, // TODO - rename `learnerGoals` to `curiousGoals` in WorkAndSkillsData and downstream view dependencies.
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

  private async getCuriousGoals(prisonerNumber: string, curiousApiClient: CuriousApiClient): Promise<LearnerGoalsData> {
    const learnerGoals: LearnerGoals = await curiousApiClient.getLearnerGoals(prisonerNumber)

    let employmentGoals: GovSummaryItem[] = []
    let personalGoals: GovSummaryItem[] = []
    let longTermGoals: GovSummaryItem[] = []
    let shortTermGoals: GovSummaryItem[] = []

    if (learnerGoals?.employmentGoals) {
      employmentGoals = this.strArrayToGovList(learnerGoals.employmentGoals)
    }
    if (learnerGoals?.personalGoals) {
      personalGoals = this.strArrayToGovList(learnerGoals.personalGoals)
    }
    if (learnerGoals?.longTermGoals) {
      longTermGoals = this.strArrayToGovList(learnerGoals.longTermGoals)
    }
    if (learnerGoals?.shortTermGoals) {
      shortTermGoals = this.strArrayToGovList(learnerGoals.shortTermGoals)
    }

    return { employmentGoals, personalGoals, longTermGoals, shortTermGoals }
  }

  private async getPersonalLearningPlanActionPlan(
    prisonerNumber: string,
    token: string,
  ): Promise<PersonalLearningPlanActionPlan> {
    return this.personalLearningPlanService.getPrisonerActionPlan(prisonerNumber, token)
  }

  private strArrayToGovList(goals: string[]): GovSummaryItem[] {
    const govList: GovSummaryItem[] = []
    goals.forEach(content => {
      const item: GovSummaryItem = { key: { text: content }, value: { text: '' } }
      govList.push(item)
    })
    return govList
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
