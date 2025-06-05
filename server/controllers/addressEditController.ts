import { Request, RequestHandler, Response } from 'express'
import { AuditService, Page, PostAction } from '../services/auditService'
import logger from '../../logger'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import AddressService from '../services/addressService'
import NotFoundError from '../utils/notFoundError'
import EphemeralDataService from '../services/EphemeralDataService'

// eslint-disable-next-line no-shadow
enum AddressLocation {
  uk = 'uk',
  overseas = 'overseas',
  no_fixed_address = 'no_fixed_address',
}

export default class AddressEditController {
  constructor(
    private readonly addressService: AddressService,
    private readonly ephemeralDataService: EphemeralDataService,
    private readonly auditService: AuditService,
  ) {}

  public displayWhereIsTheAddress(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerName, prisonerNumber, prisonId } = this.getCommonRequestData(req)
      const errors = req.flash('errors')

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.EditAddressLocation,
        })
        .catch(error => logger.error(error))

      return res.render('pages/edit/radioField', {
        pageTitle: `Where is this person’s address? - Prisoner personal details`,
        formTitle: 'Where is the address?',
        submitButtonText: 'Continue',
        options: [
          { value: AddressLocation.uk, text: 'United Kingdom' },
          { value: AddressLocation.overseas, text: 'Overseas' },
          { divider: 'or' },
          { value: AddressLocation.no_fixed_address, text: 'No fixed address' },
        ],
        errors,
        prisonerNumber,
        breadcrumbPrisonerName: prisonerName,
        miniBannerData: {
          prisonerNumber,
          prisonerName,
        },
      })
    }
  }

  public submitWhereIsTheAddress(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber } = this.getCommonRequestData(req)
      const { radioField: location } = req.body

      if (!location) {
        req.flash('errors', [{ text: 'Select where the address is', href: '#radio' }])
        return res.redirect(`/prisoner/${prisonerNumber}/personal/where-is-address`)
      }

      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditAddressLocation,
          details: { location },
        })
        .catch(error => logger.error(error))

      const redirectOptions: Record<AddressLocation, string> = {
        [AddressLocation.uk]: 'find-uk-address',
        [AddressLocation.overseas]: 'add-overseas-address',
        [AddressLocation.no_fixed_address]: 'add-uk-no-fixed-address',
      }

      return res.redirect(`/prisoner/${prisonerNumber}/personal/${redirectOptions[location as AddressLocation]}`)
    }
  }

  public displayFindUkAddress(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerName, titlePrisonerName, prisonerNumber, prisonId } = this.getCommonRequestData(req)
      const { optimisationOff } = req.query

      const errors = req.flash('errors')

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.EditAddressFindUkAddress,
        })
        .catch(error => logger.error(error))

      return res.render('pages/edit/address/findUkAddress', {
        pageTitle: 'Find a UK address - Prisoner personal details',
        formTitle: `Find a UK address for ${titlePrisonerName}`,
        errors,
        prisonerNumber,
        optimisationOff,
        breadcrumbPrisonerName: prisonerName,
        miniBannerData: { prisonerNumber, prisonerName },
      })
    }
  }

  public submitFindUkAddress(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber } = this.getCommonRequestData(req)
      const { uprn } = req.body

      if (!uprn) {
        req.flash('errors', [{ text: 'Search for and select an address', href: '#address-autosuggest-input' }])
        return res.redirect(`/prisoner/${prisonerNumber}/personal/find-uk-address`)
      }

      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditAddressFindUkAddress,
          details: { uprn },
        })
        .catch(error => logger.error(error))

      const matchingAddresses = await this.addressService.getAddressesByUprn(uprn)
      if (!matchingAddresses || matchingAddresses.length !== 1) {
        throw new NotFoundError('Could not find unique address by UPRN')
      }

      const addressConfirmationUuid = await this.ephemeralDataService.cacheData(matchingAddresses[0])
      return res.redirect(`/prisoner/${prisonerNumber}/personal/confirm-address?address=${addressConfirmationUuid}`)
    }
  }

  private getCommonRequestData(req: Request) {
    const { firstName, lastName, prisonerNumber, prisonId } = req.middleware.prisonerData
    const prisonerName = formatName(firstName, '', lastName, { style: NameFormatStyle.lastCommaFirst })
    const titlePrisonerName = formatName(firstName, '', lastName, { style: NameFormatStyle.firstLast })
    const { clientToken } = req.middleware
    return { prisonerNumber, prisonId, prisonerName, titlePrisonerName, clientToken }
  }
}
