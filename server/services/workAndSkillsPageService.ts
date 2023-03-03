import CuriousApiClient from '../data/interfaces/curiousApiClient'
import { LearnerEducation } from '../interfaces/learnerEducation'
import { LearnerEmployabilitySkills } from '../interfaces/learnerEmployabilitySkills'
import { LearnerGoals } from '../interfaces/learnerGoals'
import { LearnerLatestAssessment } from '../interfaces/learnerLatestAssessments'
import { LearnerNeurodivergence } from '../interfaces/learnerNeurodivergence'
import { LearnerProfile } from '../interfaces/learnerProfile'
import { Prisoner } from '../interfaces/prisoner'

export default class WorkAndSkillsPageService {
  private curiousApiClient: CuriousApiClient

  constructor(curiousApiClient: CuriousApiClient) {
    this.curiousApiClient = curiousApiClient
  }

  public async get(prisonerData: Prisoner) {
    const { prisonerNumber } = prisonerData

    const learnerEmployabilitySkills = await this.getLearnerEmployabilitySkills(prisonerNumber)
    const learnerProfiles = await this.getLearnerProfiles(prisonerNumber)
    const learnerEducation = await this.getLearnerEducation(prisonerNumber)
    const learnerLatestAssessments = await this.getLearnerLatestAssessments(prisonerNumber)
    const learnerGoals = await this.getLearnerGoals(prisonerNumber)
    const learnerNeurodivergence = await this.getLearnerNeurodivergence(prisonerNumber)

    return {
      learnerEmployabilitySkills,
      learnerProfiles,
      learnerEducation,
      learnerLatestAssessments,
      learnerGoals,
      learnerNeurodivergence,
    }
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
    const learnerEducation: LearnerEducation[] = await this.curiousApiClient.getLearnerEducation(prisonerNumber)
    return learnerEducation
  }

  private async getLearnerLatestAssessments(prisonerNumber: string) {
    const learnerLatestAssessments: LearnerLatestAssessment[] = await this.curiousApiClient.getLearnerLatestAssessments(
      prisonerNumber,
    )
    return learnerLatestAssessments
  }

  private async getLearnerGoals(prisonerNumber: string) {
    const learnerGoals: LearnerGoals = await this.curiousApiClient.getLearnerGoals(prisonerNumber)
    return learnerGoals
  }

  private async getLearnerNeurodivergence(prisonerNumber: string) {
    const learnerNeurodivergence: LearnerNeurodivergence[] = await this.curiousApiClient.getLearnerNeurodivergence(
      prisonerNumber,
    )
    return learnerNeurodivergence
  }
}
