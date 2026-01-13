import { Request, Response } from 'express'
import { cityOrTownOfBirthFieldData, TextFieldData } from '../../fieldData'
import { convertToTitleCase } from '../../../../utils/utils'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import PersonalEditController from '../personalEditController'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService } from '../../../../services/auditService'

export default class CityOrTownOfBirthController extends PersonalEditController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    protected readonly auditService: AuditService,
  ) {
    super(auditService)
  }

  cityOrTownOfBirthTextInput = () =>
    this.textInput(
      () => cityOrTownOfBirthFieldData,
      this.getCityOrTownOfBirth.bind(this),
      this.setCityOrTownOfBirth.bind(this),
    )

  private async getCityOrTownOfBirth(req: Request): Promise<string> {
    return convertToTitleCase(req.middleware?.inmateDetail?.birthPlace)
  }

  private async setCityOrTownOfBirth(
    req: Request,
    res: Response,
    _fieldData: TextFieldData,
    value: string,
  ): Promise<void> {
    const { prisonerNumber } = req.params
    const { clientToken } = req.middleware
    const user = res.locals.user as PrisonUser
    await this.personalPageService.updateCityOrTownOfBirth(clientToken, user, prisonerNumber, value)
  }
}
