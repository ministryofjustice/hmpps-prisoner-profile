import { RequestHandler } from 'express'
import jwtDecode from 'jwt-decode'
import logger from '../../logger'
import UserService from '../services/userService'
import { CaseLoad } from '../interfaces/caseLoad'

export default function populateCurrentUser(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        const user = res.locals.user && (await userService.getUser(res.locals.user.token))
        if (user) {
          res.locals.user = { ...user, ...res.locals.user }
        } else {
          logger.info('No user available')
        }
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve user for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}

export function getUserLocations(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        const locations = res.locals.user && (await userService.getUserLocations(res.locals.user.token))
        if (locations) {
          res.locals.user.locations = locations
        } else {
          logger.info('No user locations available')
        }
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve locations for: ${res.locals.user && res.locals.user.username}`)
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

export function getUserCaseLoads(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        const userCaseLoads = res.locals.user && (await userService.getUserCaseLoads(res.locals.user.token))
        if (userCaseLoads) {
          res.locals.user.caseLoads = userCaseLoads
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

export function getUserActiveCaseLoad(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user.activeCaseLoadId) {
        let activeCaseLoad: CaseLoad[] | undefined

        if (res.locals.user.caseLoads) {
          activeCaseLoad = res.locals.user.caseLoads.filter((caseLoad: CaseLoad) => caseLoad.currentlyActive)
        } else {
          activeCaseLoad =
            res.locals.user &&
            (await userService.getUserCaseLoads(res.locals.user.token)).filter(caseLoad => caseLoad.currentlyActive)
        }

        if (activeCaseLoad) {
          res.locals.user.activeCaseLoad = activeCaseLoad
        } else {
          logger.info('No user active case load id available')
        }
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve case loads for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}
