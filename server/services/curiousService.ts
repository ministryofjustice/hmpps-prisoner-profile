import CuriousApiClient from '../data/interfaces/curiousApi/curiousApiClient'
import logger from '../../logger'
import { InPrisonCourseRecords } from './interfaces/curiousService/CuriousInPrisonCourses'
import { CuriousRestClientBuilder } from '../data'
import { CuriousApiToken } from '../data/hmppsAuthClient'
import toInPrisonCourseRecords from './mappers/inPrisonCourseRecordsMapper'
import { FunctionalSkills } from './interfaces/curiousService/CuriousFunctionalSkillsAssessments'
import toFunctionalSkills from './mappers/functionalSkillsMapper'

export default class CuriousService {
  constructor(
    private readonly curiousApiClientBuilder: CuriousRestClientBuilder<CuriousApiClient>,
    private readonly curiousApiTokenBuilder: () => Promise<CuriousApiToken>,
  ) {}

  /**
   * Returns the specified prisoner's In Prison Course Records
   */
  async getPrisonerInPrisonCourses(prisonNumber: string): Promise<InPrisonCourseRecords> {
    const curiousApiToken = await this.curiousApiTokenBuilder()

    try {
      const allPrisonerQualifications =
        await this.curiousApiClientBuilder(curiousApiToken).getLearnerQualifications(prisonNumber)
      return toInPrisonCourseRecords(allPrisonerQualifications)
    } catch (error) {
      logger.error('Error retrieving learner education data from Curious', error)
      throw error
    }
  }

  async getPrisonerFunctionalSkills(prisonNumber: string): Promise<FunctionalSkills> {
    const curiousApiToken = await this.curiousApiTokenBuilder()

    try {
      const allPrisonerAssessments =
        await this.curiousApiClientBuilder(curiousApiToken).getLearnerAssessments(prisonNumber)
      return toFunctionalSkills(allPrisonerAssessments)
    } catch (error) {
      logger.error('Error retrieving functional skills data from Curious', error)
      throw error
    }
  }
}
