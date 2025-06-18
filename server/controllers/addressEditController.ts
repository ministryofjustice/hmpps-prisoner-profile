import { Request, RequestHandler, Response } from 'express'
import { UUID } from 'node:crypto'
import { AuditService, Page, PostAction } from '../services/auditService'
import logger from '../../logger'
import { apostrophe, convertToTitleCase, formatName, objectToSelectOptions } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import AddressService from '../services/addressService'
import NotFoundError from '../utils/notFoundError'
import EphemeralDataService from '../services/EphemeralDataService'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'
import { AddressRequestDto } from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { formatDateISO } from '../utils/dateHelpers'
import { AddressLocation } from '../services/mappers/addressMapper'
import { PrisonUser } from '../interfaces/HmppsUser'

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
      const { uprn } = req.body

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
        address.postTownCode && this.addressService.getCityCode(address.postTownCode, clientToken),
        address.countyCode && this.addressService.getCountyCode(address.countyCode, clientToken),
        address.countryCode && this.addressService.getCountryCode(address.countryCode, clientToken),
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

  public displayPrimaryOrPostalAddress(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken, prisonerName, titlePrisonerName, prisonerNumber, prisonId } = this.getCommonRequestData(req)
      const { address: addressCacheId } = req.query
      const addressCache = await this.ephemeralDataService.getData<{ address: AddressRequestDto; route: string }>(
        addressCacheId as UUID,
      )

      if (!addressCache?.value?.address) {
        throw new NotFoundError('Could not find cached address')
      }

      const errors = req.flash('errors')
      const { address } = addressCache.value
      const [cityCode, countyCode, countryCode, existingAddresses] = await Promise.all([
        this.addressService.getCityCode(address.postTownCode, clientToken),
        this.addressService.getCountyCode(address.countyCode, clientToken),
        this.addressService.getCountryCode(address.countryCode, clientToken),
        this.addressService.getAddresses(clientToken, prisonerNumber),
      ])

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.EditAddressPrimaryOrPostal,
        })
        .catch(error => logger.error(error))

      return res.render('pages/edit/address/primaryOrPostalAddress', {
        pageTitle: 'Select if primary or postal address - Prisoner personal details',
        formTitle: `Is this ${apostrophe(titlePrisonerName)} primary or postal address?`,
        address: {
          ...address,
          cacheId: addressCacheId,
          city: cityCode?.description,
          county: countyCode?.description,
          country: countryCode?.description,
        },
        existingPrimary: !!existingAddresses.find(a => a.primaryAddress),
        existingPostal: !!existingAddresses.find(a => a.postalAddress),
        errors,
        prisonerNumber,
        backLink: `/prisoner/${prisonerNumber}/personal/confirm-address?address=${addressCacheId}`,
        breadcrumbPrisonerName: prisonerName,
        miniBannerData: { prisonerNumber, prisonerName },
      })
    }
  }

  public submitPrimaryOrPostalAddress(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken, prisonerNumber } = this.getCommonRequestData(req)
      const { primaryOrPostal: primaryOrPostalResponse } = req.body
      const { address: addressCacheId } = req.query

      const addressCache = await this.ephemeralDataService.getData<{ address: AddressRequestDto; route: string }>(
        addressCacheId as UUID,
      )

      if (!addressCache?.value?.address) {
        throw new NotFoundError('Could not find cached address')
      }

      const primaryOrPostal = Array.isArray(primaryOrPostalResponse)
        ? primaryOrPostalResponse
        : [primaryOrPostalResponse]

      const address: AddressRequestDto = {
        ...addressCache.value.address,
        primaryAddress: primaryOrPostal.includes('primary'),
        postalAddress: primaryOrPostal.includes('postal'),
      }

      try {
        await this.addressService.createAddress(clientToken, prisonerNumber, address, res.locals.user as PrisonUser)
        await this.ephemeralDataService.removeData(addressCacheId as UUID)

        req.flash('flashMessage', {
          text: 'Address updated',
          type: FlashMessageType.success,
          fieldName: 'addresses',
        })

        this.auditService
          .sendPostSuccess({
            user: res.locals.user,
            prisonerNumber,
            correlationId: req.id,
            action: PostAction.EditAddressPrimaryOrPostal,
            details: { address },
          })
          .catch(error => logger.error(error))

        return res.redirect(`/prisoner/${prisonerNumber}/personal#addresses`)
      } catch (e) {
        req.flash('errors', [{ text: 'There was an error please try again' }])
        req.flash('requestBody', JSON.stringify(req.body))
        return res.redirect(`/prisoner/${prisonerNumber}/personal/primary-or-postal-address?address=${addressCacheId}`)
      }
    }
  }

  public displayManualEditAddress(options: {
    addressLocation: AddressLocation
    pageTitlePrefix: string
    formTitlePrefix: string
    auditPage: Page
  }): RequestHandler {
    return async (req: Request, res: Response) => {
      const { addressLocation, pageTitlePrefix, formTitlePrefix, auditPage } = options
      const { clientToken, prisonerName, titlePrisonerName, prisonerNumber, prisonId } = this.getCommonRequestData(req)
      const requestBody = requestBodyFromFlash<{ townOrCity: string; county: string; country: string }>(req)
      const errors = req.flash('errors')

      const [cityReferenceData, countyReferenceData, countryReferenceData] = await Promise.all([
        this.addressService.getCityReferenceData(clientToken),
        this.addressService.getCountyReferenceData(clientToken),
        this.addressService.getCountryReferenceData(clientToken, { addressLocation }),
      ])

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: auditPage,
        })
        .catch(error => logger.error(error))

      return res.render('pages/edit/address/manualAddress', {
        pageTitle: `${pageTitlePrefix} - Prisoner personal details`,
        formTitle: `${formTitlePrefix} for ${titlePrisonerName}`,
        errors,
        requestBody,
        townOrCityOptions: objectToSelectOptions(cityReferenceData, 'code', 'description', requestBody?.townOrCity),
        countyOptions: objectToSelectOptions(countyReferenceData, 'code', 'description', requestBody?.county),
        countryOptions: objectToSelectOptions(countryReferenceData, 'code', 'description', requestBody?.country),
        ukAddress: addressLocation !== AddressLocation.overseas,
        noFixedAddress: addressLocation === AddressLocation.no_fixed_address,
        noFixedAddressCheckbox: addressLocation === AddressLocation.overseas,
        breadcrumbPrisonerName: prisonerName,
        backLink: addressLocation === AddressLocation.uk ? 'find-uk-address' : 'where-is-address',
        miniBannerData: {
          prisonerNumber,
          prisonerName,
        },
      })
    }
  }

  public submitManualEditAddress(options: {
    addressLocation: AddressLocation
    auditAction: PostAction
  }): RequestHandler {
    return async (req: Request, res: Response) => {
      const { addressLocation, auditAction } = options
      const { prisonerNumber } = this.getCommonRequestData(req)
      const {
        noFixedAddress,
        houseOrBuildingName,
        houseNumber,
        addressLine1,
        addressLine2,
        townOrCity,
        county,
        postcode,
        country,
      } = req.body

      const address: AddressRequestDto = {
        noFixedAbode: addressLocation === AddressLocation.no_fixed_address || !!noFixedAddress,
        buildingNumber: houseNumber,
        buildingName: convertToTitleCase(houseOrBuildingName),
        thoroughfareName: convertToTitleCase(addressLine1),
        dependantLocality: convertToTitleCase(addressLine2),
        postTownCode: townOrCity,
        postCode: this.addressService.sanitisePostcode(postcode),
        countyCode: county,
        countryCode: country,
        fromDate: formatDateISO(new Date()),
        addressTypes: [],
      }

      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: auditAction,
          details: { address },
        })
        .catch(error => logger.error(error))

      const addressConfirmationUuid = await this.ephemeralDataService.cacheData({
        address,
        route: `${req.path?.replace('/', '')}`,
      })

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
