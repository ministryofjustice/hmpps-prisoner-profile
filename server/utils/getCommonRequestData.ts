import { Request, Response } from 'express'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import miniBannerData from '../controllers/utils/miniBannerData'
import { formatName } from './utils'

export default function getCommonRequestData(req: Request, res: Response) {
  const { clientToken, inmateDetail, prisonerData } = req.middleware
  const { firstName, lastName, prisonerNumber, prisonId, cellLocation } = prisonerData

  return {
    prisonerNumber,
    prisonId,
    cellLocation,
    alerts: prisonerData.alerts,
    prisonerName: formatName(firstName, '', lastName, { style: NameFormatStyle.lastCommaFirst }),
    naturalPrisonerName: formatName(firstName, '', lastName, { style: NameFormatStyle.firstLast }),
    clientToken,
    miniBannerData: miniBannerData(prisonerData, inmateDetail, res.locals.prisonerPermissions),
    prisonerPermissions: res.locals.prisonerPermissions,
  }
}
