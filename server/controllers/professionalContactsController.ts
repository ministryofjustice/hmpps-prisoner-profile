import { Request, Response } from 'express'
import ProfessionalContactsService from '../services/professionalContactsService'
import { youthEstatePrisons } from '../data/constants/youthEstatePrisons'

export default class ProfessionalContactsController {
  constructor(private readonly professionalContactsService: ProfessionalContactsService) {}

  public async displayProfessionalContacts(req: Request, res: Response) {
    const { prisonerNumber, bookingId, prisonId } = req.middleware.prisonerData
    const { clientToken } = req.middleware

    const professionalContacts = (
      await this.professionalContactsService.getContacts(
        clientToken,
        prisonerNumber,
        bookingId,
        youthEstatePrisons.includes(prisonId),
        res.locals.apiErrorCallback,
      )
    ).map(contact => contact.toPromiseSettledResult())

    return res.render('pages/professionalContacts/professionalContactsPage', {
      professionalContacts,
    })
  }
}
