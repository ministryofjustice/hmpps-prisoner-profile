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

      const formValues = requestBodyFromFlash<Record<string, string>>(req)
      const phoneNumber = {
        phoneNumberType: formValues?.phoneNumberType ?? '',
        phoneNumber: formValues?.phoneNumber ?? '',
        phoneExtension: formValues?.phoneExtension ?? '',
      }
      const errors = req.flash('errors')

      await this.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.AddAddressPhoneNumber,
      })

      return res.render('pages/edit/addressPhoneNumbers', {
        pageTitle: 'Add a phone number for this address - Prisoner personal details',
        formTitle: 'Add a phone number for this address',
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
        phoneNumber: {
          ...phoneNumber,
          phoneTypeOptions: phoneNumberTypes.map(option => ({
            ...option,
            checked: phoneNumber.phoneNumberType === option.value,
          })),
        },
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
      const phoneNumberRequests = [
        {
          phoneNumber: req.body.phoneNumber,
          phoneNumberType: req.body.phoneNumberType,
          extension: req.body.phoneExtension || undefined,
        },
      ]

      try {
        const createdPhoneNumbers = await this.addressService.addAddressPhoneNumbers(
          clientToken,
          prisonerNumber,
          addressId,
          phoneNumberRequests,
        )
        req.flash('flashMessage', {
          text: 'Address phone number updated',
          fieldName: 'addressPhoneNumbers',
          phoneIds: createdPhoneNumbers.map(phoneNumber => phoneNumber.phoneId).filter(Boolean),
        })

        this.auditService
          .sendPostSuccess({
            user: res.locals.user,
            prisonerNumber,
            correlationId: req.id,
            action: PostAction.AddAddressPhoneNumber,
            details: { addressId, phoneNumbers: phoneNumberRequests },
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
