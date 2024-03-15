import { Request, Response } from 'express'
import ProfessionalContactsService from '../services/professionalContactsService'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { youthEstatePrisons } from '../data/constants/youthEstatePrisons'

export default class ProfessionalContactsController {
  constructor(private readonly professionalContactsService: ProfessionalContactsService) {}

  public async displayProfessionalContacts(req: Request, res: Response) {
    const { firstName, middleNames, lastName, prisonerNumber, bookingId, prisonId } = req.middleware.prisonerData
    const { clientToken } = res.locals

    const professionalContacts = await this.professionalContactsService
      .getContacts(
        clientToken,
        prisonerNumber,
        bookingId,
        youthEstatePrisons.includes(prisonId),
        res.locals.apiErrorCallback,
      )
      .map(contact => contact.toPromiseSettledResult())

    return res.render('pages/professionalContacts/professionalContactsPage', {
      professionalContacts,
      prisonerNumber,
      prisonerName: formatName(firstName, '', lastName),
      breadcrumbPrisonerName: formatName(firstName, middleNames, lastName, { style: NameFormatStyle.lastCommaFirst }),
    })
  }
}
