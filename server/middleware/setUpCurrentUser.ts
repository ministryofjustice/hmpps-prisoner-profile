import { jwtDecode } from 'jwt-decode'
import express from 'express'
import { UUID } from 'crypto'
import { convertToTitleCase } from '../utils/utils'
import logger from '../../logger'
import { Role } from '../data/enums/role'

export default function setUpCurrentUser() {
  const router = express.Router()

  router.use((req, res, next) => {
    try {
      const {
        name,
        user_id: userId,
        user_uuid: userUuid,
        authorities: roles = [],
      } = jwtDecode(res.locals.user.token) as {
        name?: string
        user_id?: string
        user_uuid?: UUID
        authorities?: Role[]
      }

      res.locals.user = {
        ...res.locals.user,
        userId,
        userUuid,
        name,
        displayName: convertToTitleCase(name),
        backLink: req.session.userBackLink,
        userRoles: roles,
      }

      if (res.locals.user.authSource === 'nomis') {
        res.locals.user.staffId = parseInt(userId, 10) || undefined
      }

      next()
    } catch (error) {
      logger.error(error, `Failed to populate user details for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  })

  return router
}
