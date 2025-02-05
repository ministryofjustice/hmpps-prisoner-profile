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
  convertToTitleCase,
  fieldHistoryToFormattedValue,
  fieldHistoryToRows,
  formatLocation,
  formatName,
  objectToRadioOptions,
  objectToSelectOptions,
  RadioOption,
  SelectOption,
  userHasRoles,
} from '../../utils/utils'
import { NameFormatStyle } from '../../data/enums/nameFormatStyle'
import { FlashMessageType } from '../../data/enums/flashMessageType'
import { dietAndAllergyEnabled, enablePrisonPerson } from '../../utils/featureToggles'
import {
  CheckboxFieldData,
  cityOrTownOfBirthFieldData,
  countryOfBirthFieldData,
  dietAndFoodAllergiesFieldData,
  eyeColourFieldData,
  eyeColourIndividualFieldData,
  FieldData,
  foodAllergiesFieldData,
  heightFieldData,
  heightImperialFieldData,
  medicalDietFieldData,
  nationalityFieldData,
  PhysicalAttributesTextFieldData,
  RadioFieldData,
  religionFieldData,
  smokerOrVaperFieldData,
  TextFieldData,
  weightFieldData,
  weightImperialFieldData,
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
import { ProxyReferenceDataDomain } from '../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { validationErrorsFromFlash } from '../../utils/validationErrorsFromFlash'
import {
  DietAndAllergy,
  DietAndAllergyUpdate,
  HealthAndMedicationReferenceDataDomain,
  ReferenceDataCode,
  ReferenceDataIdSelection,
} from '../../data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'
import { Role } from '../../data/enums/role'

type TextFieldGetter = (req: Request, fieldData: TextFieldData) => Promise<string>
type TextFieldSetter = (req: Request, res: Response, fieldData: TextFieldData, value: string) => Promise<void>

export default class PersonalController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    private readonly prisonPersonService: PrisonPersonService,
    private readonly careNeedsService: CareNeedsService,
    private readonly auditService: AuditService,
  ) {}

  private async submit({
    req,
    res,
    prisonerNumber,
    submit,
    fieldData,
    auditDetails,
  }: {
    req: Request
    res: Response
    prisonerNumber: string
    submit: () => Promise<void>
    fieldData: FieldData
    auditDetails: object
  }) {
    const { pageTitle, auditEditPostAction, fieldName, url, redirectAnchor } = fieldData

    try {
      await submit()

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
          action: auditEditPostAction,
          details: auditDetails,
        })
        .catch(error => logger.error(error))

      return res.redirect(`/prisoner/${prisonerNumber}/personal#${redirectAnchor}`)
    } catch (e) {
      req.flash('errors', [{ text: 'There was an error please try again' }])
      req.flash('requestBody', JSON.stringify(req.body))
      return res.redirect(`/prisoner/${prisonerNumber}/personal/${url}`)
    }
  }

  displayPersonalPage() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { prisonerData, inmateDetail, alertSummaryData, clientToken } = req.middleware
      const { bookingId } = prisonerData
      const user = res.locals.user as PrisonUser
      const { activeCaseLoadId, userRoles } = user
      const prisonPersonEnabled = enablePrisonPerson(activeCaseLoadId)

      const [personalPageData, careNeeds, xrays] = await Promise.all([
        this.personalPageService.get(
          clientToken,
          prisonerData,
          prisonPersonEnabled,
          dietAndAllergyEnabled(activeCaseLoadId),
          res.locals.apiErrorCallback,
        ),
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
        ...mapHeaderData(prisonerData, inmateDetail, alertSummaryData, res.locals.user, 'personal'),
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
        dietAndAllergiesEnabled:
          dietAndAllergyEnabled(activeCaseLoadId) && dietAndAllergyEnabled(prisonerData.prisonId),
        editDietAndAllergiesEnabled:
          dietAndAllergyEnabled(activeCaseLoadId) &&
          userHasRoles([Role.DietAndAllergiesEdit], userRoles) &&
          prisonerData.prisonId === activeCaseLoadId,
        historyEnabled:
          personalPageData.showFieldHistoryLink &&
          enablePrisonPerson(activeCaseLoadId) &&
          userHasRoles(['DPS_APPLICATION_DEVELOPER'], userRoles),
      })
    }
  }

  height() {
    const { pageTitle, fieldName, auditEditPageLoad } = heightFieldData

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
            page: auditEditPageLoad,
          })

          res.render('pages/edit/heightMetric', {
            pageTitle: `${pageTitle} - Prisoner personal details`,
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
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)
          const previousHeight = prisonPerson?.physicalAttributes?.height?.value

          return this.submit({
            req,
            res,
            prisonerNumber,
            submit: async () => {
              await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
                height: editField ? height : null,
              })
            },
            fieldData: heightFieldData,
            auditDetails: { fieldName, previous: previousHeight, updated: height },
          })
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
            page: auditEditPageLoad,
          })

          res.render('pages/edit/heightImperial', {
            pageTitle: `${pageTitle} - Prisoner personal details`,
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
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)
          const previousHeight = prisonPerson?.physicalAttributes?.height?.value
          const feet = feetString ? parseInt(feetString, 10) : 0
          const inches = inchesString ? parseInt(inchesString, 10) : 0
          const height = feetAndInchesToCentimetres(feet, inches)
          return this.submit({
            req,
            res,
            prisonerNumber,
            submit: async () => {
              await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
                height: !feetString && !inchesString ? null : height,
              })
            },
            fieldData: heightImperialFieldData,
            auditDetails: { fieldName, previous: previousHeight, updated: height },
          })
        },
      },
    }
  }

  weight() {
    const { pageTitle, fieldName, auditEditPageLoad } = weightFieldData

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
            pageTitle: `${pageTitle} - Prisoner personal details`,
            prisonerNumber,
            breadcrumbPrisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
              style: NameFormatStyle.lastCommaFirst,
            }),
            errors,
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
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)
          const previousWeight = prisonPerson?.physicalAttributes?.weight?.value
          return this.submit({
            req,
            res,
            prisonerNumber,
            submit: async () => {
              await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
                weight: kilograms ? weight : null,
              })
            },
            fieldData: weightFieldData,
            auditDetails: { fieldName, previous: previousWeight, updated: weight },
          })
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
            page: auditEditPageLoad,
          })

          res.render('pages/edit/weightImperial', {
            pageTitle: `${pageTitle} - Prisoner personal details`,
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
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)
          const previousWeight = prisonPerson?.physicalAttributes?.weight?.value
          const stone = stoneString ? parseInt(stoneString, 10) : 0
          const pounds = poundsString ? parseInt(poundsString, 10) : 0
          const weight = stoneAndPoundsToKilograms(stone, pounds)
          return this.submit({
            req,
            res,
            prisonerNumber,
            submit: async () => {
              await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
                weight: !stoneString && !poundsString ? null : weight,
              })
            },
            fieldData: weightImperialFieldData,
            auditDetails: { fieldName, previous: previousWeight, updated: weight },
          })
        },
      },
    }
  }

  cityOrTownOfBirthTextInput = () =>
    this.textInput(
      cityOrTownOfBirthFieldData,
      this.getCityOrTownOfBirth.bind(this),
      this.setCityOrTownOfBirth.bind(this),
    )

  private async getCityOrTownOfBirth(req: Request): Promise<string> {
    return convertToTitleCase(req.middleware?.inmateDetail?.birthPlace)
  }

  private async setCityOrTownOfBirth(
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
    const { pageTitle, hintText, auditEditPageLoad, fieldName, inputClasses } = fieldData

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
          page: auditEditPageLoad,
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
        const updatedValue = req.body[fieldName] || null
        const previousValue = await getter(req, fieldData)
        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await setter(req, res, fieldData, updatedValue)
          },
          fieldData,
          auditDetails: { fieldName, previous: previousValue, updated: updatedValue },
        })
      },
    }
  }

  editRadioFields(formTitle: string, fieldData: RadioFieldData, options: RadioOption[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { pageTitle, hintText, redirectAnchor, auditEditPageLoad } = fieldData
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
        page: auditEditPageLoad,
      })

      res.render('pages/edit/radioField', {
        pageTitle: `${pageTitle} - Prisoner personal details`,
        formTitle,
        prisonerNumber,
        breadcrumbPrisonerName: prisonerBannerName,
        errors,
        hintText,
        options,
        redirectAnchor,
        miniBannerData: {
          prisonerName: prisonerBannerName,
          prisonerNumber,
          cellLocation: formatLocation(cellLocation),
        },
      })
    }
  }

  editRadioFieldsWithAutocomplete({
    formTitle,
    fieldData,
    radioOptions,
    autocompleteOptions,
    autocompleteSelected,
    autocompleteOptionTitle,
    autocompleteOptionLabel,
  }: {
    formTitle: string
    fieldData: RadioFieldData
    radioOptions: RadioOption[]
    autocompleteOptions: SelectOption[]
    autocompleteSelected: boolean
    autocompleteOptionTitle: string
    autocompleteOptionLabel: string
  }) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { pageTitle, hintText, redirectAnchor, auditEditPageLoad } = fieldData
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
        page: auditEditPageLoad,
      })

      res.render('pages/edit/radioFieldWithAutocomplete', {
        pageTitle: `${pageTitle} - Prisoner personal details`,
        formTitle,
        prisonerNumber,
        breadcrumbPrisonerName: prisonerBannerName,
        errors,
        hintText,
        radioOptions,
        autocompleteOptions,
        autocompleteSelected,
        autocompleteOptionTitle,
        autocompleteOptionLabel,
        redirectAnchor,
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

        const options = objectToRadioOptions(smokerOrVaperValues, 'id', 'description', fieldValue)

        return this.editRadioFields(
          `Does ${formatName(firstName, '', lastName, { style: NameFormatStyle.firstLast })} smoke or vape?`,
          smokerOrVaperFieldData,
          options,
        )(req, res, next)
      },

      submit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const radioField = req.body.radioField || null
        const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)
        const previousValue = prisonPerson?.health?.smokerOrVaper?.value?.id
        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updateSmokerOrVaper(clientToken, user, prisonerNumber, radioField)
          },
          fieldData: smokerOrVaperFieldData,
          auditDetails: { fieldName: smokerOrVaperFieldData.fieldName, previous: previousValue, updated: radioField },
        })
      },
    }
  }

  nationality() {
    const { fieldName, auditEditPageLoad } = nationalityFieldData

    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { inmateDetail, prisonerData, clientToken } = req.middleware
        const { firstName, lastName, cellLocation } = prisonerData
        const prisonerName = formatName(firstName, null, lastName, { style: NameFormatStyle.firstLast })
        const prisonerBannerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })
        const requestBodyFlash = requestBodyFromFlash<{
          autocompleteField: string
          radioField: string
          additionalNationalities: string
        }>(req)
        const errors = req.flash('errors')

        const [nationalityReferenceData] = await Promise.all([
          this.personalPageService.getReferenceDataCodesFromProxy(clientToken, ProxyReferenceDataDomain.nationality),
        ])

        const fieldValue =
          requestBodyFlash?.autocompleteField ||
          requestBodyFlash?.radioField ||
          nationalityReferenceData.find(
            nationality =>
              nationality.description ===
              getProfileInformationValue(ProfileInformationType.Nationality, inmateDetail.profileInformation),
          )?.code
        const additionalNationalitiesValue =
          requestBodyFlash?.additionalNationalities ||
          getProfileInformationValue(ProfileInformationType.OtherNationalities, inmateDetail.profileInformation)

        const britishNationality = ['BRIT']
          .map(code => nationalityReferenceData.find(val => val.code === code))
          .filter(Boolean)
        const nationalitiesAsAutocompleteOptions = nationalityReferenceData.filter(
          val => !britishNationality.includes(val),
        )
        const britishRadioOption = objectToRadioOptions(britishNationality, 'code', 'description', fieldValue).map(
          option => ({ ...option, hint: { text: 'Including English, Welsh, Scottish and Northern Irish' } }),
        )

        await this.auditService.sendPageView({
          user: res.locals.user,
          prisonerNumber: prisonerData.prisonerNumber,
          prisonId: prisonerData.prisonId,
          correlationId: req.id,
          page: auditEditPageLoad,
        })

        res.render('pages/edit/nationality', {
          pageTitle: `${nationalityFieldData.pageTitle} - Prisoner personal details`,
          formTitle: `What is ${prisonerName}'s nationality?`,
          breadcrumbPrisonerName: prisonerBannerName,
          prisonerNumber,
          errors,
          radioOptions: britishRadioOption,
          autocompleteOptions: objectToSelectOptions(
            nationalitiesAsAutocompleteOptions,
            'code',
            'description',
            fieldValue,
          ),
          additionalNationalitiesValue,
          autocompleteSelected: ['OTHER', 'OTHER__VALIDATION_ERROR'].includes(fieldValue),
          autocompleteOptionTitle: 'A different nationality',
          autocompleteOptionLabel: 'Select nationality',
          miniBannerData: {
            prisonerName: prisonerBannerName,
            prisonerNumber,
            cellLocation: formatLocation(cellLocation),
          },
        })
      },

      submit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { clientToken, inmateDetail } = req.middleware
        const user = res.locals.user as PrisonUser
        const radioField = req.body.radioField || null
        const autocompleteField = (radioField === 'OTHER' && req.body.autocompleteField) || null
        const otherNationalities = req.body.additionalNationalities || null
        const previousValue = getProfileInformationValue(
          ProfileInformationType.Nationality,
          inmateDetail.profileInformation,
        )
        const previousOtherNationalitiesValue = getProfileInformationValue(
          ProfileInformationType.OtherNationalities,
          inmateDetail.profileInformation,
        )
        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updateNationality(
              clientToken,
              user,
              prisonerNumber,
              autocompleteField || radioField,
              otherNationalities,
            )
          },
          fieldData: nationalityFieldData,
          auditDetails: [
            { fieldName, previous: previousValue, updated: autocompleteField || radioField },
            {
              fieldName: 'otherNationalities',
              previous: previousOtherNationalitiesValue,
              updated: otherNationalities,
            },
          ],
        })
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
    const { pageTitle, code, fieldName } = fieldData
    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const { clientToken } = req.middleware
        const { prisonerNumber } = req.params
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
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const radioField = req.body.radioField || null
        const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)
        const previousValue = (
          prisonPerson?.physicalAttributes?.[code as keyof PrisonPersonPhysicalAttributes]
            ?.value as PrisonPersonCharacteristic
        )?.id
        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
              [code]: radioField,
            })
          },
          fieldData,
          auditDetails: { fieldName, previous: previousValue, updated: radioField },
        })
      },
    }
  }

  /**
   * Handler for editing eye colour.
   */
  eyeColour() {
    const { pageTitle, fieldName, auditEditPageLoad } = eyeColourFieldData

    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const code = PrisonPersonCharacteristicCode.eye

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
          page: auditEditPageLoad,
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
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const eyeColour = req.body.eyeColour || null
        const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)
        const previousLeftEyeColour = prisonPerson?.physicalAttributes?.leftEyeColour?.value?.id
        const previousRightEyeColour = prisonPerson?.physicalAttributes?.rightEyeColour?.value?.id
        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
              leftEyeColour: eyeColour,
              rightEyeColour: eyeColour,
            })
          },
          fieldData: eyeColourFieldData,
          auditDetails: {
            fieldName,
            previous: { leftEyeColour: previousLeftEyeColour, rightEyeColour: previousRightEyeColour },
            updated: { leftEyeColour: eyeColour, rightEyeColour: eyeColour },
          },
        })
      },
    }
  }

  /**
   * Handler for editing left and right eye colour individually.
   */
  eyeColourIndividual() {
    const { pageTitle, auditEditPageLoad } = eyeColourIndividualFieldData

    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const code = PrisonPersonCharacteristicCode.eye
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
          page: auditEditPageLoad,
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
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const leftEyeColour = req.body.leftEyeColour || null
        const rightEyeColour = req.body.rightEyeColour || null
        const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)
        const previousLeftEyeColour = prisonPerson?.physicalAttributes?.leftEyeColour?.value?.id
        const previousRightEyeColour = prisonPerson?.physicalAttributes?.rightEyeColour?.value?.id
        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
              leftEyeColour,
              rightEyeColour,
            })
          },
          fieldData: eyeColourIndividualFieldData,
          auditDetails: {
            fieldName: 'eyeColour',
            previous: { leftEyeColour: previousLeftEyeColour, rightEyeColour: previousRightEyeColour },
            updated: { leftEyeColour, rightEyeColour },
          },
        })
      },
    }
  }

  history(fieldData: TextFieldData) {
    const { pageTitle, fieldName, formatter, auditEditPageLoad } = fieldData

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
        page: auditEditPageLoad,
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
        page: fieldData.auditEditPageLoad,
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

  dietAndFoodAllergies() {
    const { pageTitle, fieldName, auditEditPageLoad } = dietAndFoodAllergiesFieldData

    const mapDietAndAllergy = (
      dietAndAllergy: DietAndAllergy,
      field: keyof DietAndAllergy,
    ): ReferenceDataIdSelection[] => {
      if (dietAndAllergy && dietAndAllergy[field]) {
        return dietAndAllergy[field].value.map(selection => ({
          value: selection.value.id,
          comment: selection.comment,
        }))
      }
      return []
    }

    const checkboxOptions = (
      namePrefix: string,
      referenceDataCodes: ReferenceDataCode[],
      selectedItems: ReferenceDataIdSelection[],
    ) => {
      return referenceDataCodes
        .sort((a, b) => a.listSequence - b.listSequence)
        .map(code => {
          const selectedItem = selectedItems.find(item => item.value === code.id)
          return {
            name: `${namePrefix}[${code.listSequence}][value]`,
            text: code.description,
            value: code.id,
            id: code.id,
            listSequence: code.listSequence,
            checked: !!selectedItem,
            comment: selectedItem?.comment,
          }
        })
    }

    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { clientToken, prisonerData } = req.middleware
        const { firstName, lastName, cellLocation } = prisonerData
        const prisonerBannerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })
        const prisonerName = formatName(firstName, null, lastName, { style: NameFormatStyle.firstLast })

        const [healthAndMedication, allergyCodes, medicalDietCodes, personalisedDietCodes] = await Promise.all([
          this.personalPageService.getHealthAndMedication(clientToken, prisonerNumber),
          this.personalPageService.getHealthAndMedicationReferenceDataCodes(
            clientToken,
            HealthAndMedicationReferenceDataDomain.foodAllergy,
          ),
          this.personalPageService.getHealthAndMedicationReferenceDataCodes(
            clientToken,
            HealthAndMedicationReferenceDataDomain.medicalDiet,
          ),
          this.personalPageService.getHealthAndMedicationReferenceDataCodes(
            clientToken,
            HealthAndMedicationReferenceDataDomain.personalisedDiet,
          ),
        ])

        const errors = validationErrorsFromFlash(req)
        const requestBodyFlash = requestBodyFromFlash<{
          allergy?: ReferenceDataIdSelection[]
          medical?: ReferenceDataIdSelection[]
          personalised?: ReferenceDataIdSelection[]
        }>(req)

        const dietAndAllergy = healthAndMedication?.dietAndAllergy

        const allergiesSelected = () => {
          if (requestBodyFlash?.allergy) return requestBodyFlash.allergy.filter(item => !!item.value)
          return mapDietAndAllergy(dietAndAllergy, 'foodAllergies')
        }

        const medicalDietChecked = () => {
          if (requestBodyFlash?.medical) return requestBodyFlash.medical.filter(item => !!item.value)
          return mapDietAndAllergy(dietAndAllergy, 'medicalDietaryRequirements')
        }

        const personalisedDietChecked = () => {
          if (requestBodyFlash?.personalised) return requestBodyFlash.personalised.filter(item => !!item.value)
          return mapDietAndAllergy(dietAndAllergy, 'personalisedDietaryRequirements')
        }

        await this.auditService.sendPageView({
          user: res.locals.user,
          prisonerNumber: prisonerData.prisonerNumber,
          prisonId: prisonerData.prisonId,
          correlationId: req.id,
          page: auditEditPageLoad,
        })

        res.render('pages/edit/dietAndFoodAllergies', {
          pageTitle: `${pageTitle} - Prisoner personal details`,
          prisonerNumber,
          prisonerName,
          breadcrumbPrisonerName: prisonerBannerName,
          miniBannerData: {
            prisonerName: prisonerBannerName,
            prisonerNumber,
            cellLocation: formatLocation(cellLocation),
          },
          allergyOptions: checkboxOptions('allergy', allergyCodes, allergiesSelected()),
          medicalDietOptions: checkboxOptions('medical', medicalDietCodes, medicalDietChecked()),
          personalisedDietOptions: checkboxOptions('personalised', personalisedDietCodes, personalisedDietChecked()),
          errors: errors ?? [],
          errorsForForms: {
            medical: errors?.filter(e => e.href === '#medical-other')[0]?.text ?? null,
            allergy: errors?.filter(e => e.href === '#allergy-other')[0]?.text ?? null,
            personalised: errors?.filter(e => e.href === '#personalised-other')[0]?.text ?? null,
          },
        })
      },

      submit: async (req: Request, res: Response, next: NextFunction) => {
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const { prisonerNumber } = req.params
        const dietAndAllergy = (await this.personalPageService.getHealthAndMedication(clientToken, prisonerNumber))
          ?.dietAndAllergy

        const update: Partial<DietAndAllergyUpdate> = {
          foodAllergies: req.body.allergy
            ? req.body.allergy.filter((item: ReferenceDataIdSelection) => !!item.value)
            : [],
          medicalDietaryRequirements: req.body.medical
            ? req.body.medical.filter((item: ReferenceDataIdSelection) => !!item.value)
            : [],
          personalisedDietaryRequirements: req.body.personalised
            ? req.body.personalised.filter((item: ReferenceDataIdSelection) => !!item.value)
            : [],
        }

        const previousValues: Partial<DietAndAllergyUpdate> = {
          foodAllergies: mapDietAndAllergy(dietAndAllergy, 'foodAllergies'),
          medicalDietaryRequirements: mapDietAndAllergy(dietAndAllergy, 'medicalDietaryRequirements'),
          personalisedDietaryRequirements: mapDietAndAllergy(dietAndAllergy, 'personalisedDietaryRequirements'),
        }

        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updateDietAndFoodAllergies(clientToken, user, prisonerNumber, update)
          },
          fieldData: dietAndFoodAllergiesFieldData,
          auditDetails: { fieldName, previous: previousValues, updated: update },
        })
      },
    }
  }

  medicalDiet() {
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
          {
            ...medicalDietFieldData,
            options: referenceDataDomainToCheckboxFieldDataOptions(medicalDietaryRequirementValues),
          },
          referenceDataDomainToCheckboxOptions(medicalDietaryRequirementValues),
          prisonPerson?.health?.medicalDietaryRequirements?.value.map(code => code.id),
        )(req, res, next)
      },

      submit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const checkedItems = checkboxInputToSelectedValues(medicalDietFieldData.fieldName, req.body).sort()
        const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)
        const previousValues = prisonPerson?.health?.foodAllergies?.value?.map(code => code.id)?.sort()

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
            fieldName: medicalDietFieldData.fieldName,
          })

          this.auditService
            .sendPostSuccess({
              user: res.locals.user,
              prisonerNumber,
              correlationId: req.id,
              action: PostAction.EditMedicalDiet,
              details: { fieldName: medicalDietFieldData.fieldName, previous: previousValues, updated: checkedItems },
            })
            .catch(error => logger.error(error))

          return res.redirect(`/prisoner/${prisonerNumber}/personal#personal-details`)
        } catch (e) {
          req.flash('errors', [{ text: 'There was an error please try again' }])
        }
        return res.redirect(`/prisoner/${prisonerNumber}/personal/${medicalDietFieldData.url}`)
      },
    }
  }

  foodAllergies() {
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
          { ...foodAllergiesFieldData, options: referenceDataDomainToCheckboxFieldDataOptions(foodAllergyValues) },
          referenceDataDomainToCheckboxOptions(foodAllergyValues),
          prisonPerson?.health?.foodAllergies?.value.map(code => code.id),
        )(req, res, next)
      },

      submit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const checkedItems = checkboxInputToSelectedValues(foodAllergiesFieldData.fieldName, req.body).sort()
        const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)
        const previousValues = prisonPerson?.health?.foodAllergies?.value?.map(code => code.id)?.sort()

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
              details: {
                fieldName: foodAllergiesFieldData.fieldName,
                previous: previousValues,
                updated: checkedItems,
              },
            })
            .catch(error => logger.error(error))

          return res.redirect(`/prisoner/${prisonerNumber}/personal#personal-details`)
        } catch (e) {
          req.flash('errors', [{ text: 'There was an error please try again' }])
        }
        return res.redirect(`/prisoner/${prisonerNumber}/personal/${foodAllergiesFieldData.url}`)
      },
    }
  }

  countryOfBirth() {
    const { fieldName, url } = countryOfBirthFieldData

    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const { inmateDetail, prisonerData, clientToken } = req.middleware
        const { firstName, lastName } = prisonerData
        const requestBodyFlash = requestBodyFromFlash<{ autocompleteField: string; radioField: string }>(req)
        const countryReferenceData = await this.personalPageService.getReferenceDataCodesFromProxy(
          clientToken,
          ProxyReferenceDataDomain.country,
        )

        const fieldValue =
          requestBodyFlash?.autocompleteField ||
          requestBodyFlash?.radioField ||
          countryReferenceData.find(country => country.code === inmateDetail.birthCountryCode)?.code

        const countriesAsRadioOptions = ['ENG', 'SCOT', 'WALES', 'NI']
          .map(code => countryReferenceData.find(val => val.code === code))
          .filter(Boolean)

        const countriesAsAutocompleteOptions = countryReferenceData.filter(
          val => !countriesAsRadioOptions.includes(val),
        )

        return this.editRadioFieldsWithAutocomplete({
          formTitle: `What country was ${formatName(firstName, '', lastName, { style: NameFormatStyle.firstLast })} born in?`,
          fieldData: countryOfBirthFieldData,
          radioOptions: objectToRadioOptions(countriesAsRadioOptions, 'code', 'description', fieldValue),
          autocompleteOptions: objectToSelectOptions(countriesAsAutocompleteOptions, 'code', 'description', fieldValue),
          autocompleteSelected: ['OTHER', 'OTHER__VALIDATION_ERROR'].includes(fieldValue),
          autocompleteOptionTitle: 'A different country',
          autocompleteOptionLabel: 'Country name',
        })(req, res, next)
      },

      submit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { clientToken, inmateDetail } = req.middleware
        const user = res.locals.user as PrisonUser
        const radioField = req.body.radioField || null
        const autocompleteField = (radioField === 'OTHER' && req.body.autocompleteField) || null
        const previousValue = inmateDetail.birthCountryCode

        if (!autocompleteField && ['OTHER', 'OTHER__VALIDATION_ERROR'].includes(radioField)) {
          const validationText = radioField === 'OTHER' ? 'Enter country name' : 'This is not a valid country'
          req.flash('errors', [{ href: '#autocomplete', text: validationText }])
          req.flash('requestBody', JSON.stringify(req.body))
          return res.redirect(`/prisoner/${prisonerNumber}/personal/${url}`)
        }

        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updateCountryOfBirth(
              clientToken,
              user,
              prisonerNumber,
              autocompleteField || radioField,
            )
          },
          fieldData: countryOfBirthFieldData,
          auditDetails: { fieldName, previous: previousValue, updated: autocompleteField || radioField },
        })
      },
    }
  }

  religion() {
    const { pageTitle, fieldName, auditEditPageLoad, redirectAnchor } = religionFieldData

    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { clientToken, inmateDetail, prisonerData } = req.middleware
        const { firstName, lastName, cellLocation } = prisonerData
        const requestBodyFlash = requestBodyFromFlash<{
          religion: string
          reasonKnown: string
          reasonForChange: string
          reasonForChangeUnknown: string
        }>(req)
        const errors = req.flash('errors')

        const prisonerName = formatName(firstName, null, lastName, { style: NameFormatStyle.firstLast })
        const prisonerBannerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })
        const otherReligionCodes = ['OTH', 'NIL', 'UNKN']
        const religionReferenceData = await this.personalPageService.getReferenceDataCodesFromProxy(
          clientToken,
          ProxyReferenceDataDomain.religion,
        )
        const religionOptions = religionReferenceData
          .filter(it => !otherReligionCodes.includes(it.code))
          .sort((a, b) => a.description.localeCompare(b.description))
        const otherReligionOptions = otherReligionCodes.map(code => religionReferenceData.find(it => it.code === code))
        const profileInformationValue = getProfileInformationValue(
          ProfileInformationType.Religion,
          inmateDetail.profileInformation,
        )
        const currentReligion = profileInformationValue
          ? religionReferenceData.filter(
              religion => religion.description === profileInformationValue || religion.code === profileInformationValue,
            )[0] || { code: '?', description: profileInformationValue }
          : profileInformationValue
        const fieldValue = requestBodyFlash?.religion
        const currentReasonKnown = requestBodyFlash?.reasonKnown
        const currentReasonForChange = requestBodyFlash?.reasonForChange
        const currentReasonForChangeUnknown = requestBodyFlash?.reasonForChangeUnknown

        await this.auditService.sendPageView({
          user: res.locals.user,
          prisonerNumber: prisonerData.prisonerNumber,
          prisonId: prisonerData.prisonId,
          correlationId: req.id,
          page: auditEditPageLoad,
        })

        res.render('pages/edit/religion', {
          pageTitle: `${pageTitle} - Prisoner personal details`,
          formTitle: `Select ${prisonerName}'s religion, faith or belief`,
          prisonerNumber,
          currentReligion,
          currentReasonKnown,
          currentReasonForChange,
          currentReasonForChangeUnknown,
          breadcrumbPrisonerName: prisonerBannerName,
          errors,
          options: [
            ...objectToRadioOptions(religionOptions, 'code', 'description', fieldValue),
            { divider: 'Or other, none or unknown' },
            ...objectToRadioOptions(otherReligionOptions, 'code', 'description', fieldValue),
          ],
          miniBannerData: {
            prisonerName: prisonerBannerName,
            prisonerNumber,
            cellLocation: formatLocation(cellLocation),
          },
        })
      },

      submit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const religionCode = req.body.religion || null
        const currentReligionCode = req.body.currentReligionCode || null
        const reasonForChangeKnown = req.body.reasonKnown || null
        const reasonForChange =
          reasonForChangeKnown === 'NO' ? req.body.reasonForChangeUnknown : req.body.reasonForChange

        if (!religionCode) {
          return res.redirect(`/prisoner/${prisonerNumber}/personal#${redirectAnchor}`)
        }

        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updateReligion(
              clientToken,
              user,
              prisonerNumber,
              religionCode,
              reasonForChange,
            )
          },
          fieldData: religionFieldData,
          auditDetails: {
            fieldName,
            previous: currentReligionCode,
            updated: religionCode,
          },
        })
      },
    }
  }
}
