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
    const { prisonerNumber } = res.locals
    const user = res.locals.user as PrisonUser

    try {
      if (!personDuplicateRecordsEnabled(user.activeCaseLoadId)) {
        req.middleware = { ...req.middleware, duplicatePrisonerData: [] }
        return next()
      }

      if (!prisonerNumber) {
        req.middleware = { ...req.middleware, duplicatePrisonerData: [] }
        return next()
      }

      const personApiClient = services.dataAccess.personApiClientBuilder(req.middleware.clientToken)
      const personRecord = await personApiClient.getRecord(prisonerNumber)

      if (!personRecord || !personRecord.identifiers?.prisonNumbers) {
        req.middleware = { ...req.middleware, duplicatePrisonerData: [] }
        return next()
      }

      const prisonerSearchClient = services.dataAccess.prisonerSearchApiClientBuilder(req.middleware.clientToken)
      const prisonerSearchResults = await prisonerSearchClient.findByNumbers(personRecord.identifiers.prisonNumbers)

      if (!Array.isArray(prisonerSearchResults)) {
        req.middleware = { ...req.middleware, duplicatePrisonerData: [] }
        return next()
      }

      const originalPrisonId =
        prisonerSearchResults.find((p: Prisoner) => p.prisonerNumber === prisonerNumber)?.prisonId ||
        user.activeCaseLoadId
      let duplicates = prisonerSearchResults
        .filter((p: Prisoner) => p.prisonerNumber && p.prisonerNumber !== prisonerNumber)
        .map(toDuplicateInfo)

      // Filter out any records held in the ghost establishment GHI (strictly for low-quality data)
      const ghiDuplicates = duplicates.filter(d => d.prisonId === 'GHI')
      if (ghiDuplicates.length > 0) {
        metricsService.trackDuplicateRecordsGhostEstablishmentFiltered(
          prisonerNumber,
          originalPrisonId,
          ghiDuplicates,
          user,
        )
        duplicates = duplicates.filter(d => d.prisonId !== 'GHI')
      }

      // Filter out all duplicates when 2+ are active and flag a data-quality issue
      const totalActiveCount =
        (isActiveStatus(originalPrisonId) ? 1 : 0) + duplicates.filter(d => isActiveStatus(d.prisonId)).length
      if (totalActiveCount >= 2) {
        metricsService.trackDuplicateRecordsMultipleActiveFiltered(prisonerNumber, originalPrisonId, duplicates, user)
        duplicates = []
      }

      if (duplicates.length > 0) {
        metricsService.trackDuplicateRecordsFound(prisonerNumber, originalPrisonId, duplicates, user)
      }

      req.middleware = { ...req.middleware, duplicatePrisonerData: duplicates.map(d => d.prisonerNumber) }
      return next()
    } catch (error) {
      logger.error(error, `Failed to retrieve duplicate prisoner data for: ${prisonerNumber}`)
      metricsService.trackDuplicateRecordsApiFailure(prisonerNumber, user.activeCaseLoadId, error, user)

      res.locals.duplicateRecordApiFailure = true
      req.middleware = { ...req.middleware, duplicatePrisonerData: [] }
      return next()
    }
  }
}
