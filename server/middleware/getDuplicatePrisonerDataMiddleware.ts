import { NextFunction, Request, RequestHandler, Response } from 'express'
import { Services } from '../services'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { PrisonUser } from '../interfaces/HmppsUser'
import { personDuplicateRecordsEnabled } from '../utils/featureFlags'
import { DuplicatePrisonerInfo } from '../services/metrics/metricsService'
import logger from '../../logger'

const isActiveStatus = (prisonId?: string): boolean => {
  return !!(prisonId && prisonId !== 'TRN' && prisonId !== 'OUT')
}

const toDuplicateInfo = (prisoner: Prisoner): DuplicatePrisonerInfo => ({
  prisonerNumber: prisoner.prisonerNumber,
  prisonId: prisoner.prisonId,
})

export default function getDuplicatePrisonerData(services: Services): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { metricsService } = services
    const { prisonerData } = req.middleware
    const user = res.locals.user as PrisonUser

    try {
      if (!personDuplicateRecordsEnabled(user.activeCaseLoadId)) {
        req.middleware = { ...req.middleware, duplicatePrisonerData: [] }
        return next()
      }

      if (!prisonerData) {
        req.middleware = { ...req.middleware, duplicatePrisonerData: [] }
        return next()
      }

      const { prisonerNumber, prisonId } = prisonerData
      const personApiClient = services.dataAccess.personApiClientBuilder(req.middleware.clientToken)
      const personRecord = await personApiClient.getRecord(prisonerNumber)

      if (!personRecord || !personRecord.identifiers?.prisonNumbers?.length) {
        req.middleware = { ...req.middleware, duplicatePrisonerData: [] }
        return next()
      }

      const prisonerSearchClient = services.dataAccess.prisonerSearchApiClientBuilder(req.middleware.clientToken)
      const prisonerSearchResults = await prisonerSearchClient.findByNumbers(personRecord.identifiers.prisonNumbers)

      const allDuplicates = prisonerSearchResults.filter(
        (p: Prisoner) => p.prisonerNumber && p.prisonerNumber !== prisonerNumber,
      )

      // Filter out any records held in the ghost establishment GHI (strictly for low-quality data)
      const ghiDuplicates = allDuplicates.filter(p => p.prisonId === 'GHI')
      if (ghiDuplicates.length > 0) {
        metricsService.trackDuplicateRecordsGhostEstablishmentFiltered(
          prisonerNumber,
          prisonId,
          ghiDuplicates.map(toDuplicateInfo),
          user,
        )
      }
      const nonGhiDuplicates = allDuplicates.filter(p => p.prisonId !== 'GHI')

      // Filter out all duplicates when 2+ are active and flag a data-quality issue
      const totalActiveCount =
        (isActiveStatus(prisonId) ? 1 : 0) + nonGhiDuplicates.filter(p => isActiveStatus(p.prisonId)).length
      if (totalActiveCount >= 2) {
        metricsService.trackDuplicateRecordsMultipleActiveFiltered(
          prisonerNumber,
          prisonId,
          nonGhiDuplicates.map(toDuplicateInfo),
          user,
        )
      }
      const duplicates = totalActiveCount >= 2 ? [] : nonGhiDuplicates

      if (duplicates.length > 0) {
        res.locals.duplicateRecordsFound = true
        metricsService.trackDuplicateRecordsFound(prisonerNumber, prisonId, duplicates.map(toDuplicateInfo), user)
      }

      req.middleware = { ...req.middleware, duplicatePrisonerData: duplicates }
      return next()
    } catch (error) {
      logger.error(error, `Failed to retrieve duplicate prisoner data for: ${prisonerData?.prisonerNumber}`)
      metricsService.trackDuplicateRecordsApiFailure(prisonerData?.prisonerNumber, prisonerData?.prisonId, error, user)

      res.locals.duplicateRecordApiFailure = true
      req.middleware = { ...req.middleware, duplicatePrisonerData: [] }
      return next()
    }
  }
}
