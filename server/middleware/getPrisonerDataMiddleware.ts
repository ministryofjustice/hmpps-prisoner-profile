import { RequestHandler } from 'express'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { Services } from '../services'
import NotFoundError from '../utils/notFoundError'
import Assessment from '../data/interfaces/prisonApi/Assessment'
import { AssessmentCode } from '../data/enums/assessmentCode'
import logger from '../../logger'
import { toAlert, toAlertFlagLabels } from '../services/mappers/alertMapper'
import { alertFlagLabels } from '../data/alertFlags/alertFlags'

export default function getPrisonerData(services: Services, options: { minimal?: boolean } = {}): RequestHandler {
  return async (req, res, next) => {
    try {
      const prisonerSearchClient = services.dataAccess.prisonerSearchApiClientBuilder(req.middleware.clientToken)
      let prisonerNumber = ''
      if (req.params?.prisonerNumber) {
        prisonerNumber = req.params.prisonerNumber
      } else if (req.query?.prisonerNumber) {
        prisonerNumber = req.query.prisonerNumber as string
      }

      if (prisonerNumber === '') {
        return next(new NotFoundError())
      }

      const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(prisonerNumber)

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
      const alertsApiEnabled =
        'activeCaseLoadId' in res.locals.user
          ? await services.featureToggleService.getFeatureToggle(res.locals.user.activeCaseLoadId, 'alertsApiEnabled')
          : false
      const prisonApiClient = services.dataAccess.prisonApiClientBuilder(req.middleware.clientToken)
      const alertsApiClient = services.dataAccess.alertsApiClientBuilder(req.middleware.clientToken)
      const [assessments, inmateDetail, alerts] = await Promise.all([
        prisonApiClient.getAssessments(prisonerData.bookingId),
        prisonApiClient.getInmateDetail(prisonerData.bookingId),
        alertsApiEnabled ? alertsApiClient.getAlerts(prisonerNumber, { size: 1000 }) : undefined,
      ])

      const mappedAlerts = alerts?.content ?? inmateDetail.alerts.map(toAlert)
      const alertFlags = toAlertFlagLabels(mappedAlerts, alertFlagLabels)

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
        alertFlags,
      }
    } catch (error) {
      logger.error(error, `Failed to retrieve get prisoner data: ${error.endpoint}`)
      next(error)
    }

    return next()
  }
}
