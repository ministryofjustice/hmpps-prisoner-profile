import { Request, Response } from 'express'
import { formatName } from '../utils/utils'
import { AuditService, Page } from '../services/auditService'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import logger from '../../logger'
import AddressService from '../services/addressService'

export const addressLookupErrorMessage: object = { message: 'Unable to perform address search.' }
export default class AddressController {
  constructor(
    private readonly addressService: AddressService,
    private readonly auditService: AuditService,
  ) {}

  public async displayAddresses(req: Request, res: Response) {
    const { firstName, lastName, prisonerNumber, prisonId } = req.middleware.prisonerData
    const { clientToken } = req.middleware

    const addresses = (await this.addressService.getAddresses(clientToken, prisonerNumber)) ?? []

    const primaryAddress = addresses.find(address => address.primary && !address.endDate)
    const primaryAddressLabel = primaryAddress?.mail ? 'Primary and mail address' : 'Primary address'

    const mailAddress = addresses.find(address => address.mail && !address.primary && !address.endDate)
    const otherAddresses = addresses
      .filter(address => !address.primary && !address.mail && !address.endDate)
      .sort((a, b) => b.startDate?.localeCompare(a.startDate)) // Sort by ISO date string in reverse order

    this.auditService
      .sendPageView({
        user: res.locals.user,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.Addresses,
      })
      .catch(error => logger.error(error))

    return res.render('pages/addresses/addresses', {
      pageTitle: 'Addresses',
      primaryAddressLabel,
      primaryAddress,
      mailAddress,
      otherAddresses,
      prisonerNumber,
      prisonerName: formatName(firstName, '', lastName),
      breadcrumbPrisonerName: formatName(firstName, '', lastName, { style: NameFormatStyle.lastCommaFirst }),
    })
  }

  public async findAddressesByFreeTextQuery(req: Request, res: Response): Promise<void> {
    const { query } = req.params
    try {
      res.json(await this.addressService.getAddressesMatchingQuery(query))
    } catch (error) {
      res.status(error.status).json({ error: error.message })
    }
  }
}
