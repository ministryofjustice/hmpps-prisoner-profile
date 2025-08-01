import { Request, RequestHandler, Response } from 'express'
import { AuditService, Page, PostAction } from '../../services/auditService'
import logger from '../../../logger'
import { AddressLocation } from '../../services/mappers/addressMapper'
import { getCommonRequestData, mapToQueryString } from '../../utils/utils'

export interface AddressRedirects {
  [AddressLocation.uk]: string
  [AddressLocation.overseas]: string
  [AddressLocation.no_fixed_address]: string
}

export interface DisplayWhereIsTheAddressOptions {
  pageTitle: string
  formTitle: string
  page: Page
  cancelAnchor: string
}

export interface SubmitWhereIsTheAddressOptions {
  redirectOptions: AddressRedirects
  action: PostAction
  queryParams?: Record<string, string | number>
}

export function displayWhereIsTheAddressHandler(
  auditService: AuditService,
  options: DisplayWhereIsTheAddressOptions,
): RequestHandler {
  return async (req: Request, res: Response) => {
    const { prisonerName, prisonerNumber, prisonId } = getCommonRequestData(req)
    const { pageTitle, formTitle, page, cancelAnchor } = options
    const errors = req.flash('errors')

    auditService
      .sendPageView({
        user: res.locals.user,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page,
      })
      .catch(error => logger.error(error))

    return res.render('pages/edit/radioField', {
      pageTitle,
      formTitle,
      submitButtonText: 'Continue',
      options: [
        { value: AddressLocation.uk, text: 'United Kingdom' },
        { value: AddressLocation.overseas, text: 'Overseas' },
        { divider: 'or' },
        { value: AddressLocation.no_fixed_address, text: 'No fixed address' },
      ],
      errors,
      prisonerNumber,
      redirectAnchor: cancelAnchor,
      breadcrumbPrisonerName: prisonerName,
      miniBannerData: {
        prisonerNumber,
        prisonerName,
      },
    })
  }
}

export function submitWhereIsTheAddressHandler(
  auditService: AuditService,
  options: SubmitWhereIsTheAddressOptions,
): RequestHandler {
  return async (req: Request, res: Response) => {
    const { prisonerNumber } = getCommonRequestData(req)
    const { radioField: location } = req.body
    const { redirectOptions, action } = options
    const query = options.queryParams ? `?${mapToQueryString(options.queryParams)}` : ''

    auditService
      .sendPostSuccess({
        user: res.locals.user,
        prisonerNumber,
        correlationId: req.id,
        action,
        details: { location },
      })
      .catch(error => logger.error(error))

    return res.redirect(`/prisoner/${prisonerNumber}/personal/${redirectOptions[location as AddressLocation]}${query}`)
  }
}
