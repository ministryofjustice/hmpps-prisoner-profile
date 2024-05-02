import { RequestHandler } from 'express'
import { jwtDecode } from 'jwt-decode'
import logger from '../../logger'
import UserService from '../services/userService'
import CaseLoad from '../data/interfaces/prisonApi/CaseLoad'
import { convertToTitleCase } from '../utils/utils'

export function populateCurrentUser(): RequestHandler {
  return async (req, res, next) => {
    try {
      const {
        name,
        user_id: userId,
        authorities: roles = [],
      } = jwtDecode(res.locals.user.token) as {
        name?: string
        user_id?: string
        authorities?: string[]
      }

      res.locals.user = {
        ...res.locals.user,
        userId,
        staffId: res.locals.user.authSource === 'nomis' ? userId : undefined,
        name,
        displayName: convertToTitleCase(name),
        backLink: req.session.userBackLink,
        userRoles: roles,
      }

      next()
    } catch (error) {
      logger.error(error, `Failed to populate user details for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}

export function getUserCaseLoads(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        const userCaseLoads = await userService.getUserCaseLoads(res.locals.user.token)
        if (userCaseLoads && Array.isArray(userCaseLoads)) {
          const availableCaseLoads = userCaseLoads.filter(caseload => caseload.type !== 'APP')
          const activeCaseLoad = availableCaseLoads.filter((caseLoad: CaseLoad) => caseLoad.currentlyActive)[0]

          res.locals.user.caseLoads = availableCaseLoads
          res.locals.user.activeCaseLoad = activeCaseLoad

          if (activeCaseLoad) {
            res.locals.user.activeCaseLoadId = activeCaseLoad.caseLoadId
          }
        } else {
          logger.info('No user case loads available')
        }
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve case loads for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}
