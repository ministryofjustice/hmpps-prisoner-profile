import { dietAndFoodAllergiesFieldData } from '../../fieldData'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import PersonalEditController from '../personalEditController'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService } from '../../../../services/auditService'
import { EditControllerRequestHandlers } from '../../../interfaces/EditControllerRequestHandlers'
import getCommonRequestData from '../../../../utils/getCommonRequestData'
import { requestBodyFromFlash } from '../../../../utils/requestBodyFromFlash'
import { validationErrorsFromFlash } from '../../../../utils/validationErrorsFromFlash'
import {
  DietAndAllergy,
  DietAndAllergyUpdate,
  HealthAndMedicationReferenceDataDomain,
  ReferenceDataIdSelection,
} from '../../../../data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'
import { ReferenceDataCodeDto } from '../../../../data/interfaces/referenceData'

export default class DietAndFoodAllergiesController extends PersonalEditController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    protected readonly auditService: AuditService,
  ) {
    super(auditService)
  }

  dietAndFoodAllergies(): EditControllerRequestHandlers {
    const { pageTitle, fieldName, auditEditPageLoad } = dietAndFoodAllergiesFieldData

    const mapDietAndAllergy = (
      dietAndAllergy: DietAndAllergy,
      field: keyof Omit<DietAndAllergy, 'cateringInstructions'>,
    ): ReferenceDataIdSelection[] => {
      if (dietAndAllergy && dietAndAllergy[field]) {
        return dietAndAllergy[field].value.map(selection => ({
          value: selection.value.id,
          comment: selection.comment,
        }))
      }
      return []
    }

    const checkboxOptions = (
      namePrefix: string,
      referenceDataCodes: ReferenceDataCodeDto[],
      selectedItems: ReferenceDataIdSelection[],
    ) => {
      return referenceDataCodes
        .sort((a, b) => a.listSequence - b.listSequence)
        .map(code => {
          const selectedItem = selectedItems.find(item => item.value === code.id)
          return {
            name: `${namePrefix}[${code.listSequence}][value]`,
            text: code.description,
            value: code.id,
            id: code.id,
            listSequence: code.listSequence,
            checked: !!selectedItem,
            comment: selectedItem?.comment,
          }
        })
    }

    return {
      edit: async (req, res) => {
        const { clientToken, prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)

        const [healthAndMedication, allergyCodes, medicalDietCodes, personalisedDietCodes] = await Promise.all([
          this.personalPageService.getHealthAndMedication(clientToken, prisonerNumber, {
            dietAndAllergiesEnabled: true,
            healthAndMedicationApiReadEnabled: true,
          }),
          this.personalPageService.getReferenceDataCodes(
            clientToken,
            HealthAndMedicationReferenceDataDomain.foodAllergy,
          ),
          this.personalPageService.getReferenceDataCodes(
            clientToken,
            HealthAndMedicationReferenceDataDomain.medicalDiet,
          ),
          this.personalPageService.getReferenceDataCodes(
            clientToken,
            HealthAndMedicationReferenceDataDomain.personalisedDiet,
          ),
        ])

        const errors = validationErrorsFromFlash(req)
        const requestBodyFlash = requestBodyFromFlash<{
          allergy?: ReferenceDataIdSelection[]
          medical?: ReferenceDataIdSelection[]
          personalised?: ReferenceDataIdSelection[]
          cateringInstructions?: string
        }>(req)

        const dietAndAllergy = healthAndMedication?.dietAndAllergy

        const allergiesSelected = () => {
          if (requestBodyFlash?.allergy) return requestBodyFlash.allergy.filter(item => !!item.value)
          return mapDietAndAllergy(dietAndAllergy, 'foodAllergies')
        }

        const medicalDietChecked = () => {
          if (requestBodyFlash?.medical) return requestBodyFlash.medical.filter(item => !!item.value)
          return mapDietAndAllergy(dietAndAllergy, 'medicalDietaryRequirements')
        }

        const personalisedDietChecked = () => {
          if (requestBodyFlash?.personalised) return requestBodyFlash.personalised.filter(item => !!item.value)
          return mapDietAndAllergy(dietAndAllergy, 'personalisedDietaryRequirements')
        }

        const cateringInstructions = requestBodyFlash?.cateringInstructions
          ? requestBodyFlash.cateringInstructions
          : dietAndAllergy?.cateringInstructions?.value

        await this.auditService.sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: auditEditPageLoad,
        })

        res.render('pages/edit/dietAndFoodAllergies', {
          pageTitle: `${pageTitle} - Prisoner personal details`,
          miniBannerData,
          allergyOptions: checkboxOptions('allergy', allergyCodes, allergiesSelected()),
          medicalDietOptions: checkboxOptions('medical', medicalDietCodes, medicalDietChecked()),
          personalisedDietOptions: checkboxOptions('personalised', personalisedDietCodes, personalisedDietChecked()),
          cateringInstructions,
          errors: errors ?? [],
        })
      },

      submit: async (req, res) => {
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const { prisonerNumber } = req.params
        const dietAndAllergy = (
          await this.personalPageService.getHealthAndMedication(clientToken, prisonerNumber, {
            dietAndAllergiesEnabled: true,
            healthAndMedicationApiReadEnabled: true,
          })
        )?.dietAndAllergy

        const update: Partial<DietAndAllergyUpdate> = {
          foodAllergies: req.body.allergy
            ? req.body.allergy.filter((item: ReferenceDataIdSelection) => !!item.value)
            : [],
          medicalDietaryRequirements: req.body.medical
            ? req.body.medical.filter((item: ReferenceDataIdSelection) => !!item.value)
            : [],
          personalisedDietaryRequirements: req.body.personalised
            ? req.body.personalised.filter((item: ReferenceDataIdSelection) => !!item.value)
            : [],
          cateringInstructions: req.body.cateringInstructions,
        }

        const previousValues: Partial<DietAndAllergyUpdate> = {
          foodAllergies: mapDietAndAllergy(dietAndAllergy, 'foodAllergies'),
          medicalDietaryRequirements: mapDietAndAllergy(dietAndAllergy, 'medicalDietaryRequirements'),
          personalisedDietaryRequirements: mapDietAndAllergy(dietAndAllergy, 'personalisedDietaryRequirements'),
          cateringInstructions: dietAndAllergy?.cateringInstructions?.value,
        }

        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updateDietAndFoodAllergies(clientToken, user, prisonerNumber, update)
          },
          fieldData: dietAndFoodAllergiesFieldData,
          auditDetails: { fieldName, previous: previousValues, updated: update },
        })
      },
    }
  }
}
