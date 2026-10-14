import { RequestHandler } from 'express'
import AddressService from '../services/addressService'
import { AuditService, Page, PostAction } from '../services/auditService'
import { addressToLines } from '../utils/utils'
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

const addressPhoneNumberFormValues = (body: Record<string, unknown>) => {
  const value = (key: string): string => (typeof body[key] === 'string' ? body[key] : '')
  const indexes = Object.keys(body)
    .map(key => key.match(/^phoneNumber(?:Type|Extension)?(\d+)$/)?.[1])
    .filter((index): index is string => index !== undefined)
    .map(Number)
  const lastIndex = Math.max(0, ...indexes)

  return Array.from({ length: lastIndex + 1 }, (_, index) => ({
    phoneNumberType: value(`phoneNumberType${index}`),
    phoneNumber: value(`phoneNumber${index}`),
    phoneExtension: value(`phoneExtension${index}`),
  }))
}

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
      const returnToAddresses = req.query?.returnTo === 'addresses' || formValues?.returnTo === 'addresses'
      const initialFormValues = phone
        ? {
            phoneNumberType0: phone.type,
            phoneNumber0: phone.number,
            phoneExtension0: phone.ext ?? '',
          }
        : {}
      const phoneNumbers = addressPhoneNumberFormValues(formValues ?? initialFormValues)
      const errors = req.flash('errors')

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
        returnToAddresses,
        errors,
        prisonerNumber,
        miniBannerData,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { clientToken, prisonerNumber } = getCommonRequestData(req, res)
      const addressId = Number(req.params.addressId)
      const isChanging = req.params.phoneId !== undefined
      const phoneNumbers = addressPhoneNumberFormValues(req.body)
      const returnToAddresses = req.query?.returnTo === 'addresses' || req.body?.returnTo === 'addresses'
      const addAddressPhoneNumberUrl = `/prisoner/${prisonerNumber}/addresses/${addressId}/add-address-phone-number${returnToAddresses ? '?returnTo=addresses' : ''}`

      if (!isChanging && req.query.removePhoneNumber !== undefined) {
        const removedIndex = Number(req.query.removePhoneNumber)
        const requestBody = {
          ...Object.fromEntries(
            phoneNumbers
              .filter((_, index) => index !== removedIndex)
              .flatMap((phoneNumber, index) => [
                [`phoneNumberType${index}`, phoneNumber.phoneNumberType] as const,
                [`phoneNumber${index}`, phoneNumber.phoneNumber] as const,
                [`phoneExtension${index}`, phoneNumber.phoneExtension] as const,
              ]),
          ),
          ...(returnToAddresses ? { returnTo: 'addresses' } : {}),
        }
        req.flash('requestBody', JSON.stringify(requestBody))
        return res.redirect(addAddressPhoneNumberUrl)
      }

      if (!isChanging && req.query.addAnother === 'true') {
        const requestBody = { ...req.body }
        const nextIndex = phoneNumbers.length
        requestBody[`phoneNumberType${nextIndex}`] = ''
        requestBody[`phoneNumber${nextIndex}`] = ''
        requestBody[`phoneExtension${nextIndex}`] = ''
        req.flash('requestBody', JSON.stringify(requestBody))
        return res.redirect(addAddressPhoneNumberUrl)
      }

      const phoneNumberRequests = (isChanging ? phoneNumbers.slice(0, 1) : phoneNumbers).map(
        ({ phoneNumber, phoneNumberType, phoneExtension }) => ({
          phoneNumber,
          phoneNumberType,
          extension: phoneExtension || undefined,
        }),
      )

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

        return res.redirect(
          returnToAddresses
            ? `/prisoner/${prisonerNumber}/addresses`
            : `/prisoner/${prisonerNumber}/personal#addresses`,
        )
      } catch {
        req.flash('errors', [{ text: 'There was an error please try again' }])
        req.flash('requestBody', JSON.stringify(req.body))
        return res.redirect(req.originalUrl)
      }
    }
  }
}
