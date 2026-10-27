import { RequestHandler } from 'express'
import AddressService from '../services/addressService'
import { AuditService, Page, PostAction } from '../services/auditService'
import { addressPhoneNumberFormValues, addressToLines } from '../utils/utils'
import getCommonRequestData from '../utils/getCommonRequestData'
import NotFoundError from '../utils/notFoundError'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'
import logger from '../../logger'

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
        const removedIndex = Number(req.query.removePhoneNumber)
        const requestBody = Object.fromEntries(
          phoneNumbers
            .filter((_, index) => index !== removedIndex)
            .flatMap((phoneNumber, index) => [
              [`phoneNumberType${index}`, phoneNumber.phoneNumberType] as const,
              [`phoneNumber${index}`, phoneNumber.phoneNumber] as const,
              [`phoneExtension${index}`, phoneNumber.phoneExtension] as const,
            ]),
        )
        if (req.body.highlightAddressId) requestBody.highlightAddressId = req.body.highlightAddressId
        if (req.body.addressCacheId) requestBody.addressCacheId = req.body.addressCacheId
        req.flash('requestBody', JSON.stringify(requestBody))
        return res.redirect(`${addAddressPhoneNumberUrl}#phone-number-section-${Math.max(removedIndex - 1, 0)}`)
      }

      const phoneNumberRequests = (isChanging ? phoneNumbers.slice(0, 1) : phoneNumbers).map(
        ({ phoneNumber, phoneNumberType, phoneExtension }) => ({
          phoneNumber,
          phoneNumberType,
          extension: phoneExtension || undefined,
        }),
      )

      if (!isChanging && req.query.addAnother === 'true') {
        const requestBody = { ...req.body }
        const nextIndex = phoneNumbers.length
        requestBody[`phoneNumberType${nextIndex}`] = ''
        requestBody[`phoneNumber${nextIndex}`] = ''
        requestBody[`phoneExtension${nextIndex}`] = ''
        req.flash('requestBody', JSON.stringify(requestBody))
        return res.redirect(`${addAddressPhoneNumberUrl}#phone-number-section-${nextIndex}`)
      }

      try {
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
