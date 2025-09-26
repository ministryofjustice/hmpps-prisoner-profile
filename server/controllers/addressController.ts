import { Request, Response } from 'express'
import { AuditService, Page } from '../services/auditService'
import logger from '../../logger'
import AddressService from '../services/addressService'
import { getErrorStatus } from '../utils/errorHelpers'

export default class AddressController {
  constructor(
    readonly addressService: AddressService,
    private readonly auditService: AuditService,
  ) {}

  public async displayAddresses(req: Request, res: Response) {
    const { prisonerNumber, prisonId } = req.middleware.prisonerData
    const { clientToken } = req.middleware

    const addresses = (await this.addressService.getAddressesFromPrisonAPI(clientToken, prisonerNumber)) ?? []

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
    })
  }

  public async findAddressesByFreeTextQuery(req: Request, res: Response): Promise<void> {
    try {
      const results = await this.addressService.getAddressesMatchingQuery(req.params.query)
      res.json({ status: 200, results })
    } catch (error) {
      res.status(getErrorStatus(error)).json({ status: getErrorStatus(error), error: error.message })
    }
  }
}
