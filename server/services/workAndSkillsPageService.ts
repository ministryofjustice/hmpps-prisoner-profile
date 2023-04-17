import { format, startOfToday, sub } from 'date-fns'
import { AbsenceOutcomeCodes } from '../data/enums/absenceOutcomeCodes'
import CuriousApiClient from '../data/interfaces/curiousApiClient'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { GovSummaryGroup, GovSummaryItem } from '../interfaces/govSummaryItem'
import { LearnerEducation } from '../interfaces/learnerEducation'
import { LearnerEmployabilitySkills } from '../interfaces/learnerEmployabilitySkills'
import { LearnerGoals } from '../interfaces/learnerGoals'
import { LearnerLatestAssessment } from '../interfaces/learnerLatestAssessments'
import { LearnerNeurodivergence } from '../interfaces/learnerNeurodivergence'
import { LearnerProfile } from '../interfaces/learnerProfile'
import { OffenderActivitiesHistory } from '../interfaces/offenderActivitiesHistory'
import { OffenderAttendanceHistory } from '../interfaces/offenderAttendanceHistory'
import { Prisoner } from '../interfaces/prisoner'
import { properCaseName } from '../utils/utils'
import { formatDate } from '../utils/dateHelpers'

export default class WorkAndSkillsPageService {
  private curiousApiClient: CuriousApiClient

  private prisonApiClient: PrisonApiClient

  constructor(curiousApiClient: CuriousApiClient, prisonApiClient: PrisonApiClient) {
    this.curiousApiClient = curiousApiClient
    this.prisonApiClient = prisonApiClient
  }

  public async get(prisonerData: Prisoner) {
    const { prisonerNumber, firstName, lastName } = prisonerData
    const prisonerName = `${properCaseName(firstName)} ${properCaseName(lastName)}`

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
      this.getLearnerEmployabilitySkills(prisonerNumber),
      this.getLearnerProfiles(prisonerNumber),
      this.getLearnerEducation(prisonerNumber),
      this.getLearnerLatestAssessments(prisonerNumber),
      this.getLearnerGoals(prisonerNumber),
      this.getLearnerNeurodivergence(prisonerNumber),
      this.getOffenderActivitiesHistory(prisonerNumber),
      this.getOffenderAttendanceHistoryStats(prisonerNumber),
    ])

    return {
      learnerEmployabilitySkills,
      learnerProfiles,
      learnerEducation,
      learnerLatestAssessments,
      learnerGoals,
      learnerNeurodivergence,
      prisonerName,
      offenderActivitiesHistory,
      unacceptableAbsences,
    }
  }

  private async getOffenderAttendanceHistoryStats(prisonerNumber: string) {
    const todaysDate = format(startOfToday(), 'yyyy-MM-dd')
    const sixMonthsAgo = format(sub(startOfToday(), { months: 6 }), 'yyyy-MM-dd')
    const oneMonthAgo = format(sub(startOfToday(), { months: 1 }), 'yyyy-MM-dd')
    const offenderAttendanceHistory: OffenderAttendanceHistory =
      await this.prisonApiClient.getOffenderAttendanceHistory(prisonerNumber, sixMonthsAgo, todaysDate)

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

  private async getOffenderActivitiesHistory(prisonerNumber: string) {
    const oneYearAgo = format(sub(startOfToday(), { months: 12 }), 'yyyy-MM-dd')
    const offenderActivitiesHistory: OffenderActivitiesHistory =
      await this.prisonApiClient.getOffenderActivitiesHistory(prisonerNumber, oneYearAgo)
    const activitiesHistory: GovSummaryItem[] = []
    if (offenderActivitiesHistory !== undefined && offenderActivitiesHistory.content.length) {
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

  private async getLearnerEmployabilitySkills(prisonerNumber: string) {
    const learnerEmployabilitySkills: LearnerEmployabilitySkills =
      await this.curiousApiClient.getLearnerEmployabilitySkills(prisonerNumber)
    return learnerEmployabilitySkills
  }

  private async getLearnerProfiles(prisonerNumber: string) {
    const learnerProfiles: LearnerProfile[] = await this.curiousApiClient.getLearnerProfile(prisonerNumber)
    return learnerProfiles
  }

  private async getLearnerEducation(prisonerNumber: string) {
    const learnerEducation: LearnerEducation = await this.curiousApiClient.getLearnerEducation(prisonerNumber)
    const coursesAndQualifications: GovSummaryItem[] = []
    if (learnerEducation !== undefined) {
      learnerEducation.content.forEach(content => {
        const item = {
          key: { text: content.courseName },
          value: { text: `Planned end date on ${formatDate(content.learningPlannedEndDate, 'long')}` },
        }
        coursesAndQualifications.push(item)
      })
    }
    return coursesAndQualifications
  }

  private async getLearnerLatestAssessments(prisonerNumber: string) {
    const learnerLatestAssessments: LearnerLatestAssessment[] = await this.curiousApiClient.getLearnerLatestAssessments(
      prisonerNumber,
    )

    const multiListArray: GovSummaryGroup[][] = []

    if (learnerLatestAssessments !== undefined) {
      const list: GovSummaryGroup[] = []
      learnerLatestAssessments[0].qualifications.forEach(content => {
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

  private async getLearnerGoals(prisonerNumber: string) {
    const learnerGoals: LearnerGoals = await this.curiousApiClient.getLearnerGoals(prisonerNumber)

    let employmentGoals: GovSummaryItem[] = []
    let personalGoals: GovSummaryItem[] = []
    let longTermGoals: GovSummaryItem[] = []
    let shortTermGoals: GovSummaryItem[] = []

    if (learnerGoals !== undefined) {
      employmentGoals = this.strArrayToGovList(learnerGoals.employmentGoals)
      personalGoals = this.strArrayToGovList(learnerGoals.personalGoals)
      longTermGoals = this.strArrayToGovList(learnerGoals.longTermGoals)
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

  private async getLearnerNeurodivergence(prisonerNumber: string) {
    const learnerNeurodivergence: LearnerNeurodivergence[] = await this.curiousApiClient.getLearnerNeurodivergence(
      prisonerNumber,
    )
    return learnerNeurodivergence
  }
}
