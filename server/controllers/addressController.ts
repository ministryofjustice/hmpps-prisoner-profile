import { Request, Response } from 'express'
import { addressToLines, formatName } from '../utils/utils'
import { AuditService, Page } from '../services/auditService'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import logger from '../../logger'
import AddressService from '../services/addressService'
import GovSummaryItem from '../interfaces/GovSummaryItem'
import Address from '../data/interfaces/prisonApi/Address'

export default class AddressController {
  constructor(
    private readonly addressService: AddressService,
    private readonly auditService: AuditService,
  ) {}

  public async displayAddresses(req: Request, res: Response) {
    const { firstName, lastName, prisonerNumber, prisonId } = req.middleware.prisonerData
    const { clientToken } = res.locals

    const addresses = (await this.addressService.getAddresses(clientToken, prisonerNumber)) ?? []

    const primaryAddressRecord = addresses.find(address => address.primary && !address.endDate)
    const primaryAddress = this.mapAddressToSummaryItems(primaryAddressRecord)
    const primaryAddressLabel = primaryAddressRecord?.mail ? 'Primary and mail address' : 'Primary address'

    const mailAddress = this.mapAddressToSummaryItems(
      addresses.find(address => address.mail && !address.primary && !address.endDate),
    )

    const otherAddresses = addresses
      .filter(address => !address.primary && !address.mail && !address.endDate)
      .sort((a, b) => b.startDate.localeCompare(a.startDate)) // Sort by ISO date string in reverse order
      .map(this.mapAddressToSummaryItems)

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

  private mapAddressToSummaryItems(address: Address): { rows: GovSummaryItem[]; startDate: string } {
    const addressSummary: GovSummaryItem[] = []

    if (address) {
      addressSummary.push({
        key: { text: 'Address' },
        value: { html: address.noFixedAddress ? 'No fixed address' : addressToLines(address).join('<br/>') },
        classes: 'govuk-summary-list__row--no-border',
      })
      addressSummary.push({
        key: { text: 'Type of address' },
        value: {
          html: address.addressUsages.filter(usage => usage.activeFlag).length
            ? address.addressUsages
                .filter(usage => usage.activeFlag)
                .map(usage => usage.addressUsageDescription)
                .join('<br/>')
            : 'Not entered',
        },
      })
      if (address.phones?.length) {
        addressSummary.push({
          key: { text: 'Phone' },
          value: {
            html: address.phones.map(phone => phone.number).join('<br/>'),
          },
        })
      }
      if (address.comment) {
        addressSummary.push({
          key: { text: 'Comment' },
          value: { text: address.comment },
        })
      }
    }

    return { rows: addressSummary, startDate: address?.startDate }
  }
}
