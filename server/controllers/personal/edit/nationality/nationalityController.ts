import { nationalityFieldData } from '../../fieldData'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import PersonalEditController from '../personalEditController'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService } from '../../../../services/auditService'
import { EditControllerRequestHandlers } from '../../../interfaces/EditControllerRequestHandlers'
import getCommonRequestData from '../../../../utils/getCommonRequestData'
import { requestBodyFromFlash } from '../../../../utils/requestBodyFromFlash'
import { objectToRadioOptions, objectToSelectOptions } from '../../../../utils/utils'
import { CorePersonRecordReferenceDataDomain } from '../../../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import {
  getProfileInformationValue,
  ProfileInformationType,
} from '../../../../data/interfaces/prisonApi/ProfileInformation'

export default class NationalityController extends PersonalEditController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    protected readonly auditService: AuditService,
  ) {
    super(auditService)
  }

  nationality(): EditControllerRequestHandlers {
    const { fieldName, auditEditPageLoad } = nationalityFieldData

    return {
      edit: async (req, res) => {
        const { clientToken, prisonerNumber, prisonId, naturalPrisonerName, miniBannerData } = getCommonRequestData(
          req,
          res,
        )
        const { inmateDetail } = req.middleware
        const requestBodyFlash = requestBodyFromFlash<{
          autocompleteField: string
          autocompleteError: string
          radioField: string
          additionalNationalities: string
        }>(req)
        const errors = req.flash('errors')

        const [nationalityReferenceData] = await Promise.all([
          this.personalPageService.getReferenceDataCodes(clientToken, CorePersonRecordReferenceDataDomain.nationality),
        ])

        const fieldValue =
          requestBodyFlash?.autocompleteField ||
          requestBodyFlash?.radioField ||
          nationalityReferenceData.find(
            nationality =>
              nationality.description ===
              getProfileInformationValue(ProfileInformationType.Nationality, inmateDetail.profileInformation),
          )?.code
        const additionalNationalitiesValue =
          requestBodyFlash?.additionalNationalities ||
          getProfileInformationValue(ProfileInformationType.OtherNationalities, inmateDetail.profileInformation)

        const britishNationality = ['BRIT']
          .map(code => nationalityReferenceData.find(val => val.code === code))
          .filter(Boolean)
        const nationalitiesAsAutocompleteOptions = nationalityReferenceData.filter(
          val => !britishNationality.includes(val),
        )
        const britishRadioOption = objectToRadioOptions(britishNationality, 'code', 'description', fieldValue).map(
          option => ({ ...option, hint: { text: 'Including English, Welsh, Scottish and Northern Irish' } }),
        )

        await this.auditService.sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: auditEditPageLoad,
        })

        res.render('pages/edit/nationality', {
          pageTitle: `${nationalityFieldData.pageTitle} - Prisoner personal details`,
          formTitle: `What is ${naturalPrisonerName}'s nationality?`,
          errors,
          radioOptions: britishRadioOption,
          autocompleteOptions: objectToSelectOptions(
            nationalitiesAsAutocompleteOptions,
            'code',
            'description',
            fieldValue,
          ),
          additionalNationalitiesValue,
          autocompleteSelected: fieldValue === 'OTHER',
          autocompleteOptionTitle: 'A different nationality',
          autocompleteOptionLabel: 'Nationality',
          autocompleteOptionHint: 'Start typing to select nationality.',
          autocompleteError: requestBodyFlash?.autocompleteError,
          miniBannerData,
        })
      },

      submit: async (req, res) => {
        const { prisonerNumber } = req.params
        const { clientToken, inmateDetail } = req.middleware
        const user = res.locals.user as PrisonUser
        const radioField = req.body.radioField || null
        const autocompleteField = (radioField === 'OTHER' && req.body.autocompleteField) || null
        const otherNationalities = req.body.additionalNationalities || null
        const previousValue = getProfileInformationValue(
          ProfileInformationType.Nationality,
          inmateDetail.profileInformation,
        )
        const previousOtherNationalitiesValue = getProfileInformationValue(
          ProfileInformationType.OtherNationalities,
          inmateDetail.profileInformation,
        )
        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updateNationality(
              clientToken,
              user,
              prisonerNumber,
              autocompleteField || radioField,
              otherNationalities,
            )
          },
          fieldData: nationalityFieldData,
          auditDetails: [
            { fieldName, previous: previousValue, updated: autocompleteField || radioField },
            {
              fieldName: 'otherNationalities',
              previous: previousOtherNationalitiesValue,
              updated: otherNationalities,
            },
          ],
        })
      },
    }
  }
}
