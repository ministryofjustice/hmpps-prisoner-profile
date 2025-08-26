import { NextFunction, Request, RequestHandler, Response } from 'express'
import { UUID } from 'crypto'
import { AuditService, Page, PostAction } from '../services/auditService'
import logger from '../../logger'
import { apostrophe, blankStringsToNull } from '../utils/utils'
import EphemeralDataService from '../services/ephemeralDataService'
import AddressService from '../services/addressService'
import NotFoundError from '../utils/notFoundError'
import { AddressRequestDto } from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { AddressLocation } from '../services/mappers/addressMapper'
import { PrisonUser } from '../interfaces/HmppsUser'
import { displayWhereIsTheAddressHandler, submitWhereIsTheAddressHandler } from './handlers/whereIsTheAddress'
import { displayManualEditAddressHandler, submitManualEditAddressHandler } from './handlers/manualEditAddress'
import { displayConfirmAddressHandler } from './handlers/confirmAddress'
import { displayFindUkAddressHandler, submitFindUkAddressHandler } from './handlers/findUkAddress'
import getCommonRequestData from '../utils/getCommonRequestData'

export default class AddressEditController {
  constructor(
    private readonly addressService: AddressService,
    private readonly ephemeralDataService: EphemeralDataService,
    private readonly auditService: AuditService,
  ) {}

  public displayWhereIsTheAddress(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { naturalPrisonerName } = getCommonRequestData(req, res)

      return displayWhereIsTheAddressHandler(this.auditService, {
        pageTitle: 'Where is this person’s address? - Prisoner personal details',
        formTitle: `Where is ${apostrophe(naturalPrisonerName)} address?`,
        page: Page.EditAddressLocation,
        cancelAnchor: 'addresses',
      })(req, res, next)
    }
  }

  public submitWhereIsTheAddress(): RequestHandler {
    return submitWhereIsTheAddressHandler(this.auditService, {
      redirectOptions: {
        [AddressLocation.uk]: 'find-uk-address',
        [AddressLocation.overseas]: 'add-overseas-address',
        [AddressLocation.no_fixed_address]: 'add-uk-no-fixed-address',
      },
      action: PostAction.EditAddressLocation,
    })
  }

  public displayFindUkAddress(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { naturalPrisonerName } = getCommonRequestData(req, res)
      return displayFindUkAddressHandler(this.auditService, {
        pageTitle: 'Find a UK address - Prisoner personal details',
        formTitle: `Find a UK address for ${naturalPrisonerName}`,
        auditPage: Page.EditAddressFindUkAddress,
        manualEntryAnchor: 'add-uk-address',
        backLink: 'where-is-address',
        cancelAnchor: 'addresses',
      })(req, res, next)
    }
  }

  public submitFindUkAddress(): RequestHandler {
    return submitFindUkAddressHandler(this.addressService, this.ephemeralDataService, this.auditService, {
      route: 'find-uk-address',
      confirmRedirectUrl: 'confirm-address',
      auditAction: PostAction.EditAddressFindUkAddress,
    })
  }

  public displayConfirmAddress(): RequestHandler {
    return displayConfirmAddressHandler(this.addressService, this.ephemeralDataService, this.auditService, {
      pageTitle: 'Confirm address - Prisoner personal details',
      formTitle: 'Confirm address',
      auditPage: Page.EditAddressConfirm,
      enterDifferentAddressAnchor: 'where-is-address',
      cancelAnchor: 'addresses',
      confirmPrimaryOrPostalAddress: true,
    })
  }

  public displayPrimaryOrPostalAddress(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken, prisonerName, naturalPrisonerName, prisonerNumber, prisonId, miniBannerData } =
        getCommonRequestData(req, res)
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
        formTitle: `Is this ${apostrophe(naturalPrisonerName)} primary or postal address?`,
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
        backLinkUrl: `/prisoner/${prisonerNumber}/personal/confirm-address?address=${addressCacheId}`,
        breadcrumbPrisonerName: prisonerName,
        miniBannerData,
      })
    }
  }

  public submitPrimaryOrPostalAddress(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken, prisonerNumber } = getCommonRequestData(req, res)
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

      const address = blankStringsToNull<AddressRequestDto>({
        ...addressCache.value.address,
        primaryAddress: primaryOrPostal.includes('primary'),
        postalAddress: primaryOrPostal.includes('postal'),
        addressTypes: ['HOME'],
      })

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
      } catch (_error) {
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
    return async (req: Request, res: Response, next: NextFunction) => {
      const { addressLocation, pageTitlePrefix, formTitlePrefix, auditPage } = options
      const { naturalPrisonerName } = getCommonRequestData(req, res)
      const backLink = addressLocation === AddressLocation.uk ? 'find-uk-address' : 'where-is-address'

      return displayManualEditAddressHandler(this.addressService, this.auditService, {
        addressLocation,
        pageTitle: `${pageTitlePrefix} - Prisoner personal details`,
        formTitle: `${formTitlePrefix} for ${naturalPrisonerName}`,
        auditPage,
        backLink,
        cancelAnchor: 'addresses',
      })(req, res, next)
    }
  }

  public submitManualEditAddress(options: {
    addressLocation: AddressLocation
    auditAction: PostAction
  }): RequestHandler {
    return submitManualEditAddressHandler(this.addressService, this.ephemeralDataService, this.auditService, {
      addressLocation: options.addressLocation,
      auditAction: options.auditAction,
      confirmRedirectUrl: 'confirm-address',
    })
  }
}
