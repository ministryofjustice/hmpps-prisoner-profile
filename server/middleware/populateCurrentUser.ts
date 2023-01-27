import { RequestHandler } from 'express'
import logger from '../../logger'
import UserService from '../services/userService'

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

export function getUserRoles(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        const roles = res.locals.user && (await userService.getUserRoles(res.locals.user.token))
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
        const caseLoads = res.locals.user && (await userService.getUserCaseLoads(res.locals.user.token))
        if (caseLoads) {
          res.locals.user.caseLoads = caseLoads
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
