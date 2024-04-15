import { Request, Response } from 'express'
import { formatName } from '../utils/utils'
import { AuditService, Page } from '../services/auditService'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import logger from '../../logger'
import AddressService from '../services/addressService'

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
      .sort((a, b) => b.startDate.localeCompare(a.startDate)) // Sort by ISO date string in reverse order

    this.auditService
      .sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
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
}
