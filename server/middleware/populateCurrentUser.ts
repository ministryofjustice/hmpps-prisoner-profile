import { RequestHandler } from 'express'
import jwtDecode from 'jwt-decode'
import logger from '../../logger'
import UserService from '../services/userService'
import config from '../config'

export default function populateCurrentUser(userService: UserService): RequestHandler {
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
      const showFeedbackBanner =
        req.session.userDetails && config.feedbackEnabledPrisons.includes(req.session.userDetails.activeCaseLoadId)

      res.locals.user = { ...req.session.userDetails, ...res.locals.user, showFeedbackBanner }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve user for: ${res.locals.user && res.locals.user.username}`)
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
