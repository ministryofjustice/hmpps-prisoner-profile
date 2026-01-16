import { Request, RequestHandler, Response } from 'express'
import { PrisonUser } from '../../interfaces/HmppsUser'
import PersonalPageService from '../../services/personalPageService'
import CareNeedsService from '../../services/careNeedsService'
import { mapHeaderData } from '../../mappers/headerMappers'
import { AuditService, Page } from '../../services/auditService'
import { FlashMessageType } from '../../data/enums/flashMessageType'
import {
  dietAndAllergyEnabled,
  editProfileEnabled,
  editProfileSimulateFetch,
  editReligionEnabled,
} from '../../utils/featureToggles'
import { addEmailAddressTextFieldData, changeEmailAddressTextFieldData, FieldData, TextFieldData } from './fieldData'
import logger from '../../../logger'
import { requestBodyFromFlash } from '../../utils/requestBodyFromFlash'
import config from '../../config'
import { NomisLockedError } from '../../utils/nomisLockedError'
import getCommonRequestData from '../../utils/getCommonRequestData'

type TextFieldDataGetter = (req: Request) => TextFieldData
type TextFieldGetter = (req: Request, fieldData: TextFieldData) => Promise<string>
type TextFieldSetter = (
  req: Request,
  res: Response,
  fieldData: TextFieldData,
  value: string,
) => Promise<SetterOutcome | void>
export enum SetterOutcome {
  SUCCESS,
  DUPLICATE,
}

interface PersonalControllerRequestHandlers {
  edit: RequestHandler
  submit: RequestHandler
}

export default class PersonalController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    private readonly careNeedsService: CareNeedsService,
    private readonly auditService: AuditService,
  ) {}

  displayPersonalPage(): RequestHandler {
    return async (req, res) => {
      const { prisonerData, inmateDetail, alertSummaryData, clientToken } = req.middleware
      const { bookingId } = prisonerData
      const { apiErrorCallback, user, prisonerPermissions } = res.locals
      const { activeCaseLoadId } = user as PrisonUser
      const editEnabled = editProfileEnabled(activeCaseLoadId)
      const simulateFetchEnabled = editProfileSimulateFetch(activeCaseLoadId)
      const { personalRelationshipsApiReadEnabled, healthAndMedicationApiReadEnabled, personEndpointsEnabled } =
        config.featureToggles

      const [personalPageData, careNeeds, xrays] = await Promise.all([
        this.personalPageService.get(clientToken, prisonerData, {
          dietAndAllergyIsEnabled: dietAndAllergyEnabled(activeCaseLoadId),
          editProfileEnabled: editEnabled,
          simulateFetchEnabled,
          personalRelationshipsApiReadEnabled,
          apiErrorCallback,
          healthAndMedicationApiReadEnabled,
          personEndpointsEnabled,
        }),
        this.careNeedsService.getCareNeedsAndAdjustments(clientToken, bookingId),
        this.careNeedsService.getXrayBodyScanSummary(clientToken, bookingId),
      ])

      await this.auditService.sendPageView({
        user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.Personal,
      })

      const hasPersonalId = Object.values(personalPageData.identityNumbers.personal).some(v => v.length > 0)
      const hasHomeOfficeId = Object.values(personalPageData.identityNumbers.homeOffice).some(v => v.length > 0)

      res.render('pages/personalPage', {
        pageTitle: 'Personal',
        ...mapHeaderData(prisonerData, inmateDetail, alertSummaryData, prisonerPermissions, 'personal'),
        ...personalPageData,
        changeEyeColourUrl:
          personalPageData.physicalCharacteristics.getOrNull()?.leftEyeColour ===
          personalPageData.physicalCharacteristics.getOrNull()?.rightEyeColour
            ? 'personal/eye-colour'
            : 'personal/eye-colour-individual',
        careNeeds: careNeeds.filter(need => need.isOngoing).sort((a, b) => b.startDate?.localeCompare(a.startDate)),
        security: { ...personalPageData.security, xrays },
        hasPastCareNeeds: careNeeds.some(need => !need.isOngoing),
        editEnabled,
        displayNewAddressesCard: editEnabled,
        dietAndAllergiesEnabled:
          dietAndAllergyEnabled(activeCaseLoadId) && dietAndAllergyEnabled(prisonerData.prisonId),
        editReligionEnabled: editEnabled || editReligionEnabled(),
        personalRelationshipsApiReadEnabled,
        hasPersonalId,
        hasHomeOfficeId,
        useCustomErrorBanner: true,
      })
    }
  }

  /**
   *
   * @param fieldDataGetter Returns the field data for the text input for display
   * @param getter Returns the current value for the text input
   * @param setter Sets the submitted value, typically on an external API
   * @param options.template A nunjucks template that extends the text field one where additional actions are necessary
   * @returns Edit/Submit routes for use with an edit route
   */
  private textInput(
    fieldDataGetter: TextFieldDataGetter,
    getter: TextFieldGetter,
    setter: TextFieldSetter,
    options?: { template?: string; onSubmit: (req: Request, res: Response, fieldData: TextFieldData) => Promise<void> },
  ): PersonalControllerRequestHandlers {
    return {
      edit: async (req, res) => {
        const fieldData = fieldDataGetter(req)
        const {
          pageTitle,
          formTitle,
          hintText,
          auditEditPageLoad,
          fieldName,
          inputClasses,
          submitButtonText,
          inputType,
          spellcheck,
          redirectAnchor,
        } = fieldData
        const { prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)
        const requestBodyFlash = requestBodyFromFlash<{ [fieldName: string]: string }>(req)
        const errors = req.flash('errors')

        const fieldValue = requestBodyFlash ? requestBodyFlash[fieldName] : await getter(req, fieldData)

        await this.auditService.sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: auditEditPageLoad,
        })

        res.render(options?.template ? `pages/edit/textFields/${options?.template}` : 'pages/edit/textField', {
          pageTitle: `${pageTitle} - Prisoner personal details`,
          formTitle: formTitle ?? pageTitle,
          errors,
          hintText,
          fieldName,
          fieldValue,
          inputClasses,
          redirectAnchor,
          miniBannerData,
          submitButtonText,
          inputType,
          spellcheck,
        })
      },

      submit: async (req, res) => {
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
            return setter(req, res, fieldData, updatedValue)
          },
          fieldData,
          auditDetails: { fieldName, previous: previousValue, updated: updatedValue },
          options: options?.onSubmit ? { onSubmit: options.onSubmit } : undefined,
        })
      },
    }
  }

  globalEmails(): Record<'add' | 'edit', PersonalControllerRequestHandlers> {
    const globalEmailGetter: TextFieldGetter = async (req, _fieldData) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware
      const { emailAddressId } = req.params
      const phonesAndEmails = await this.personalPageService.getGlobalPhonesAndEmails(clientToken, prisonerNumber)
      return phonesAndEmails.emails.find(email => email.id.toString() === emailAddressId).email
    }

    const fieldDataGetter =
      (action: string): TextFieldDataGetter =>
      req => {
        const { emailAddressId } = req.params
        const {
          prisonerData: { firstName, lastName },
        } = req.middleware
        if (action === 'change') {
          return changeEmailAddressTextFieldData(emailAddressId, { name: { firstName, lastName } })
        }
        return addEmailAddressTextFieldData({ name: { firstName, lastName } })
      }

    const globalEmailSetter: TextFieldSetter = async (req, res, _fieldData, value) => {
      const { prisonerNumber, emailAddressId } = req.params
      const { clientToken } = req.middleware
      const { emails } = await this.personalPageService.getGlobalPhonesAndEmails(clientToken, prisonerNumber)

      const emailUpdateValue = value.replace(/\s/g, '').toLowerCase()
      const isDuplicateEmail = emails
        .filter(email => email.id.toString() !== emailAddressId)
        .some(email => email.email === emailUpdateValue)

      if (isDuplicateEmail) {
        return SetterOutcome.DUPLICATE
      }

      await this.personalPageService.updateGlobalEmail(
        clientToken,
        res.locals.user as PrisonUser,
        prisonerNumber,
        emailAddressId,
        emailUpdateValue,
      )
      return SetterOutcome.SUCCESS
    }

    const globalEmailCreator: TextFieldSetter = async (req, res, _fieldData, value) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware
      const { emails } = await this.personalPageService.getGlobalPhonesAndEmails(clientToken, prisonerNumber)

      const emailUpdateValue = value.replace(/\s/g, '').toLowerCase()
      const isDuplicateEmail = emails.some(email => email.email === emailUpdateValue)

      if (isDuplicateEmail) {
        return SetterOutcome.DUPLICATE
      }

      await this.personalPageService.createGlobalEmail(
        clientToken,
        res.locals.user as PrisonUser,
        prisonerNumber,
        emailUpdateValue,
      )
      return SetterOutcome.SUCCESS
    }

    const globalEmailOnSubmit = async (
      req: Request,
      res: Response,
      fieldData: TextFieldData,
      submitStatus: SetterOutcome | void,
    ) => {
      const { prisonerNumber } = req.params
      const addAnother = req.query?.addAnother ?? 'false'

      if (submitStatus === SetterOutcome.DUPLICATE) {
        req.flash('errors', [
          {
            text: 'This email address already exists for this person. Add a new email or edit the saved one',
            href: '#email',
          },
        ])
        req.flash('requestBody', JSON.stringify(req.body))
        return res.redirect(`/prisoner/${prisonerNumber}/personal/${fieldData.url}`)
      }

      if (addAnother === 'true') {
        return res.redirect(`/prisoner/${prisonerNumber}/personal/${fieldData.url}`)
      }

      return res.redirect(`/prisoner/${prisonerNumber}/personal#${fieldData.redirectAnchor}`)
    }

    return {
      add: this.textInput(fieldDataGetter('add'), async () => '', globalEmailCreator, {
        template: 'addEmail',
        onSubmit: globalEmailOnSubmit,
      }),
      edit: this.textInput(fieldDataGetter('change'), globalEmailGetter, globalEmailSetter, {
        onSubmit: globalEmailOnSubmit,
      }),
    }
  }

  private async submit({
    req,
    res,
    prisonerNumber,
    submit,
    fieldData,
    auditDetails,
    options,
  }: {
    req: Request
    res: Response
    prisonerNumber: string
    submit: () => Promise<SetterOutcome | void>
    fieldData: FieldData
    auditDetails: object
    options?: {
      onSubmit: (
        submitReq: Request,
        submitRes: Response,
        submitFieldData: FieldData,
        setterOutcome: SetterOutcome | void,
      ) => Promise<void>
    }
  }): Promise<void> {
    const { pageTitle, auditEditPostAction, fieldName, url, redirectAnchor, successFlashFieldName } = fieldData

    try {
      const setterOutcome = await submit()

      if (setterOutcome === SetterOutcome.SUCCESS || setterOutcome === undefined) {
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
      }

      if (options?.onSubmit) {
        return options?.onSubmit(req, res, fieldData, setterOutcome)
      }

      return res.redirect(`/prisoner/${prisonerNumber}/personal#${redirectAnchor}`)
    } catch (e) {
      if (e instanceof NomisLockedError) throw e
      req.flash('errors', [{ text: 'There was an error please try again' }])
      req.flash('requestBody', JSON.stringify(req.body))
      return res.redirect(`/prisoner/${prisonerNumber}/personal/${url}`)
    }
  }
}
