import { Request, RequestHandler, Response } from 'express'
import { UUID } from 'node:crypto'
import { AddressRequestDto } from '../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import NotFoundError from '../../utils/notFoundError'
import { AuditService, Page } from '../../services/auditService'
import logger from '../../../logger'
import AddressService from '../../services/addressService'
import EphemeralDataService from '../../services/ephemeralDataService'
import getCommonRequestData from '../../utils/getCommonRequestData'

export interface ConfirmAddressOptions {
  pageTitle: string
  formTitle: string
  auditPage: Page
  enterDifferentAddressAnchor: string
  cancelAnchor: string
  confirmPrimaryOrPostalAddress: boolean
}

export function displayConfirmAddressHandler(
  addressService: AddressService,
  ephemeralDataService: EphemeralDataService,
  auditService: AuditService,
  options: ConfirmAddressOptions,
): RequestHandler {
  return async (req: Request, res: Response) => {
    const { clientToken, prisonerName, prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)
    const {
      pageTitle,
      formTitle,
      auditPage,
      enterDifferentAddressAnchor,
      cancelAnchor,
      confirmPrimaryOrPostalAddress,
    } = options
    const { address: addressCacheId } = req.query
    const addressCache = await ephemeralDataService.getData<{ address: AddressRequestDto; route: string }>(
      addressCacheId as UUID,
    )

    if (!addressCache?.value?.address) {
      throw new NotFoundError('Could not find cached address')
    }

    const { address, route } = addressCache.value

    const [cityCode, countyCode, countryCode] = await Promise.all([
      address.postTownCode && addressService.getCityCode(address.postTownCode, clientToken),
      address.countyCode && addressService.getCountyCode(address.countyCode, clientToken),
      address.countryCode && addressService.getCountryCode(address.countryCode, clientToken),
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

    return res.render('pages/edit/address/confirmAddress', {
      pageTitle,
      formTitle,
      address: {
        ...address,
        cacheId: addressCacheId,
        city: cityCode?.description,
        county: countyCode?.description,
        country: countryCode?.description,
      },
      prisonerNumber,
      confirmPrimaryOrPostalAddress,
      backLinkUrl: `/prisoner/${prisonerNumber}/personal/${route}`,
      cancelLink: `/prisoner/${prisonerNumber}/personal#${cancelAnchor}`,
      enterDifferentAddressLink: `/prisoner/${prisonerNumber}/personal/${enterDifferentAddressAnchor}`,
      breadcrumbPrisonerName: prisonerName,
      miniBannerData,
    })
  }
}
