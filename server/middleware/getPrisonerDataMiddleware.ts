import type { RequestHandler } from 'express'
import { isToday, isWithinInterval, parseISO, startOfToday, subDays } from 'date-fns'
import logger from '../../logger'
import config from '../config'
import NotFoundError from '../utils/notFoundError'
import { Result } from '../utils/result/result'
import { formatName, isActiveCaseLoad } from '../utils/utils'
import type { Services } from '../services'
import { toAlertSummaryData } from '../services/mappers/alertMapper'
import type Assessment from '../data/interfaces/prisonApi/Assessment'
import { AssessmentCode } from '../data/enums/assessmentCode'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'

const prisonerNumberRegex = /^[a-zA-Z][0-9]{4}[a-zA-Z]{2}$/

export default function getPrisonerData(
  services: Services,
  { minimal = false }: { minimal?: boolean } = {},
): RequestHandler {
  return async (req, res, next) => {
    let prisonerNumber = ''
    if (req.params?.prisonerNumber) {
      prisonerNumber = req.params.prisonerNumber
    } else if (req.query?.prisonerNumber) {
      prisonerNumber = req.query.prisonerNumber as string
    }

    if (prisonerNumber === '' || !prisonerNumberRegex.test(prisonerNumber)) {
      return next(new NotFoundError())
    }

    /** Provide a minimal set of commonly used data to the template */
    async function populateMinimalDetails(): Promise<void> {
      const prisonerSearchClient = services.dataAccess.prisonerSearchApiClientBuilder(req.middleware.clientToken)
      const prisonerData = await prisonerSearchClient.getPrisonerDetails(prisonerNumber)

      if (!prisonerData.prisonerNumber) {
        throw new NotFoundError()
      }

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
      req.middleware = { ...req.middleware, prisonerData }
    }

    /** Get Assessment details and Inmate details, and add to prisonerData */
    async function populateExtraDetails(): Promise<void> {
      const { prisonerData } = req.middleware

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
        prisonerData.assessments = assessments.sort((a, b) => {
          const dateComparison = new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
          return dateComparison !== 0 ? dateComparison : (b.assessmentSeq ?? 0) - (a.assessmentSeq ?? 0)
        })
      }

      if (!config.featureToggles.csraServiceEnabled) {
        prisonerData.csra = prisonerData.assessments?.find((assessment: Assessment) =>
          assessment.assessmentDescription.includes(AssessmentCode.csra),
        )?.classification
      }
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

      // recreate name since prisoner search can lag behind prison-api
      const { firstName: firstNameInmate, middleName: middleNameInmate, lastName: lastNameInmate } = inmateDetail
      res.locals.prisonerName = {
        firstLast: formatName(firstNameInmate, '', lastNameInmate),
        lastCommaFirst: formatName(firstNameInmate, '', lastNameInmate, { style: NameFormatStyle.lastCommaFirst }),
        full: formatName(firstNameInmate, middleNameInmate, lastNameInmate),
      }

      // Provide additional commonly used data to the template
      res.locals = {
        ...res.locals,
        prisonerImageUrl: `/api/prisoner/${prisonerData.prisonerNumber}/image?imageId=${inmateDetail.facialImageId}${inmateDetail.facialImageId ? '' : '&cache=v2'}`,
      }
    }

    const minimalDetailsPopulated = Boolean(res.locals.prisonerNumber === prisonerNumber && req.middleware.prisonerData)
    const fullDetailsPopulated = Boolean(res.locals.prisonerNumber === prisonerNumber && req.middleware.inmateDetail)

    // Don’t repopulate if already loaded
    if ((minimal && minimalDetailsPopulated) || fullDetailsPopulated) {
      return next()
    }

    try {
      if (!minimalDetailsPopulated) {
        await populateMinimalDetails()
      }
      if (!minimal) {
        await populateExtraDetails()
      }
    } catch (error) {
      logger.error(error, `Failed to retrieve get prisoner data: ${error.endpoint}`)
      return next(error)
    }
    return next()
  }
}
