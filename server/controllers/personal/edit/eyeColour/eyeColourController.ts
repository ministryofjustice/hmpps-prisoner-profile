import { eyeColourFieldData, eyeColourIndividualFieldData } from '../../fieldData'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import PersonalEditController from '../personalEditController'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService } from '../../../../services/auditService'
import { EditControllerRequestHandlers } from '../../../interfaces/EditControllerRequestHandlers'
import getCommonRequestData from '../../../../utils/getCommonRequestData'
import { requestBodyFromFlash } from '../../../../utils/requestBodyFromFlash'
import { objectToRadioOptions } from '../../../../utils/utils'
import { CorePersonRecordReferenceDataDomain } from '../../../../data/interfaces/personIntegrationApi/personIntegrationApiClient'

export default class EyeColourController extends PersonalEditController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    protected readonly auditService: AuditService,
  ) {
    super(auditService)
  }

  /**
   * Handler for editing eye colour.
   */
  eyeColour(): EditControllerRequestHandlers {
    const { pageTitle, fieldName, auditEditPageLoad } = eyeColourFieldData

    return {
      edit: async (req, res) => {
        const domain = CorePersonRecordReferenceDataDomain.leftEyeColour
        const { clientToken, prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)
        const requestBodyFlash = requestBodyFromFlash<{ eyeColour: string }>(req)
        const errors = req.flash('errors')

        const [characteristics, physicalAttributes] = await Promise.all([
          this.personalPageService.getReferenceDataCodes(clientToken, domain),
          this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber),
        ])

        /* Set radio to correct eye colour if both left and right values are the same, otherwise leave unselected. */
        const eyeColour =
          physicalAttributes.leftEyeColourCode === physicalAttributes.rightEyeColourCode
            ? physicalAttributes.leftEyeColourCode
            : undefined

        const fieldValue = requestBodyFlash?.eyeColour || eyeColour

        await this.auditService.sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: auditEditPageLoad,
        })

        res.render('pages/edit/eyeColour', {
          pageTitle: `${pageTitle} - Prisoner personal details`,
          formTitle: pageTitle,
          errors,
          options: objectToRadioOptions(characteristics, 'code', 'description', fieldValue),
          miniBannerData,
        })
      },

      submit: async (req, res) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const eyeColour = req.body.eyeColour || null
        const physicalAttributes = await this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber)
        const previousLeftEyeColour = physicalAttributes?.leftEyeColourCode
        const previousRightEyeColour = physicalAttributes?.rightEyeColourCode
        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
              leftEyeColourCode: eyeColour,
              rightEyeColourCode: eyeColour,
            })
          },
          fieldData: eyeColourFieldData,
          auditDetails: {
            fieldName,
            previous: { leftEyeColourCode: previousLeftEyeColour, rightEyeColourCode: previousRightEyeColour },
            updated: { leftEyeColourCode: eyeColour, rightEyeColourCode: eyeColour },
          },
        })
      },
    }
  }

  /**
   * Handler for editing left and right eye colour individually.
   */
  eyeColourIndividual(): EditControllerRequestHandlers {
    const { pageTitle, auditEditPageLoad } = eyeColourIndividualFieldData

    return {
      edit: async (req, res) => {
        const domainLeftEyeColour = CorePersonRecordReferenceDataDomain.leftEyeColour
        const domainRightEyeColour = CorePersonRecordReferenceDataDomain.rightEyeColour

        const { clientToken, prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)
        const requestBodyFlash = requestBodyFromFlash<{ leftEyeColour: string; rightEyeColour: string }>(req)
        const errors = req.flash('errors')

        const [leftEyeColours, rightEyeColours, physicalAttributes] = await Promise.all([
          this.personalPageService.getReferenceDataCodes(clientToken, domainLeftEyeColour),
          this.personalPageService.getReferenceDataCodes(clientToken, domainRightEyeColour),
          this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber),
        ])
        const leftEyeColour = requestBodyFlash?.leftEyeColour || physicalAttributes.leftEyeColourCode
        const rightEyeColour = requestBodyFlash?.rightEyeColour || physicalAttributes.rightEyeColourCode

        await this.auditService.sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: auditEditPageLoad,
        })

        res.render('pages/edit/eyeColourIndividual', {
          pageTitle: `${pageTitle} - Prisoner personal details`,
          formTitle: pageTitle,
          errors,
          leftOptions: objectToRadioOptions(leftEyeColours, 'code', 'description', leftEyeColour),
          rightOptions: objectToRadioOptions(rightEyeColours, 'code', 'description', rightEyeColour),
          miniBannerData,
        })
      },

      submit: async (req, res) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const leftEyeColourCode = req.body.leftEyeColour || null
        const rightEyeColourCode = req.body.rightEyeColour || null
        const physicalAttributes = await this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber)
        const previousLeftEyeColour = physicalAttributes?.leftEyeColourCode
        const previousRightEyeColour = physicalAttributes?.rightEyeColourCode
        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
              leftEyeColourCode,
              rightEyeColourCode,
            })
          },
          fieldData: eyeColourIndividualFieldData,
          auditDetails: {
            fieldName: 'eyeColour',
            previous: { leftEyeColourCode: previousLeftEyeColour, rightEyeColourCode: previousRightEyeColour },
            updated: { leftEyeColourCode, rightEyeColourCode },
          },
        })
      },
    }
  }
}
