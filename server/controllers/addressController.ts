import { Request, Response } from 'express'
import { AuditService, Page } from '../services/auditService'
import logger from '../../logger'
import AddressService from '../services/addressService'
import { getErrorStatus } from '../utils/errorHelpers'
import type { PrisonUser } from '../interfaces/HmppsUser'
import { editAddressSpecificPhoneNumbersEnabled, editProfileEnabled } from '../utils/featureFlags'

export default class AddressController {
  constructor(
    readonly addressService: AddressService,
    private readonly auditService: AuditService,
  ) {}

  public async displayAddresses(req: Request, res: Response) {
    const { prisonerNumber, prisonId } = req.middleware.prisonerData
    const { clientToken } = req.middleware

    const addresses = (await this.addressService.getAddressesForDisplay(clientToken, prisonerNumber)) ?? []

    const primaryAddress = addresses.find(address => address.primaryAddress)
    const primaryAddressLabel = primaryAddress?.postalAddress ? 'Primary and postal address' : 'Primary address'

    const mailAddress = addresses.find(address => address.postalAddress && !address.primaryAddress)
    const otherAddresses = addresses
      .filter(address => !address.primaryAddress && !address.postalAddress)
      .sort((a, b) => (b.fromDate ?? '').localeCompare(a.fromDate ?? '')) // Sort by ISO date string in reverse order

    const { activeCaseLoadId } = res.locals.user as PrisonUser

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
      editEnabled: editProfileEnabled(activeCaseLoadId),
      editAddressSpecificPhoneNumbersEnabled: editAddressSpecificPhoneNumbersEnabled(activeCaseLoadId),
    })
  }

  public async findAddressesByFreeTextQuery(req: Request, res: Response): Promise<void> {
    try {
      const results = await this.addressService.getAddressesMatchingQuery(req.params.query)
      res.json({ status: 200, results })
    } catch (error) {
      const status = getErrorStatus(error) ?? 500
      res.status(status).json({ status, error: error.message })
    }
  }
}
