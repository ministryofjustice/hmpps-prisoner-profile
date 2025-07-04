import { Request, RequestHandler, Response } from 'express'
import { AddressLocation } from '../../services/mappers/addressMapper'
import { AuditService, Page, PostAction } from '../../services/auditService'
import { requestBodyFromFlash } from '../../utils/requestBodyFromFlash'
import logger from '../../../logger'
import { convertToTitleCase, getCommonRequestData, mapToQueryString, objectToSelectOptions } from '../../utils/utils'
import { AddressRequestDto } from '../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { formatDateISO } from '../../utils/dateHelpers'
import EphemeralDataService from '../../services/ephemeralDataService'
import AddressService from '../../services/addressService'

export interface DisplayManualEditAddressOptions {
  addressLocation: AddressLocation
  pageTitle: string
  formTitle: string
  auditPage: Page
  backLink: string
  cancelAnchor: string
  queryParams?: Record<string, string | number>
}

export interface SubmitManualEditAddressOptions {
  addressLocation: AddressLocation
  auditAction: PostAction
  confirmRedirectUrl: string
  queryParams?: Record<string, string | number>
}

export function displayManualEditAddressHandler(
  addressService: AddressService,
  auditService: AuditService,
  options: DisplayManualEditAddressOptions,
): RequestHandler {
  return async (req: Request, res: Response) => {
    const { addressLocation, pageTitle, formTitle, auditPage, backLink, cancelAnchor } = options
    const { clientToken, prisonerName, prisonerNumber, prisonId } = getCommonRequestData(req)
    const requestBody = requestBodyFromFlash<{ townOrCity: string; county: string; country: string }>(req)
    const errors = req.flash('errors')

    const [cityReferenceData, countyReferenceData, countryReferenceData] = await Promise.all([
      addressService.getCityReferenceData(clientToken),
      addressService.getCountyReferenceData(clientToken),
      addressService.getCountryReferenceData(clientToken, { addressLocation }),
    ])

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

    return res.render('pages/edit/address/manualAddress', {
      pageTitle,
      formTitle,
      errors,
      requestBody,
      townOrCityOptions: objectToSelectOptions(cityReferenceData, 'code', 'description', requestBody?.townOrCity),
      countyOptions: objectToSelectOptions(countyReferenceData, 'code', 'description', requestBody?.county),
      countryOptions: objectToSelectOptions(countryReferenceData, 'code', 'description', requestBody?.country),
      ukAddress: addressLocation !== AddressLocation.overseas,
      noFixedAddress: addressLocation === AddressLocation.no_fixed_address,
      noFixedAddressCheckbox: addressLocation === AddressLocation.overseas,
      breadcrumbPrisonerName: prisonerName,
      backLink: `${backLink}${query}`,
      cancelLink: `/prisoner/${prisonerNumber}/personal#${cancelAnchor}`,
      prisonerNumber,
      miniBannerData: {
        prisonerNumber,
        prisonerName,
      },
    })
  }
}

export function submitManualEditAddressHandler(
  addressService: AddressService,
  ephemeralDataService: EphemeralDataService,
  auditService: AuditService,
  options: SubmitManualEditAddressOptions,
): RequestHandler {
  return async (req: Request, res: Response) => {
    const { addressLocation, auditAction, confirmRedirectUrl, queryParams } = options
    const { prisonerNumber } = getCommonRequestData(req)
    const {
      noFixedAddress,
      houseOrBuildingName,
      houseNumber,
      addressLine1,
      addressLine2,
      townOrCity,
      county,
      postcode,
      country,
    } = req.body

    const address: AddressRequestDto = {
      noFixedAbode: addressLocation === AddressLocation.no_fixed_address || !!noFixedAddress,
      buildingNumber: houseNumber,
      buildingName: convertToTitleCase(houseOrBuildingName),
      thoroughfareName: convertToTitleCase(addressLine1),
      dependantLocality: convertToTitleCase(addressLine2),
      postTownCode: townOrCity,
      postCode: addressService.sanitisePostcode(postcode),
      countyCode: county,
      countryCode: country,
      fromDate: formatDateISO(new Date()),
      addressTypes: [],
    }

    auditService
      .sendPostSuccess({
        user: res.locals.user,
        prisonerNumber,
        correlationId: req.id,
        action: auditAction,
        details: { address },
      })
      .catch(error => logger.error(error))

    const currentQuery = queryParams ? `?${mapToQueryString(queryParams)}` : ''
    const addressConfirmationUuid = await ephemeralDataService.cacheData({
      address,
      route: `${req.path?.replace('/', '')}${currentQuery}`,
    })
    const query = mapToQueryString({ address: addressConfirmationUuid, ...(queryParams ?? {}) })

    return res.redirect(`/prisoner/${prisonerNumber}/personal/${confirmRedirectUrl}?${query}`)
  }
}
