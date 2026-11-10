import { Request, Response } from 'express'
import HmppsError from '../interfaces/HmppsError'
import { addressPhoneNumberFormValues } from './utils'

export const redirectWithPhoneNumberErrors = (req: Request, res: Response, errors: HmppsError[], url: string) => {
  req.flash('errors', errors)
  req.flash('requestBody', JSON.stringify(req.body))
  return res.redirect(url)
}

export const redirectAfterPhoneNumberRemoval = (
  req: Request,
  res: Response,
  phoneNumbers: ReturnType<typeof addressPhoneNumberFormValues>,
  removedIndex: number,
  url: string,
) => {
  const remaining = phoneNumbers.filter((_, index) => index !== removedIndex)
  const requestBody: Record<string, string> = Object.fromEntries(
    remaining.flatMap((phoneNumber, index) => [
      [`phoneNumberType${index}`, phoneNumber.phoneNumberType],
      [`phoneNumber${index}`, phoneNumber.phoneNumber],
      [`phoneExtension${index}`, phoneNumber.phoneExtension],
    ]),
  )
  if (req.body.highlightAddressId) requestBody.highlightAddressId = req.body.highlightAddressId
  if (req.body.addressCacheId) requestBody.addressCacheId = req.body.addressCacheId

  req.flash('requestBody', JSON.stringify(requestBody))
  return res.redirect(`${url}#phone-number-section-${Math.max(remaining.length - 1, 0)}`)
}

export const redirectToNewPhoneNumberRow = (req: Request, res: Response, rowCount: number, url: string) => {
  const requestBody: Record<string, string> = { ...req.body }
  requestBody[`phoneNumberType${rowCount}`] = ''
  requestBody[`phoneNumber${rowCount}`] = ''
  requestBody[`phoneExtension${rowCount}`] = ''

  req.flash('requestBody', JSON.stringify(requestBody))
  return res.redirect(`${url}#phone-number-section-${rowCount}`)
}
