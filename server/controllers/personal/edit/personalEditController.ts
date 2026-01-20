import { Request, RequestHandler, Response } from 'express'
import { AuditService } from '../../../services/auditService'
import { FieldData, RadioFieldData, TextFieldData } from '../fieldData'
import { FlashMessageType } from '../../../data/enums/flashMessageType'
import logger from '../../../../logger'
import { NomisLockedError } from '../../../utils/nomisLockedError'
import getCommonRequestData from '../../../utils/getCommonRequestData'
import { requestBodyFromFlash } from '../../../utils/requestBodyFromFlash'
import { RadioOption, SelectOption } from '../../../utils/utils'

export type TextFieldDataGetter = (req: Request) => TextFieldData
export type TextFieldGetter = (req: Request, fieldData: TextFieldData) => Promise<string>
export type TextFieldSetter = (
  req: Request,
  res: Response,
  fieldData: TextFieldData,
  value: string,
) => Promise<SetterOutcome | void>

enum SetterOutcome {
  SUCCESS,
  DUPLICATE,
}

interface PersonalControllerRequestHandlers {
  edit: RequestHandler
  submit: RequestHandler
}

export default abstract class PersonalEditController {
  protected constructor(protected readonly auditService: AuditService) {}

  /**
   *
   * @param fieldDataGetter Returns the field data for the text input for display
   * @param getter Returns the current value for the text input
   * @param setter Sets the submitted value, typically on an external API
   * @param options.template A nunjucks template that extends the text field one where additional actions are necessary
   * @returns Edit/Submit routes for use with an edit route
   */
  protected textInput(
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

  protected editRadioFields(
    formTitle: string,
    fieldData: RadioFieldData,
    options: (RadioOption | { divider: string })[],
  ): RequestHandler {
    return async (req, res) => {
      const { prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)
      const { pageTitle, hintText, redirectAnchor, auditEditPageLoad } = fieldData

      const errors = req.flash('errors')

      await this.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: auditEditPageLoad,
      })

      res.render('pages/edit/radioField', {
        pageTitle: `${pageTitle} - Prisoner personal details`,
        formTitle,
        errors,
        hintText,
        options,
        redirectAnchor,
        miniBannerData,
      })
    }
  }

  protected editRadioFieldsWithAutocomplete({
    formTitle,
    fieldData,
    radioOptions,
    autocompleteOptions,
    autocompleteSelected,
    autocompleteOptionTitle,
    autocompleteOptionLabel,
    autocompleteOptionHint,
    autocompleteError,
  }: {
    formTitle: string
    fieldData: RadioFieldData
    radioOptions: RadioOption[]
    autocompleteOptions: SelectOption[]
    autocompleteSelected: boolean
    autocompleteOptionTitle: string
    autocompleteOptionLabel: string
    autocompleteOptionHint: string
    autocompleteError: string
  }): RequestHandler {
    return async (req, res) => {
      const { prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)
      const { pageTitle, hintText, redirectAnchor, auditEditPageLoad } = fieldData
      const errors = req.flash('errors')

      await this.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: auditEditPageLoad,
      })

      res.render('pages/edit/radioFieldWithAutocomplete', {
        pageTitle: `${pageTitle} - Prisoner personal details`,
        formTitle,
        errors,
        hintText,
        radioOptions,
        autocompleteOptions,
        autocompleteSelected,
        autocompleteOptionTitle,
        autocompleteOptionLabel,
        autocompleteOptionHint,
        autocompleteError,
        redirectAnchor,
        miniBannerData,
      })
    }
  }

  protected async submit({
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
