import { NextFunction, Request, Response } from 'express'
import { PrisonUser } from '../../interfaces/HmppsUser'
import PersonalPageService from '../../services/personalPageService'
import CareNeedsService from '../../services/careNeedsService'
import {
  centimetresToFeetAndInches,
  feetAndInchesToCentimetres,
  kilogramsToStoneAndPounds,
  stoneAndPoundsToKilograms,
} from '../../utils/unitConversions'
import { mapHeaderData } from '../../mappers/headerMappers'
import { AuditService, Page, PostAction } from '../../services/auditService'
import {
  CheckboxOptions,
  fieldHistoryToFormattedValue,
  fieldHistoryToRows,
  formatLocation,
  formatName,
  objectToRadioOptions,
  RadioOption,
  userHasRoles,
} from '../../utils/utils'
import { NameFormatStyle } from '../../data/enums/nameFormatStyle'
import { FlashMessageType } from '../../data/enums/flashMessageType'
import { enablePrisonPerson } from '../../utils/featureToggles'
import {
  CheckboxFieldData,
  PhysicalAttributesTextFieldData,
  RadioFieldData,
  smokerOrVaperFieldData,
  TextFieldData,
} from './fieldData'
import logger from '../../../logger'
import miniBannerData from '../utils/miniBannerData'
import { requestBodyFromFlash } from '../../utils/requestBodyFromFlash'
import { getProfileInformationValue, ProfileInformationType } from '../../data/interfaces/prisonApi/ProfileInformation'
import {
  PrisonPersonCharacteristic,
  PrisonPersonCharacteristicCode,
  PrisonPersonPhysicalAttributes,
  ValueWithMetadata,
} from '../../data/interfaces/prisonPersonApi/prisonPersonApiClient'
import PrisonPersonService from '../../services/prisonPersonService'
import { formatDateTime } from '../../utils/dateHelpers'
import {
  checkboxInputToSelectedValues,
  referenceDataDomainToCheckboxFieldDataOptions,
  referenceDataDomainToCheckboxOptions,
} from '../../utils/checkboxUtils'

type TextFieldGetter = (req: Request, fieldData: TextFieldData) => Promise<string>
type TextFieldSetter = (req: Request, res: Response, fieldData: TextFieldData, value: string) => Promise<void>

export default class PersonalController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    private readonly prisonPersonService: PrisonPersonService,
    private readonly careNeedsService: CareNeedsService,
    private readonly auditService: AuditService,
  ) {}

  displayPersonalPage() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const {
        prisonerData,
        inmateDetail,
        alertSummaryData: { alertFlags },
        clientToken,
      } = req.middleware
      const { bookingId } = prisonerData
      const user = res.locals.user as PrisonUser
      const { activeCaseLoadId, userRoles } = user
      const prisonPersonEnabled = enablePrisonPerson(activeCaseLoadId)

      const [personalPageData, careNeeds, xrays] = await Promise.all([
        this.personalPageService.get(clientToken, prisonerData, prisonPersonEnabled),
        this.careNeedsService.getCareNeedsAndAdjustments(clientToken, bookingId),
        this.careNeedsService.getXrayBodyScanSummary(clientToken, bookingId),
      ])

      await this.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.Personal,
      })

      res.render('pages/personalPage', {
        pageTitle: 'Personal',
        ...mapHeaderData(prisonerData, inmateDetail, alertFlags, res.locals.user, 'personal'),
        ...personalPageData,
        changeEyeColourUrl:
          personalPageData.physicalCharacteristics.leftEyeColour ===
          personalPageData.physicalCharacteristics.rightEyeColour
            ? 'personal/edit/eye-colour'
            : 'personal/edit/eye-colour-individual',
        careNeeds: careNeeds.filter(need => need.isOngoing).sort((a, b) => b.startDate?.localeCompare(a.startDate)),
        security: { ...personalPageData.security, xrays },
        hasPastCareNeeds: careNeeds.some(need => !need.isOngoing),
        editEnabled: enablePrisonPerson(activeCaseLoadId) && userHasRoles(['DPS_APPLICATION_DEVELOPER'], userRoles),
        historyEnabled:
          personalPageData.showFieldHistoryLink &&
          enablePrisonPerson(activeCaseLoadId) &&
          userHasRoles(['DPS_APPLICATION_DEVELOPER'], userRoles),
      })
    }
  }

  height() {
    return {
      metric: {
        edit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken, prisonerData } = req.middleware
          const { firstName, lastName } = prisonerData
          const requestBodyFlash = requestBodyFromFlash<{ editField: string }>(req)
          const errors = req.flash('errors')
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          await this.auditService.sendPageView({
            user: res.locals.user,
            prisonerNumber: prisonerData.prisonerNumber,
            prisonId: prisonerData.prisonId,
            correlationId: req.id,
            page: Page.EditHeight,
          })

          res.render('pages/edit/heightMetric', {
            pageTitle: 'Height - Prisoner personal details',
            prisonerNumber,
            breadcrumbPrisonerName: formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst }),
            errors,
            fieldValue: requestBodyFlash ? requestBodyFlash.editField : prisonPerson?.physicalAttributes?.height?.value,
            miniBannerData: miniBannerData(prisonerData),
          })
        },

        submit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const { editField } = req.body
          const user = res.locals.user as PrisonUser

          const height = editField ? parseInt(editField, 10) : 0

          try {
            await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
              height: editField ? height : null,
            })

            req.flash('flashMessage', { text: 'Height edited', type: FlashMessageType.success, fieldName: 'height' })

            this.auditService
              .sendPostSuccess({
                user,
                prisonerNumber,
                correlationId: req.id,
                action: PostAction.EditPhysicalCharacteristics,
                details: { pageTitle: 'Height' },
              })
              .catch(error => logger.error(error))

            return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)
          } catch (e) {
            req.flash('requestBody', JSON.stringify(req.body))
            req.flash('errors', [{ text: 'There was an error please try again' }])
            return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/height`)
          }
        },
      },

      imperial: {
        edit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken, prisonerData } = req.middleware
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)
          const prisonPersonHeight = prisonPerson?.physicalAttributes?.height?.value

          const { feet, inches } =
            prisonPersonHeight === undefined || prisonPersonHeight === null
              ? { feet: undefined, inches: undefined }
              : centimetresToFeetAndInches(prisonPerson?.physicalAttributes?.height?.value)

          const requestBodyFlash = requestBodyFromFlash<{ feet: string; inches: string }>(req)
          const errors = req.flash('errors')

          await this.auditService.sendPageView({
            user: res.locals.user,
            prisonerNumber: prisonerData.prisonerNumber,
            prisonId: prisonerData.prisonId,
            correlationId: req.id,
            page: Page.EditHeight,
          })

          res.render('pages/edit/heightImperial', {
            pageTitle: 'Height - Prisoner personal details',
            prisonerNumber,
            breadcrumbPrisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
              style: NameFormatStyle.lastCommaFirst,
            }),
            errors,
            feetValue: requestBodyFlash ? requestBodyFlash.feet : feet,
            inchesValue: requestBodyFlash ? requestBodyFlash.inches : inches,
            miniBannerData: miniBannerData(prisonerData),
          })
        },

        submit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const user = res.locals.user as PrisonUser
          const { feet: feetString, inches: inchesString }: { feet: string; inches: string } = req.body

          const feet = feetString ? parseInt(feetString, 10) : 0
          const inches = inchesString ? parseInt(inchesString, 10) : 0

          try {
            const height = feetAndInchesToCentimetres(feet, inches)
            await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
              height: !feetString && !inchesString ? null : height,
            })

            req.flash('flashMessage', { text: 'Height edited', type: FlashMessageType.success, fieldName: 'height' })

            this.auditService
              .sendPostSuccess({
                user,
                prisonerNumber,
                correlationId: req.id,
                action: PostAction.EditPhysicalCharacteristics,
                details: { pageTitle: 'Height' },
              })
              .catch(error => logger.error(error))

            return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)
          } catch (e) {
            req.flash('requestBody', JSON.stringify(req.body))
            req.flash('errors', [{ text: 'There was an error please try again' }])
            return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/height/imperial`)
          }
        },
      },
    }
  }

  weight() {
    return {
      metric: {
        edit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken, prisonerData } = req.middleware
          const requestBodyFlash = requestBodyFromFlash<{ kilograms: string }>(req)
          const errors = req.flash('errors')
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          await this.auditService.sendPageView({
            user: res.locals.user,
            prisonerNumber: prisonerData.prisonerNumber,
            prisonId: prisonerData.prisonId,
            correlationId: req.id,
            page: Page.EditWeight,
          })

          res.render('pages/edit/weightMetric', {
            pageTitle: 'Weight - Prisoner personal details',
            prisonerNumber,
            breadcrumbPrisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
              style: NameFormatStyle.lastCommaFirst,
            }),
            errors,
            fieldName: 'weight',
            fieldValue: requestBodyFlash ? requestBodyFlash.kilograms : prisonPerson?.physicalAttributes?.weight?.value,
            miniBannerData: miniBannerData(prisonerData),
          })
        },

        submit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const user = res.locals.user as PrisonUser
          const { kilograms } = req.body
          const weight = parseInt(kilograms, 10)

          try {
            await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
              weight: kilograms ? weight : null,
            })

            req.flash('flashMessage', { text: 'Weight edited', type: FlashMessageType.success, fieldName: 'weight' })

            this.auditService
              .sendPostSuccess({
                user,
                prisonerNumber,
                correlationId: req.id,
                action: PostAction.EditPhysicalCharacteristics,
                details: { pageTitle: 'Weight' },
              })
              .catch(error => logger.error(error))

            return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)
          } catch (e) {
            req.flash('requestBody', JSON.stringify(req.body))
            req.flash('errors', [{ text: 'There was an error please try again' }])
            return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/weight`)
          }
        },
      },

      imperial: {
        edit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken, prisonerData } = req.middleware
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)
          const prisonPersonWeight = prisonPerson?.physicalAttributes?.weight?.value

          const { stone, pounds } =
            prisonPersonWeight === undefined || prisonPersonWeight === null
              ? { stone: undefined, pounds: undefined }
              : kilogramsToStoneAndPounds(prisonPersonWeight)

          const requestBodyFlash = requestBodyFromFlash<{ stone: string; pounds: string }>(req)
          const errors = req.flash('errors')

          await this.auditService.sendPageView({
            user: res.locals.user,
            prisonerNumber: prisonerData.prisonerNumber,
            prisonId: prisonerData.prisonId,
            correlationId: req.id,
            page: Page.EditWeight,
          })

          this.auditService
            .sendPostSuccess({
              user: res.locals.user,
              prisonerNumber,
              correlationId: req.id,
              action: PostAction.EditPhysicalCharacteristics,
              details: { pageTitle: 'Weight' },
            })
            .catch(error => logger.error(error))

          res.render('pages/edit/weightImperial', {
            pageTitle: 'Weight - Prisoner personal details',
            prisonerNumber,
            breadcrumbPrisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
              style: NameFormatStyle.lastCommaFirst,
            }),
            errors,
            stoneValue: requestBodyFlash ? requestBodyFlash.stone : stone,
            poundsValue: requestBodyFlash ? requestBodyFlash.pounds : pounds,
            miniBannerData: miniBannerData(prisonerData),
          })
        },

        submit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const user = res.locals.user as PrisonUser
          const { stone: stoneString, pounds: poundsString }: { stone: string; pounds: string } = req.body

          const stone = stoneString ? parseInt(stoneString, 10) : 0
          const pounds = poundsString ? parseInt(poundsString, 10) : 0

          try {
            const weight = stoneAndPoundsToKilograms(stone, pounds)
            await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
              weight: !stoneString && !poundsString ? null : weight,
            })

            req.flash('flashMessage', { text: 'Weight edited', type: FlashMessageType.success, fieldName: 'weight' })

            this.auditService
              .sendPostSuccess({
                user: res.locals.user,
                prisonerNumber,
                correlationId: req.id,
                action: PostAction.EditPhysicalCharacteristics,
                details: { pageTitle: 'Weight' },
              })
              .catch(error => logger.error(error))

            return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)
          } catch (e) {
            req.flash('requestBody', JSON.stringify(req.body))
            req.flash('errors', [{ text: 'There was an error please try again' }])
            return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/weight/imperial`)
          }
        },
      },
    }
  }

  cityOrPlaceOfBirthTextInput = (fieldData: TextFieldData) =>
    this.textInput(fieldData, this.getCityOrPlaceOfBirth.bind(this), this.setCityOrPlaceOfBirth.bind(this))

  private async getCityOrPlaceOfBirth(req: Request): Promise<string> {
    return req.middleware?.inmateDetail?.birthPlace
  }

  private async setCityOrPlaceOfBirth(
    req: Request,
    res: Response,
    _fieldData: TextFieldData,
    value: string,
  ): Promise<void> {
    const { prisonerNumber } = req.params
    const { clientToken } = req.middleware
    const user = res.locals.user as PrisonUser
    await this.personalPageService.updateCityOrTownOfBirth(clientToken, user, prisonerNumber, value)
  }

  physicalAttributesTextInput = (fieldData: PhysicalAttributesTextFieldData) =>
    this.textInput(fieldData, this.getPhysicalAttributesText.bind(this), this.setPhysicalAttributesText.bind(this))

  private async getPhysicalAttributesText(req: Request, fieldData: PhysicalAttributesTextFieldData): Promise<string> {
    const { prisonerNumber } = req.params
    const { clientToken } = req.middleware
    const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)
    return (prisonPerson?.physicalAttributes[fieldData.fieldName] as ValueWithMetadata<string>)?.value
  }

  private async setPhysicalAttributesText(
    req: Request,
    res: Response,
    fieldData: PhysicalAttributesTextFieldData,
    value: string,
  ): Promise<void> {
    const { prisonerNumber } = req.params
    const { clientToken } = req.middleware
    const user = res.locals.user as PrisonUser
    await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
      [fieldData.fieldName]: value,
    })
  }

  private textInput(fieldData: TextFieldData, getter: TextFieldGetter, setter: TextFieldSetter) {
    const { pageTitle, hintText, auditPage, fieldName, url, redirectAnchor, inputClasses } = fieldData

    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { prisonerData } = req.middleware
        const { firstName, lastName } = prisonerData
        const requestBodyFlash = requestBodyFromFlash<{ [fieldName: string]: string }>(req)
        const errors = req.flash('errors')
        const prisonerBannerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })

        const fieldValue = requestBodyFlash ? requestBodyFlash[fieldName] : await getter(req, fieldData)

        await this.auditService.sendPageView({
          user: res.locals.user,
          prisonerNumber: prisonerData.prisonerNumber,
          prisonId: prisonerData.prisonId,
          correlationId: req.id,
          page: auditPage,
        })

        res.render('pages/edit/textField', {
          pageTitle: `${pageTitle} - Prisoner personal details`,
          formTitle: pageTitle,
          prisonerNumber,
          breadcrumbPrisonerName: prisonerBannerName,
          errors,
          hintText,
          fieldName,
          fieldValue,
          inputClasses,
          miniBannerData: miniBannerData(prisonerData),
        })
      },

      submit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const fieldValue = req.body[fieldName] || null

        try {
          await setter(req, res, fieldData, fieldValue)

          req.flash('flashMessage', {
            text: `${pageTitle} updated`,
            type: FlashMessageType.success,
            fieldName,
          })

          this.auditService
            .sendPostSuccess({
              user: res.locals.user,
              prisonerNumber,
              correlationId: req.id,
              action: PostAction.EditPhysicalCharacteristics,
              details: { pageTitle },
            })
            .catch(error => logger.error(error))

          return res.redirect(`/prisoner/${prisonerNumber}/personal#${redirectAnchor}`)
        } catch (e) {
          req.flash('requestBody', JSON.stringify(req.body))
          req.flash('errors', [{ text: 'There was an error please try again' }])
          return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/${url}`)
        }
      },
    }
  }

  editRadioFields(formTitle: string, fieldData: RadioFieldData, options: RadioOption[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { pageTitle, hintText, auditPage } = fieldData
      const { prisonerNumber } = req.params
      const { prisonerData } = req.middleware
      const { firstName, lastName, cellLocation } = prisonerData
      const errors = req.flash('errors')

      const prisonerBannerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })

      await this.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: auditPage,
      })

      res.render('pages/edit/radioField', {
        pageTitle: `${pageTitle} - Prisoner personal details`,
        formTitle,
        prisonerNumber,
        breadcrumbPrisonerName: prisonerBannerName,
        errors,
        hintText,
        options,
        miniBannerData: {
          prisonerName: prisonerBannerName,
          prisonerNumber,
          cellLocation: formatLocation(cellLocation),
        },
      })
    }
  }

  smokerOrVaper() {
    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const { inmateDetail, prisonerData, clientToken } = req.middleware
        const { firstName, lastName } = prisonerData
        const requestBodyFlash = requestBodyFromFlash<{ radioField: string }>(req)
        const fieldValue =
          requestBodyFlash?.radioField ||
          getProfileInformationValue(ProfileInformationType.SmokerOrVaper, inmateDetail.profileInformation)
        const [smokerOrVaperValues] = await Promise.all([
          this.personalPageService.getReferenceDataCodes(clientToken, 'smoke'),
        ])

        const options: RadioOption[] = smokerOrVaperValues.map(({ description, id }) => ({
          text: description,
          value: id,
          checked: fieldValue === id,
        }))

        return this.editRadioFields(
          `Does ${formatName(firstName, '', lastName, { style: NameFormatStyle.firstLast })} smoke or vape?`,
          smokerOrVaperFieldData,
          options,
        )(req, res, next)
      },

      submit: async (req: Request, res: Response, next: NextFunction) => {
        const { pageTitle, code, fieldName, url } = smokerOrVaperFieldData
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const radioField = req.body.radioField || null

        try {
          await this.personalPageService.updateSmokerOrVaper(clientToken, user, prisonerNumber, radioField)
          req.flash('flashMessage', { text: `${pageTitle} updated`, type: FlashMessageType.success, fieldName })

          this.auditService
            .sendPostSuccess({
              user: res.locals.user,
              prisonerNumber,
              correlationId: req.id,
              action: PostAction.EditPhysicalCharacteristics,
              details: { pageTitle, code, fieldName, radioField, url },
            })
            .catch(error => logger.error(error))

          return res.redirect(`/prisoner/${prisonerNumber}/personal#personal-details`)
        } catch (e) {
          req.flash('errors', [{ text: 'There was an error please try again' }])
        }
        req.flash('requestBody', JSON.stringify(req.body))
        return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/${url}`)
      },
    }
  }

  /**
   * Handler for editing single-value radio fields.
   *
   * @param fieldData - config for which physical characteristic to edit
   *
   * Handles editing:
   *   Hair type or colour
   *   Facial hair
   *   Face shape
   *   Build
   */
  physicalCharacteristicRadioField(fieldData: RadioFieldData) {
    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const { clientToken } = req.middleware
        const { prisonerNumber } = req.params
        const { pageTitle, code } = fieldData
        const requestBodyFlash = requestBodyFromFlash<{ radioField: string }>(req)
        const [characteristics, prisonPerson] = await Promise.all([
          this.personalPageService.getReferenceDataCodes(clientToken, code),
          this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true),
        ])
        const fieldValue =
          requestBodyFlash?.radioField ||
          (
            prisonPerson?.physicalAttributes[
              code as keyof PrisonPersonPhysicalAttributes
            ] as ValueWithMetadata<PrisonPersonCharacteristic>
          )?.value?.id
        const options = objectToRadioOptions(characteristics, 'id', 'description', fieldValue)

        return this.editRadioFields(pageTitle, fieldData, options)(req, res, next)
      },

      submit: async (req: Request, res: Response, next: NextFunction) => {
        const { pageTitle, code, fieldName, url } = fieldData
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const radioField = req.body.radioField || null

        try {
          await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
            [code]: radioField,
          })
          req.flash('flashMessage', { text: `${pageTitle} updated`, type: FlashMessageType.success, fieldName })

          this.auditService
            .sendPostSuccess({
              user: res.locals.user,
              prisonerNumber,
              correlationId: req.id,
              action: PostAction.EditPhysicalCharacteristics,
              details: { pageTitle, code, fieldName, radioField, url },
            })
            .catch(error => logger.error(error))

          return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)
        } catch (e) {
          req.flash('errors', [{ text: 'There was an error please try again' }])
        }
        req.flash('requestBody', JSON.stringify(req.body))
        return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/${url}`)
      },
    }
  }

  /**
   * Handler for editing eye colour.
   */
  eyeColour() {
    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const pageTitle = 'Eye colour'
        const code = PrisonPersonCharacteristicCode.eye
        const auditPage = Page.EditEyeColour

        const { prisonerNumber } = req.params
        const { clientToken, prisonerData } = req.middleware
        const { firstName, lastName, cellLocation } = prisonerData
        const requestBodyFlash = requestBodyFromFlash<{ eyeColour: string }>(req)
        const errors = req.flash('errors')

        const prisonerBannerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })

        const [characteristics, prisonPerson] = await Promise.all([
          this.personalPageService.getReferenceDataCodes(clientToken, code),
          this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true),
        ])

        /* Set radio to correct eye colour if both left and right values are the same, otherwise leave unselected. */
        const eyeColour =
          prisonPerson?.physicalAttributes.leftEyeColour?.value?.id ===
          prisonPerson?.physicalAttributes.rightEyeColour?.value?.id
            ? prisonPerson?.physicalAttributes.leftEyeColour?.value?.id
            : undefined

        const fieldValue = requestBodyFlash?.eyeColour || eyeColour

        await this.auditService.sendPageView({
          user: res.locals.user,
          prisonerNumber: prisonerData.prisonerNumber,
          prisonId: prisonerData.prisonId,
          correlationId: req.id,
          page: auditPage,
        })

        res.render('pages/edit/eyeColour', {
          pageTitle: `${pageTitle} - Prisoner personal details`,
          formTitle: pageTitle,
          prisonerNumber,
          breadcrumbPrisonerName: prisonerBannerName,
          errors,
          options: objectToRadioOptions(characteristics, 'id', 'description', fieldValue),
          miniBannerData: {
            prisonerName: prisonerBannerName,
            prisonerNumber,
            cellLocation: formatLocation(cellLocation),
          },
        })
      },

      submit: async (req: Request, res: Response, next: NextFunction) => {
        const pageTitle = 'Eye colour'
        const fieldName = 'eyeColour'
        const url = 'eye-colour'

        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const eyeColour = req.body.eyeColour || null

        try {
          await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
            leftEyeColour: eyeColour,
            rightEyeColour: eyeColour,
          })
          req.flash('flashMessage', { text: `${pageTitle} updated`, type: FlashMessageType.success, fieldName })

          this.auditService
            .sendPostSuccess({
              user: res.locals.user,
              prisonerNumber,
              correlationId: req.id,
              action: PostAction.EditPhysicalCharacteristics,
              details: { pageTitle, fieldName, eyeColour, url },
            })
            .catch(error => logger.error(error))

          return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)
        } catch (e) {
          req.flash('errors', [{ text: 'There was an error please try again' }])
        }
        req.flash('requestBody', JSON.stringify(req.body))
        return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/${url}`)
      },
    }
  }

  /**
   * Handler for editing left and right eye colour individually.
   */
  eyeColourIndividual() {
    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const pageTitle = 'Left and right eye colours'
        const code = PrisonPersonCharacteristicCode.eye
        const auditPage = Page.EditEyeColour

        const { prisonerNumber } = req.params
        const { clientToken, prisonerData } = req.middleware
        const { firstName, lastName, cellLocation } = prisonerData
        const requestBodyFlash = requestBodyFromFlash<{ leftEyeColour: string; rightEyeColour: string }>(req)
        const errors = req.flash('errors')

        const prisonerBannerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })

        const [characteristics, prisonPerson] = await Promise.all([
          this.personalPageService.getReferenceDataCodes(clientToken, code),
          this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true),
        ])
        const leftEyeColour =
          requestBodyFlash?.leftEyeColour || prisonPerson?.physicalAttributes.leftEyeColour?.value?.id
        const rightEyeColour =
          requestBodyFlash?.rightEyeColour || prisonPerson?.physicalAttributes.rightEyeColour?.value?.id

        await this.auditService.sendPageView({
          user: res.locals.user,
          prisonerNumber: prisonerData.prisonerNumber,
          prisonId: prisonerData.prisonId,
          correlationId: req.id,
          page: auditPage,
        })

        res.render('pages/edit/eyeColourIndividual', {
          pageTitle: `${pageTitle} - Prisoner personal details`,
          formTitle: pageTitle,
          prisonerNumber,
          breadcrumbPrisonerName: prisonerBannerName,
          errors,
          leftOptions: objectToRadioOptions(characteristics, 'id', 'description', leftEyeColour),
          rightOptions: objectToRadioOptions(characteristics, 'id', 'description', rightEyeColour),
          miniBannerData: {
            prisonerName: prisonerBannerName,
            prisonerNumber,
            cellLocation: formatLocation(cellLocation),
          },
        })
      },

      submit: async (req: Request, res: Response, next: NextFunction) => {
        const pageTitle = 'Left and right eye colours'
        const url = 'eye-colour-individual'

        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const leftEyeColour = req.body.leftEyeColour || null
        const rightEyeColour = req.body.rightEyeColour || null

        try {
          await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
            leftEyeColour,
            rightEyeColour,
          })
          req.flash('flashMessage', {
            text: `Eye colour updated`,
            type: FlashMessageType.success,
            fieldName: 'eyeColour',
          })

          this.auditService
            .sendPostSuccess({
              user: res.locals.user,
              prisonerNumber,
              correlationId: req.id,
              action: PostAction.EditPhysicalCharacteristics,
              details: { pageTitle, leftEyeColour, rightEyeColour, url },
            })
            .catch(error => logger.error(error))

          return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)
        } catch (e) {
          req.flash('errors', [{ text: 'There was an error please try again' }])
        }
        req.flash('requestBody', JSON.stringify(req.body))
        return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/${url}`)
      },
    }
  }

  history(fieldData: TextFieldData) {
    const { pageTitle, fieldName, formatter, auditPage } = fieldData

    return async (req: Request, res: Response, next: NextFunction) => {
      const { prisonerNumber } = req.params
      const { clientToken, prisonerData } = req.middleware
      const { firstName, lastName } = prisonerData
      const prisonerBannerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })
      const fieldHistory = await this.prisonPersonService.getFieldHistory(clientToken, prisonerNumber, fieldName)
      const latestFieldHistory = fieldHistory.pop()
      const currentValue = fieldHistoryToFormattedValue(latestFieldHistory, formatter)
      const currentCreatedBy = latestFieldHistory?.createdBy
      const currentAppliesFrom = formatDateTime(latestFieldHistory?.appliesFrom)

      await this.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: auditPage,
      })

      return res.render('pages/edit/fieldHistory', {
        pageTitle: `${pageTitle} history - Prisoner personal details`,
        formTitle: `${pageTitle}`,
        prisonerNumber,
        breadcrumbPrisonerName: prisonerBannerName,
        fieldHistory: fieldHistoryToRows(fieldHistory.reverse(), formatter),
        currentValue,
        currentCreatedBy,
        currentAppliesFrom,
        miniBannerData: miniBannerData(prisonerData),
      })
    }
  }

  editCheckboxes(
    formTitle: string,
    fieldData: CheckboxFieldData,
    options: CheckboxOptions[],
    selectedValues: string[] = [],
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { prisonerNumber } = req.params
      const { prisonerData } = req.middleware
      const { firstName, lastName, cellLocation } = prisonerData
      const requestBodyFlash = requestBodyFromFlash<{ [key: string]: string[] }>(req)
      const checkedItems = requestBodyFlash
        ? checkboxInputToSelectedValues(fieldData.fieldName, requestBodyFlash)
        : selectedValues

      const errors = req.flash('errors')

      const prisonerBannerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })
      const prisonerName = formatName(firstName, null, lastName, { style: NameFormatStyle.firstLast })

      await this.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: fieldData.auditPage,
      })

      res.render('pages/edit/checkboxField', {
        pageTitle: `${fieldData.pageTitle} - Prisoner personal details`,
        formTitle,
        formHint: fieldData.hintText || '',
        fieldName: fieldData.fieldName,
        formOptions: fieldData.options,
        prisonerNumber,
        prisonerName,
        breadcrumbPrisonerName: prisonerBannerName,
        errors,
        checkboxInputs: options,
        checkedItems,
        miniBannerData: {
          prisonerName: prisonerBannerName,
          prisonerNumber,
          cellLocation: formatLocation(cellLocation),
        },
      })
    }
  }

  medicalDiet() {
    const fieldData: CheckboxFieldData = {
      fieldName: 'medicalDiet',
      auditPage: Page.EditMedicalDiet,
      pageTitle: 'Medical diet',
      url: 'medical-diet',
      hintText: 'Select all that apply',
    }
    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { clientToken, prisonerData } = req.middleware
        const { firstName, lastName } = prisonerData
        const prisonerName = formatName(firstName, null, lastName, { style: NameFormatStyle.firstLast })
        const formTitle = `Does ${prisonerName} have any of these medical dietary requirements?`
        const [medicalDietaryRequirementValues, prisonPerson] = await Promise.all([
          this.personalPageService.getReferenceDataDomain(clientToken, 'medicalDiet'),
          this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true),
        ])

        return this.editCheckboxes(
          formTitle,
          { ...fieldData, options: referenceDataDomainToCheckboxFieldDataOptions(medicalDietaryRequirementValues) },
          referenceDataDomainToCheckboxOptions(medicalDietaryRequirementValues),
          prisonPerson?.health?.medicalDietaryRequirements.map(code => code.id),
        )(req, res, next)
      },

      submit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const checkedItems = checkboxInputToSelectedValues(fieldData.fieldName, req.body)

        try {
          await this.personalPageService.updateMedicalDietaryRequirements(
            clientToken,
            user,
            prisonerNumber,
            checkedItems,
          )
          req.flash('flashMessage', {
            text: `Medical diet updated`,
            type: FlashMessageType.success,
            fieldName: fieldData.fieldName,
          })

          this.auditService
            .sendPostSuccess({
              user: res.locals.user,
              prisonerNumber,
              correlationId: req.id,
              action: PostAction.EditMedicalDiet,
              details: { medicalDietaryRequirements: checkedItems },
            })
            .catch(error => logger.error(error))

          return res.redirect(`/prisoner/${prisonerNumber}/personal#personal-details`)
        } catch (e) {
          req.flash('errors', [{ text: 'There was an error please try again' }])
        }
        return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/${fieldData.url}`)
      },
    }
  }

  foodAllergies() {
    const fieldData: CheckboxFieldData = {
      fieldName: 'foodAllergies',
      auditPage: Page.EditFoodAllergies,
      pageTitle: 'Food allergies',
      url: 'food-allergies',
      hintText: 'Select all that apply',
    }

    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { clientToken, prisonerData } = req.middleware
        const { firstName, lastName } = prisonerData
        const prisonerName = formatName(firstName, null, lastName, { style: NameFormatStyle.firstLast })
        const formTitle = `Does ${prisonerName} have any food allergies?`
        const [foodAllergyValues, prisonPerson] = await Promise.all([
          this.personalPageService.getReferenceDataDomain(clientToken, 'foodAllergy'),
          this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true),
        ])

        return this.editCheckboxes(
          formTitle,
          { ...fieldData, options: referenceDataDomainToCheckboxFieldDataOptions(foodAllergyValues) },
          referenceDataDomainToCheckboxOptions(foodAllergyValues),
          prisonPerson?.health?.foodAllergies.map(code => code.id),
        )(req, res, next)
      },

      submit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const checkedItems = checkboxInputToSelectedValues(fieldData.fieldName, req.body)

        try {
          await this.personalPageService.updateFoodAllergies(clientToken, user, prisonerNumber, checkedItems)

          req.flash('flashMessage', {
            text: `Food allergies updated`,
            type: FlashMessageType.success,
            fieldName: 'foodAllergies',
          })

          this.auditService
            .sendPostSuccess({
              user: res.locals.user,
              prisonerNumber,
              correlationId: req.id,
              action: PostAction.EditFoodAllergies,
              details: { foodAllergies: checkedItems },
            })
            .catch(error => logger.error(error))

          return res.redirect(`/prisoner/${prisonerNumber}/personal#personal-details`)
        } catch (e) {
          req.flash('errors', [{ text: 'There was an error please try again' }])
        }
        return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/${fieldData.url}`)
      },
    }
  }
}
