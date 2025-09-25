import { Router } from 'express'
import { CaseNotesPermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
import CaseNotesController from '../controllers/caseNotesController'
import { Services } from '../services'
import validationMiddleware from '../middleware/validationMiddleware'
import { CaseNoteValidator } from '../validators/caseNoteValidator'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest, postRequest } from './routerUtils'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import { UpdateCaseNoteValidator } from '../validators/updateCaseNoteValidator'

export default function caseNotesRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const post = postRequest(router)
  const basePath = '/prisoner/:prisonerNumber'
  const { prisonPermissionsService } = services

  const caseNotesController = new CaseNotesController(services.caseNotesService, services.auditService)

  get(
    `${basePath}/case-notes`,
    auditPageAccessAttempt({ services, page: Page.CaseNotes }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [CaseNotesPermission.read] }),
    caseNotesController.displayCaseNotes(),
  )

  get(
    `${basePath}/add-case-note`,
    auditPageAccessAttempt({ services, page: Page.AddCaseNote }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [CaseNotesPermission.edit] }),
    caseNotesController.displayAddCaseNote(),
  )

  post(
    `${basePath}/add-case-note`,
    auditPageAccessAttempt({ services, page: Page.PostAddCaseNote }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [CaseNotesPermission.edit] }),
    validationMiddleware([CaseNoteValidator]),
    caseNotesController.post(),
  )

  get(
    `${basePath}/update-case-note/:caseNoteId`,
    auditPageAccessAttempt({ services, page: Page.UpdateCaseNote }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [CaseNotesPermission.edit] }),
    caseNotesController.displayUpdateCaseNote(),
  )

  post(
    `${basePath}/update-case-note/:caseNoteId`,
    auditPageAccessAttempt({ services, page: Page.PostUpdateCaseNote }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [CaseNotesPermission.edit] }),
    validationMiddleware([UpdateCaseNoteValidator]),
    caseNotesController.postUpdate(),
  )

  return router
}
