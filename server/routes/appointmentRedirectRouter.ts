import { Router } from 'express'
import config from '../config'

export default function appointmentRedirectRouter(): Router {
  const router = Router()

  router.get('/prisoner/:prisonerNumber/add-appointment', (req, res) => {
    const { prisonerNumber } = req.params
    res.redirect(`${config.serviceUrls.appointments}/create/start-prisoner/${prisonerNumber}`)
  })

  return router
}
