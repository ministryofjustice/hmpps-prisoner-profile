import { NextFunction, Request, RequestHandler, Response } from 'express'
import { UUID } from 'node:crypto'
import {
  apostrophe,
  formatLocation,
  formatName,
  getCommonRequestData,
  mapRelationshipDescriptionByCode,
  objectToSelectOptions,
} from '../utils/utils'
import { AuditService, Page, PostAction } from '../services/auditService'
import NextOfKinService from '../services/nextOfKinService'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import logger from '../../logger'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'
import {
  PersonalRelationshipsContactRequest,
  PersonalRelationshipsContactRequestAddress,
  PersonalRelationshipsReferenceDataDomain,
  PersonalRelationshipType,
} from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { PrisonUser } from '../interfaces/HmppsUser'
import { dateToIsoDate } from '../utils/dateHelpers'
import { displayWhereIsTheAddressHandler, submitWhereIsTheAddressHandler } from './handlers/whereIsTheAddress'
import { AddressLocation } from '../services/mappers/addressMapper'
import { displayManualEditAddressHandler, submitManualEditAddressHandler } from './handlers/manualEditAddress'
import AddressService from '../services/addressService'
import EphemeralDataService from '../services/ephemeralDataService'
import { displayConfirmAddressHandler } from './handlers/confirmAddress'
import { displayFindUkAddressHandler, submitFindUkAddressHandler } from './handlers/findUkAddress'
import NotFoundError from '../utils/notFoundError'
import { AddressRequestDto } from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { PhoneNumberTypeMappings } from '../data/constants/phoneNumberMappings'

export interface NextOfKinSubmission {
  contactType: string
  firstName?: string
  middleNames?: string
  lastName?: string
  'dateOfBirth-day'?: string
  'dateOfBirth-month'?: string
  'dateOfBirth-year'?: string
  phoneNumber?: NextOfKinPhoneNumberSubmission
  property?: string
  street?: string
  cityCodeError?: string
  postcode?: string
  relationshipTypeId?: string
  relationshipTypeIdError?: string
}

export interface NextOfKinPhoneNumberSubmission {
  type?: string
  numbers?: Record<string, { number?: string; extension?: string }>
}

export interface PersonalRelationshipsContactForm {
  titleCode?: string
  lastName: string
  firstName: string
  middleNames?: string
  dateOfBirth?: string
  'dateOfBirth-day'?: string
  'dateOfBirth-month'?: string
  'dateOfBirth-year'?: string
  relationshipTypeId: string
  contactType: string[] | string
  property?: string
  street?: string
  cityCode?: string
  postcode?: string
  noFixedAddress: boolean
  phoneNumber?: PersonalRelationshipsContactFormPhoneNumbers
}

export interface PersonalRelationshipsContactFormPhoneNumbers {
  type?: string
  numbers?: Record<string, PersonalRelationshipsContactFormPhoneNumber>
}

export interface PersonalRelationshipsContactFormPhoneNumber {
  number?: string
  extension?: string
}

export default class NextOfKinController {
  constructor(
    private readonly nextOfKinService: NextOfKinService,
    private readonly addressService: AddressService,
    private readonly ephemeralDataService: EphemeralDataService,
    private readonly auditService: AuditService,
  ) {}

  public displayNextOfKinEmergencyContact(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerName, naturalPrisonerName, prisonerNumber, prisonId, cellLocation, clientToken } =
        getCommonRequestData(req)
      const requestBodyFlash = requestBodyFromFlash<PersonalRelationshipsContactForm>(req)
      const errors = req.flash('errors')

      const formValues: PersonalRelationshipsContactForm = requestBodyFlash ?? ({} as PersonalRelationshipsContactForm)

      const {
        Title: titles,
        OfficialRelationship: officialRelationships,
        SocialRelationship: socialRelationships,
        City: cities,
      } = await this.nextOfKinService.getReferenceData(clientToken, [
        PersonalRelationshipsReferenceDataDomain.Title,
        PersonalRelationshipsReferenceDataDomain.OfficialRelationship,
        PersonalRelationshipsReferenceDataDomain.SocialRelationship,
        PersonalRelationshipsReferenceDataDomain.City,
      ])

      const relationshipOptions = [
        { value: '', text: '' },
        ...officialRelationships.map(({ code, description }) => ({
          value: `${PersonalRelationshipType.Official}_${code}`,
          text: mapRelationshipDescriptionByCode(code, description),
          selected: formValues.relationshipTypeId === `${PersonalRelationshipType.Official}_${code}`,
        })),
        ...socialRelationships.map(({ code, description }) => ({
          value: `${PersonalRelationshipType.Social}_${code}`,
          text: mapRelationshipDescriptionByCode(code, description),
          selected: formValues.relationshipTypeId === `${PersonalRelationshipType.Social}_${code}`,
        })),
      ]
      const titleOptions = [
        { value: '', text: 'Select title' },
        ...objectToSelectOptions(titles, 'code', 'description', formValues.titleCode),
      ]
      const cityOptions = [
        { value: '', text: '' },
        ...objectToSelectOptions(cities, 'code', 'description', formValues.cityCode),
      ]

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.EditNextOfKin,
        })
        .catch(error => logger.error(error))

      return res.render('pages/nextOfKin/nextOfKinEmergencyContacts', {
        pageTitle: `Next of kin and emergency contacts - Prisoner personal details`,
        title: `Add a next of kin or emergency contact for ${naturalPrisonerName}`,
        formValues,
        errors,
        titleOptions,
        naturalPrisonerName,
        relationshipOptions,
        cityOptions,
        miniBannerData: {
          prisonerNumber,
          prisonerName,
          cellLocation: formatLocation(cellLocation),
        },
      })
    }
  }

  public submitNextOfKinEmergencyContact(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware
      const formValues = req.body

      const errors = req.errors || []

      let contactCacheUuid: UUID

      if (!errors.length) {
        const contactRequest: PersonalRelationshipsContactRequest = this.mapFormToRequest(
          formValues,
          prisonerNumber,
          res.locals.user.username,
        )

        try {
          const result = await this.nextOfKinService.createContact(
            clientToken,
            res.locals.user as PrisonUser,
            contactRequest,
          )
          const { id, firstName, lastName } = result.createdContact
          if (formValues.action === 'add-address') {
            contactCacheUuid = await this.ephemeralDataService.cacheData({
              id,
              name: formatName(firstName, '', lastName, { style: NameFormatStyle.firstLast }),
            })
          }
        } catch (error) {
          if (error.status === 400) {
            errors.push({ text: error.message })
          } else throw error
        }
      }

      if (errors.length) {
        req.flash('requestBody', JSON.stringify(formValues))
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/personal/next-of-kin-emergency-contacts`)
      }

      if (formValues.action !== 'add-address') {
        req.flash('flashMessage', {
          text: `Next of kin and emergency contacts added`,
          type: FlashMessageType.success,
          ...(formValues.action === 'continue' ? {} : { fieldName: 'next-of-kin' }),
        })
      }

      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditNextOfKin,
          details: { formValues },
        })
        .catch(error => logger.error(error))

      if (formValues.action === 'add-address') {
        return res.redirect(
          `/prisoner/${prisonerNumber}/personal/where-is-next-of-kin-address?contact=${contactCacheUuid}`,
        )
      }
      return res.redirect(`/prisoner/${prisonerNumber}/personal#next-of-kin`)
    }
  }

  public displayWhereIsTheAddress(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { name } = await this.getContactNameFromCache(req)

      return displayWhereIsTheAddressHandler(this.auditService, {
        pageTitle: 'Where is this contact’s address? - Prisoner personal details',
        formTitle: `Where is ${apostrophe(name)} address?`,
        page: Page.EditNextOfKinAddressLocation,
        cancelAnchor: 'next-of-kin',
      })(req, res, next)
    }
  }

  public submitWhereIsTheAddress(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { contact: contactCacheId } = req.query

      return submitWhereIsTheAddressHandler(this.auditService, {
        redirectOptions: {
          [AddressLocation.uk]: 'find-uk-next-of-kin-address',
          [AddressLocation.overseas]: 'add-next-of-kin-overseas-address',
          [AddressLocation.no_fixed_address]: 'add-uk-next-of-kin-no-fixed-address',
        },
        action: PostAction.EditNextOfKinAddressLocation,
        queryParams: {
          contact: contactCacheId as string,
        },
      })(req, res, next)
    }
  }

  public displayFindUkAddress(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { contact: contactCacheId } = req.query
      const { name } = await this.getContactNameFromCache(req)

      return displayFindUkAddressHandler(this.auditService, {
        pageTitle: 'Find a UK address for this contact - Prisoner personal details',
        formTitle: `Find a UK address for ${name}`,
        auditPage: Page.EditNextOfKinAddressFindUkAddress,
        manualEntryAnchor: 'add-uk-next-of-kin-address',
        backLink: 'where-is-next-of-kin-address',
        cancelAnchor: 'next-of-kin',
        queryParams: {
          contact: contactCacheId as string,
        },
      })(req, res, next)
    }
  }

  public submitFindUkAddress(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { contact: contactCacheId } = req.query

      return submitFindUkAddressHandler(this.addressService, this.ephemeralDataService, this.auditService, {
        route: `find-uk-next-of-kin-address?contact=${contactCacheId}`,
        confirmRedirectUrl: 'confirm-next-of-kin-address',
        auditAction: PostAction.EditNextOfKinAddressFindUkAddress,
        queryParams: {
          contact: contactCacheId as string,
        },
      })(req, res, next)
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
      const { name } = await this.getContactNameFromCache(req)
      const { contact: contactCacheId } = req.query
      const backLink =
        addressLocation === AddressLocation.uk ? 'find-uk-next-of-kin-address' : 'where-is-next-of-kin-address'

      return displayManualEditAddressHandler(this.addressService, this.auditService, {
        addressLocation,
        pageTitle: `${pageTitlePrefix} - Prisoner personal details`,
        formTitle: `${formTitlePrefix} for ${name}`,
        auditPage,
        backLink,
        cancelAnchor: 'next-of-kin',
        queryParams: {
          contact: contactCacheId as string,
        },
      })(req, res, next)
    }
  }

  public submitManualEditAddress(options: {
    addressLocation: AddressLocation
    auditAction: PostAction
  }): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { contact: contactCacheId } = req.query
      return submitManualEditAddressHandler(this.addressService, this.ephemeralDataService, this.auditService, {
        addressLocation: options.addressLocation,
        auditAction: options.auditAction,
        confirmRedirectUrl: 'confirm-next-of-kin-address',
        queryParams: {
          contact: contactCacheId as string,
        },
      })(req, res, next)
    }
  }

  public displayConfirmAddress(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { contact: contactCacheId } = req.query
      const { name } = await this.getContactNameFromCache(req)
      return displayConfirmAddressHandler(this.addressService, this.ephemeralDataService, this.auditService, {
        pageTitle: 'Confirm address - Prisoner personal details',
        formTitle: `Confirm ${apostrophe(name)} address`,
        auditPage: Page.EditNextOfKinAddressConfirm,
        enterDifferentAddressAnchor: `where-is-next-of-kin-address?contact=${contactCacheId}`,
        cancelAnchor: 'next-of-kin',
        confirmPrimaryOrPostalAddress: false,
      })(req, res, next)
    }
  }

  public submitConfirmAddress(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken, prisonerNumber } = getCommonRequestData(req)

      const { address: addressCacheId, contact: contactCacheId } = req.query

      const [addressCache, contactCache] = await Promise.all([
        this.ephemeralDataService.getData<{ address: AddressRequestDto; route: string }>(addressCacheId as UUID),
        this.ephemeralDataService.getData<{ id: number; name: string }>(contactCacheId as UUID),
      ])

      if (!addressCache?.value?.address) {
        throw new NotFoundError('Could not find cached address')
      }
      if (!contactCache?.value?.id) {
        throw new NotFoundError('Could not find cached contact id')
      }

      const { id: contactId } = contactCache.value
      const addressRequest = this.mapCachedAddressToRequest(addressCache.value.address)

      try {
        await this.nextOfKinService.addContactAddress(
          clientToken,
          res.locals.user as PrisonUser,
          prisonerNumber,
          contactId,
          addressRequest,
        )

        await Promise.all([
          this.ephemeralDataService.removeData(addressCacheId as UUID),
          this.ephemeralDataService.removeData(contactCacheId as UUID),
        ])

        this.auditService
          .sendPostSuccess({
            user: res.locals.user,
            prisonerNumber,
            correlationId: req.id,
            action: PostAction.EditNextOfKinAddAddress,
            details: { addressRequest },
          })
          .catch(error => logger.error(error))

        req.flash('flashMessage', {
          text: 'Contact address updated',
          type: FlashMessageType.success,
          fieldName: 'nextOfKin',
        })

        return res.redirect(`/prisoner/${prisonerNumber}/personal#next-of-kin`)
      } catch (e) {
        req.flash('errors', [{ text: 'There was an error please try again' }])
        req.flash('requestBody', JSON.stringify(req.body))
        return res.redirect(
          `/prisoner/${prisonerNumber}/personal/confirm-next-of-kin-address?address=${addressCacheId}&contact=${contactCacheId}`,
        )
      }
    }
  }

  private mapFormToRequest(
    formValues: PersonalRelationshipsContactForm,
    prisonerNumber: string,
    username: string,
  ): PersonalRelationshipsContactRequest {
    const {
      titleCode,
      lastName,
      firstName,
      middleNames,
      'dateOfBirth-day': dateOfBirthDay,
      'dateOfBirth-month': dateOfBirthMonth,
      'dateOfBirth-year': dateOfBirthYear,
      relationshipTypeId,
      contactType,
      noFixedAddress,
      property,
      street,
      cityCode,
      postcode,
      phoneNumber,
    } = formValues
    const [relationshipTypeCode, relationshipToPrisonerCode] = relationshipTypeId.split('_')
    const isNextOfKin = contactType.includes('nextOfKin')
    const isEmergencyContact = contactType.includes('emergencyContact')
    const dateOfBirth =
      dateOfBirthDay &&
      dateOfBirthMonth &&
      dateOfBirthYear &&
      dateToIsoDate(`${dateOfBirthDay}/${dateOfBirthMonth}/${dateOfBirthYear}`)
    const address = (property || street || cityCode || postcode || noFixedAddress) && [
      {
        ...(property && { property }),
        ...(street && { street }),
        ...(cityCode && { cityCode }),
        ...(postcode && { postcode }),
        noFixedAddress,
        countryCode: 'ENG',
      },
    ]

    const phone = phoneNumber?.type
      ? [this.mapPhoneNumberFromFormData(phoneNumber)].filter(item => item !== undefined)
      : undefined

    return {
      ...(titleCode && { titleCode }),
      lastName,
      firstName,
      ...(middleNames && { middleNames }),
      ...(dateOfBirth && { dateOfBirth }),
      isStaff: false,
      relationship: {
        prisonerNumber,
        relationshipTypeCode,
        relationshipToPrisonerCode,
        isNextOfKin,
        isEmergencyContact,
        isApprovedVisitor: false,
      },
      addresses: address ?? [],
      phoneNumbers: phone ?? [],
      createdBy: username,
    }
  }

  private mapPhoneNumberFromFormData(formValues: PersonalRelationshipsContactFormPhoneNumbers) {
    if (!formValues || !formValues.type || formValues.type === 'NONE') {
      return undefined
    }

    return {
      phoneType: formValues.type,
      phoneNumber: formValues.numbers?.[PhoneNumberTypeMappings[formValues.type].formValue]?.number || undefined,
      extNumber: formValues.numbers?.[PhoneNumberTypeMappings[formValues.type].formValue]?.extension || undefined,
    }
  }

  private async getContactNameFromCache(req: Request) {
    const { contact: contactCacheId } = req.query
    const contactNameCache = await this.ephemeralDataService.getData<{ id: number; name: string }>(
      contactCacheId as UUID,
    )

    if (!contactNameCache?.value?.name) {
      throw new NotFoundError('Could not find cached contact name')
    }

    return contactNameCache.value
  }

  private mapCachedAddressToRequest(cachedAddress: AddressRequestDto): PersonalRelationshipsContactRequestAddress {
    const {
      buildingNumber,
      buildingName,
      thoroughfareName,
      dependantLocality,
      postCode,
      postTownCode,
      countyCode,
      countryCode,
      noFixedAbode,
    } = cachedAddress

    return {
      property: buildingNumber && buildingName ? `${buildingNumber} ${buildingName}` : buildingNumber,
      ...(thoroughfareName && { street: thoroughfareName }),
      ...(dependantLocality && { area: dependantLocality }),
      ...(postTownCode && { cityCode: postTownCode }),
      ...(postCode && { postcode: postCode }),
      ...(countyCode && { countyCode }),
      ...(countryCode && { countryCode }),
      noFixedAddress: noFixedAbode ?? false,
    }
  }
}
