import { Request, Response } from 'express'
import ProfessionalContactsService from '../services/professionalContactsService'
import { formatName } from '../utils/utils'

export default class ProfessionalContactsController {
  constructor(private readonly professionalContactsService: ProfessionalContactsService) {}

  public async displayProfessionalContacts(req: Request, res: Response) {
    const { firstName, lastName, prisonerNumber, bookingId } = req.middleware.prisonerData
    const { clientToken } = res.locals

    const professionalContacts = await this.professionalContactsService.getContacts(
      clientToken,
      prisonerNumber,
      bookingId,
    )

    return res.render('pages/professionalContacts/professionalContactsPage', {
      professionalContacts,
      prisonerNumber,
      prisonerName: formatName(firstName, '', lastName),
    })
  }
}
