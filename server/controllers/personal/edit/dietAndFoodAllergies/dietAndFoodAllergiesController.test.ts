import { NextFunction, Request, RequestHandler, Response } from 'express'
import { prisonUserMock } from '../../../../data/localMockData/user'
import { AuditService, Page, PostAction } from '../../../../services/auditService'
import { FlashMessageType } from '../../../../data/enums/flashMessageType'
import PersonalPageService from '../../../../services/personalPageService'
import { personalPageServiceMock } from '../../../../../tests/mocks/personalPageServiceMock'
import { auditServiceMock } from '../../../../../tests/mocks/auditServiceMock'
import DietAndFoodAllergiesController from './dietAndFoodAllergiesController'
import { inmateDetailMock } from '../../../../data/localMockData/inmateDetailMock'
import { PrisonerMockDataA } from '../../../../data/localMockData/prisoner'
import {
  HealthAndMedication,
  ReferenceDataIdSelection,
} from '../../../../data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'
import { healthAndMedicationMock } from '../../../../data/localMockData/healthAndMedicationApi/healthAndMedicationMock'
import {
  foodAllergyCodesMock,
  medicalDietCodesMock,
  personalisedDietCodesMock,
} from '../../../../data/localMockData/healthAndMedicationApi/referenceDataMocks'

describe('DietAndFoodAllergiesController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let controller: DietAndFoodAllergiesController
  let res: Response
  const next: NextFunction = jest.fn()

  const { prisonerNumber } = PrisonerMockDataA

  const middleware = {
    clientToken: 'token',
    prisonerData: PrisonerMockDataA,
    inmateDetail: inmateDetailMock,
  }

  beforeEach(() => {
    personalPageService = personalPageServiceMock() as PersonalPageService
    personalPageService.getHealthAndMedication = jest.fn(async () => ({ ...healthAndMedicationMock }))
    auditService = auditServiceMock()

    controller = new DietAndFoodAllergiesController(personalPageService, auditService)
    res = {
      locals: {
        user: prisonUserMock,
        prisonerNumber,
        prisonId: 999,
      },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  describe('dietAndFoodAllergies', () => {
    describe('edit', () => {
      const action: RequestHandler = async (req, response) =>
        controller.dietAndFoodAllergies().edit(req, response, next)
      const editOptions = ({ selections }: { selections: ReferenceDataIdSelection[] }) => ({
        allergyOptions: [
          {
            checked: selections.map(s => s.value).includes('FOOD_ALLERGY_EGG'),
            id: 'FOOD_ALLERGY_EGG',
            listSequence: 0,
            name: 'allergy[0][value]',
            text: 'Egg',
            value: 'FOOD_ALLERGY_EGG',
          },
          {
            checked: selections.map(s => s.value).includes('FOOD_ALLERGY_OTHER'),
            id: 'FOOD_ALLERGY_OTHER',
            listSequence: 1,
            name: 'allergy[1][value]',
            text: 'Other',
            value: 'FOOD_ALLERGY_OTHER',
            comment: selections.find(s => s.value === 'FOOD_ALLERGY_OTHER')?.comment || undefined,
          },
        ],
        medicalDietOptions: [
          {
            checked: selections.map(s => s.value).includes('MEDICAL_DIET_COELIAC'),
            id: 'MEDICAL_DIET_COELIAC',
            listSequence: 0,
            name: 'medical[0][value]',
            text: 'Coeliac',
            value: 'MEDICAL_DIET_COELIAC',
          },
          {
            checked: selections.map(s => s.value).includes('MEDICAL_DIET_OTHER'),
            id: 'MEDICAL_DIET_OTHER',
            listSequence: 1,
            name: 'medical[1][value]',
            text: 'Other',
            value: 'MEDICAL_DIET_OTHER',
            comment: selections.find(s => s.value === 'MEDICAL_DIET_OTHER')?.comment || undefined,
          },
        ],
        personalisedDietOptions: [
          {
            checked: selections.map(s => s.value).includes('PERSONALISED_DIET_VEGAN'),
            id: 'PERSONALISED_DIET_VEGAN',
            listSequence: 0,
            name: 'personalised[0][value]',
            text: 'Vegan',
            value: 'PERSONALISED_DIET_VEGAN',
          },
          {
            checked: selections.map(s => s.value).includes('PERSONALISED_DIET_OTHER'),
            id: 'PERSONALISED_DIET_OTHER',
            listSequence: 1,
            name: 'personalised[1][value]',
            text: 'Other',
            value: 'PERSONALISED_DIET_OTHER',
            comment: selections.find(s => s.value === 'PERSONALISED_DIET_OTHER')?.comment || undefined,
          },
        ],
      })

      it('Renders the edit page with the correct data from the health and medications api when no existing data is present', async () => {
        personalPageService.getHealthAndMedication = jest.fn(async () => null as HealthAndMedication)

        const req = {
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request
        await action(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/edit/dietAndFoodAllergies', {
          pageTitle: expect.anything(),
          miniBannerData: {
            cellLocation: '1-1-035',
            prisonerName: 'Saunders, John',
            prisonerNumber,
            prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=1413311&fullSizeImage=false`,
          },
          errors: [],
          ...editOptions({ selections: [] }),
        })
      })

      it('Renders the edit page with the correct data from the health and medications api when data is present', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request
        await action(req, res, next)

        expect(personalPageService.getHealthAndMedication).toHaveBeenCalledWith(expect.anything(), prisonerNumber, {
          dietAndAllergiesEnabled: true,
          healthAndMedicationApiReadEnabled: true,
        })

        expect(res.render).toHaveBeenCalledWith('pages/edit/dietAndFoodAllergies', {
          pageTitle: expect.anything(),
          miniBannerData: {
            cellLocation: '1-1-035',
            prisonerName: 'Saunders, John',
            prisonerNumber,
            prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=1413311&fullSizeImage=false`,
          },
          errors: [],
          ...editOptions({
            selections: [
              { value: medicalDietCodesMock[0].id },
              { value: foodAllergyCodesMock[0].id },
              { value: personalisedDietCodesMock[0].id },
            ],
          }),
          cateringInstructions: 'Some catering instructions.',
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Populates the field value from the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            return key === 'requestBody'
              ? [
                  JSON.stringify({
                    medical: [{ value: medicalDietCodesMock[0].id }, { value: 'MEDICAL_DIET_OTHER', comment: 'abc' }],
                    allergy: [{ value: foodAllergyCodesMock[0].id }, { value: 'FOOD_ALLERGY_OTHER', comment: 'def' }],
                    personalised: [
                      { value: personalisedDietCodesMock[0].id },
                      {
                        value: 'PERSONALISED_DIET_OTHER',
                        comment: 'ghi',
                      },
                    ],
                    cateringInstructions: 'jkl',
                  }),
                ]
              : []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            ...editOptions({
              selections: [
                { value: medicalDietCodesMock[0].id },
                { value: 'MEDICAL_DIET_OTHER', comment: 'abc' },
                { value: foodAllergyCodesMock[0].id },
                { value: 'FOOD_ALLERGY_OTHER', comment: 'def' },
                { value: personalisedDietCodesMock[0].id },
                { value: 'PERSONALISED_DIET_OTHER', comment: 'ghi' },
              ],
            }),
            cateringInstructions: 'jkl',
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber,
          prisonId: 999,
          correlationId: req.id,
          page: Page.EditDietAndFoodAllergies,
        }

        await action(req, res, next)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: Request
      const action: RequestHandler = async (req, response) =>
        controller.dietAndFoodAllergies().submit(req, response, next)

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware,
          params: { prisonerNumber },
          body: {
            medical: [{ value: medicalDietCodesMock[0].id }, { value: 'MEDICAL_DIET_OTHER', comment: 'abc' }],
            allergy: [{ value: foodAllergyCodesMock[0].id }, { value: 'FOOD_ALLERGY_OTHER', comment: 'def' }],
            personalised: [
              { value: personalisedDietCodesMock[0].id },
              {
                value: 'PERSONALISED_DIET_OTHER',
                comment: 'ghi',
              },
            ],
            cateringInstructions: 'jkl',
          },
          flash: jest.fn(),
        } as unknown as Request
      })

      it('Redirects to the personal page #diet-and-food-allergies on success', async () => {
        await action(validRequest, res, next)
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#diet-and-food-allergies`)
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Diet and food allergies updated',
          type: FlashMessageType.success,
          fieldName: 'dietAndFoodAllergies',
        })
      })

      it('Updates the prisoner health on success', async () => {
        await action(validRequest, res, next)
        expect(personalPageService.updateDietAndFoodAllergies).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          prisonerNumber,
          {
            medicalDietaryRequirements: [
              { value: medicalDietCodesMock[0].id },
              { value: 'MEDICAL_DIET_OTHER', comment: 'abc' },
            ],
            foodAllergies: [{ value: foodAllergyCodesMock[0].id }, { value: 'FOOD_ALLERGY_OTHER', comment: 'def' }],
            personalisedDietaryRequirements: [
              { value: personalisedDietCodesMock[0].id },
              {
                value: 'PERSONALISED_DIET_OTHER',
                comment: 'ghi',
              },
            ],
            cateringInstructions: 'jkl',
          },
        )
      })

      it('Handles API errors', async () => {
        personalPageService.updateDietAndFoodAllergies = async () => {
          throw new Error()
        }

        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/diet-and-food-allergies`)
      })

      it('Sends a post success audit event', async () => {
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber,
          correlationId: validRequest.id,
          action: PostAction.EditDietAndFoodAllergies,
          details: {
            fieldName: 'dietAndFoodAllergies',
            previous: {
              medicalDietaryRequirements: [{ value: medicalDietCodesMock[0].id }],
              foodAllergies: [{ value: foodAllergyCodesMock[0].id }],
              personalisedDietaryRequirements: [{ value: personalisedDietCodesMock[0].id }],
              cateringInstructions: 'Some catering instructions.',
            },
            updated: {
              medicalDietaryRequirements: [
                { value: medicalDietCodesMock[0].id },
                { value: 'MEDICAL_DIET_OTHER', comment: 'abc' },
              ],
              foodAllergies: [{ value: foodAllergyCodesMock[0].id }, { value: 'FOOD_ALLERGY_OTHER', comment: 'def' }],
              personalisedDietaryRequirements: [
                { value: personalisedDietCodesMock[0].id },
                {
                  value: 'PERSONALISED_DIET_OTHER',
                  comment: 'ghi',
                },
              ],
              cateringInstructions: 'jkl',
            },
          },
        }

        await action(validRequest, res, next)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })
})
