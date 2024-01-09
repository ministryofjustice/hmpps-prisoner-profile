import { RequestHandler } from 'express'
import { Prisoner } from '../interfaces/prisoner'
import { Services } from '../services'
import NotFoundError from '../utils/notFoundError'
import { Assessment } from '../interfaces/prisonApi/assessment'
import { AssessmentCode } from '../data/enums/assessmentCode'
import logger from '../../logger'

export default function getPrisonerData(services: Services, options: { minimal?: boolean } = {}): RequestHandler {
  return async (req, res, next) => {
    try {
      const prisonerSearchClient = services.dataAccess.prisonerSearchApiClientBuilder(res.locals.clientToken)
      const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(req.params.prisonerNumber)

      if (prisonerData.prisonerNumber === undefined) {
        return next(new NotFoundError())
      }

      if (options.minimal) {
        req.middleware = { ...req.middleware, prisonerData }
        return next()
      }

      // Get Assessment details and Inmate details, and add to prisonerData
      // Needed for CSRA and Category data
      // Need to update prisoner search endpoint to return the data needed, then this can be removed
      const prisonApiClient = services.dataAccess.prisonApiClientBuilder(res.locals.clientToken)
      const [assessments, inmateDetail] = await Promise.all([
        prisonApiClient.getAssessments(prisonerData.bookingId),
        prisonApiClient.getInmateDetail(prisonerData.bookingId),
      ])

      if (assessments && Array.isArray(assessments)) {
        prisonerData.assessments = assessments.sort(
          (a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime(),
        )
      }
      prisonerData.csra = prisonerData.assessments?.find((assessment: Assessment) =>
        assessment.assessmentDescription.includes(AssessmentCode.csra),
      )?.classification
      // End

      req.middleware = {
        ...req.middleware,
        prisonerData,
        inmateDetail,
      }
    } catch (error) {
      logger.error(error, `Failed to retrieve get prisoner data: ${error.endpoint}`)
      next(error)
    }

    return next()
  }
}
