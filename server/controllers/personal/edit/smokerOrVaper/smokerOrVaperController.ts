import { smokerOrVaperFieldData } from '../../fieldData'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import PersonalEditController from '../personalEditController'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService } from '../../../../services/auditService'
import { EditControllerRequestHandlers } from '../../../interfaces/EditControllerRequestHandlers'
import getCommonRequestData from '../../../../utils/getCommonRequestData'
import { requestBodyFromFlash } from '../../../../utils/requestBodyFromFlash'
import { objectToRadioOptions } from '../../../../utils/utils'
import { HealthAndMedicationReferenceDataDomain } from '../../../../data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'
import InmateDetail from '../../../../data/interfaces/prisonApi/InmateDetail'
import {
  getProfileInformationValue,
  ProfileInformationType,
} from '../../../../data/interfaces/prisonApi/ProfileInformation'

export default class SmokerOrVaperController extends PersonalEditController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    protected readonly auditService: AuditService,
  ) {
    super(auditService)
  }

  smokerOrVaper(): EditControllerRequestHandlers {
    return {
      edit: async (req, res, next) => {
        const { clientToken, naturalPrisonerName } = getCommonRequestData(req, res)
        const requestBodyFlash = requestBodyFromFlash<{ radioField: string }>(req)
        const fieldValue = requestBodyFlash?.radioField || this.getSmokerStatus(req.middleware.inmateDetail)
        const smokerOrVaperValues = await this.personalPageService.getReferenceDataCodes(
          clientToken,
          HealthAndMedicationReferenceDataDomain.smoker,
        )

        const options = objectToRadioOptions(smokerOrVaperValues, 'id', 'description', fieldValue)

        return this.editRadioFields(`Does ${naturalPrisonerName} smoke or vape?`, smokerOrVaperFieldData, options)(
          req,
          res,
          next,
        )
      },

      submit: async (req, res) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const radioField = req.body.radioField || null
        const previousValue: string = this.getSmokerStatus(req.middleware.inmateDetail)
        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updateSmokerOrVaper(clientToken, user, prisonerNumber, radioField)
          },
          fieldData: smokerOrVaperFieldData,
          auditDetails: { fieldName: smokerOrVaperFieldData.fieldName, previous: previousValue, updated: radioField },
        })
      },
    }
  }

  // This will be replaced by a request to the Health and Medication API once it masters this data:
  private getSmokerStatus(inmateDetail: InmateDetail): string {
    const statusMap: Record<string, string> = {
      Yes: 'SMOKER_YES',
      No: 'SMOKER_NO',
      'Vaper/NRT Only': 'SMOKER_VAPER',
    }
    return statusMap[getProfileInformationValue(ProfileInformationType.SmokerOrVaper, inmateDetail.profileInformation)]
  }
}
