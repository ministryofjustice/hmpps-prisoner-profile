import { Request, RequestHandler, Response } from 'express'
import { formatLocation, formatName } from '../utils/utils'
import { AuditService, Page, PostAction } from '../services/auditService'
import logger from '../../logger'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { PrisonUser } from '../interfaces/HmppsUser'
import IdentityNumbersService from '../services/identityNumbersService'
import { IdentifierMappings, JusticeIdentifierMappings } from '../data/constants/identifierMappings'
import { AddIdentifierRequestDto } from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import {
  AddIdentityNumberSubmission,
  buildIdentityNumberOptions,
} from './utils/identityNumbersController/buildIdentityNumberOptions'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'
import OffenderIdentifier from '../data/interfaces/prisonApi/OffenderIdentifier'
import HmppsError from '../interfaces/HmppsError'

export default class IdentityNumbersController {
  constructor(
    private readonly identityNumbersService: IdentityNumbersService,
    private readonly auditService: AuditService,
  ) {}

  public addJusticeIdNumbers(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { firstName, lastName, prisonerNumber, prisonId, cellLocation } = req.middleware.prisonerData
      const { clientToken } = req.middleware
      const existingIdentifiers = await this.identityNumbersService.getIdentityNumbers(clientToken, prisonerNumber)
      const errors = req.flash('errors')

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.AddJusticeIdNumbers,
        })
        .catch(error => logger.error(error))
      const identifierOptions = buildIdentityNumberOptions(
        requestBodyFromFlash<Record<string, AddIdentityNumberSubmission>>(req),
        existingIdentifiers,
        JusticeIdentifierMappings,
      )

      return res.render('pages/identityNumbers/addJusticeNumbers', {
        pageTitle: `Add justice ID numbers - Prisoner personal details`,
        title: `Add justice ID numbers`,
        identifierOptions,
        errors,
        miniBannerData: {
          prisonerNumber,
          prisonerName: formatName(firstName, '', lastName, { style: NameFormatStyle.lastCommaFirst }),
          cellLocation: formatLocation(cellLocation),
        },
      })
    }
  }

  public postJusticeIdNumbers(): RequestHandler {
    return async (req: Request, res: Response) => {
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
            if (error.status === 400) {
              errors.push({ text: error?.data?.userMessage ?? error.message })
            } else throw error
          }
        }
      }

      if (errors.length) {
        req.flash('requestBody', JSON.stringify(req.body))
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/personal/justice-id-numbers`)
      }

      req.flash('flashMessage', {
        text: 'Justice identity numbers added',
        type: FlashMessageType.success,
        fieldName: 'identity-numbers',
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

      return res.redirect(`/prisoner/${prisonerNumber}/personal#identity-numbers`)
    }
  }

  private createRequestFromFormValues = (formValues: Record<string, AddIdentityNumberSubmission>) => {
    return Object.entries(formValues)
      .map(([id, value]): AddIdentifierRequestDto => {
        const type = IdentifierMappings[id]?.type

        if (type && value.value) {
          return {
            type,
            value: value.value,
            comments: value.comment,
          }
        }
        return null
      })
      .filter(Boolean)
  }

  private checkForDuplicateValues = (
    formValues: Record<string, AddIdentityNumberSubmission>,
    existingIdentifiers: OffenderIdentifier[],
    errors: HmppsError[],
  ) => {
    Object.entries(formValues).forEach(([key, value]) => {
      const type = IdentifierMappings[key]?.type
      const label = IdentifierMappings[key]?.label
      if (existingIdentifiers.some(id => id.type === type && id.value?.toUpperCase() === value.value?.toUpperCase())) {
        errors.push({
          text: `This ${label} already exists. Enter a different ${label}`,
          href: `#${key}-value-input`,
        })
      }
    })
  }
}
