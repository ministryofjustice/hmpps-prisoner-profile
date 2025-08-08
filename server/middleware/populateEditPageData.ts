import { RequestHandler } from 'express'
import miniBannerData from '../controllers/utils/miniBannerData'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'

export function populateEditPageData(): RequestHandler {
  return (req, res, next) => {
    const { inmateDetail, prisonerData } = req.middleware
    const { firstName, lastName, prisonerNumber } = prisonerData

    res.locals.prisonerNumber = prisonerNumber
    res.locals.breadcrumbPrisonerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })
    res.locals.miniBannerData = miniBannerData(prisonerData, inmateDetail, res.locals.prisonerPermissions)

    next()
  }
}
