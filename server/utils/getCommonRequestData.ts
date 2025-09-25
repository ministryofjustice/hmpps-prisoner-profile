import { Request, Response } from 'express'
import miniBannerData from '../controllers/utils/miniBannerData'

export default function getCommonRequestData(req: Request, res: Response) {
  const { clientToken, inmateDetail, prisonerData } = req.middleware
  const { prisonerNumber, prisonerName, prisonId } = res.locals
  const { cellLocation } = prisonerData

  return {
    prisonerNumber,
    prisonId,
    cellLocation,
    alerts: prisonerData.alerts,
    prisonerName: prisonerName?.lastCommaFirst,
    naturalPrisonerName: prisonerName?.firstLast,
    clientToken,
    miniBannerData: miniBannerData(prisonerData, inmateDetail, res.locals.prisonerPermissions),
    prisonerPermissions: res.locals.prisonerPermissions,
  }
}
