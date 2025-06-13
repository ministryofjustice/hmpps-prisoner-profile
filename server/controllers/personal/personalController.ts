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
import { AuditService, Page } from '../../services/auditService'
import {
  apostrophe,
  convertToTitleCase,
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
import { dietAndAllergyEnabled, editProfileEnabled, editReligionEnabled } from '../../utils/featureToggles'
import {
  cityOrTownOfBirthFieldData,
  countryOfBirthFieldData,
  dietAndFoodAllergiesFieldData,
  domesticStatusFieldData,
  emailAddressTextFieldData,
  eyeColourFieldData,
  eyeColourIndividualFieldData,
  FieldData,
  heightFieldData,
  heightImperialFieldData,
  nationalityFieldData,
  numberOfChildrenFieldData,
  PhysicalAttributesTextFieldData,
  RadioFieldData,
  religionFieldData,
  sexualOrientationFieldData,
  smokerOrVaperFieldData,
  TextFieldData,
  weightFieldData,
  weightImperialFieldData,
} from './fieldData'
import logger from '../../../logger'
import miniBannerData from '../utils/miniBannerData'
import { requestBodyFromFlash } from '../../utils/requestBodyFromFlash'
import { getProfileInformationValue, ProfileInformationType } from '../../data/interfaces/prisonApi/ProfileInformation'
import { validationErrorsFromFlash } from '../../utils/validationErrorsFromFlash'
import {
  DietAndAllergy,
  DietAndAllergyUpdate,
  HealthAndMedicationReferenceDataDomain,
  ReferenceDataIdSelection,
} from '../../data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'
import { Role } from '../../data/enums/role'
import {
  CorePersonPhysicalAttributesRequest,
  CorePersonRecordReferenceDataDomain,
} from '../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { ReferenceDataCodeDto } from '../../data/interfaces/referenceData'
import InmateDetail from '../../data/interfaces/prisonApi/InmateDetail'
import config from '../../config'

type TextFieldDataGetter = (req: Request) => TextFieldData
type TextFieldGetter = (req: Request, fieldData: TextFieldData) => Promise<string>
type TextFieldSetter = (req: Request, res: Response, fieldData: TextFieldData, value: string) => Promise<void>

export default class PersonalController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    private readonly careNeedsService: CareNeedsService,
    private readonly auditService: AuditService,
  ) {}

  displayPersonalPage() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { prisonerData, inmateDetail, alertSummaryData, clientToken } = req.middleware
      const { bookingId } = prisonerData
      const { user, flashMessage, apiErrorCallback } = res.locals
      const { activeCaseLoadId, userRoles } = user as PrisonUser
      const profileEditEnabled = editProfileEnabled(activeCaseLoadId)
      const { personalRelationshipsApiReadEnabled } = config.featureToggles

      const [personalPageData, careNeeds, xrays] = await Promise.all([
        this.personalPageService.get(
          clientToken,
          prisonerData,
          dietAndAllergyEnabled(activeCaseLoadId),
          profileEditEnabled,
          personalRelationshipsApiReadEnabled,
          apiErrorCallback,
          flashMessage,
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

      const editEnabled = profileEditEnabled && userHasRoles(['DPS_APPLICATION_DEVELOPER'], userRoles)
      const hasPersonalId = Object.values(personalPageData.identityNumbers.personal).some(v => v.length > 0)
      const hasHomeOfficeId = Object.values(personalPageData.identityNumbers.homeOffice).some(v => v.length > 0)

      res.render('pages/personalPage', {
        pageTitle: 'Personal',
        ...mapHeaderData(prisonerData, inmateDetail, alertSummaryData, res.locals.user, 'personal'),
        ...personalPageData,
        changeEyeColourUrl:
          personalPageData.physicalCharacteristics.leftEyeColour ===
          personalPageData.physicalCharacteristics.rightEyeColour
            ? 'personal/eye-colour'
            : 'personal/eye-colour-individual',
        careNeeds: careNeeds.filter(need => need.isOngoing).sort((a, b) => b.startDate?.localeCompare(a.startDate)),
        security: { ...personalPageData.security, xrays },
        hasPastCareNeeds: careNeeds.some(need => !need.isOngoing),
        editEnabled,
        dietAndAllergiesEnabled:
          dietAndAllergyEnabled(activeCaseLoadId) && dietAndAllergyEnabled(prisonerData.prisonId),
        editDietAndAllergiesEnabled:
          dietAndAllergyEnabled(activeCaseLoadId) &&
          userHasRoles([Role.DietAndAllergiesEdit], userRoles) &&
          prisonerData.prisonId === activeCaseLoadId,
        editReligionEnabled: editEnabled || editReligionEnabled(),
        personalRelationshipsApiReadEnabled,
        hasPersonalId,
        hasHomeOfficeId,
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

          const { height } = await this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber)

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
            fieldValue: requestBodyFlash ? requestBodyFlash.editField : height,
            miniBannerData: miniBannerData(prisonerData),
          })
        },

        submit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const { editField } = req.body
          const user = res.locals.user as PrisonUser

          const height = editField ? parseInt(editField, 10) : 0

          const { height: previousHeight } = await this.personalPageService.getPhysicalAttributes(
            clientToken,
            prisonerNumber,
          )

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
          const { clientToken, prisonerData, inmateDetail } = req.middleware

          const { height } = await this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber)

          const { feet, inches } =
            height === undefined || height === null
              ? { feet: undefined, inches: undefined }
              : centimetresToFeetAndInches(height)

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
            breadcrumbPrisonerName: formatName(inmateDetail.firstName, '', inmateDetail.lastName, {
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

          const { height: previousHeight } = await this.personalPageService.getPhysicalAttributes(
            clientToken,
            prisonerNumber,
          )

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
          const { clientToken, prisonerData, inmateDetail } = req.middleware
          const requestBodyFlash = requestBodyFromFlash<{ kilograms: string }>(req)
          const errors = req.flash('errors')

          const { weight } = await this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber)

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
            breadcrumbPrisonerName: formatName(inmateDetail.firstName, '', inmateDetail.lastName, {
              style: NameFormatStyle.lastCommaFirst,
            }),
            errors,
            fieldValue: requestBodyFlash ? requestBodyFlash.kilograms : weight,
            miniBannerData: miniBannerData(prisonerData),
          })
        },

        submit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const user = res.locals.user as PrisonUser
          const { kilograms } = req.body
          const weight = parseInt(kilograms, 10)

          const { weight: previousWeight } = await this.personalPageService.getPhysicalAttributes(
            clientToken,
            prisonerNumber,
          )

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
          const { clientToken, prisonerData, inmateDetail } = req.middleware

          const { weight } = await this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber)

          const { stone, pounds } =
            weight === undefined || weight === null
              ? { stone: undefined, pounds: undefined }
              : kilogramsToStoneAndPounds(weight)

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
            breadcrumbPrisonerName: formatName(inmateDetail.firstName, '', inmateDetail.lastName, {
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

          const { weight: previousWeight } = await this.personalPageService.getPhysicalAttributes(
            clientToken,
            prisonerNumber,
          )

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
      () => cityOrTownOfBirthFieldData,
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
    this.textInput(
      () => fieldData,
      this.getPhysicalAttributesText.bind(this),
      this.setPhysicalAttributesText.bind(this),
    )

  private async getPhysicalAttributesText(
    req: Request,
    fieldData: PhysicalAttributesTextFieldData,
  ): Promise<string | number> {
    const { prisonerNumber } = req.params
    const { clientToken } = req.middleware

    const physicalAttributes = await this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber)

    return physicalAttributes[fieldData.fieldName]
  }

  private async setPhysicalAttributesText(
    req: Request,
    res: Response,
    fieldData: PhysicalAttributesTextFieldData,
    value: string | number,
  ): Promise<void> {
    const { prisonerNumber } = req.params
    const { clientToken } = req.middleware
    const user = res.locals.user as PrisonUser

    await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
      [fieldData.fieldName]: value,
    })
  }

  private textInput(fieldDataGetter: TextFieldDataGetter, getter: TextFieldGetter, setter: TextFieldSetter) {
    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const fieldData = fieldDataGetter(req)
        const { pageTitle, formTitle, hintText, auditEditPageLoad, fieldName, inputClasses, submitButtonText } =
          fieldData
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
          formTitle: formTitle ?? pageTitle,
          prisonerNumber,
          breadcrumbPrisonerName: prisonerBannerName,
          errors,
          hintText,
          fieldName,
          fieldValue,
          inputClasses,
          miniBannerData: miniBannerData(prisonerData),
          submitButtonText,
        })
      },

      submit: async (req: Request, res: Response, next: NextFunction) => {
        const fieldData = fieldDataGetter(req)
        const { fieldName } = fieldData
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

  editRadioFields(formTitle: string, fieldData: RadioFieldData, options: (RadioOption | { divider: string })[]) {
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
        const fieldValue = requestBodyFlash?.radioField || this.getSmokerStatus(inmateDetail)
        const smokerOrVaperValues = await this.personalPageService.getReferenceDataCodes(
          clientToken,
          HealthAndMedicationReferenceDataDomain.smoker,
        )

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
        const previousValue: string = this.getSmokerStatus(req.middleware.inmateDetail)
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
          this.personalPageService.getReferenceDataCodes(clientToken, CorePersonRecordReferenceDataDomain.nationality),
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
    const { pageTitle, code, domain, fieldName } = fieldData
    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const { clientToken } = req.middleware
        const { prisonerNumber } = req.params
        const requestBodyFlash = requestBodyFromFlash<{ radioField: string }>(req)

        const [characteristics, physicalAttributes] = await Promise.all([
          this.personalPageService.getReferenceDataCodes(clientToken, domain),
          this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber),
        ])
        const fieldValue = requestBodyFlash?.radioField || physicalAttributes[code]
        const options = objectToRadioOptions(characteristics, 'code', 'description', fieldValue)

        return this.editRadioFields(pageTitle, fieldData, options)(req, res, next)
      },

      submit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const radioField = req.body.radioField || null
        const physicalAttributes = await this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber)
        const previousValue = physicalAttributes?.[code as keyof CorePersonPhysicalAttributesRequest]
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
        const domain = CorePersonRecordReferenceDataDomain.leftEyeColour

        const { prisonerNumber } = req.params
        const { clientToken, prisonerData } = req.middleware
        const { firstName, lastName, cellLocation } = prisonerData
        const requestBodyFlash = requestBodyFromFlash<{ eyeColour: string }>(req)
        const errors = req.flash('errors')

        const prisonerBannerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })

        const [characteristics, physicalAttributes] = await Promise.all([
          this.personalPageService.getReferenceDataCodes(clientToken, domain),
          this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber),
        ])

        /* Set radio to correct eye colour if both left and right values are the same, otherwise leave unselected. */
        const eyeColour =
          physicalAttributes.leftEyeColourCode === physicalAttributes.rightEyeColourCode
            ? physicalAttributes.leftEyeColourCode
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
          options: objectToRadioOptions(characteristics, 'code', 'description', fieldValue),
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
        const physicalAttributes = await this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber)
        const previousLeftEyeColour = physicalAttributes?.leftEyeColourCode
        const previousRightEyeColour = physicalAttributes?.rightEyeColourCode
        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
              leftEyeColourCode: eyeColour,
              rightEyeColourCode: eyeColour,
            })
          },
          fieldData: eyeColourFieldData,
          auditDetails: {
            fieldName,
            previous: { leftEyeColourCode: previousLeftEyeColour, rightEyeColourCode: previousRightEyeColour },
            updated: { leftEyeColourCode: eyeColour, rightEyeColourCode: eyeColour },
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
        const domainLeftEyeColour = CorePersonRecordReferenceDataDomain.leftEyeColour
        const domainRightEyeColour = CorePersonRecordReferenceDataDomain.rightEyeColour

        const { prisonerNumber } = req.params
        const { clientToken, prisonerData } = req.middleware
        const { firstName, lastName, cellLocation } = prisonerData
        const requestBodyFlash = requestBodyFromFlash<{ leftEyeColour: string; rightEyeColour: string }>(req)
        const errors = req.flash('errors')

        const prisonerBannerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })

        const [leftEyeColours, rightEyeColours, physicalAttributes] = await Promise.all([
          this.personalPageService.getReferenceDataCodes(clientToken, domainLeftEyeColour),
          this.personalPageService.getReferenceDataCodes(clientToken, domainRightEyeColour),
          this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber),
        ])
        const leftEyeColour = requestBodyFlash?.leftEyeColour || physicalAttributes.leftEyeColourCode
        const rightEyeColour = requestBodyFlash?.rightEyeColour || physicalAttributes.rightEyeColourCode

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
          leftOptions: objectToRadioOptions(leftEyeColours, 'code', 'description', leftEyeColour),
          rightOptions: objectToRadioOptions(rightEyeColours, 'code', 'description', rightEyeColour),
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
        const leftEyeColourCode = req.body.leftEyeColour || null
        const rightEyeColourCode = req.body.rightEyeColour || null
        const physicalAttributes = await this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber)
        const previousLeftEyeColour = physicalAttributes?.leftEyeColourCode
        const previousRightEyeColour = physicalAttributes?.rightEyeColourCode
        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
              leftEyeColourCode,
              rightEyeColourCode,
            })
          },
          fieldData: eyeColourIndividualFieldData,
          auditDetails: {
            fieldName: 'eyeColour',
            previous: { leftEyeColourCode: previousLeftEyeColour, rightEyeColourCode: previousRightEyeColour },
            updated: { leftEyeColourCode, rightEyeColourCode },
          },
        })
      },
    }
  }

  dietAndFoodAllergies() {
    const { pageTitle, fieldName, auditEditPageLoad } = dietAndFoodAllergiesFieldData

    const mapDietAndAllergy = (
      dietAndAllergy: DietAndAllergy,
      field: keyof Omit<DietAndAllergy, 'cateringInstructions'>,
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
      referenceDataCodes: ReferenceDataCodeDto[],
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
          this.personalPageService.getReferenceDataCodes(
            clientToken,
            HealthAndMedicationReferenceDataDomain.foodAllergy,
          ),
          this.personalPageService.getReferenceDataCodes(
            clientToken,
            HealthAndMedicationReferenceDataDomain.medicalDiet,
          ),
          this.personalPageService.getReferenceDataCodes(
            clientToken,
            HealthAndMedicationReferenceDataDomain.personalisedDiet,
          ),
        ])

        const errors = validationErrorsFromFlash(req)
        const requestBodyFlash = requestBodyFromFlash<{
          allergy?: ReferenceDataIdSelection[]
          medical?: ReferenceDataIdSelection[]
          personalised?: ReferenceDataIdSelection[]
          cateringInstructions?: string
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

        const cateringInstructions = requestBodyFlash?.cateringInstructions
          ? requestBodyFlash.cateringInstructions
          : dietAndAllergy?.cateringInstructions?.value

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
          cateringInstructions,
          errors: errors ?? [],
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
          cateringInstructions: req.body.cateringInstructions,
        }

        const previousValues: Partial<DietAndAllergyUpdate> = {
          foodAllergies: mapDietAndAllergy(dietAndAllergy, 'foodAllergies'),
          medicalDietaryRequirements: mapDietAndAllergy(dietAndAllergy, 'medicalDietaryRequirements'),
          personalisedDietaryRequirements: mapDietAndAllergy(dietAndAllergy, 'personalisedDietaryRequirements'),
          cateringInstructions: dietAndAllergy?.cateringInstructions?.value,
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

  countryOfBirth() {
    const { fieldName, url } = countryOfBirthFieldData

    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const { inmateDetail, prisonerData, clientToken } = req.middleware
        const { firstName, lastName } = prisonerData
        const requestBodyFlash = requestBodyFromFlash<{ autocompleteField: string; radioField: string }>(req)
        const countryReferenceData = await this.personalPageService.getReferenceDataCodes(
          clientToken,
          CorePersonRecordReferenceDataDomain.country,
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

    const currentReligionValue = (req: Request, referenceData: ReferenceDataCodeDto[]) => {
      const { inmateDetail } = req.middleware
      const profileInformationValue = getProfileInformationValue(
        ProfileInformationType.Religion,
        inmateDetail.profileInformation,
      )
      const currentValue =
        profileInformationValue &&
        (referenceData.find(
          religion =>
            religion.description.toLowerCase() === profileInformationValue.toLowerCase() ||
            religion.code === profileInformationValue,
        ) ?? { code: '?', description: profileInformationValue })

      const override = religionFieldData.referenceDataOverrides.find(o => o.id === currentValue?.code)
      return {
        ...currentValue,
        description: override?.description ?? currentValue?.description,
      }
    }

    // Options are already sorted alphabetically, this then applies additional non-alphabetical sorting
    const religionOptionsSorter = (a: RadioOption, b: RadioOption): number => {
      if (
        (a.text.startsWith('Christian – ') && b.text.startsWith('Christian – ')) ||
        (a.text.startsWith('Muslim') && b.text.startsWith('Muslim'))
      ) {
        if (a.text.endsWith('Other')) {
          return b.text.endsWith('Other') ? 0 : 1
        }
        if (b.text.endsWith('Other')) {
          return a.text.endsWith('Other') ? 0 : -1
        }
      }

      if (a.text.endsWith('– Oriental Orthodox') && b.text.endsWith('– Orthodox')) {
        return 1
      }
      if (b.text.endsWith('– Oriental Orthodox') && a.text.endsWith('– Orthodox')) {
        return -1
      }

      return 0
    }

    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { clientToken, prisonerData } = req.middleware
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
        // 'UNKN' will be deactivated as part of the religion reference data migration in NOMIS (and can then be removed from here)
        const otherReligionCodes = ['OTH', 'NIL', 'TPRNTS', 'UNKN']
        const religionReferenceData = await this.personalPageService.getReferenceDataCodes(
          clientToken,
          CorePersonRecordReferenceDataDomain.religion,
        )
        const religionOptions = religionReferenceData
          .filter(it => !otherReligionCodes.includes(it.code))
          .sort((a, b) => a.description.localeCompare(b.description))
        const otherReligionOptions = otherReligionCodes
          .map(code => religionReferenceData.find(it => it.code === code))
          .filter(Boolean)

        const currentReligion = currentReligionValue(req, religionReferenceData)
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
          formTitle: `Select ${apostrophe(prisonerName)} religion, faith or belief`,
          prisonerNumber,
          currentReligion,
          currentReasonKnown,
          currentReasonForChange,
          currentReasonForChangeUnknown,
          breadcrumbPrisonerName: prisonerBannerName,
          redirectAnchor,
          errors,
          options: [
            ...objectToRadioOptions(
              religionOptions,
              'code',
              'description',
              fieldValue,
              religionFieldData.referenceDataOverrides,
            ).sort(religionOptionsSorter),
            { divider: 'Or' },
            ...objectToRadioOptions(
              otherReligionOptions,
              'code',
              'description',
              fieldValue,
              religionFieldData.referenceDataOverrides,
            ),
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

  sexualOrientation() {
    const { fieldName } = sexualOrientationFieldData

    const descriptionLookup: Record<string, string> = {
      HET: 'Heterosexual or straight',
      HOM: 'Gay or lesbian',
      ND: 'Not answered',
    }

    const currentOrientationCode = async (req: Request, referenceData?: ReferenceDataCodeDto[]) => {
      const { inmateDetail, clientToken } = req.middleware
      const sexualOrientationReferenceData =
        referenceData ||
        (await this.personalPageService.getReferenceDataCodes(
          clientToken,
          CorePersonRecordReferenceDataDomain.sexualOrientation,
        ))
      const profileInformationValue = getProfileInformationValue(
        ProfileInformationType.SexualOrientation,
        inmateDetail.profileInformation,
      )
      return (
        profileInformationValue &&
        sexualOrientationReferenceData.find(
          orientation =>
            orientation.description === profileInformationValue || orientation.code === profileInformationValue,
        )?.code
      )
    }

    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerData, clientToken } = req.middleware
        const { firstName, lastName } = prisonerData
        const requestBodyFlash = requestBodyFromFlash<{ autocompleteField: string; radioField: string }>(req)
        const sexualOrientationReferenceData = await this.personalPageService.getReferenceDataCodes(
          clientToken,
          CorePersonRecordReferenceDataDomain.sexualOrientation,
        )
        const mappedReferenceData = sexualOrientationReferenceData.map(item => {
          return {
            ...item,
            description: descriptionLookup[item.code] ?? item.description,
          }
        })

        const options = mappedReferenceData.filter(it => it.code !== 'ND')
        const notAnsweredOption = mappedReferenceData.find(it => it.code === 'ND')

        const fieldValue =
          requestBodyFlash?.radioField || (await currentOrientationCode(req, sexualOrientationReferenceData))

        const radioOptions = [
          ...objectToRadioOptions(options, 'code', 'description', fieldValue),
          { divider: 'Or' },
          ...objectToRadioOptions([notAnsweredOption], 'code', 'description', fieldValue),
        ]

        return this.editRadioFields(
          `Which of the following best describes ${apostrophe(formatName(firstName, '', lastName, { style: NameFormatStyle.firstLast }))} sexual orientation?`,
          sexualOrientationFieldData,
          radioOptions,
        )(req, res, next)
      },

      submit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const radioField = req.body.radioField || null
        const previousValue = await currentOrientationCode(req)

        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updateSexualOrientation(clientToken, user, prisonerNumber, radioField)
          },
          fieldData: sexualOrientationFieldData,
          auditDetails: { fieldName, previous: previousValue, updated: radioField },
        })
      },
    }
  }

  numberOfChildren() {
    const { pageTitle, fieldName, auditEditPageLoad, redirectAnchor } = numberOfChildrenFieldData

    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerData, clientToken } = req.middleware
        const { firstName, lastName, cellLocation } = prisonerData
        const { prisonerNumber } = req.params
        const prisonerName = formatName(firstName, null, lastName, { style: NameFormatStyle.firstLast })
        const prisonerBannerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })
        const requestBodyFlash = requestBodyFromFlash<{ hasChildren: string; numberOfChildren?: number }>(req)
        const errors = req.flash('errors')

        const currentNumberOfChildren =
          requestBodyFlash?.numberOfChildren ??
          (await this.personalPageService.getNumberOfChildren(clientToken, prisonerNumber))?.numberOfChildren
        const radioFieldValue =
          (requestBodyFlash?.hasChildren ?? (currentNumberOfChildren && currentNumberOfChildren !== '0')) ? 'YES' : 'NO'

        await this.auditService.sendPageView({
          user: res.locals.user,
          prisonerNumber: prisonerData.prisonerNumber,
          prisonId: prisonerData.prisonId,
          correlationId: req.id,
          page: auditEditPageLoad,
        })

        res.render('pages/edit/children', {
          pageTitle: `${pageTitle} - Prisoner personal details`,
          formTitle: `Does ${prisonerName} have any children?`,
          prisonerNumber,
          breadcrumbPrisonerName: prisonerBannerName,
          radioFieldValue,
          currentNumberOfChildren,
          errors,
          redirectAnchor,
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
        const { hasChildren, numberOfChildren } = req.body
        const previousValue = (await this.personalPageService.getNumberOfChildren(clientToken, prisonerNumber))
          ?.numberOfChildren

        const parsedNumberOfChildren = hasChildren === 'YES' ? Number(numberOfChildren) : 0

        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updateNumberOfChildren(
              clientToken,
              user,
              prisonerNumber,
              parsedNumberOfChildren,
            )
          },
          fieldData: numberOfChildrenFieldData,
          auditDetails: { fieldName, previous: previousValue, updated: numberOfChildren },
        })
      },
    }
  }

  domesticStatus() {
    const { fieldName } = domesticStatusFieldData

    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { prisonerData, clientToken } = req.middleware
        const { firstName, lastName } = prisonerData
        const requestBodyFlash = requestBodyFromFlash<{ radioField: string }>(req)
        const domesticStatusReferenceData = await this.personalPageService.getDomesticStatusReferenceData(clientToken)

        const options = domesticStatusReferenceData.filter(it => it.code !== 'N')
        const preferNotToSayOption = domesticStatusReferenceData.find(it => it.code === 'N')

        const fieldValue =
          requestBodyFlash?.radioField ||
          (await this.personalPageService.getDomesticStatus(clientToken, prisonerNumber))?.domesticStatusCode

        const radioOptions = [
          ...objectToRadioOptions(options, 'code', 'description', fieldValue),
          { divider: 'Or' },
          ...objectToRadioOptions([preferNotToSayOption], 'code', 'description', fieldValue),
        ]

        return this.editRadioFields(
          `What is ${apostrophe(formatName(firstName, '', lastName, { style: NameFormatStyle.firstLast }))} marital or civil partnership status?`,
          domesticStatusFieldData,
          radioOptions,
        )(req, res, next)
      },

      submit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const radioField = req.body.radioField || null
        const previousValue = (await this.personalPageService.getDomesticStatus(clientToken, prisonerNumber))
          ?.domesticStatusCode

        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updateDomesticStatus(clientToken, user, prisonerNumber, radioField)
          },
          fieldData: domesticStatusFieldData,
          auditDetails: { fieldName, previous: previousValue, updated: radioField },
        })
      },
    }
  }

  globalNumbers() {
    return {
      edit: async (_req: Request, _res: Response, _next: NextFunction) => {},
      submit: async (_req: Request, _res: Response, _next: NextFunction) => {},
    }
  }

  globalEmails() {
    const globalEmailGetter: TextFieldGetter = async (req, _fieldData) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware
      const { emailAddressId } = req.params
      const phonesAndEmails = await this.personalPageService.getGlobalPhonesAndEmails(clientToken, prisonerNumber)
      const emailValue = phonesAndEmails.emails.find(email => email.id.toString() === emailAddressId).email
      return emailValue
    }

    const fieldDataGetter: TextFieldDataGetter = req => {
      const { emailAddressId } = req.params
      const {
        prisonerData: { firstName, lastName },
      } = req.middleware
      return emailAddressTextFieldData(emailAddressId, { firstName, lastName })
    }

    const globalEmailSetter: TextFieldSetter = async (req, _res, _fieldData, value) => {
      const { prisonerNumber, emailAddressId } = req.params
      const { clientToken } = req.middleware

      await this.personalPageService.updateGlobalEmail(clientToken, prisonerNumber, emailAddressId, value)
    }

    return { edit: this.textInput(fieldDataGetter, globalEmailGetter, globalEmailSetter) }
  }

  // This will be replaced by a request to the Health and Medication API once it masters this data:
  getSmokerStatus(inmateDetail: InmateDetail): string {
    const statusMap: Record<string, string> = {
      Yes: 'SMOKER_YES',
      No: 'SMOKER_NO',
      'Vaper/NRT Only': 'SMOKER_VAPER',
    }
    return statusMap[getProfileInformationValue(ProfileInformationType.SmokerOrVaper, inmateDetail.profileInformation)]
  }

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
    const { pageTitle, auditEditPostAction, fieldName, url, redirectAnchor, successFlashFieldName } = fieldData

    try {
      await submit()

      req.flash('flashMessage', {
        text: `${successFlashFieldName ?? pageTitle} updated`,
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
}
