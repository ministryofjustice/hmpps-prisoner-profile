import { Request, RequestHandler, Response } from 'express'
import { UUID } from 'node:crypto'
import { AuditService, Page, PostAction } from '../services/auditService'
import logger from '../../logger'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import AddressService from '../services/addressService'
import NotFoundError from '../utils/notFoundError'
import EphemeralDataService from '../services/EphemeralDataService'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'
import { AddressRequestDto } from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'

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
      const formValues = requestBodyFromFlash<{ 'address-autosuggest-input': string }>(req)

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
        inputValue: formValues?.['address-autosuggest-input'],
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
      const { clientToken, prisonerNumber } = this.getCommonRequestData(req)
      const { uprn, 'address-autosuggest-input': userText } = req.body

      if (!uprn) {
        const errorMessage = userText ? 'This is not a valid address' : 'Enter a UK address'
        req.flash('requestBody', JSON.stringify(req.body))
        req.flash('errors', [{ text: errorMessage, href: '#address-autosuggest-input' }])
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

      const address = await this.addressService.getAddressByUprn(uprn, clientToken)
      const addressConfirmationUuid = await this.ephemeralDataService.cacheData({ address, route: 'find-uk-address' })
      return res.redirect(`/prisoner/${prisonerNumber}/personal/confirm-address?address=${addressConfirmationUuid}`)
    }
  }

  public displayConfirmAddress(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken, prisonerName, prisonerNumber, prisonId } = this.getCommonRequestData(req)
      const { address: addressCacheId } = req.query
      const addressCache = await this.ephemeralDataService.getData<{ address: AddressRequestDto; route: string }>(
        addressCacheId as UUID,
      )

      if (!addressCache?.value?.address) {
        throw new NotFoundError('Could not find cached address')
      }

      const { address, route } = addressCache.value

      const [cityCode, countyCode, countryCode] = await Promise.all([
        address.postTownCode && this.addressService.getCityReferenceData(address.postTownCode, clientToken),
        address.countyCode && this.addressService.getCountyReferenceData(address.countyCode, clientToken),
        address.countryCode && this.addressService.getCountryReferenceData(address.countryCode, clientToken),
      ])

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.EditAddressConfirm,
        })
        .catch(error => logger.error(error))

      return res.render('pages/edit/address/confirmAddress', {
        pageTitle: 'Confirm address - Prisoner personal details',
        formTitle: 'Confirm address',
        address: {
          ...address,
          cacheId: addressCacheId,
          city: cityCode?.description,
          county: countyCode?.description,
          country: countryCode?.description,
        },
        prisonerNumber,
        backLink: `/prisoner/${prisonerNumber}/personal/${route}`,
        breadcrumbPrisonerName: prisonerName,
        miniBannerData: { prisonerNumber, prisonerName },
      })
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
