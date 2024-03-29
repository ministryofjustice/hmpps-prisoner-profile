import { RequestHandler } from 'express'
import { jwtDecode } from 'jwt-decode'
import logger from '../../logger'
import UserService from '../services/userService'
import CaseLoad from '../data/interfaces/prisonApi/CaseLoad'

export function populateCurrentUser(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (!req.session.userDetails) {
        const userDetails = res.locals.user && (await userService.getUser(res.locals.user.token))
        if (userDetails) {
          req.session.userDetails = userDetails
        } else {
          logger.info('No user details retrieved')
        }
      }

      res.locals.user = {
        ...req.session.userDetails,
        ...res.locals.user,
        backLink: req.session.userBackLink,
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve user for: ${res.locals.user && res.locals.user.username}`)
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

export function getUserRoles(): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        const { authorities: roles = [] } = jwtDecode(res.locals.user.token) as { authorities?: string[] }
        if (roles) {
          res.locals.user.userRoles = roles
        } else {
          logger.info('No user roles available')
        }
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve roles for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}
