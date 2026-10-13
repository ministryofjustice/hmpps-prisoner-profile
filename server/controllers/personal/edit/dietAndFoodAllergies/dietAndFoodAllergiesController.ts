import PersonalPageService from '../../../../services/personalPageService'
import PersonalEditController from '../personalEditController'
import { AuditService } from '../../../../services/auditService'
import { dietAndFoodAllergiesFieldData } from '../../fieldData'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import { EditControllerRequestHandlers } from '../../../interfaces/EditControllerRequestHandlers'
import {
  DietAndAllergy,
  DietAndAllergyUpdate,
  HealthAndMedicationReferenceDataDomain,
  ReferenceDataIdSelection,
  ReferenceDataSelection,
} from '../../../../data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'
import { ReferenceDataCodeDto } from '../../../../data/interfaces/referenceData'
import { validationErrorsFromFlash } from '../../../../utils/validationErrorsFromFlash'
import { requestBodyFromFlash } from '../../../../utils/requestBodyFromFlash'
import getCommonRequestData from '../../../../utils/getCommonRequestData'

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
      field: 'foodAllergies' | 'medicalDietaryRequirements' | 'personalisedDietaryRequirements',
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
          this.personalPageService.getHealthAndMedication(clientToken, prisonerNumber),
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
          reviewStatus?: string
        }>(req)

        const dietAndAllergy = healthAndMedication?.dietAndAllergy

        const pendingMerges = healthAndMedication?.pendingMerges || []
        const hasPendingMerges = pendingMerges.length > 0

        const deduplicate = (selections: ReferenceDataSelection[]) => {
          const others = selections.filter(
            s =>
              s.value.id.endsWith('_OTHER') ||
              ['MEDICAL_DIET_EATING_DISORDER', 'MEDICAL_DIET_NUTRIENT_DEFICIENCY'].includes(s.value.id),
          )
          const nonOthers = selections.filter(s => !others.includes(s))
          const uniqueNonOthers = Array.from(new Set(nonOthers.map(s => s.value.id))).map(id =>
            nonOthers.find(s => s.value.id === id),
          )
          return [...uniqueNonOthers, ...others]
        }

        const groupedPendingMerges = {
          foodAllergies: deduplicate(pendingMerges.flatMap(pm => pm.dietAndAllergy?.foodAllergies.value || [])),
          medicalDietaryRequirements: deduplicate(
            pendingMerges.flatMap(pm => pm.dietAndAllergy?.medicalDietaryRequirements.value || []),
          ),
          personalisedDietaryRequirements: deduplicate(
            pendingMerges.flatMap(pm => pm.dietAndAllergy?.personalisedDietaryRequirements.value || []),
          ),
          cateringInstructions: pendingMerges
            .map(pm => pm.dietAndAllergy?.cateringInstructions?.value)
            .filter(instr => !!instr),
        }

        const getSelected = (
          flashField: ReferenceDataIdSelection[],
          apiField: 'foodAllergies' | 'medicalDietaryRequirements' | 'personalisedDietaryRequirements',
        ) => {
          if (flashField) return flashField.filter(item => !!item.value)
          return mapDietAndAllergy(dietAndAllergy, apiField)
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
          allergyOptions: checkboxOptions(
            'allergy',
            allergyCodes,
            getSelected(requestBodyFlash?.allergy, 'foodAllergies'),
          ),
          medicalDietOptions: checkboxOptions(
            'medical',
            medicalDietCodes,
            getSelected(requestBodyFlash?.medical, 'medicalDietaryRequirements'),
          ),
          personalisedDietOptions: checkboxOptions(
            'personalised',
            personalisedDietCodes,
            getSelected(requestBodyFlash?.personalised, 'personalisedDietaryRequirements'),
          ),
          cateringInstructions,
          hasPendingMerges,
          groupedPendingMerges,
          reviewStatus: requestBodyFlash?.reviewStatus,
          errors: errors ?? [],
        })
      },

      submit: async (req, res) => {
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const { prisonerNumber } = req.params
        const healthAndMedication = await this.personalPageService.getHealthAndMedication(clientToken, prisonerNumber)
        const dietAndAllergy = healthAndMedication?.dietAndAllergy
        const hasPendingMerges = (healthAndMedication?.pendingMerges || []).length > 0
        const { reviewStatus } = req.body

        if (hasPendingMerges && !reviewStatus) {
          req.flash('errors', [{ text: 'Select if the review is complete', href: '#reviewStatus' }])
          req.flash('requestBody', JSON.stringify(req.body))
          return res.redirect(`/prisoner/${prisonerNumber}/personal/diet-and-food-allergies`)
        }

        const filterSelections = (selections: ReferenceDataIdSelection[]) =>
          selections?.filter((item: ReferenceDataIdSelection) => !!item.value) || []

        const update: Partial<DietAndAllergyUpdate> = {
          foodAllergies: filterSelections(req.body.allergy),
          medicalDietaryRequirements: filterSelections(req.body.medical),
          personalisedDietaryRequirements: filterSelections(req.body.personalised),
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
            if (reviewStatus === 'COMPLETE') {
              await this.personalPageService.completeMerge(clientToken, prisonerNumber)
            }
          },
          fieldData: dietAndFoodAllergiesFieldData,
          auditDetails: { fieldName, previous: previousValues, updated: update },
        })
      },
    }
  }
}
