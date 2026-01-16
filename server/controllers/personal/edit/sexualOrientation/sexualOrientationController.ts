import { Request } from 'express'
import { sexualOrientationFieldData } from '../../fieldData'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import PersonalEditController from '../personalEditController'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService } from '../../../../services/auditService'
import { EditControllerRequestHandlers } from '../../../interfaces/EditControllerRequestHandlers'
import { requestBodyFromFlash } from '../../../../utils/requestBodyFromFlash'
import { apostrophe, formatName, objectToRadioOptions } from '../../../../utils/utils'
import { CorePersonRecordReferenceDataDomain } from '../../../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import {
  getProfileInformationValue,
  ProfileInformationType,
} from '../../../../data/interfaces/prisonApi/ProfileInformation'
import { ReferenceDataCodeDto } from '../../../../data/interfaces/referenceData'
import { NameFormatStyle } from '../../../../data/enums/nameFormatStyle'

export default class SexualOrientationController extends PersonalEditController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    protected readonly auditService: AuditService,
  ) {
    super(auditService)
  }

  sexualOrientation(): EditControllerRequestHandlers {
    const { fieldName } = sexualOrientationFieldData

    const descriptionLookup: Record<string, string> = {
      HET: 'Heterosexual or straight',
      HOM: 'Gay or lesbian',
      ND: 'They prefer not to say',
    }

    const currentOrientationCode = async (req: Request, referenceData?: ReferenceDataCodeDto[]) => {
      const { inmateDetail, clientToken } = req.middleware
      const sexualOrientationReferenceData =
        referenceData ||
        (await this.personalPageService.getReferenceDataCodes(
          clientToken,
          CorePersonRecordReferenceDataDomain.sexualOrientation,
        ))
      const profileInformationValue = getProfileInformationValue(
        ProfileInformationType.SexualOrientation,
        inmateDetail.profileInformation,
      )
      return (
        profileInformationValue &&
        sexualOrientationReferenceData.find(
          orientation =>
            orientation.description === profileInformationValue || orientation.code === profileInformationValue,
        )?.code
      )
    }

    return {
      edit: async (req, res, next) => {
        const { prisonerData, clientToken } = req.middleware
        const { firstName, lastName } = prisonerData
        const requestBodyFlash = requestBodyFromFlash<{ radioField: string }>(req)
        const sexualOrientationReferenceData = await this.personalPageService.getReferenceDataCodes(
          clientToken,
          CorePersonRecordReferenceDataDomain.sexualOrientation,
        )
        const mappedReferenceData = sexualOrientationReferenceData.map(item => {
          return {
            ...item,
            description: descriptionLookup[item.code] ?? item.description,
          }
        })

        const options = mappedReferenceData.filter(it => it.code !== 'ND')
        const notAnsweredOption = mappedReferenceData.find(it => it.code === 'ND')

        const fieldValue =
          requestBodyFlash?.radioField || (await currentOrientationCode(req, sexualOrientationReferenceData))

        const radioOptions = [
          ...objectToRadioOptions(options, 'code', 'description', fieldValue),
          { divider: 'Or' },
          ...objectToRadioOptions([notAnsweredOption], 'code', 'description', fieldValue),
        ]

        return this.editRadioFields(
          `Which of the following best describes ${apostrophe(formatName(firstName, '', lastName, { style: NameFormatStyle.firstLast }))} sexual orientation?`,
          sexualOrientationFieldData,
          radioOptions,
        )(req, res, next)
      },

      submit: async (req, res) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const radioField = req.body.radioField || null
        const previousValue = await currentOrientationCode(req)

        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updateSexualOrientation(clientToken, user, prisonerNumber, radioField)
          },
          fieldData: sexualOrientationFieldData,
          auditDetails: { fieldName, previous: previousValue, updated: radioField },
        })
      },
    }
  }
}
