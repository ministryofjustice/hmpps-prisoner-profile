import { Request, Response } from 'express'
import { addEmailAddressTextFieldData, changeEmailAddressTextFieldData, TextFieldData } from '../../fieldData'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import PersonalEditController, {
  TextFieldDataGetter,
  TextFieldGetter,
  TextFieldSetter,
} from '../personalEditController'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService } from '../../../../services/auditService'
import { EditControllerRequestHandlers } from '../../../interfaces/EditControllerRequestHandlers'

enum SetterOutcome {
  SUCCESS,
  DUPLICATE,
}

export default class EmailAddressController extends PersonalEditController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    protected readonly auditService: AuditService,
  ) {
    super(auditService)
  }

  globalEmails(): Record<'add' | 'edit', EditControllerRequestHandlers> {
    const globalEmailGetter: TextFieldGetter = async (req, _fieldData) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware
      const { emailAddressId } = req.params
      const phonesAndEmails = await this.personalPageService.getGlobalPhonesAndEmails(clientToken, prisonerNumber)
      return phonesAndEmails.emails.find(email => email.id.toString() === emailAddressId).email
    }

    const fieldDataGetter =
      (action: string): TextFieldDataGetter =>
      req => {
        const { emailAddressId } = req.params
        const {
          prisonerData: { firstName, lastName },
        } = req.middleware
        if (action === 'change') {
          return changeEmailAddressTextFieldData(emailAddressId, { name: { firstName, lastName } })
        }
        return addEmailAddressTextFieldData({ name: { firstName, lastName } })
      }

    const globalEmailSetter: TextFieldSetter = async (req, res, _fieldData, value) => {
      const { prisonerNumber, emailAddressId } = req.params
      const { clientToken } = req.middleware
      const { emails } = await this.personalPageService.getGlobalPhonesAndEmails(clientToken, prisonerNumber)

      const emailUpdateValue = value.replace(/\s/g, '').toLowerCase()
      const isDuplicateEmail = emails
        .filter(email => email.id.toString() !== emailAddressId)
        .some(email => email.email === emailUpdateValue)

      if (isDuplicateEmail) {
        return SetterOutcome.DUPLICATE
      }

      await this.personalPageService.updateGlobalEmail(
        clientToken,
        res.locals.user as PrisonUser,
        prisonerNumber,
        emailAddressId,
        emailUpdateValue,
      )
      return SetterOutcome.SUCCESS
    }

    const globalEmailCreator: TextFieldSetter = async (req, res, _fieldData, value) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware
      const { emails } = await this.personalPageService.getGlobalPhonesAndEmails(clientToken, prisonerNumber)

      const emailUpdateValue = value.replace(/\s/g, '').toLowerCase()
      const isDuplicateEmail = emails.some(email => email.email === emailUpdateValue)

      if (isDuplicateEmail) {
        return SetterOutcome.DUPLICATE
      }

      await this.personalPageService.createGlobalEmail(
        clientToken,
        res.locals.user as PrisonUser,
        prisonerNumber,
        emailUpdateValue,
      )
      return SetterOutcome.SUCCESS
    }

    const globalEmailOnSubmit = async (
      req: Request,
      res: Response,
      fieldData: TextFieldData,
      submitStatus: SetterOutcome | void,
    ) => {
      const { prisonerNumber } = req.params
      const addAnother = req.query?.addAnother ?? 'false'

      if (submitStatus === SetterOutcome.DUPLICATE) {
        req.flash('errors', [
          {
            text: 'This email address already exists for this person. Add a new email or edit the saved one',
            href: '#email',
          },
        ])
        req.flash('requestBody', JSON.stringify(req.body))
        return res.redirect(`/prisoner/${prisonerNumber}/personal/${fieldData.url}`)
      }

      if (addAnother === 'true') {
        return res.redirect(`/prisoner/${prisonerNumber}/personal/${fieldData.url}`)
      }

      return res.redirect(`/prisoner/${prisonerNumber}/personal#${fieldData.redirectAnchor}`)
    }

    return {
      add: this.textInput(fieldDataGetter('add'), async () => '', globalEmailCreator, {
        template: 'addEmail',
        onSubmit: globalEmailOnSubmit,
      }),
      edit: this.textInput(fieldDataGetter('change'), globalEmailGetter, globalEmailSetter, {
        onSubmit: globalEmailOnSubmit,
      }),
    }
  }
}
