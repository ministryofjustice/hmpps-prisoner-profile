import PersonalEditController from '../personalEditController'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService, Page } from '../../../../services/auditService'
import { addPhoneNumberFieldData, changePhoneNumberFieldData } from '../../fieldData'
import getCommonRequestData from '../../../../utils/getCommonRequestData'
import { requestBodyFromFlash } from '../../../../utils/requestBodyFromFlash'
import { addressPhoneNumberFormValues } from '../../../../utils/utils'
import {
  redirectAfterPhoneNumberRemoval,
  redirectToNewPhoneNumberRow,
  redirectWithPhoneNumberErrors,
} from '../../../../utils/phoneNumberRows'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import { CorePersonRecordReferenceDataDomain } from '../../../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { ReferenceDataCodeDto } from '../../../../data/interfaces/referenceData'
import type { RadioOption } from '../../../../interfaces/GovOptions'
import { EditControllerRequestHandlers } from '../../../interfaces/EditControllerRequestHandlers'
import {
  deduplicatePhoneNumberPairs,
  normalisePhoneExtension,
  phoneNumberForStorage,
  phoneNumberValidator,
  validatePhoneNumberDuplicate,
} from '../../../../validators/personal/phoneNumberValidator'

export default class GlobalNumbersController extends PersonalEditController {
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

          const requestBodyFlash = requestBodyFromFlash<Record<string, unknown>>(req)
          const phoneNumbers = addressPhoneNumberFormValues(requestBodyFlash ?? {}).map((phoneNumber, index) => ({
            ...phoneNumber,
            index,
            phoneTypeOptions: phoneTypeOptions(phoneTypes, phoneNumber.phoneNumberType),
          }))

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
            phoneNumbers,
            miniBannerData,
          })
        },

        submit: async (req, res) => {
          const { clientToken, prisonerNumber, naturalPrisonerName } = getCommonRequestData(req, res)
          const phoneNumbers = addressPhoneNumberFormValues(req.body)
          const fieldData = addPhoneNumberFieldData(naturalPrisonerName)
          const phoneNumberUrl = `/prisoner/${prisonerNumber}/personal/${fieldData.url}`

          if (req.query?.removePhoneNumber !== undefined) {
            return redirectAfterPhoneNumberRemoval(
              req,
              res,
              phoneNumbers,
              Number(req.query.removePhoneNumber),
              phoneNumberUrl,
            )
          }

          const { phones } = await this.personalPageService.getGlobalPhonesAndEmails(clientToken, prisonerNumber)
          const errors = [
            ...phoneNumberValidator(req.body),
            ...phoneNumbers.flatMap((phone, index) =>
              validatePhoneNumberDuplicate(phone.phoneNumber, phone.phoneExtension, phones, 'global', index),
            ),
          ]

          if (errors.length) {
            return redirectWithPhoneNumberErrors(req, res, errors, phoneNumberUrl)
          }

          if (req.query?.addAnother === 'true') {
            return redirectToNewPhoneNumberRow(req, res, phoneNumbers.length, phoneNumberUrl)
          }

          const phoneNumberRequests = deduplicatePhoneNumberPairs(
            phoneNumbers.map(({ phoneNumber, phoneNumberType, phoneExtension }) => ({
              phoneNumber: phoneNumberForStorage(phoneNumber),
              phoneNumberType,
              extension: normalisePhoneExtension(phoneExtension),
            })),
          )

          let savedPhoneIds: number[] = []

          return this.submit({
            req,
            res,
            prisonerNumber,
            submit: async () => {
              savedPhoneIds = (
                await Promise.all(
                  phoneNumberRequests.map(phone =>
                    this.personalPageService.createGlobalPhoneNumber(
                      clientToken,
                      res.locals.user as PrisonUser,
                      prisonerNumber,
                      {
                        phoneNumber: phone.phoneNumber,
                        phoneNumberType: phone.phoneNumberType,
                        phoneExtension: phone.extension,
                      },
                    ),
                  ),
                )
              ).map(phone => phone.id)
            },
            fieldData,
            auditDetails: {
              fieldName: fieldData.fieldName,
              previous: {},
              updated:
                phoneNumberRequests.length === 1
                  ? {
                      phoneNumber: phoneNumberRequests[0].phoneNumber,
                      phoneNumberType: phoneNumberRequests[0].phoneNumberType,
                      phoneExtension: phoneNumberRequests[0].extension,
                    }
                  : phoneNumberRequests.map(({ phoneNumber, phoneNumberType, extension }) => ({
                      phoneNumber,
                      phoneNumberType,
                      phoneExtension: extension,
                    })),
            },
            options: { flashMessage: () => ({ phoneIds: savedPhoneIds }) },
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
          const storedPhoneNumber = phoneNumberForStorage(phoneNumber)
          const storedPhoneExtension = normalisePhoneExtension(phoneExtension)
          const fieldData = changePhoneNumberFieldData(phoneNumberId, naturalPrisonerName)
          const { phones } = await this.personalPageService.getGlobalPhonesAndEmails(clientToken, prisonerNumber)
          const previousValue = phones.find(phone => phone.id.toString() === phoneNumberId)

          const errors = [
            ...phoneNumberValidator(req.body),
            ...validatePhoneNumberDuplicate(
              storedPhoneNumber,
              storedPhoneExtension,
              phones.filter(phone => phone.id.toString() !== phoneNumberId),
              'global',
            ),
          ]

          if (errors.length) {
            return redirectWithPhoneNumberErrors(
              req,
              res,
              errors,
              `/prisoner/${prisonerNumber}/personal/${fieldData.url}`,
            )
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
                  phoneNumber: storedPhoneNumber,
                  phoneNumberType,
                  phoneExtension: storedPhoneExtension,
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
              updated: { phoneNumber: storedPhoneNumber, phoneNumberType, phoneExtension: storedPhoneExtension },
            },
          })
        },
      },
    }
  }
}
