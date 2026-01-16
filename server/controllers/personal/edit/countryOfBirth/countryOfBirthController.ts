import { countryOfBirthFieldData } from '../../fieldData'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import PersonalEditController from '../personalEditController'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService } from '../../../../services/auditService'
import { EditControllerRequestHandlers } from '../../../interfaces/EditControllerRequestHandlers'
import { requestBodyFromFlash } from '../../../../utils/requestBodyFromFlash'
import { formatName, objectToRadioOptions, objectToSelectOptions } from '../../../../utils/utils'
import { CorePersonRecordReferenceDataDomain } from '../../../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { NameFormatStyle } from '../../../../data/enums/nameFormatStyle'

export default class CountryOfBirthController extends PersonalEditController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    protected readonly auditService: AuditService,
  ) {
    super(auditService)
  }

  countryOfBirth(): EditControllerRequestHandlers {
    const { fieldName } = countryOfBirthFieldData

    return {
      edit: async (req, res, next) => {
        const { inmateDetail, prisonerData, clientToken } = req.middleware
        const { firstName, lastName } = prisonerData
        const { autocompleteField, autocompleteError, radioField } =
          requestBodyFromFlash<{
            autocompleteField: string
            autocompleteError: string
            radioField: string
          }>(req) || {}
        const countryReferenceData = await this.personalPageService.getReferenceDataCodes(
          clientToken,
          CorePersonRecordReferenceDataDomain.country,
        )

        const fieldValue =
          autocompleteField ||
          radioField ||
          countryReferenceData.find(country => country.code === inmateDetail.birthCountryCode)?.code

        const countriesAsRadioOptions = ['ENG', 'SCOT', 'WALES', 'NI']
          .map(code => countryReferenceData.find(val => val.code === code))
          .filter(Boolean)

        const countriesAsAutocompleteOptions = countryReferenceData.filter(
          val => !countriesAsRadioOptions.includes(val),
        )

        return this.editRadioFieldsWithAutocomplete({
          formTitle: `What country was ${formatName(firstName, '', lastName, { style: NameFormatStyle.firstLast })} born in?`,
          fieldData: countryOfBirthFieldData,
          radioOptions: objectToRadioOptions(countriesAsRadioOptions, 'code', 'description', fieldValue),
          autocompleteOptions: objectToSelectOptions(countriesAsAutocompleteOptions, 'code', 'description', fieldValue),
          autocompleteSelected: fieldValue === 'OTHER',
          autocompleteOptionTitle: 'A country outside the UK',
          autocompleteOptionLabel: 'Country',
          autocompleteOptionHint: 'Start typing to select country.',
          autocompleteError,
        })(req, res, next)
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
