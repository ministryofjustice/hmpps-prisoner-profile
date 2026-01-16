import { Request, Response } from 'express'
import { addPhoneNumberFieldData, changePhoneNumberFieldData, TextFieldData } from '../../fieldData'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import PersonalEditController from '../personalEditController'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService, Page } from '../../../../services/auditService'
import getCommonRequestData from '../../../../utils/getCommonRequestData'
import { requestBodyFromFlash } from '../../../../utils/requestBodyFromFlash'
import { RadioOption } from '../../../../utils/utils'
import { CorePersonRecordReferenceDataDomain } from '../../../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { ReferenceDataCodeDto } from '../../../../data/interfaces/referenceData'
import { EditControllerRequestHandlers } from '../../../interfaces/EditControllerRequestHandlers'

export default class PhoneNumbersController extends PersonalEditController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    protected readonly auditService: AuditService,
  ) {
    super(auditService)
  }

  globalNumbers(): Record<'add' | 'edit', EditControllerRequestHandlers> {
    const phoneTypeOptions = (referenceData: ReferenceDataCodeDto[], chosenType: string = null): RadioOption[] => {
      const orderedReferenceDataCodes = ['MOB', 'HOME', 'ALTH', 'BUS', 'ALTB', 'VISIT', 'FAX']

      return referenceData
        .sort((a, b) => orderedReferenceDataCodes.indexOf(a.code) - orderedReferenceDataCodes.indexOf(b.code))
        .map(({ code, description }) => {
          return {
            text: description,
            value: code,
            checked: chosenType === code,
          }
        })
    }

    const onAdditionSubmit = async (req: Request, res: Response, fieldData: TextFieldData) => {
      const { prisonerNumber } = req.params
      const addAnother = req.query?.addAnother ?? 'false'

      if (addAnother === 'true') {
        return res.redirect(`/prisoner/${prisonerNumber}/personal/${fieldData.url}`)
      }

      return res.redirect(`/prisoner/${prisonerNumber}/personal#${fieldData.redirectAnchor}`)
    }

    return {
      add: {
        edit: async (req, res) => {
          const { clientToken, prisonerNumber, prisonId, naturalPrisonerName, miniBannerData } = getCommonRequestData(
            req,
            res,
          )
          const errors = req.flash('errors')
          const { pageTitle, formTitle } = addPhoneNumberFieldData(naturalPrisonerName)
          const [phoneTypes] = await Promise.all([
            this.personalPageService.getReferenceDataCodes(clientToken, CorePersonRecordReferenceDataDomain.phoneTypes),
          ])

          const requestBodyFlash = requestBodyFromFlash<{
            phoneNumber: string
            phoneNumberType: string
            phoneExtension: string
          }>(req)

          const phoneValue = requestBodyFlash
            ? {
                type: requestBodyFlash.phoneNumberType,
                number: requestBodyFlash.phoneNumber,
                extension: requestBodyFlash.phoneExtension,
              }
            : undefined

          await this.auditService.sendPageView({
            user: res.locals.user,
            prisonerNumber,
            prisonId,
            correlationId: req.id,
            page: Page.AddPhoneNumber,
          })

          res.render('pages/edit/phone', {
            pageTitle: `${pageTitle} - Prisoner personal details`,
            formTitle,
            errors,
            addAnotherEnabled: true,
            phoneTypeOptions: phoneTypeOptions(phoneTypes, phoneValue?.type),
            phoneNumber: phoneValue?.number,
            phoneExtension: phoneValue?.extension,
            miniBannerData,
          })
        },

        submit: async (req, res) => {
          const { clientToken, prisonerNumber, naturalPrisonerName } = getCommonRequestData(req, res)
          const { phoneNumber, phoneNumberType, phoneExtension } = req.body
          const fieldData = addPhoneNumberFieldData(naturalPrisonerName)

          const { phones } = await this.personalPageService.getGlobalPhonesAndEmails(clientToken, prisonerNumber)
          const sanitisedNumber = phoneNumber.replace(/\D/g, '')
          const isDuplicate = phones.some(
            phone => phone.number.replace(/\D/g, '') === sanitisedNumber && (phone.extension ?? '') === phoneExtension,
          )

          if (isDuplicate) {
            req.flash('errors', [
              {
                text: 'This phone number already exists for this person. Add a new number or edit the saved one',
                href: '#phone-number',
              },
            ])
            req.flash('requestBody', JSON.stringify(req.body))
            return res.redirect(`/prisoner/${prisonerNumber}/personal/${fieldData.url}`)
          }

          return this.submit({
            req,
            res,
            prisonerNumber,
            submit: async () => {
              await this.personalPageService.createGlobalPhoneNumber(
                clientToken,
                res.locals.user as PrisonUser,
                prisonerNumber,
                {
                  phoneNumber,
                  phoneNumberType,
                  phoneExtension,
                },
              )
            },
            fieldData,
            auditDetails: {
              fieldName: fieldData.fieldName,
              previous: {},
              updated: { phoneNumber, phoneNumberType, phoneExtension },
            },
            options: { onSubmit: onAdditionSubmit },
          })
        },
      },
      edit: {
        edit: async (req, res) => {
          const { phoneNumberId } = req.params
          const { clientToken, prisonerNumber, prisonId, naturalPrisonerName, miniBannerData } = getCommonRequestData(
            req,
            res,
          )
          const errors = req.flash('errors')
          const { pageTitle, formTitle } = changePhoneNumberFieldData(phoneNumberId, naturalPrisonerName)
          const requestBodyFlash = requestBodyFromFlash<{
            phoneNumber: string
            phoneNumberType: string
            phoneExtension: string
          }>(req)

          const [phonesAndEmails, phoneTypes] = await Promise.all([
            this.personalPageService.getGlobalPhonesAndEmails(clientToken, prisonerNumber),
            this.personalPageService.getReferenceDataCodes(clientToken, CorePersonRecordReferenceDataDomain.phoneTypes),
          ])

          const phoneValue = requestBodyFlash
            ? {
                type: requestBodyFlash.phoneNumberType,
                number: requestBodyFlash.phoneNumber,
                extension: requestBodyFlash.phoneExtension,
              }
            : phonesAndEmails.phones.find(phone => phone.id.toString() === phoneNumberId)

          await this.auditService.sendPageView({
            user: res.locals.user,
            prisonerNumber,
            prisonId,
            correlationId: req.id,
            page: Page.EditPhoneNumber,
          })

          res.render('pages/edit/phone', {
            pageTitle: `${pageTitle} - Prisoner personal details`,
            formTitle,
            errors,
            phoneTypeOptions: phoneTypeOptions(phoneTypes, phoneValue.type),
            phoneNumber: phoneValue.number,
            phoneExtension: phoneValue.extension,
            miniBannerData,
          })
        },

        submit: async (req, res) => {
          const { phoneNumberId } = req.params
          const { clientToken, prisonerNumber, naturalPrisonerName } = getCommonRequestData(req, res)
          const { phoneNumber, phoneNumberType, phoneExtension } = req.body
          const fieldData = changePhoneNumberFieldData(phoneNumberId, naturalPrisonerName)
          const { phones } = await this.personalPageService.getGlobalPhonesAndEmails(clientToken, prisonerNumber)
          const previousValue = phones.find(phone => phone.id.toString() === phoneNumberId)

          const sanitisedNumber = phoneNumber.replace(/\D/g, '')
          const isDuplicate = phones
            .filter(phone => phone.id.toString() !== phoneNumberId)
            .some(
              phone =>
                phone.number.replace(/\D/g, '') === sanitisedNumber && (phone.extension ?? '') === phoneExtension,
            )

          if (isDuplicate) {
            req.flash('errors', [
              {
                text: 'This phone number already exists for this person. Add a new number or edit the saved one',
                href: '#phone-number',
              },
            ])
            req.flash('requestBody', JSON.stringify(req.body))
            return res.redirect(`/prisoner/${prisonerNumber}/personal/${fieldData.url}`)
          }

          return this.submit({
            req,
            res,
            prisonerNumber,
            submit: async () => {
              await this.personalPageService.updateGlobalPhoneNumber(
                clientToken,
                res.locals.user as PrisonUser,
                prisonerNumber,
                phoneNumberId,
                {
                  phoneNumber,
                  phoneNumberType,
                  phoneExtension,
                },
              )
            },
            fieldData,
            auditDetails: {
              fieldName: fieldData.fieldName,
              previous: {
                phoneNumber: previousValue.number,
                phoneNumberType: previousValue.type,
                phoneExtension: previousValue.extension,
              },
              updated: { phoneNumber, phoneNumberType, phoneExtension },
            },
          })
        },
      },
    }
  }
}
