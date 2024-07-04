import { NextFunction, Request, Response } from 'express'
import Prisoner from '../../data/interfaces/prisonerSearchApi/Prisoner'
import { formatName, hasLength } from '../../utils/utils'
import { NameFormatStyle } from '../../data/enums/nameFormatStyle'
import HmppsError from '../../interfaces/HmppsError'
import { FlashMessageType } from '../../data/enums/flashMessageType'
import PersonalPageService from '../../services/personalPageService'

export const radios = (
  personalPageService: PersonalPageService,
  { pageTitle, fieldName, hintText }: { pageTitle: string; fieldName: string; hintText: string },
) => {
  return {
    edit: async (req: Request, res: Response, next: NextFunction) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware
      const prisonerData: Prisoner = req.middleware?.prisonerData
      const fieldValueFlash = req.flash('fieldValue')
      const errors = req.flash('errors')
      const prisonPerson = await personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

      res.render('pages/edit/radios', {
        pageTitle,
        prisonerNumber,
        breadcrumbPrisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
          style: NameFormatStyle.lastCommaFirst,
        }),
        errors: hasLength(errors) ? errors : [],
        fieldName,
        hintText,
        options: [{ value: '', text: 'Test' }], // TODO get ref data -- from Person API??? (use fieldName as key)
        fieldValue: fieldValueFlash.length > 0 ? fieldValueFlash[0] : prisonPerson?.physicalAttributes[fieldName],
      })
    },

    submit: async (req: Request, res: Response, next: NextFunction) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware
      const { radioField } = req.body
      const errors: HmppsError[] = []
      // const prisonPerson = await personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

      try {
        await personalPageService.updatePhysicalAttributes(clientToken, prisonerNumber, {
          [fieldName]: radioField,
        })

        req.flash('flashMessage', { text: `${pageTitle} updated`, type: FlashMessageType.success })
        return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)
      } catch (e) {
        errors.push({ text: 'There was an error please try again' })
      }

      req.flash('fieldValue', radioField)
      req.flash('errors', errors)
      return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/${fieldName}`)
    },
  }
}
