import { Request } from 'express'
import PersonalPageService from '../../../../services/personalPageService'
import PersonalEditController from '../personalEditController'
import { AuditService } from '../../../../services/auditService'
import { religionFieldData } from '../../fieldData'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import { EditControllerRequestHandlers } from '../../../interfaces/EditControllerRequestHandlers'
import getCommonRequestData from '../../../../utils/getCommonRequestData'
import { requestBodyFromFlash } from '../../../../utils/requestBodyFromFlash'
import { apostrophe, objectToRadioOptions } from '../../../../utils/utils'
import { CorePersonRecordReferenceDataDomain } from '../../../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import {
  getProfileInformationValue,
  ProfileInformationType,
} from '../../../../data/interfaces/prisonApi/ProfileInformation'
import type { RadioOption } from '../../../../interfaces/GovOptions'
import { ReferenceDataCodeDto } from '../../../../data/interfaces/referenceData'

export default class ReligionController extends PersonalEditController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    protected readonly auditService: AuditService,
  ) {
    super(auditService)
  }

  religion(): EditControllerRequestHandlers {
    const { pageTitle, fieldName, auditEditPageLoad, redirectAnchor } = religionFieldData

    const currentReligionValue = (req: Request, referenceData: ReferenceDataCodeDto[]) => {
      const { inmateDetail } = req.middleware
      const profileInformationValue = getProfileInformationValue(
        ProfileInformationType.Religion,
        inmateDetail.profileInformation,
      )
      const currentValue =
        profileInformationValue &&
        (referenceData.find(
          religion =>
            religion.description.toLowerCase() === profileInformationValue.toLowerCase() ||
            religion.code === profileInformationValue,
        ) ?? { code: '?', description: profileInformationValue })

      const override = religionFieldData.referenceDataOverrides.find(o => o.id === currentValue?.code)
      return {
        ...currentValue,
        description: override?.description ?? currentValue?.description,
      }
    }

    // When there are multiple variants of a religion, we want to display the 'Other' option last:
    const demoteOtherVariant = (prefix: string, a: RadioOption, b: RadioOption): number => {
      if (a.text.startsWith(prefix) && b.text.startsWith(prefix)) {
        if (a.text.endsWith('Other')) return 1
        if (b.text.endsWith('Other')) return -1
      }
      return 0
    }

    // When two options alphabetically next to each other need to be in a specific alternative order:
    const preferOrder = (
      optionToDisplayFirst: string,
      optionToDisplayLast: string,
      a: RadioOption,
      b: RadioOption,
    ): number => {
      if (a.text === optionToDisplayFirst && b.text === optionToDisplayLast) return -1
      if (b.text === optionToDisplayFirst && a.text === optionToDisplayLast) return 1
      return 0
    }

    // Options are already sorted alphabetically, this then applies additional non-alphabetical sorting
    const religionOptionsSorter = (a: RadioOption, b: RadioOption): number => {
      const otherVariantSort = demoteOtherVariant('Christian', a, b) || demoteOtherVariant('Muslim', a, b)
      if (otherVariantSort !== 0) return otherVariantSort

      const muslimPreferredOrder = preferOrder('Muslim', 'Muslim – Shia', a, b)
      if (muslimPreferredOrder !== 0) return muslimPreferredOrder

      const christianPreferredOrder = preferOrder('Christian – Oriental Orthodox', 'Christian – Orthodox', a, b)
      if (christianPreferredOrder !== 0) return christianPreferredOrder

      return 0
    }

    return {
      edit: async (req, res) => {
        const { clientToken, prisonerNumber, naturalPrisonerName, prisonId, miniBannerData } = getCommonRequestData(
          req,
          res,
        )

        const requestBodyFlash = requestBodyFromFlash<{
          religion: string
          reasonKnown: string
          reasonForChange: string
          reasonForChangeUnknown: string
        }>(req)
        const errors = req.flash('errors')

        // 'UNKN' will be deactivated as part of the religion reference data migration in NOMIS (and can then be removed from here)
        const otherReligionCodes = ['OTH', 'NIL', 'TPRNTS', 'UNKN']
        const religionReferenceData = await this.personalPageService.getReferenceDataCodes(
          clientToken,
          CorePersonRecordReferenceDataDomain.religion,
        )
        const religionOptions = religionReferenceData
          .filter(it => !otherReligionCodes.includes(it.code))
          .sort((a, b) => a.description.localeCompare(b.description))
        const otherReligionOptions = otherReligionCodes
          .map(code => religionReferenceData.find(it => it.code === code))
          .filter(Boolean)

        const currentReligion = currentReligionValue(req, religionReferenceData)
        const fieldValue = requestBodyFlash?.religion
        const currentReasonKnown = requestBodyFlash?.reasonKnown
        const currentReasonForChange = requestBodyFlash?.reasonForChange
        const currentReasonForChangeUnknown = requestBodyFlash?.reasonForChangeUnknown

        await this.auditService.sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: auditEditPageLoad,
        })

        res.render('pages/edit/religion', {
          pageTitle: `${pageTitle} - Prisoner personal details`,
          formTitle: `Select ${apostrophe(naturalPrisonerName)} religion, faith or belief`,
          currentReligion,
          currentReasonKnown,
          currentReasonForChange,
          currentReasonForChangeUnknown,
          redirectAnchor,
          errors,
          options: [
            ...objectToRadioOptions(
              religionOptions,
              'code',
              'description',
              fieldValue,
              religionFieldData.referenceDataOverrides,
            ).sort(religionOptionsSorter),
            { divider: 'Or' },
            ...objectToRadioOptions(
              otherReligionOptions,
              'code',
              'description',
              fieldValue,
              religionFieldData.referenceDataOverrides,
            ),
          ],
          miniBannerData,
        })
      },

      submit: async (req, res) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const religionCode = req.body.religion || null
        const currentReligionCode = req.body.currentReligionCode || null
        const reasonForChangeKnown = req.body.reasonKnown || null
        const reasonForChange =
          reasonForChangeKnown === 'NO' ? req.body.reasonForChangeUnknown : req.body.reasonForChange

        if (!religionCode) {
          return res.redirect(`/prisoner/${prisonerNumber}/personal#${redirectAnchor}`)
        }

        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updateReligion(
              clientToken,
              user,
              prisonerNumber,
              religionCode,
              reasonForChange,
            )
          },
          fieldData: religionFieldData,
          auditDetails: {
            fieldName,
            previous: currentReligionCode,
            updated: religionCode,
          },
        })
      },
    }
  }
}
