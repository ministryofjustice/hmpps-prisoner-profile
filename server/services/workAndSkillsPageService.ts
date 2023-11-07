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

export default class WorkAndSkillsPageService {
  constructor(
    private readonly curiousApiClientBuilder: RestClientBuilder<CuriousApiClient>,
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
  ) {}

  public async get(token: string, prisonerData: Prisoner) {
    const curiousApiClient = this.curiousApiClientBuilder(token)
    const prisonApiClient = this.prisonApiClientBuilder(token)
    const { prisonerNumber, firstName, lastName } = prisonerData
    const workAndSkillsPrisonerName = `${properCaseName(firstName)} ${properCaseName(lastName)}`

    const [
      learnerEmployabilitySkills,
      learnerProfiles,
      learnerEducation,
      learnerLatestAssessments,
      learnerGoals,
      learnerNeurodivergence,
      offenderActivitiesHistory,
      unacceptableAbsences,
    ] = await Promise.all([
      this.getLearnerEmployabilitySkills(prisonerNumber, curiousApiClient),
      this.getLearnerProfiles(prisonerNumber, curiousApiClient),
      this.getLearnerEducation(prisonerNumber, curiousApiClient),
      this.getLearnerLatestAssessments(prisonerNumber, curiousApiClient),
      this.getLearnerGoals(prisonerNumber, curiousApiClient),
      this.getLearnerNeurodivergence(prisonerNumber, curiousApiClient),
      this.getOffenderActivitiesHistory(prisonerNumber, prisonApiClient),
      this.getOffenderAttendanceHistoryStats(prisonerNumber, prisonApiClient),
    ])

    return {
      learnerEmployabilitySkills,
      learnerProfiles,
      learnerEducation,
      learnerLatestAssessments,
      learnerGoals,
      learnerNeurodivergence,
      workAndSkillsPrisonerName,
      offenderActivitiesHistory,
      unacceptableAbsences,
    }
  }

  private async getOffenderAttendanceHistoryStats(prisonerNumber: string, prisonApiClient: PrisonApiClient) {
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

  private async getOffenderActivitiesHistory(prisonerNumber: string, prisonApiClient: PrisonApiClient) {
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

  private async getLearnerEmployabilitySkills(prisonerNumber: string, curiousApiClient: CuriousApiClient) {
    const learnerEmployabilitySkills: LearnerEmployabilitySkills =
      await curiousApiClient.getLearnerEmployabilitySkills(prisonerNumber)
    return learnerEmployabilitySkills
  }

  private async getLearnerProfiles(prisonerNumber: string, curiousApiClient: CuriousApiClient) {
    const learnerProfiles: LearnerProfile[] = await curiousApiClient.getLearnerProfile(prisonerNumber)
    return learnerProfiles
  }

  private async getLearnerEducation(prisonerNumber: string, curiousApiClient: CuriousApiClient) {
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

  private async getLearnerLatestAssessments(prisonerNumber: string, curiousApiClient: CuriousApiClient) {
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

  async getLearnerGoals(prisonerNumber: string, curiousApiClient: CuriousApiClient) {
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

  private strArrayToGovList(goals: string[]) {
    const govList: GovSummaryItem[] = []
    goals.forEach(content => {
      const item: GovSummaryItem = { key: { text: content }, value: { text: '' } }
      govList.push(item)
    })
    return govList
  }

  public async getLearnerNeurodivergence(prisonerNumber: string, curiousApiClient: CuriousApiClient) {
    const learnerNeurodivergence: LearnerNeurodivergence[] =
      await curiousApiClient.getLearnerNeurodivergence(prisonerNumber)
    return learnerNeurodivergence
  }
}
