import { Request, RequestHandler, Response } from 'express'
import { AuditService, Page, PostAction } from '../../services/auditService'
import { requestBodyFromFlash } from '../../utils/requestBodyFromFlash'
import logger from '../../../logger'
import { getCommonRequestData, mapToQueryString } from '../../utils/utils'
import EphemeralDataService from '../../services/ephemeralDataService'
import AddressService from '../../services/addressService'

export interface DisplayFindUkAddressOptions {
  pageTitle: string
  formTitle: string
  auditPage: Page
  manualEntryAnchor: string
  backLink: string
  cancelAnchor: string
  queryParams?: Record<string, string | number>
}

export interface SubmitFindUkAddressOptions {
  route: string
  confirmRedirectUrl: string
  auditAction: PostAction
  queryParams?: Record<string, string | number>
}

export function displayFindUkAddressHandler(
  auditService: AuditService,
  options: DisplayFindUkAddressOptions,
): RequestHandler {
  return async (req: Request, res: Response) => {
    const { prisonerName, prisonerNumber, prisonId } = getCommonRequestData(req)
    const { pageTitle, formTitle, auditPage, manualEntryAnchor, backLink, cancelAnchor } = options
    const { optimisationOff } = req.query

    const errors = req.flash('errors')
    const formValues = requestBodyFromFlash<{ 'address-autosuggest-input': string }>(req)

    auditService
      .sendPageView({
        user: res.locals.user,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: auditPage,
      })
      .catch(error => logger.error(error))

    const query = options.queryParams ? `?${mapToQueryString(options.queryParams)}` : ''

    return res.render('pages/edit/address/findUkAddress', {
      pageTitle,
      formTitle,
      inputValue: formValues?.['address-autosuggest-input'],
      errors,
      prisonerNumber,
      optimisationOff,
      backLinkUrl: `${backLink}${query}`,
      cancelLink: `/prisoner/${prisonerNumber}/personal#${cancelAnchor}`,
      manualEntryUrl: `/prisoner/${prisonerNumber}/personal/${manualEntryAnchor}${query}`,
      breadcrumbPrisonerName: prisonerName,
      miniBannerData: { prisonerNumber, prisonerName },
    })
  }
}

export function submitFindUkAddressHandler(
  addressService: AddressService,
  ephemeralDataService: EphemeralDataService,
  auditService: AuditService,
  options: SubmitFindUkAddressOptions,
): RequestHandler {
  return async (req: Request, res: Response) => {
    const { clientToken, prisonerNumber } = getCommonRequestData(req)
    const { auditAction, route, confirmRedirectUrl, queryParams } = options
    const { uprn } = req.body

    auditService
      .sendPostSuccess({
        user: res.locals.user,
        prisonerNumber,
        correlationId: req.id,
        action: auditAction,
        details: { uprn },
      })
      .catch(error => logger.error(error))

    const address = await addressService.getAddressByUprn(uprn, clientToken)
    const addressConfirmationUuid = await ephemeralDataService.cacheData({ address, route })
    const query = mapToQueryString({ address: addressConfirmationUuid, ...(queryParams ?? {}) })
    return res.redirect(`/prisoner/${prisonerNumber}/personal/${confirmRedirectUrl}?${query}`)
  }
}
