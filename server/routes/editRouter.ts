import { Router } from 'express'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest } from './routerUtils'

export default function editRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)

  const fieldConfig = {
    height: {},
    weight: {},
    'number-of-children': {},
  }

  // Generic field edit page for basic things? Going off one field per page gov design
  // Easier for validations/etc
  get(
    '/prisoner/:prisonerNumber/edit/height',
    getPrisonerData(services),
    checkPrisonerInCaseload({ allowGlobal: false, allowInactive: false }),
    async (req, res, next) => {
      // const prisonerData = req.middleware?.prisonerData
    },
  )

  get(
    '/prisoner/:prisonerNumber/edit/weight',
    getPrisonerData(services),
    checkPrisonerInCaseload({ allowGlobal: false, allowInactive: false }),
    async (req, res, next) => {
      // const prisonerData = req.middleware?.prisonerData
    },
  )

  return router
}
