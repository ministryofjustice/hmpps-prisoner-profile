import PersonalEditController from '../personalEditController'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService } from '../../../../services/auditService'
import { countryOfBirthFieldData } from '../../fieldData'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import { objectToRadioOptions, objectToSelectOptions } from '../../../../utils/utils'
import { CorePersonRecordReferenceDataDomain } from '../../../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import getCommonRequestData from '../../../../utils/getCommonRequestData'
import { requestBodyFromFlash } from '../../../../utils/requestBodyFromFlash'
import { EditControllerRequestHandlers } from '../../../interfaces/EditControllerRequestHandlers'

export default class CountryOfBirthController extends PersonalEditController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    protected readonly auditService: AuditService,
  ) {
    super(auditService)
  }

  countryOfBirth(): EditControllerRequestHandlers {
    const { fieldName, auditEditPageLoad, pageTitle, redirectAnchor } = countryOfBirthFieldData

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
        }>(req)
        const errors = req.flash('errors')

        const countryReferenceData = await this.personalPageService.getReferenceDataCodes(
          clientToken,
          CorePersonRecordReferenceDataDomain.country,
        )

        const fieldValue =
          requestBodyFlash?.autocompleteField ||
          requestBodyFlash?.radioField ||
          countryReferenceData.find(country => country.code === inmateDetail.birthCountryCode)?.code

        const countriesAsRadioOptions = ['ENG', 'SCOT', 'WALES', 'NI']
          .map(code => countryReferenceData.find(val => val.code === code))
          .filter(Boolean)

        const countriesAsAutocompleteOptions = countryReferenceData.filter(
          val => !countriesAsRadioOptions.includes(val),
        )

        await this.auditService.sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: auditEditPageLoad,
        })

        res.render('pages/edit/radioFieldWithAutocomplete', {
          pageTitle: `${pageTitle} - Prisoner personal details`,
          formTitle: `What country was ${naturalPrisonerName} born in?`,
          errors,
          radioOptions: objectToRadioOptions(countriesAsRadioOptions, 'code', 'description', fieldValue),
          autocompleteOptions: objectToSelectOptions(countriesAsAutocompleteOptions, 'code', 'description', fieldValue),
          autocompleteSelected: fieldValue === 'OTHER',
          autocompleteOptionTitle: 'A country outside the UK',
          autocompleteOptionLabel: 'Country',
          autocompleteOptionHint: 'Start typing to select country.',
          autocompleteError: requestBodyFlash?.autocompleteError,
          redirectAnchor,
          miniBannerData,
        })
      },

      submit: async (req, res) => {
        const { prisonerNumber } = req.params
        const { clientToken, inmateDetail } = req.middleware
        const user = res.locals.user as PrisonUser
        const radioField = req.body.radioField || null
        const autocompleteField = (radioField === 'OTHER' && req.body.autocompleteField) || null
        const previousValue = inmateDetail.birthCountryCode

        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updateCountryOfBirth(
              clientToken,
              user,
              prisonerNumber,
              autocompleteField || radioField,
            )
          },
          fieldData: countryOfBirthFieldData,
          auditDetails: { fieldName, previous: previousValue, updated: autocompleteField || radioField },
        })
      },
    }
  }
}
