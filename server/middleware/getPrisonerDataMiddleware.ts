import { RequestHandler } from 'express'
import { isToday, isWithinInterval, parseISO, startOfToday, subDays } from 'date-fns'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { Services } from '../services'
import NotFoundError from '../utils/notFoundError'
import Assessment from '../data/interfaces/prisonApi/Assessment'
import { AssessmentCode } from '../data/enums/assessmentCode'
import logger from '../../logger'
import { toAlertSummaryData } from '../services/mappers/alertMapper'
import { Result } from '../utils/result/result'
import { formatName, isActiveCaseLoad } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'

const prisonerNumberRegex = /^[a-zA-Z][0-9]{4}[a-zA-Z]{2}$/

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

      if (prisonerNumber === '' || !prisonerNumberRegex.test(prisonerNumber)) {
        return next(new NotFoundError())
      }

      const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(prisonerNumber)

      if (prisonerData.prisonerNumber === undefined) {
        return next(new NotFoundError())
      }

      // Provide a minimal set of commonly used data to the template
      const { firstName, middleNames, lastName } = prisonerData
      res.locals = {
        ...res.locals,
        prisonerNumber,
        prisonId: prisonerData.prisonId,
        prisonerName: {
          firstLast: formatName(firstName, '', lastName),
          lastCommaFirst: formatName(firstName, '', lastName, { style: NameFormatStyle.lastCommaFirst }),
          full: formatName(firstName, middleNames, lastName),
        },
      }

      if (options.minimal) {
        req.middleware = { ...req.middleware, prisonerData }
        return next()
      }

      // Get Assessment details and Inmate details, and add to prisonerData
      // Needed for CSRA and Category data
      // Need to update prisoner search endpoint to return the data needed, then this can be removed
      const prisonApiClient = services.dataAccess.prisonApiClientBuilder(req.middleware.clientToken)
      const alertsApiClient = services.dataAccess.alertsApiClientBuilder(req.middleware.clientToken)
      const [assessments, inmateDetail, alerts, arrivalDate] = await Promise.all([
        prisonApiClient.getAssessments(prisonerData.bookingId),
        prisonApiClient.getInmateDetail(prisonerData.bookingId),
        Result.wrap(alertsApiClient.getAlerts(prisonerNumber, { showAll: true })),
        isActiveCaseLoad(prisonerData.prisonId, res.locals.user)
          ? prisonApiClient.getLatestArrivalDate(prisonerData.prisonerNumber)
          : null,
      ])

      const alertSummaryData = toAlertSummaryData(alerts)

      if (assessments && Array.isArray(assessments)) {
        prisonerData.assessments = assessments.sort(
          (a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime(),
        )
      }
      prisonerData.csra = prisonerData.assessments?.find((assessment: Assessment) =>
        assessment.assessmentDescription.includes(AssessmentCode.csra),
      )?.classification
      // End

      if (arrivalDate) {
        const arrival = parseISO(arrivalDate)
        prisonerData.newArrival24 = isToday(arrival)
        prisonerData.newArrival72 = isWithinInterval(arrival, {
          start: subDays(startOfToday(), 2),
          end: startOfToday(),
        })
      }

      req.middleware = {
        ...req.middleware,
        prisonerData,
        inmateDetail,
        alertSummaryData,
      }

      // Provide additional commonly used data to the template
      res.locals = {
        ...res.locals,
        prisonerImageUrl: `/api/prisoner/${prisonerData.prisonerNumber}/image?imageId=${inmateDetail.facialImageId}`,
      }
    } catch (error) {
      logger.error(error, `Failed to retrieve get prisoner data: ${error.endpoint}`)
      next(error)
    }

    return next()
  }
}
