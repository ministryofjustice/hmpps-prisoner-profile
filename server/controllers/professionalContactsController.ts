import type { Request, Response } from 'express'
import type ProfessionalContactsService from '../services/professionalContactsService'

export default class ProfessionalContactsController {
  constructor(readonly professionalContactsService: ProfessionalContactsService) {}

  public async displayProfessionalContacts(req: Request, res: Response) {
    const { prisonerNumber, bookingId, prisonId } = req.middleware.prisonerData
    const { clientToken } = req.middleware

    const professionalContacts = (
      await this.professionalContactsService.getContacts(
        clientToken,
        prisonerNumber,
        bookingId,
        prisonId,
        res.locals.apiErrorCallback,
      )
    ).map(contact => contact.toPromiseSettledResult())

    return res.render('pages/professionalContacts/professionalContactsPage', {
      professionalContacts,
    })
  }
}
