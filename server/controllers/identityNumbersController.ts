import { NextFunction, Request, Response } from 'express'
import { apostrophe, capitaliseFirstLetter } from '../utils/utils'
import { AuditService, Page, PostAction } from '../services/auditService'
import logger from '../../logger'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { PrisonUser } from '../interfaces/HmppsUser'
import IdentityNumbersService from '../services/identityNumbersService'
import {
  HomeOfficeIdentifierMappings,
  IdentifierMapping,
  IdentifierMappings,
  JusticeIdentifierMappings,
  PersonalIdentifierMappings,
} from '../data/constants/identifierMappings'
import {
  AddIdentifierRequestDto,
  UpdateIdentifierRequestDto,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import {
  AddIdentityNumberSubmission,
  buildIdentityNumberOptions,
} from './utils/identityNumbersController/buildIdentityNumberOptions'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'
import OffenderIdentifier from '../data/interfaces/prisonApi/OffenderIdentifier'
import HmppsError from '../interfaces/HmppsError'
import getCommonRequestData from '../utils/getCommonRequestData'
import { errorHasStatus } from '../utils/errorHelpers'

export interface EditIdentityNumberSubmission {
  type?: string
  value?: string
  comment?: string
}

export default class IdentityNumbersController {
  constructor(
    private readonly identityNumbersService: IdentityNumbersService,
    private readonly auditService: AuditService,
  ) {}

  public homeOfficeIdNumbers() {
    return {
      edit: this.addIdentityNumbers({
        pageTitle: `Add Home Office ID numbers - Prisoner personal details`,
        title: `Add Home Office ID numbers`,
        pageViewAuditEvent: Page.AddHomeOfficeIdNumbers,
        mappings: HomeOfficeIdentifierMappings,
      }),
      submit: this.postIdentityNumbers({
        errorRedirect: 'home-office-id-numbers',
        successRedirectAnchor: 'home-office-numbers',
      }),
    }
  }

  public justiceIdNumbers() {
    return {
      edit: this.addIdentityNumbers({
        pageTitle: `Add justice ID numbers - Prisoner personal details`,
        title: `Add justice ID numbers`,
        pageViewAuditEvent: Page.AddJusticeIdNumbers,
        mappings: JusticeIdentifierMappings,
      }),
      submit: this.postIdentityNumbers({
        errorRedirect: 'justice-id-numbers',
        successRedirectAnchor: 'justice-numbers',
      }),
    }
  }

  public personalIdNumbers() {
    return {
      edit: this.addIdentityNumbers({
        pageTitle: `Add personal ID numbers - Prisoner personal details`,
        title: `Add personal ID numbers`,
        pageViewAuditEvent: Page.AddPersonalIdNumbers,
        mappings: PersonalIdentifierMappings,
      }),
      submit: this.postIdentityNumbers({
        errorRedirect: 'personal-id-numbers',
        successRedirectAnchor: 'personal-numbers',
      }),
    }
  }

  public idNumber() {
    return {
      edit: async (req: Request, res: Response) => {
        const { prisonerNumber, prisonId, naturalPrisonerName, miniBannerData } = getCommonRequestData(req, res)
        const { clientToken } = req.middleware
        const errors = req.flash('errors')
        const [offenderId, seqId] = this.parseIdentifierIds(req)

        const existingIdentifier = await this.identityNumbersService.getIdentityNumber(clientToken, +offenderId, +seqId)
        const { type, description } = Object.values(IdentifierMappings).find(
          item => item.type === existingIdentifier.type,
        )
        const identifierLabel = description || 'ID number'

        const requestBodyFlash = requestBodyFromFlash<EditIdentityNumberSubmission>(req)
        const formValues = requestBodyFlash || {
          type: existingIdentifier.type,
          value: existingIdentifier.value,
          comment: existingIdentifier.issuedAuthorityText,
        }

        this.auditService
          .sendPageView({
            user: res.locals.user,
            prisonerNumber,
            prisonId,
            correlationId: req.id,
            page: Page.EditIdNumber,
          })
          .catch(error => logger.error(error))

        return res.render('pages/identityNumbers/editIdentityNumber', {
          pageTitle: `${capitaliseFirstLetter(identifierLabel)} - Prisoner personal details`,
          title: `Change ${apostrophe(naturalPrisonerName)} ${identifierLabel}`,
          formValues,
          identifierType: type,
          errors,
          miniBannerData,
        })
      },
      submit: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const [offenderId, seqId] = this.parseIdentifierIds(req)
        const errors = req.errors || []
        const formValues: { type?: string; value?: string; comment?: string } = req.body
        const { description, editPageUrl, redirectAnchor } = Object.values(IdentifierMappings).find(
          item => item.type === formValues.type,
        )

        if (!errors.length) {
          const existingIdentifiers = await this.identityNumbersService.getIdentityNumbers(clientToken, prisonerNumber)

          if (
            existingIdentifiers.some(
              id =>
                id.type === formValues.type &&
                !(id.offenderId === +offenderId && id.offenderIdSeq === +seqId) &&
                id.value?.toUpperCase() === formValues.value?.toUpperCase(),
            )
          ) {
            errors.push({
              text: `This ${description} already exists. Enter a different ${description}`,
              href: `#identifier-value-input`,
            })
          }

          if (!errors.length) {
            const request: UpdateIdentifierRequestDto = {
              value: formValues.value,
              comments: formValues.comment,
            }
            try {
              await this.identityNumbersService.updateIdentityNumber(
                clientToken,
                res.locals.user as PrisonUser,
                prisonerNumber,
                +offenderId,
                +seqId,
                request,
              )
            } catch (error) {
              if (errorHasStatus(error, 400)) {
                errors.push({ text: error?.data?.userMessage ?? error.message })
              } else throw error
            }
          }
        }

        if (errors.length) {
          req.flash('requestBody', JSON.stringify(req.body))
          req.flash('errors', errors)
          return res.redirect(`/prisoner/${prisonerNumber}/personal/${editPageUrl}/${offenderId}-${seqId}`)
        }

        req.flash('flashMessage', {
          text: `Identity numbers updated`,
          type: FlashMessageType.success,
          fieldName: `'${editPageUrl}-row'`,
        })

        this.auditService
          .sendPostSuccess({
            user: res.locals.user,
            prisonerNumber,
            correlationId: req.id,
            action: PostAction.EditIdNumber,
            details: { formValues },
          })
          .catch(error => logger.error(error))

        return res.redirect(`/prisoner/${prisonerNumber}/personal#${redirectAnchor}`)
      },
    }
  }

  private addIdentityNumbers = (options: {
    pageTitle: string
    title: string
    pageViewAuditEvent: Page
    mappings: Record<string, IdentifierMapping>
  }) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { clientToken, prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)
      const existingIdentifiers = await this.identityNumbersService.getIdentityNumbers(clientToken, prisonerNumber)
      const errors = req.flash('errors')

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: options.pageViewAuditEvent,
        })
        .catch(error => logger.error(error))
      const identifierOptions = buildIdentityNumberOptions(
        requestBodyFromFlash<Record<string, AddIdentityNumberSubmission>>(req),
        existingIdentifiers,
        options.mappings,
      )

      return res.render('pages/identityNumbers/addIdentityNumbers', {
        pageTitle: options.pageTitle,
        title: options.title,
        identifierOptions,
        errors,
        miniBannerData,
      })
    }
  }

  private postIdentityNumbers = (options: { errorRedirect: string; successRedirectAnchor: string }) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware
      const errors = req.errors || []
      const formValues: Record<string, AddIdentityNumberSubmission> = req.body

      if (!errors.length) {
        const existingIdentifiers = await this.identityNumbersService.getIdentityNumbers(clientToken, prisonerNumber)
        this.checkForDuplicateValues(formValues, existingIdentifiers, errors)

        if (!errors.length) {
          const request = this.createRequestFromFormValues(formValues)
          try {
            await this.identityNumbersService.addIdentityNumbers(
              clientToken,
              res.locals.user as PrisonUser,
              prisonerNumber,
              request,
            )
          } catch (error) {
            if (errorHasStatus(error, 400)) {
              errors.push({ text: error?.data?.userMessage ?? error.message })
            } else throw error
          }
        }
      }

      if (errors.length) {
        req.flash('requestBody', JSON.stringify(req.body))
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/personal/${options.errorRedirect}`)
      }

      req.flash('flashMessage', {
        text: 'Identity numbers updated',
        type: FlashMessageType.success,
        fieldName: this.getUpdatedFieldsFromFormValues(formValues),
      })

      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.AddIdNumbers,
          details: { formValues },
        })
        .catch(error => logger.error(error))

      return res.redirect(`/prisoner/${prisonerNumber}/personal#${options.successRedirectAnchor}`)
    }
  }

  private createRequestFromFormValues = (formValues: Record<string, AddIdentityNumberSubmission>) => {
    return Object.entries(formValues)
      .map(([id, value]): AddIdentifierRequestDto => {
        if (value.selected) {
          const type = IdentifierMappings[id]?.type

          if (type && value.value) {
            return {
              type,
              value: value.value,
              comments: value.comment,
            }
          }
        }
        return null
      })
      .filter(Boolean)
  }

  private getUpdatedFieldsFromFormValues = (formValues: Record<string, AddIdentityNumberSubmission>) =>
    Object.entries(formValues)
      .map(([id, value]): string =>
        value.selected && value.value ? `'${IdentifierMappings[id]?.editPageUrl}-row'` : null,
      )
      .filter(Boolean)
      .join(',')

  private checkForDuplicateValues = (
    formValues: Record<string, AddIdentityNumberSubmission>,
    existingIdentifiers: OffenderIdentifier[],
    errors: HmppsError[],
  ) => {
    Object.entries(formValues).forEach(([key, value]) => {
      if (value?.selected) {
        const type = IdentifierMappings[key]?.type
        const description = IdentifierMappings[key]?.description
        if (
          existingIdentifiers.some(id => id.type === type && id.value?.toUpperCase() === value.value?.toUpperCase())
        ) {
          errors.push({
            text: `This ${description} already exists. Enter a different ${description}`,
            href: `#${key}-value-input`,
          })
        }
      }
    })
  }

  private parseIdentifierIds(req: Request): (string | undefined)[] {
    const tokens = req.params?.compositeId?.split('-')
    return [tokens?.[0], tokens?.[1]]
  }
}
