import { Request, Response } from 'express'
import { shoeSizeFieldData, TextFieldData } from '../../fieldData'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import PersonalEditController from '../personalEditController'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService } from '../../../../services/auditService'

export default class ShoeSizeController extends PersonalEditController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    protected readonly auditService: AuditService,
  ) {
    super(auditService)
  }

  shoeSizeTextInput = () =>
    this.textInput(() => shoeSizeFieldData, this.getShoeSize.bind(this), this.setShoeSize.bind(this))

  private async getShoeSize(req: Request): Promise<string | number> {
    const { prisonerNumber } = req.params
    const { clientToken } = req.middleware
    const physicalAttributes = await this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber)
    return physicalAttributes.shoeSize
  }

  private async setShoeSize(req: Request, res: Response, _fieldData: TextFieldData, shoeSize: string): Promise<void> {
    const { prisonerNumber } = req.params
    const { clientToken } = req.middleware
    const user = res.locals.user as PrisonUser

    await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, { shoeSize })
  }
}
