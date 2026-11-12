import { RequestHandler } from 'express'
import AddressService from '../services/addressService'
import { AuditService, Page, PostAction } from '../services/auditService'
import { addressPhoneNumberFormValues, addressToLines } from '../utils/utils'
import getCommonRequestData from '../utils/getCommonRequestData'
import NotFoundError from '../utils/notFoundError'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'
import logger from '../../logger'
import {
  redirectAfterPhoneNumberRemoval,
  redirectToNewPhoneNumberRow,
  redirectWithPhoneNumberErrors,
} from '../utils/phoneNumberRows'
import {
  deduplicatePhoneNumberPairs,
  normalisePhoneExtension,
  phoneNumberForStorage,
  phoneNumberValidator,
  validatePhoneNumberDuplicate,
} from '../validators/personal/phoneNumberValidator'

const phoneNumberTypes = [
  { text: 'Mobile', value: 'MOB' },
  { text: 'Home', value: 'HOME' },
  { text: 'Alternate home', value: 'ALTH' },
  { text: 'Business', value: 'BUS' },
  { text: 'Alternate business', value: 'ALTB' },
  { text: 'Agency visit line', value: 'VISIT' },
  { text: 'Fax', value: 'FAX' },
]

export default class AddressPhoneNumberController {
  constructor(
    private readonly addressService: AddressService,
    private readonly auditService: AuditService,
  ) {}

  public display(): RequestHandler {
    return async (req, res) => {
      const { clientToken, prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)
      const addressId = Number(req.params.addressId)
      const address = (await this.addressService.getAddressesFromPrisonAPI(clientToken, prisonerNumber))?.find(
        candidate => candidate.addressId === addressId,
      )

      if (!address) throw new NotFoundError('Could not find address')

      const phoneId = req.params.phoneId === undefined ? undefined : Number(req.params.phoneId)
      const isChanging = phoneId !== undefined
      const phone = isChanging ? address.phones?.find(candidate => candidate.phoneId === phoneId) : undefined

      if (isChanging && !phone) throw new NotFoundError('Could not find phone number')

      const formValues = requestBodyFromFlash<Record<string, unknown>>(req)
      const initialFormValues = phone
        ? {
            phoneNumberType0: phone.type,
            phoneNumber0: phone.number,
            phoneExtension0: phone.ext ?? '',
          }
        : {}
      const phoneNumbers = addressPhoneNumberFormValues(formValues ?? initialFormValues)
      const errors = req.flash('errors')
      const addressCacheId = formValues?.addressCacheId ?? req.query?.addressCacheId

      await this.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: isChanging ? Page.EditAddressPhoneNumber : Page.AddAddressPhoneNumber,
      })

      return res.render('pages/edit/addressPhoneNumbers', {
        pageTitle: `${isChanging ? 'Change a phone number for this address' : 'Add a phone number for this address'} - Prisoner personal details`,
        formTitle: isChanging ? 'Change the phone number for this address' : 'Add a phone number for this address',
        addressLines: [
          ...(address.noFixedAddress ? ['No fixed address'] : []),
          ...addressToLines({
            flat: address.flat,
            premise: address.premise,
            street: address.street,
            town: address.town,
            county: address.county,
            postalCode: address.postalCode,
            country: address.country,
          }),
        ],
        phoneNumbers: phoneNumbers.map((phoneNumber, index) => ({
          ...phoneNumber,
          index,
          phoneTypeOptions: phoneNumberTypes.map(option => ({
            ...option,
            checked: phoneNumber.phoneNumberType === option.value,
          })),
        })),
        isChanging,
        errors,
        prisonerNumber,
        highlightAddressId: formValues?.highlightAddressId ?? req.query?.highlightAddressId,
        addressCacheId,
        cancelUrl: addressCacheId
          ? `/prisoner/${prisonerNumber}/addresses/${addressId}/cancel-add-address-phone-number?addressCacheId=${addressCacheId}`
          : `/prisoner/${prisonerNumber}/personal#addresses`,
        miniBannerData,
      })
    }
  }

  public cancel(): RequestHandler {
    return (req, res) => {
      const { prisonerNumber } = getCommonRequestData(req, res)
      const addressId = Number(req.params.addressId)

      req.flash('flashMessage', {
        text: 'Address updated',
        fieldName: 'addresses',
        addressIds: [addressId],
      })

      return res.redirect(`/prisoner/${prisonerNumber}/personal#addresses`)
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { clientToken, prisonerNumber } = getCommonRequestData(req, res)
      const addressId = Number(req.params.addressId)
      const isChanging = req.params.phoneId !== undefined
      const phoneNumbers = addressPhoneNumberFormValues(req.body)
      const addAddressPhoneNumberUrl = `/prisoner/${prisonerNumber}/addresses/${addressId}/add-address-phone-number`

      if (!isChanging && req.query.removePhoneNumber !== undefined) {
        return redirectAfterPhoneNumberRemoval(
          req,
          res,
          phoneNumbers,
          Number(req.query.removePhoneNumber),
          addAddressPhoneNumberUrl,
        )
      }

      try {
        const address = (await this.addressService.getAddressesFromPrisonAPI(clientToken, prisonerNumber))?.find(
          candidate => candidate.addressId === addressId,
        )
        const existingNumbers = (address?.phones ?? [])
          .filter(phone => !isChanging || phone.phoneId !== Number(req.params.phoneId))
          .map(phone => ({ number: phone.number, extension: phone.ext }))
        const errors = [
          ...phoneNumberValidator(req.body, true),
          ...phoneNumbers.flatMap((phone, index) =>
            validatePhoneNumberDuplicate(phone.phoneNumber, phone.phoneExtension, existingNumbers, 'address', index),
          ),
        ]

        if (errors.length) {
          return redirectWithPhoneNumberErrors(
            req,
            res,
            errors,
            isChanging ? req.originalUrl : addAddressPhoneNumberUrl,
          )
        }

        if (!isChanging && req.query.addAnother === 'true') {
          return redirectToNewPhoneNumberRow(req, res, phoneNumbers.length, addAddressPhoneNumberUrl)
        }

        const phoneNumberRequests = deduplicatePhoneNumberPairs(
          (isChanging ? phoneNumbers.slice(0, 1) : phoneNumbers).map(
            ({ phoneNumber, phoneNumberType, phoneExtension }) => ({
              phoneNumber: phoneNumberForStorage(phoneNumber),
              phoneNumberType,
              extension: normalisePhoneExtension(phoneExtension),
            }),
          ),
        )

        const savedPhoneNumbers = isChanging
          ? [
              await this.addressService.updateAddressPhoneNumber(
                clientToken,
                prisonerNumber,
                addressId,
                Number(req.params.phoneId),
                phoneNumberRequests[0],
              ),
            ]
          : await this.addressService.addAddressPhoneNumbers(
              clientToken,
              prisonerNumber,
              addressId,
              phoneNumberRequests,
            )
        req.flash('flashMessage', {
          text: 'Address phone number updated',
          fieldName: 'addressPhoneNumbers',
          addressIds:
            req.body?.highlightAddressId || req.query?.highlightAddressId
              ? [Number(req.body?.highlightAddressId || req.query?.highlightAddressId)]
              : [],
          phoneIds: isChanging
            ? [Number(req.params.phoneId)]
            : savedPhoneNumbers.map(phoneNumber => phoneNumber.phoneId).filter(Boolean),
        })

        this.auditService
          .sendPostSuccess({
            user: res.locals.user,
            prisonerNumber,
            correlationId: req.id,
            action: isChanging ? PostAction.EditAddressPhoneNumber : PostAction.AddAddressPhoneNumber,
            details: isChanging
              ? { addressId, phoneId: Number(req.params.phoneId), phoneNumber: phoneNumberRequests[0] }
              : { addressId, phoneNumbers: phoneNumberRequests },
          })
          .catch(error => logger.error(error))

        return res.redirect(`/prisoner/${prisonerNumber}/personal#addresses`)
      } catch {
        req.flash('errors', [{ text: 'There was an error please try again' }])
        req.flash('requestBody', JSON.stringify(req.body))
        return res.redirect(req.originalUrl)
      }
    }
  }
}
