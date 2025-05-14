import type { RequestHandler } from 'express'
import asyncMiddleware from './asyncMiddleware'
import { UserService } from '../services'

export default function checkIfKeyWorkerAtPrison(userService: UserService): RequestHandler {
  return asyncMiddleware(async (req, res, next) => {
    if (res.locals.user?.authSource !== 'nomis') return next()

    const { prisonerData: prisoner } = req.middleware
    const userCaseLoads = res.locals.user?.caseLoads?.map(caseLoad => caseLoad.caseLoadId)
    const keyWorkerAtPrisons = req.session.keyWorkerAtPrisons ?? {}

    if (
      prisoner.prisonId &&
      userCaseLoads?.includes(prisoner.prisonId) &&
      keyWorkerAtPrisons[prisoner.prisonId] === undefined
    ) {
      req.session.keyWorkerAtPrisons = {
        ...keyWorkerAtPrisons,
        [prisoner.prisonId]: await userService.isUserAKeyWorker(
          res.locals.user.token,
          res.locals.user,
          prisoner.prisonId,
        ),
      }
    }

    // This information is then provided to the user object on res.locals
    res.locals.user.keyWorkerAtPrisons = req.session.keyWorkerAtPrisons || {}
    return next()
  })
}
