import { Router } from 'express'
import { Services } from '../../services'
import AccessibilityStatementController from '../../controllers/accessibility/accessibilityStatementController'

export default function accessibilityStatementRouter(services: Services): Router {
  const router = Router()
  const { contentfulService } = services
  const accessibilityStatementController = new AccessibilityStatementController(contentfulService)

  router.get('/accessibility-statement', (req, res) =>
    accessibilityStatementController.displayAccessibilityStatement(req, res),
  )

  return router
}
