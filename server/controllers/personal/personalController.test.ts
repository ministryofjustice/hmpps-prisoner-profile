import { Response } from 'express'
import { auditServiceMock } from '../../../tests/mocks/auditServiceMock'
import { careNeedsServiceMock } from '../../../tests/mocks/careNeedsServiceMock'
import { personalPageServiceMock } from '../../../tests/mocks/personalPageServiceMock'
import { FlashMessageType } from '../../data/enums/flashMessageType'
import { AuditService, Page, PostAction } from '../../services/auditService'
import CareNeedsService from '../../services/careNeedsService'
import PersonalPageService from '../../services/personalPageService'
import PersonalController from './personalController'
import {
  cityOrTownOfBirthFieldData,
  domesticStatusFieldData,
  heightFieldData,
  nationalityFieldData,
  numberOfChildrenFieldData,
  RadioFieldData,
  sexualOrientationFieldData,
  shoeSizeFieldData,
  smokerOrVaperFieldData,
  weightFieldData,
} from './fieldData'
import { prisonUserMock } from '../../data/localMockData/user'
import InmateDetail from '../../data/interfaces/prisonApi/InmateDetail'
import { ProfileInformationType } from '../../data/interfaces/prisonApi/ProfileInformation'
import { healthAndMedicationMock } from '../../data/localMockData/healthAndMedicationApi/healthAndMedicationMock'
import {
  HealthAndMedication,
  ReferenceDataIdSelection,
} from '../../data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'
import {
  foodAllergyCodesMock,
  medicalDietCodesMock,
  personalisedDietCodesMock,
} from '../../data/localMockData/healthAndMedicationApi/referenceDataMocks'
import { CorePersonRecordReferenceDataDomain } from '../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { buildCodesMock, eyeColourCodesMock } from '../../data/localMockData/personIntegrationApi/referenceDataMocks'
import { corePersonPhysicalAttributesMock } from '../../data/localMockData/physicalAttributesMock'
import { objectToRadioOptions } from '../../utils/utils'
import { CorePersonPhysicalAttributes } from '../../services/interfaces/corePerson/corePersonPhysicalAttributes'
import {
  PersonalRelationshipsDomesticStatusMock,
  PersonalRelationshipsNumberOfChildrenMock,
} from '../../data/localMockData/personalRelationshipsApiMock'
import { ReferenceDataCodeDto } from '../../data/interfaces/referenceData'
import { globalPhonesAndEmailsMock } from '../../data/localMockData/globalPhonesAndEmails'

describe('PersonalController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let careNeedsService: CareNeedsService
  let controller: PersonalController
  let res: Response

  const defaultMiddleware = {
    clientToken: 'token',
    prisonerData: {
      firstName: 'First',
      lastName: 'Last',
      cellLocation: '2-3-001',
      prisonerNumber: 'A1234BC',
      prisonId: 999,
    },
    inmateDetail: {
      firstName: 'First',
      lastName: 'Last',
      birthPlace: 'SHEFFIELD',
      profileInformation: [
        { question: 'Smoker or Vaper', resultValue: 'Yes', type: ProfileInformationType.SmokerOrVaper },
        { question: 'Nationality', resultValue: 'BRIT', type: ProfileInformationType.Nationality },
        {
          question: 'Other Nationality',
          resultValue: 'Some other nationality',
          type: ProfileInformationType.OtherNationalities,
        },
        { question: 'Religion', resultValue: 'Buddhist', type: ProfileInformationType.Religion },
        {
          question: 'Sexual orientation',
          resultValue: 'Heterosexual / Straight',
          type: ProfileInformationType.SexualOrientation,
        },
      ],
    } as InmateDetail,
  }

  const defaultLocals = {
    user: prisonUserMock,
  }

  beforeEach(() => {
    personalPageService = personalPageServiceMock() as PersonalPageService
    personalPageService.getHealthAndMedication = jest.fn(async () => ({ ...healthAndMedicationMock }))
    personalPageService.getPhysicalAttributes = jest.fn(async () => corePersonPhysicalAttributesMock)
    personalPageService.updateSmokerOrVaper = jest.fn()
    auditService = auditServiceMock()
    careNeedsService = careNeedsServiceMock() as CareNeedsService
    personalPageService.getNumberOfChildren = jest.fn(async () => PersonalRelationshipsNumberOfChildrenMock)
    personalPageService.getDomesticStatus = jest.fn(async () => PersonalRelationshipsDomesticStatusMock)

    controller = new PersonalController(personalPageService, careNeedsService, auditService)
    res = { locals: defaultLocals, render: jest.fn(), redirect: jest.fn() } as any
  })

  describe('displayPersonalPage', () => {
    // Skipped to focus on the edit routes for now
    it.skip('Renders the page with information from the service', () => {})
  })

  describe('height', () => {
    describe('metric', () => {
      describe('edit', () => {
        const action = async (req: any, response: any) => controller.height().metric.edit(req, response, () => {})

        it('Renders the default edit page with the correct data from the prison person API', async () => {
          const req = {
            params: { prisonerNumber: 'A1234BC' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)

          expect(personalPageService.getPhysicalAttributes).toHaveBeenCalledWith('token', 'A1234BC')
          expect(res.render).toHaveBeenCalledWith('pages/edit/heightMetric', {
            pageTitle: expect.anything(),
            prisonerNumber: 'A1234BC',
            breadcrumbPrisonerName: 'Last, First',
            errors: [],
            fieldValue: 100,
            miniBannerData: {
              cellLocation: '2-3-001',
              prisonerName: 'Last, First',
              prisonerNumber: 'A1234BC',
              prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
            },
          })
        })

        it('Populates the errors from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'A1234BC' },
            flash: (key: string): any => {
              if (key === 'errors') return ['error']
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
        })

        it('Populates the field value from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'A1234BC' },
            flash: (key: string): any => {
              return key === 'requestBody' ? [JSON.stringify({ editField: '1234' })] : []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ fieldValue: '1234' }))
        })

        it('Sends a page view audit event', async () => {
          const req = {
            id: 1,
            params: { prisonerNumber: 'A1234BC' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'A1234BC',
            prisonId: 999,
            correlationId: req.id,
            page: Page.EditHeight,
          }

          await action(req, res)

          expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })

      describe('submit', () => {
        let validRequest: any
        const action = async (req: any, response: any) => controller.height().metric.submit(req, response, () => {})

        beforeEach(() => {
          validRequest = {
            middleware: defaultMiddleware,
            params: { prisonerNumber: 'A1234BC' },
            body: { editField: '123' },
            flash: jest.fn(),
          } as any
        })

        it.each([
          { editField: '', updateRequest: { height: null } },
          { editField: '100', updateRequest: { height: 100 } },
        ])('Valid request: %s', async ({ editField, updateRequest }) => {
          const request = { ...validRequest, body: { editField } }
          await action(request, res)
          expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith(
            expect.anything(),
            prisonUserMock,
            expect.anything(),
            expect.objectContaining(updateRequest),
          )
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#height')
          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Height updated',
            type: FlashMessageType.success,
            fieldName: 'height',
          })
        })

        it('Handles API errors', async () => {
          personalPageService.updatePhysicalAttributes = async () => {
            throw new Error()
          }

          await action(validRequest, res)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/height')
        })

        it('Sends a post success audit event', async () => {
          const request = { ...validRequest, id: 1, body: { editField: 157 } }
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'A1234BC',
            correlationId: request.id,
            action: PostAction.EditHeight,
            details: { fieldName: heightFieldData.fieldName, previous: 100, updated: 157 },
          }

          await action(request, res)

          expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })
    })

    describe('imperial', () => {
      describe('edit', () => {
        const action = async (req: any, response: any) => controller.height().imperial.edit(req, response, () => {})

        it('Renders the default edit page with the correct data', async () => {
          const req = {
            params: { prisonerNumber: 'A1234BC' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)

          expect(res.render).toHaveBeenCalledWith('pages/edit/heightImperial', {
            pageTitle: expect.anything(),
            prisonerNumber: 'A1234BC',
            breadcrumbPrisonerName: 'Last, First',
            errors: [],
            feetValue: 3,
            inchesValue: 3,
            miniBannerData: {
              cellLocation: '2-3-001',
              prisonerName: 'Last, First',
              prisonerNumber: 'A1234BC',
              prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
            },
          })
        })

        it('Populates the errors from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'A1234BC' },
            flash: (key: string): any => {
              if (key === 'errors') return ['error']
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
        })

        it('Populates the field value from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'A1234BC' },
            flash: (key: string): any => {
              return key === 'requestBody' ? [JSON.stringify({ feet: '5', inches: '10' })] : []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ feetValue: '5', inchesValue: '10' }),
          )
        })

        it('Keeps the inputs empty when no height exists', async () => {
          personalPageService.getPhysicalAttributes = jest.fn(
            async (): Promise<CorePersonPhysicalAttributes> => ({
              ...corePersonPhysicalAttributesMock,
              height: undefined,
              weight: undefined,
            }),
          )
          const req = {
            params: { prisonerNumber: 'A1234BC' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ feetValue: undefined, inchesValue: undefined }),
          )
        })

        it('Sends a page view audit event', async () => {
          const req = {
            id: 1,
            params: { prisonerNumber: 'A1234BC' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'A1234BC',
            prisonId: 999,
            correlationId: req.id,
            page: Page.EditHeight,
          }

          await action(req, res)

          expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })

      describe('submit', () => {
        let validRequest: any
        const action = async (req: any, response: any) => controller.height().imperial.submit(req, response, () => {})

        beforeEach(() => {
          validRequest = {
            middleware: defaultMiddleware,
            params: { prisonerNumber: 'A1234BC' },
            body: { feet: '5', inches: '10' },
            flash: jest.fn(),
          } as any
        })

        it.each([
          { feet: '', inches: '', updateRequest: { height: null } },
          { feet: '5', inches: '2', updateRequest: { height: 157 } },
          { feet: '3', inches: '', updateRequest: { height: 91 } },
        ])('Valid request updates physical attributes: %s', async ({ feet, inches, updateRequest }) => {
          const request = { ...validRequest, body: { feet, inches } }
          await action(request, res)
          expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith(
            expect.anything(),
            prisonUserMock,
            expect.anything(),
            expect.objectContaining(updateRequest),
          )
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#height')
          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Height updated',
            type: FlashMessageType.success,
            fieldName: 'height',
          })
        })

        it('Handles API errors', async () => {
          personalPageService.updatePhysicalAttributes = async () => {
            throw new Error()
          }

          await action(validRequest, res)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
          expect(validRequest.flash).toHaveBeenCalledWith('requestBody', JSON.stringify(validRequest.body))
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/height/imperial')
        })

        it('Sends a post success audit event', async () => {
          const request = { ...validRequest, id: 1, body: { feet: '5', inches: '2' } }
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'A1234BC',
            correlationId: request.id,
            action: PostAction.EditHeight,
            details: { fieldName: heightFieldData.fieldName, previous: 100, updated: 157 },
          }

          await action(request, res)

          expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })
    })
  })

  describe('weight', () => {
    describe('metric', () => {
      describe('edit', () => {
        const action = async (req: any, response: any) => controller.weight().metric.edit(req, response, () => {})

        it('Renders the default edit page with the correct data from the prison person API', async () => {
          const req = {
            params: { prisonerNumber: 'A1234BC' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)

          expect(personalPageService.getPhysicalAttributes).toHaveBeenCalledWith('token', 'A1234BC')
          expect(res.render).toHaveBeenCalledWith('pages/edit/weightMetric', {
            pageTitle: 'Weight - Prisoner personal details',
            prisonerNumber: 'A1234BC',
            breadcrumbPrisonerName: 'Last, First',
            errors: [],
            fieldValue: 100,
            miniBannerData: {
              prisonerNumber: 'A1234BC',
              prisonerName: 'Last, First',
              cellLocation: '2-3-001',
              prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
            },
          })
        })

        it('Populates the errors from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'A1234BC' },
            flash: (key: string): any => {
              if (key === 'errors') return ['error']
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
        })

        it('Populates the field value from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'A1234BC' },
            flash: (key: string): any => {
              return key === 'requestBody' ? [JSON.stringify({ kilograms: '1234' })] : []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ fieldValue: '1234' }))
        })

        it('Sends a page view audit event', async () => {
          const req = {
            id: 1,
            params: { prisonerNumber: 'A1234BC' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'A1234BC',
            prisonId: 999,
            correlationId: req.id,
            page: Page.EditWeight,
          }

          await action(req, res)

          expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })

      describe('submit', () => {
        let validRequest: any
        const action = async (req: any, response: any) => controller.weight().metric.submit(req, response, () => {})

        beforeEach(() => {
          validRequest = {
            middleware: defaultMiddleware,
            params: { prisonerNumber: 'A1234BC' },
            body: { kilograms: '80' },
            flash: jest.fn(),
          } as any
        })

        it.each([
          { kilograms: '', updateRequest: { weight: null } },
          { kilograms: '50', updateRequest: { weight: 50 } },
          { kilograms: '12', updateRequest: { weight: 12 } },
          { kilograms: '640', updateRequest: { weight: 640 } },
        ])('Valid request: %s', async ({ kilograms, updateRequest }) => {
          const request = { ...validRequest, body: { kilograms } }
          await action(request, res)
          expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith(
            expect.anything(),
            prisonUserMock,
            expect.anything(),
            expect.objectContaining(updateRequest),
          )
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#weight')
          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Weight updated',
            type: FlashMessageType.success,
            fieldName: 'weight',
          })
        })

        it('Handles API errors', async () => {
          personalPageService.updatePhysicalAttributes = async () => {
            throw new Error()
          }

          await action(validRequest, res)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
          expect(validRequest.flash).toHaveBeenCalledWith('requestBody', JSON.stringify(validRequest.body))
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/weight')
        })

        it('Sends a post success audit event', async () => {
          const request = { ...validRequest, id: 1, body: { kilograms: '96' } }
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'A1234BC',
            correlationId: request.id,
            action: PostAction.EditWeight,
            details: { fieldName: weightFieldData.fieldName, previous: 100, updated: 96 },
          }

          await action(request, res)

          expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })
    })

    describe('imperial', () => {
      describe('edit', () => {
        const action = async (req: any, response: any) => controller.weight().imperial.edit(req, response, () => {})

        it('Renders the default edit page with the correct data', async () => {
          const req = {
            params: { prisonerNumber: 'A1234BC' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)

          expect(res.render).toHaveBeenCalledWith('pages/edit/weightImperial', {
            pageTitle: expect.anything(),
            prisonerNumber: 'A1234BC',
            breadcrumbPrisonerName: 'Last, First',
            errors: [],
            stoneValue: 15,
            poundsValue: 10,
            miniBannerData: {
              prisonerNumber: 'A1234BC',
              prisonerName: 'Last, First',
              cellLocation: '2-3-001',
              prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
            },
          })
        })

        it('Populates the errors from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'A1234BC' },
            flash: (key: string): any => {
              if (key === 'errors') return ['error']
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
        })

        it('Populates the field value from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'A1234BC' },
            flash: (key: string): any => {
              return key === 'requestBody' ? [JSON.stringify({ stone: '5', pounds: '10' })] : []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ stoneValue: '5', poundsValue: '10' }),
          )
        })

        it('Keeps the inputs empty when no weight exists', async () => {
          personalPageService.getPhysicalAttributes = jest.fn(
            async (): Promise<CorePersonPhysicalAttributes> => ({
              ...corePersonPhysicalAttributesMock,
              height: undefined,
              weight: undefined,
            }),
          )
          const req = {
            params: { prisonerNumber: 'A1234BC' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ stoneValue: undefined, poundsValue: undefined }),
          )
        })

        it('Sends a page view audit event', async () => {
          const req = {
            id: 1,
            params: { prisonerNumber: 'A1234BC' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'A1234BC',
            prisonId: 999,
            correlationId: req.id,
            page: Page.EditWeight,
          }

          await action(req, res)

          expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })

      describe('submit', () => {
        let validRequest: any
        const action = async (req: any, response: any) => controller.weight().imperial.submit(req, response, () => {})

        beforeEach(() => {
          validRequest = {
            middleware: defaultMiddleware,
            params: { prisonerNumber: 'A1234BC' },
            body: { stone: '10', pounds: '12' },
            flash: jest.fn(),
          } as any
        })

        it.each([
          { stone: '', pounds: '', updateRequest: { weight: null } },
          { stone: '5', pounds: '2', updateRequest: { weight: 33 } },
          { stone: '3', pounds: '', updateRequest: { weight: 19 } },
        ])('Valid request: %s', async ({ stone, pounds, updateRequest }) => {
          const request = { ...validRequest, body: { stone, pounds } }
          await action(request, res)
          expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith(
            expect.anything(),
            prisonUserMock,
            expect.anything(),
            expect.objectContaining(updateRequest),
          )
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#weight')
          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Weight updated',
            type: FlashMessageType.success,
            fieldName: 'weight',
          })
        })

        it('Handles API errors', async () => {
          personalPageService.updatePhysicalAttributes = async () => {
            throw new Error()
          }

          await action(validRequest, res)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
          expect(validRequest.flash).toHaveBeenCalledWith('requestBody', JSON.stringify(validRequest.body))
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/weight/imperial')
        })

        it('Sends a post success audit event', async () => {
          const request = { ...validRequest, id: 1, body: { stone: '15', pounds: '2' } }
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'A1234BC',
            correlationId: request.id,
            action: PostAction.EditWeight,
            details: { fieldName: weightFieldData.fieldName, previous: 100, updated: 96 },
          }

          await action(request, res)

          expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })
    })
  })

  /**
   * Tests for the generic radios edit pages - covers editing Hair type or colour, Facial hair, Face shape and Build
   */
  describe('physical characteristics radio field', () => {
    const fieldData: RadioFieldData = {
      pageTitle: 'Build',
      fieldName: 'build',
      code: 'buildCode',
      domain: CorePersonRecordReferenceDataDomain.build,
      auditEditPageLoad: 'PAGE' as Page,
      auditEditPostAction: 'ACTION' as PostAction,
      url: 'build',
      redirectAnchor: 'appearance',
      hintText: 'Hint text',
    }

    describe('edit', () => {
      const action = async (req: any, response: any) =>
        controller.physicalCharacteristicRadioField(fieldData).edit(req, response, () => {})

      it('Renders the radios edit page with the field data config supplied', async () => {
        const req = {
          id: '1',
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any

        await action(req, res)

        expect(personalPageService.getReferenceDataCodes).toHaveBeenCalledWith(
          'token',
          CorePersonRecordReferenceDataDomain.build,
        )
        expect(personalPageService.getPhysicalAttributes).toHaveBeenCalledWith('token', 'A1234BC')
        expect(res.render).toHaveBeenCalledWith('pages/edit/radioField', {
          pageTitle: 'Build - Prisoner personal details',
          formTitle: 'Build',
          prisonerNumber: 'A1234BC',
          breadcrumbPrisonerName: 'Last, First',
          errors: [],
          hintText: 'Hint text',
          options: objectToRadioOptions(buildCodesMock, 'code', 'description'),
          redirectAnchor: 'appearance',
          miniBannerData: {
            prisonerName: 'Last, First',
            prisonerNumber: 'A1234BC',
            cellLocation: '2-3-001',
            prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
          },
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          id: '1',
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Selects the correct radio using field value from the flash', async () => {
        const req = {
          id: '1',
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            if (key === 'requestBody') return [JSON.stringify({ radioField: 'MEDIUM' })]
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.arrayContaining([{ checked: true, text: 'Medium', value: 'MEDIUM' }]),
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          prisonId: 999,
          correlationId: req.id,
          page: fieldData.auditEditPageLoad,
        }

        await action(req, res)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: any
      const action = async (req: any, response: any) =>
        controller.physicalCharacteristicRadioField(fieldData).submit(req, response, () => {})

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware: defaultMiddleware,
          params: { prisonerNumber: 'A1234BC' },
          body: { radioField: 'MEDIUM' },
          flash: jest.fn(),
        } as any
      })

      it('Updates the physical characteristic', async () => {
        await action(validRequest, res)
        expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith('token', prisonUserMock, 'A1234BC', {
          buildCode: 'MEDIUM',
        })
      })

      it('Redirects to the personal page #appearance on success', async () => {
        await action(validRequest, res)
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#appearance')
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Build updated',
          type: FlashMessageType.success,
          fieldName: 'build',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updatePhysicalAttributes = async () => {
          throw new Error()
        }

        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/build')
      })

      it('Sends a post success audit event', async () => {
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          correlationId: validRequest.id,
          action: 'ACTION',
          details: {
            fieldName: fieldData.fieldName,
            previous: corePersonPhysicalAttributesMock.buildCode,
            updated: 'MEDIUM',
          },
        }

        await action(validRequest, res)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })

  describe('Smoker or vaper', () => {
    describe('Edit', () => {
      const action = async (req: any, response: any) => controller.smokerOrVaper().edit(req, response, () => {})

      it('Renders the default edit page with the correct data from the prison person API', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/edit/radioField', {
          pageTitle: 'Smoker or vaper - Prisoner personal details',
          formTitle: 'Does First Last smoke or vape?',
          prisonerNumber: 'A1234BC',
          breadcrumbPrisonerName: 'Last, First',
          hintText: undefined,
          errors: [],
          options: expect.arrayContaining([
            expect.objectContaining({ value: 'SMOKER_YES' }),
            expect.objectContaining({ value: 'SMOKER_VAPER' }),
            expect.objectContaining({ value: 'SMOKER_NO' }),
          ]),
          redirectAnchor: 'smoking-and-vaping',
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber: 'A1234BC',
            prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
          },
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Populates the field value from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'SMOKER_NO' })] : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.arrayContaining([expect.objectContaining({ value: 'SMOKER_NO', checked: true })]),
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          prisonId: 999,
          correlationId: req.id,
          page: Page.EditSmokerOrVaper,
        }

        await action(req, res)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: any
      const action = async (req: any, response: any) => controller.smokerOrVaper().submit(req, response, () => {})

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware: defaultMiddleware,
          params: { prisonerNumber: 'A1234BC' },
          body: { radioField: 'SMOKE_NO' },
          flash: jest.fn(),
        } as any
      })

      it('Updates the smoker or vaper', async () => {
        await action(validRequest, res)
        expect(personalPageService.updateSmokerOrVaper).toHaveBeenCalledWith(
          'token',
          prisonUserMock,
          'A1234BC',
          'SMOKE_NO',
        )
      })

      it('Redirects to the personal page #smoking-and-vaping on success', async () => {
        await action(validRequest, res)
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#smoking-and-vaping')
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Smoking and vaping updated',
          type: FlashMessageType.success,
          fieldName: 'smokerOrVaper',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updateSmokerOrVaper = async () => {
          throw new Error()
        }

        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/smoker-or-vaper')
      })

      it('Sends a post success audit event', async () => {
        const request = { ...validRequest, id: 1, body: { radioField: 'SMOKER_NO' } }
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          correlationId: request.id,
          action: PostAction.EditSmokerOrVaper,
          details: { fieldName: smokerOrVaperFieldData.fieldName, previous: 'SMOKER_YES', updated: 'SMOKER_NO' },
        }

        await action(request, res)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })

  describe('Nationality', () => {
    describe('Edit', () => {
      const action = async (req: any, response: any) => controller.nationality().edit(req, response, () => {})

      it('Renders the default edit page with the correct data from the prison person API', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/edit/nationality', {
          pageTitle: 'Nationality - Prisoner personal details',
          formTitle: `What is First Last's nationality?`,
          breadcrumbPrisonerName: 'Last, First',
          prisonerNumber: 'A1234BC',
          errors: [],
          radioOptions: expect.arrayContaining([expect.objectContaining({ text: 'British', value: 'BRIT' })]),
          autocompleteOptions: expect.arrayContaining([
            expect.objectContaining({ text: 'French', value: 'FREN' }),
            expect.objectContaining({ text: 'German', value: 'GERM' }),
          ]),
          additionalNationalitiesValue: 'Some other nationality',
          autocompleteSelected: false,
          autocompleteOptionTitle: 'A different nationality',
          autocompleteOptionLabel: 'Select nationality',
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber: 'A1234BC',
            prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
          },
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Populates the field value from the radio field using the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'BRIT' })] : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            radioOptions: expect.arrayContaining([expect.objectContaining({ value: 'BRIT', checked: true })]),
          }),
        )
      })

      it('Populates the autocompleteSelected value from the flash when no autocomplete option is chosen', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'OTHER' })] : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            radioOptions: expect.arrayContaining([expect.objectContaining({ value: 'BRIT' })]),
            autocompleteSelected: true,
          }),
        )
      })

      it('Populates the field value from the autocomplete field using the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'OTHER', autocompleteField: 'FREN' })] : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            radioOptions: expect.arrayContaining([expect.objectContaining({ value: 'BRIT' })]),
            autocompleteOptions: expect.arrayContaining([
              expect.objectContaining({ value: 'FREN', selected: true }),
              expect.objectContaining({ value: 'GERM' }),
            ]),
            autocompleteSelected: false,
          }),
        )
      })

      it('Populates the additional nationalities value from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            return key === 'requestBody' ? [JSON.stringify({ additionalNationalities: 'Some info' })] : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            additionalNationalitiesValue: 'Some info',
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          prisonId: 999,
          correlationId: req.id,
          page: Page.EditNationality,
        }

        await action(req, res)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: any
      const action = async (req: any, response: any) => controller.nationality().submit(req, response, () => {})

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware: defaultMiddleware,
          params: { prisonerNumber: 'A1234BC' },
          body: { radioField: 'BRIT' },
          flash: jest.fn(),
        } as any
      })

      it('Updates the nationality', async () => {
        await action(validRequest, res)
        expect(personalPageService.updateNationality).toHaveBeenCalledWith(
          'token',
          prisonUserMock,
          'A1234BC',
          'BRIT',
          null,
        )
      })

      it('Updates the nationality from the autocomplete field', async () => {
        const request = {
          ...validRequest,
          body: { radioField: 'OTHER', autocompleteField: 'FREN' },
        }
        await action(request, res)
        expect(personalPageService.updateNationality).toHaveBeenCalledWith(
          'token',
          prisonUserMock,
          'A1234BC',
          'FREN',
          null,
        )
      })

      it('Updates the other nationalities', async () => {
        const request = {
          ...validRequest,
          body: { radioField: 'BRIT', additionalNationalities: 'Updated nationalities' },
        }
        await action(request, res)
        expect(personalPageService.updateNationality).toHaveBeenCalledWith(
          'token',
          prisonUserMock,
          'A1234BC',
          'BRIT',
          'Updated nationalities',
        )
      })

      it('Redirects to the personal page #nationality on success', async () => {
        await action(validRequest, res)
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#nationality')
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Nationality updated',
          type: FlashMessageType.success,
          fieldName: 'nationality',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updateNationality = async () => {
          throw new Error()
        }

        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/nationality')
      })

      it('Sends a post success audit event', async () => {
        const request = {
          ...validRequest,
          id: 1,
          body: { radioField: 'FREN', additionalNationalities: 'Updated nationalities' },
        }
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          correlationId: request.id,
          action: PostAction.EditNationality,
          details: [
            { fieldName: nationalityFieldData.fieldName, previous: 'BRIT', updated: 'FREN' },
            { fieldName: 'otherNationalities', previous: 'Some other nationality', updated: 'Updated nationalities' },
          ],
        }

        await action(request, res)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })

  describe('physical attributes text input', () => {
    describe('edit', () => {
      const action = async (req: any, response: any) =>
        controller.physicalAttributesTextInput(shoeSizeFieldData).edit(req, response, () => {})

      it('Renders the default edit page with the correct data from the prison person API', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)

        expect(personalPageService.getPhysicalAttributes).toHaveBeenCalledWith('token', 'A1234BC')
        expect(res.render).toHaveBeenCalledWith('pages/edit/textField', {
          pageTitle: 'Shoe size - Prisoner personal details',
          formTitle: 'Shoe size',
          prisonerNumber: 'A1234BC',
          breadcrumbPrisonerName: 'Last, First',
          errors: [],
          hintText: shoeSizeFieldData.hintText,
          inputClasses: shoeSizeFieldData.inputClasses,
          fieldName: shoeSizeFieldData.fieldName,
          fieldValue: '11',
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber: 'A1234BC',
            prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
          },
          redirectAnchor: shoeSizeFieldData.redirectAnchor,
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Populates the field value from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            return key === 'requestBody' ? [JSON.stringify({ shoeSize: '1234' })] : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ fieldValue: '1234' }))
      })
    })

    describe('submit', () => {
      let validRequest: any
      const action = async (req: any, response: any) =>
        controller.physicalAttributesTextInput(shoeSizeFieldData).submit(req, response, () => {})

      beforeEach(() => {
        validRequest = {
          middleware: defaultMiddleware,
          params: { prisonerNumber: 'A1234BC' },
          body: { shoeSize: '10' },
          flash: jest.fn(),
        } as any
      })

      it.each([
        { shoeSize: '', updateRequest: { shoeSize: null } },
        { shoeSize: '10', updateRequest: { shoeSize: '10' } },
        { shoeSize: '7.5', updateRequest: { shoeSize: '7.5' } },
      ])('Valid request: %s', async ({ shoeSize, updateRequest }) => {
        const request = { ...validRequest, body: { shoeSize } }
        await action(request, res)
        expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith(
          expect.anything(),
          prisonUserMock,
          expect.anything(),
          expect.objectContaining(updateRequest),
        )
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#shoe-size')
        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Shoe size updated',
          type: FlashMessageType.success,
          fieldName: 'shoeSize',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updatePhysicalAttributes = async () => {
          throw new Error()
        }

        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/shoe-size')
      })
    })
  })

  describe('city or town of birth', () => {
    describe('edit', () => {
      const action = async (req: any, response: any) =>
        controller.cityOrTownOfBirthTextInput().edit(req, response, () => {})

      it('Renders the default edit page with the correct data from the prison API', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/edit/textField', {
          pageTitle: 'City or town of birth - Prisoner personal details',
          formTitle: 'City or town of birth',
          prisonerNumber: 'A1234BC',
          breadcrumbPrisonerName: 'Last, First',
          errors: [],
          hintText: cityOrTownOfBirthFieldData.hintText,
          inputClasses: cityOrTownOfBirthFieldData.inputClasses,
          fieldName: cityOrTownOfBirthFieldData.fieldName,
          fieldValue: 'Sheffield',
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber: 'A1234BC',
            prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
          },
          redirectAnchor: 'city-or-town-of-birth',
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Populates the field value from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            return key === 'requestBody' ? [JSON.stringify({ cityOrTownOfBirth: 'SHEFFIELD' })] : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ fieldValue: 'SHEFFIELD' }))
      })
    })

    describe('submit', () => {
      let validRequest: any
      const action = async (req: any, response: any) =>
        controller.cityOrTownOfBirthTextInput().submit(req, response, () => {})

      beforeEach(() => {
        validRequest = {
          middleware: defaultMiddleware,
          params: { prisonerNumber: 'A1234BC' },
          body: { cityOrTownOfBirth: 'Sheffield' },
          flash: jest.fn(),
        } as any
      })

      it.each([
        { cityOrTownOfBirth: '', updateRequest: null },
        { cityOrTownOfBirth: 'Rotherham', updateRequest: 'Rotherham' },
      ])('Valid request: %s', async ({ cityOrTownOfBirth, updateRequest }) => {
        const request = { ...validRequest, body: { cityOrTownOfBirth } }
        await action(request, res)
        expect(personalPageService.updateCityOrTownOfBirth).toHaveBeenCalledWith(
          expect.anything(),
          prisonUserMock,
          expect.anything(),
          updateRequest,
        )
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#city-or-town-of-birth')
        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'City or town of birth updated',
          type: FlashMessageType.success,
          fieldName: 'cityOrTownOfBirth',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updateCityOrTownOfBirth = async () => {
          throw new Error()
        }

        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/city-or-town-of-birth')
      })
    })
  })

  describe('country of birth', () => {
    describe('edit', () => {
      const action = async (req: any, response: any) => controller.countryOfBirth().edit(req, response, () => {})

      it('Renders the default edit page with the correct data from the prison API', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/edit/radioFieldWithAutocomplete', {
          pageTitle: 'Country of birth - Prisoner personal details',
          formTitle: 'What country was First Last born in?',
          prisonerNumber: 'A1234BC',
          breadcrumbPrisonerName: 'Last, First',
          errors: [],
          radioOptions: [{ value: 'ENG', text: 'England' }],
          autocompleteOptions: [{ value: 'FRA', text: 'France' }],
          autocompleteOptionTitle: 'A different country',
          autocompleteOptionLabel: 'Country name',
          autocompleteSelected: false,
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber: 'A1234BC',
            prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
          },
          redirectAnchor: 'country-of-birth',
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Populates the radio buttons from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'ENG' })] : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            autocompleteSelected: false,
            radioOptions: [{ checked: true, text: 'England', value: 'ENG' }],
          }),
        )
      })

      it('Populates the autocomplete from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            return key === 'requestBody' ? [JSON.stringify({ autocompleteField: 'FRA' })] : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            autocompleteOptions: [{ selected: true, text: 'France', value: 'FRA' }],
          }),
        )
      })

      it('Selects the autocomplete radio when the flash indicates an empty autocomplete field', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'OTHER' })] : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ autocompleteSelected: true }),
        )
      })

      it('Selects the autocomplete radio when the flash indicates an invalid autocomplete field', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'OTHER__VALIDATION_ERROR' })] : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ autocompleteSelected: true }),
        )
      })
    })

    describe('submit', () => {
      let validRequest: any
      const action = async (req: any, response: any) => controller.countryOfBirth().submit(req, response, () => {})

      beforeEach(() => {
        validRequest = {
          middleware: defaultMiddleware,
          params: { prisonerNumber: 'A1234BC' },
          body: { radioField: 'ENG' },
          flash: jest.fn(),
        } as any
      })

      it.each([
        { body: { radioField: 'ENG' }, updateRequest: 'ENG' },
        { body: { radioField: 'OTHER', autocompleteField: 'FRA' }, updateRequest: 'FRA' },
      ])('Valid request: %s', async ({ body, updateRequest }) => {
        const request = { ...validRequest, body }
        await action(request, res)
        expect(personalPageService.updateCountryOfBirth).toHaveBeenCalledWith(
          expect.anything(),
          prisonUserMock,
          expect.anything(),
          updateRequest,
        )
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#country-of-birth')
        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Country of birth updated',
          type: FlashMessageType.success,
          fieldName: 'countryOfBirth',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updateCountryOfBirth = async () => {
          throw new Error()
        }

        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/country-of-birth')
      })
    })
  })

  /**
   * Tests for the eye colour edit page - where both eyes are the same colour
   */
  describe('eyeColour', () => {
    describe('edit', () => {
      const action = async (req: any, response: any) => controller.eyeColour().edit(req, response, () => {})

      it('Renders the eye colour edit page', async () => {
        const req = {
          id: '1',
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any

        await action(req, res)

        expect(personalPageService.getReferenceDataCodes).toHaveBeenCalledWith(
          'token',
          CorePersonRecordReferenceDataDomain.leftEyeColour,
        )
        expect(personalPageService.getPhysicalAttributes).toHaveBeenCalledWith('token', 'A1234BC')
        expect(res.render).toHaveBeenCalledWith('pages/edit/eyeColour', {
          pageTitle: 'Eye colour - Prisoner personal details',
          formTitle: 'Eye colour',
          prisonerNumber: 'A1234BC',
          breadcrumbPrisonerName: 'Last, First',
          errors: [],
          options: objectToRadioOptions(
            eyeColourCodesMock,
            'code',
            'description',
            corePersonPhysicalAttributesMock.leftEyeColourCode,
          ),
          miniBannerData: {
            prisonerName: 'Last, First',
            prisonerNumber: 'A1234BC',
            cellLocation: '2-3-001',
            prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
          },
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          id: '1',
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Selects the correct radio using field value from the flash', async () => {
        const req = {
          id: '1',
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            if (key === 'requestBody') return [JSON.stringify({ eyeColour: 'GREEN' })]
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.arrayContaining([{ checked: true, text: 'Green', value: 'GREEN' }]),
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          prisonId: 999,
          correlationId: req.id,
          page: Page.EditEyeColour,
        }

        await action(req, res)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: any
      const action = async (req: any, response: any) => controller.eyeColour().submit(req, response, () => {})

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware: defaultMiddleware,
          params: { prisonerNumber: 'A1234BC' },
          body: { eyeColour: 'GREEN' },
          flash: jest.fn(),
        } as any
      })

      it('Updates the physical characteristic', async () => {
        await action(validRequest, res)
        expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith('token', prisonUserMock, 'A1234BC', {
          leftEyeColourCode: 'GREEN',
          rightEyeColourCode: 'GREEN',
        })
      })

      it('Redirects to the personal page #eye-colour on success', async () => {
        await action(validRequest, res)
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#eye-colour')
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Eye colour updated',
          type: FlashMessageType.success,
          fieldName: 'eyeColour',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updatePhysicalAttributes = async () => {
          throw new Error()
        }

        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/eye-colour')
      })

      it('Sends a post success audit event', async () => {
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          correlationId: validRequest.id,
          action: PostAction.EditEyeColour,
          details: {
            fieldName: 'eyeColour',
            previous: { leftEyeColourCode: 'BLUE', rightEyeColourCode: 'BLUE' },
            updated: { leftEyeColourCode: 'GREEN', rightEyeColourCode: 'GREEN' },
          },
        }

        await action(validRequest, res)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })

  /**
   * Tests for the eye colour edit page - where left and right eyes are different colours
   */
  describe('eyeColourIndividual', () => {
    describe('edit', () => {
      const action = async (req: any, response: any) => controller.eyeColourIndividual().edit(req, response, () => {})

      it('Renders the eye colour edit page', async () => {
        const req = {
          id: '1',
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any

        await action(req, res)

        expect(personalPageService.getReferenceDataCodes).toHaveBeenCalledWith(
          'token',
          CorePersonRecordReferenceDataDomain.leftEyeColour,
        )
        expect(personalPageService.getReferenceDataCodes).toHaveBeenCalledWith(
          'token',
          CorePersonRecordReferenceDataDomain.rightEyeColour,
        )
        expect(personalPageService.getPhysicalAttributes).toHaveBeenCalledWith('token', 'A1234BC')
        expect(res.render).toHaveBeenCalledWith('pages/edit/eyeColourIndividual', {
          pageTitle: 'Left and right eye colours - Prisoner personal details',
          formTitle: 'Left and right eye colours',
          prisonerNumber: 'A1234BC',
          breadcrumbPrisonerName: 'Last, First',
          errors: [],
          leftOptions: objectToRadioOptions(
            eyeColourCodesMock,
            'code',
            'description',
            corePersonPhysicalAttributesMock.leftEyeColourCode,
          ),
          rightOptions: objectToRadioOptions(
            eyeColourCodesMock,
            'code',
            'description',
            corePersonPhysicalAttributesMock.rightEyeColourCode,
          ),
          miniBannerData: {
            prisonerName: 'Last, First',
            prisonerNumber: 'A1234BC',
            cellLocation: '2-3-001',
            prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
          },
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          id: '1',
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Selects the correct radio using field value from the flash', async () => {
        const req = {
          id: '1',
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            if (key === 'requestBody') return [JSON.stringify({ leftEyeColour: 'BROWN', rightEyeColour: 'GREEN' })]
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            leftOptions: expect.arrayContaining([{ checked: true, text: 'Brown', value: 'BROWN' }]),
            rightOptions: expect.arrayContaining([{ checked: true, text: 'Green', value: 'GREEN' }]),
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          prisonId: 999,
          correlationId: req.id,
          page: Page.EditEyeColour,
        }

        await action(req, res)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: any
      const action = async (req: any, response: any) => controller.eyeColourIndividual().submit(req, response, () => {})

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware: defaultMiddleware,
          params: { prisonerNumber: 'A1234BC' },
          body: { leftEyeColour: 'BROWN', rightEyeColour: 'GREEN' },
          flash: jest.fn(),
        } as any
      })

      it('Updates the physical characteristic', async () => {
        await action(validRequest, res)
        expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith('token', prisonUserMock, 'A1234BC', {
          leftEyeColourCode: 'BROWN',
          rightEyeColourCode: 'GREEN',
        })
      })

      it('Redirects to the personal page #eye-colour on success', async () => {
        await action(validRequest, res)
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#eye-colour')
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Left and right eye colours updated',
          type: FlashMessageType.success,
          fieldName: 'eyeColour',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updatePhysicalAttributes = async () => {
          throw new Error()
        }

        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/eye-colour-individual')
      })

      it('Sends a post success audit event', async () => {
        const request = { ...validRequest, id: 1, body: { leftEyeColour: 'BROWN', rightEyeColour: 'GREEN' } }
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          correlationId: request.id,
          action: PostAction.EditEyeColour,
          details: {
            fieldName: 'eyeColour',
            previous: {
              leftEyeColourCode: corePersonPhysicalAttributesMock.leftEyeColourCode,
              rightEyeColourCode: corePersonPhysicalAttributesMock.rightEyeColourCode,
            },
            updated: { leftEyeColourCode: 'BROWN', rightEyeColourCode: 'GREEN' },
          },
        }

        await action(request, res)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })

  describe('Diet and food allergies', () => {
    describe('Edit', () => {
      const action = async (req: any, response: any) => controller.dietAndFoodAllergies().edit(req, response, () => {})
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
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/edit/dietAndFoodAllergies', {
          pageTitle: expect.anything(),
          prisonerNumber: 'A1234BC',
          prisonerName: 'First Last',
          breadcrumbPrisonerName: 'Last, First',
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber: 'A1234BC',
            prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
          },
          errors: [],
          ...editOptions({ selections: [] }),
        })
      })

      it('Renders the edit page with the correct data from the health and medications api when data is present', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)

        expect(personalPageService.getHealthAndMedication).toHaveBeenCalledWith(expect.anything(), 'A1234BC')
        expect(res.render).toHaveBeenCalledWith('pages/edit/dietAndFoodAllergies', {
          pageTitle: expect.anything(),
          prisonerNumber: 'A1234BC',
          prisonerName: 'First Last',
          breadcrumbPrisonerName: 'Last, First',
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber: 'A1234BC',
            prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
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
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Populates the field value from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
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
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
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
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          prisonId: 999,
          correlationId: req.id,
          page: Page.EditDietAndFoodAllergies,
        }

        await action(req, res)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: any
      const action = async (req: any, response: any) =>
        controller.dietAndFoodAllergies().submit(req, response, () => {})

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware: defaultMiddleware,
          params: { prisonerNumber: 'A1234BC' },
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
        } as any
      })

      it('Redirects to the personal page #diet-and-food-allergies on success', async () => {
        await action(validRequest, res)
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#diet-and-food-allergies')
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Diet and food allergies updated',
          type: FlashMessageType.success,
          fieldName: 'dietAndFoodAllergies',
        })
      })

      it('Updates the prisoner health on success', async () => {
        await action(validRequest, res)
        expect(personalPageService.updateDietAndFoodAllergies).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          'A1234BC',
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

        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/diet-and-food-allergies')
      })

      it('Sends a post success audit event', async () => {
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
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

        await action(validRequest, res)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })

  describe('religion, faith or belief', () => {
    describe('edit', () => {
      const action = async (req: any, response: any) => controller.religion().edit(req, response, () => {})

      it('Renders the default edit page with the correct data from the prison API, overriding option text and sorting correctly', async () => {
        const expectedOptions = [
          { text: 'Buddhist', value: 'BUDD' },
          {
            text: 'Christian – Anglican',
            value: 'COFE',
            hint: {
              text: 'Includes Church of England, Church of Ireland, Church in Wales, Church of Norway, Church of Sweden, Episcopalian, and Lutheran',
            },
          },
          { text: 'Christian – Methodist', value: 'METH' },
          {
            text: 'Christian – Orthodox',
            value: 'CHRODX',
            hint: {
              text: 'Includes Bulgarian Orthodox, Eastern Orthodox, Greek Orthodox, Romanian Orthodox, Russian Orthodox, Serbian Orthodox, and Ukrainian Orthodox',
            },
          },
          { text: 'Christian – Oriental Orthodox', value: 'OORTH' },
          {
            text: 'Christian – Other',
            value: 'CHRST',
            hint: {
              text: 'Includes Apostolic, Calvinist, Celestial Church of God, Church of Scotland, Congregational, Dutch Reform Church, Evangelical, Gospel, Nonconformist, Pentecostal, Protestant, Salvation Army, United Reformed, and Welsh Independent',
            },
          },
          { text: 'Muslim – Shia', value: 'SHIA' },
          {
            text: 'Muslim – Sunni',
            value: 'SUNI',
            hint: {
              text: 'Most Muslims in the UK are Sunni, they will often describe themselves just as Muslim',
            },
          },
          { text: 'Muslim – Other', value: 'MUSOTH' },
          { text: 'Zoroastrian', value: 'ZORO' },
          { divider: 'Or' },
          {
            text: 'Other religion, faith or belief',
            value: 'OTH',
            hint: {
              text: 'Includes Christadelphian, Unification, Unitarian and all other religions, faiths or beliefs',
            },
          },
          { text: 'No religion, faith or belief', value: 'NIL' },
          { text: 'They prefer not to say', value: 'TPRNTS' },
        ]
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/edit/religion', {
          pageTitle: 'Religion, faith or belief - Prisoner personal details',
          formTitle: `Select First Last’s religion, faith or belief`,
          redirectAnchor: 'religion-faith-or-belief',
          prisonerNumber: 'A1234BC',
          currentReasonForChange: undefined,
          currentReasonForChangeUnknown: undefined,
          currentReasonKnown: undefined,
          currentReligion: {
            id: 'RELF_BUDD',
            code: 'BUDD',
            description: 'Buddhist',
            isActive: true,
            listSequence: 99,
          },
          breadcrumbPrisonerName: 'Last, First',
          errors: [],
          options: expectedOptions,
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber: 'A1234BC',
            prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
          },
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Populates the religion radio buttons from the flash', async () => {
        const expectedOptions = [
          { text: 'Buddhist', value: 'BUDD' },
          {
            text: 'Christian – Anglican',
            value: 'COFE',
            hint: {
              text: 'Includes Church of England, Church of Ireland, Church in Wales, Church of Norway, Church of Sweden, Episcopalian, and Lutheran',
            },
          },
          { text: 'Christian – Methodist', value: 'METH' },
          {
            text: 'Christian – Orthodox',
            value: 'CHRODX',
            hint: {
              text: 'Includes Bulgarian Orthodox, Eastern Orthodox, Greek Orthodox, Romanian Orthodox, Russian Orthodox, Serbian Orthodox, and Ukrainian Orthodox',
            },
          },
          { text: 'Christian – Oriental Orthodox', value: 'OORTH' },
          {
            text: 'Christian – Other',
            value: 'CHRST',
            hint: {
              text: 'Includes Apostolic, Calvinist, Celestial Church of God, Church of Scotland, Congregational, Dutch Reform Church, Evangelical, Gospel, Nonconformist, Pentecostal, Protestant, Salvation Army, United Reformed, and Welsh Independent',
            },
          },
          { text: 'Muslim – Shia', value: 'SHIA' },
          {
            text: 'Muslim – Sunni',
            value: 'SUNI',
            hint: {
              text: 'Most Muslims in the UK are Sunni, they will often describe themselves just as Muslim',
            },
          },
          { text: 'Muslim – Other', value: 'MUSOTH' },
          { text: 'Zoroastrian', value: 'ZORO', checked: true },
          { divider: 'Or' },
          {
            text: 'Other religion, faith or belief',
            value: 'OTH',
            hint: {
              text: 'Includes Christadelphian, Unification, Unitarian and all other religions, faiths or beliefs',
            },
          },
          { text: 'No religion, faith or belief', value: 'NIL' },
          { text: 'They prefer not to say', value: 'TPRNTS' },
        ]

        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            return key === 'requestBody' ? [JSON.stringify({ religion: 'ZORO' })] : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expectedOptions,
          }),
        )
      })

      it('Populates the reason for change radio from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            return key === 'requestBody' ? [JSON.stringify({ reasonKnown: 'YES' })] : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            currentReasonKnown: 'YES',
          }),
        )
      })

      it('Populates the text areas from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            return key === 'requestBody'
              ? [JSON.stringify({ reasonForChange: 'Reason 1', reasonForChangeUnknown: 'Reason 2' })]
              : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            currentReasonForChange: 'Reason 1',
            currentReasonForChangeUnknown: 'Reason 2',
          }),
        )
      })
    })

    describe('submit', () => {
      let validRequest: any
      const action = async (req: any, response: any) => controller.religion().submit(req, response, () => {})

      beforeEach(() => {
        validRequest = {
          middleware: defaultMiddleware,
          params: { prisonerNumber: 'A1234BC' },
          body: { religion: 'ZORO', reasonKnown: 'NO' },
          flash: jest.fn(),
        } as any
      })

      it.each([
        { body: { religion: 'ZORO', reasonKnown: 'NO' }, updatedReligion: 'ZORO' },
        {
          body: { religion: 'ZORO', reasonKnown: 'NO', reasonForChangeUnknown: 'Not sure' },
          updatedReligion: 'ZORO',
          reason: 'Not sure',
        },
        {
          body: {
            religion: 'ZORO',
            reasonKnown: 'NO',
            reasonForChange: 'Some reason',
            reasonForChangeUnknown: 'Not sure',
          },
          updatedReligion: 'ZORO',
          reason: 'Not sure',
        },
        {
          body: { religion: 'ZORO', reasonKnown: 'YES', reasonForChange: 'Some reason' },
          updatedReligion: 'ZORO',
          reason: 'Some reason',
        },
        {
          body: {
            religion: 'ZORO',
            reasonKnown: 'YES',
            reasonForChange: 'Some reason',
            reasonForChangeUnknown: 'Not sure',
          },
          updatedReligion: 'ZORO',
          reason: 'Some reason',
        },
      ])('Prisoner with existing religion - valid request: %s', async ({ body, updatedReligion, reason }) => {
        const request = { ...validRequest, body }
        await action(request, res)
        expect(personalPageService.updateReligion).toHaveBeenCalledWith(
          expect.anything(),
          prisonUserMock,
          expect.anything(),
          updatedReligion,
          reason,
        )
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#religion-faith-or-belief')
        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Religion, faith or belief updated',
          type: FlashMessageType.success,
          fieldName: 'religion',
        })
      })

      it.each([
        {
          body: { religion: 'ZORO' },
          updatedReligion: 'ZORO',
        },
        {
          body: { religion: 'ZORO', reasonForChange: 'Some reason' },
          updatedReligion: 'ZORO',
          reason: 'Some reason',
        },
      ])('Prisoner without existing religion - valid request: %s', async ({ body, updatedReligion, reason }) => {
        const request = {
          middleware: {
            clientToken: 'token',
            prisonerData: {
              firstName: 'First',
              lastName: 'Last',
              cellLocation: '2-3-001',
              prisonerNumber: 'A1234BC',
              prisonId: 999,
            },
            inmateDetail: {
              birthPlace: 'SHEFFIELD',
              profileInformation: [],
            } as InmateDetail,
          },
          params: { prisonerNumber: 'A1234BC' },
          body,
          flash: jest.fn(),
        } as any

        await action(request, res)

        expect(personalPageService.updateReligion).toHaveBeenCalledWith(
          expect.anything(),
          prisonUserMock,
          expect.anything(),
          updatedReligion,
          reason,
        )
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#religion-faith-or-belief')
        expect(request.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Religion, faith or belief updated',
          type: FlashMessageType.success,
          fieldName: 'religion',
        })
      })

      it('Sends a post success audit event', async () => {
        const request = {
          ...validRequest,
          id: 1,
          body: { religion: 'ZORO', currentReligionCode: 'DRU', reasonKnown: 'NO' },
        }
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          correlationId: request.id,
          action: PostAction.EditReligion,
          details: {
            fieldName: 'religion',
            previous: 'DRU',
            updated: 'ZORO',
          },
        }

        await action(request, res)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })

      it('Does not submit a request if no religion was selected', async () => {
        const request = {
          ...validRequest,
          id: 1,
          body: {},
        }

        await action(request, res)

        expect(auditService.sendPostSuccess).not.toHaveBeenCalled()
        expect(personalPageService.updateReligion).not.toHaveBeenCalled()
      })

      it('Handles API errors', async () => {
        personalPageService.updateReligion = async () => {
          throw new Error()
        }

        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/religion')
      })
    })
  })

  describe('Sexual orientation', () => {
    describe('Edit', () => {
      const action = async (req: any, response: any) => controller.sexualOrientation().edit(req, response, () => {})
      const expectedOptions = [
        { text: 'Heterosexual or straight', value: 'HET', checked: true },
        { text: 'Gay or lesbian', value: 'HOM' },
        { text: 'Bisexual', value: 'BIS' },
        { text: 'Other', value: 'OTH' },
        { divider: 'Or' },
        { text: 'They prefer not to say', value: 'ND' },
      ]

      it('Renders the default edit page with the correct data from the prison person API', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/edit/radioField', {
          pageTitle: 'Sexual orientation - Prisoner personal details',
          formTitle: `Which of the following best describes First Last’s sexual orientation?`,
          prisonerNumber: 'A1234BC',
          breadcrumbPrisonerName: 'Last, First',
          hintText: undefined,
          errors: [],
          options: expectedOptions,
          redirectAnchor: 'sexual-orientation',
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber: 'A1234BC',
            prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
          },
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Populates the field value from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'HOM' })] : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.arrayContaining([expect.objectContaining({ value: 'HOM', checked: true })]),
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          prisonId: 999,
          correlationId: req.id,
          page: Page.EditSexualOrientation,
        }

        await action(req, res)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: any
      const action = async (req: any, response: any) => controller.sexualOrientation().submit(req, response, () => {})

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware: defaultMiddleware,
          params: { prisonerNumber: 'A1234BC' },
          body: { radioField: 'HET' },
          flash: jest.fn(),
        } as any
      })

      it('Updates the sexual orientation', async () => {
        await action(validRequest, res)
        expect(personalPageService.updateSexualOrientation).toHaveBeenCalledWith(
          'token',
          prisonUserMock,
          'A1234BC',
          'HET',
        )
      })

      it('Redirects to the personal page #sexual-orientation on success', async () => {
        await action(validRequest, res)
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#sexual-orientation')
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Sexual orientation updated',
          type: FlashMessageType.success,
          fieldName: 'sexualOrientation',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updateSexualOrientation = async () => {
          throw new Error()
        }

        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/sexual-orientation')
      })

      it('Sends a post success audit event', async () => {
        const request = { ...validRequest, id: 1, body: { radioField: 'HOM' } }
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          correlationId: request.id,
          action: PostAction.EditSexualOrientation,
          details: { fieldName: sexualOrientationFieldData.fieldName, previous: 'HET', updated: 'HOM' },
        }

        await action(request, res)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })

  describe('Number of children', () => {
    describe('Edit', () => {
      const action = async (req: any, response: any) => controller.numberOfChildren().edit(req, response, () => {})

      it('Renders the default edit page with the correct data from the prison person API', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/edit/children', {
          pageTitle: 'Children - Prisoner personal details',
          formTitle: `Does First Last have any children?`,
          prisonerNumber: 'A1234BC',
          breadcrumbPrisonerName: 'Last, First',
          errors: [],
          redirectAnchor: 'number-of-children',
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber: 'A1234BC',
            prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
          },
          radioFieldValue: 'YES',
          currentNumberOfChildren: '2',
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Populates the field values from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            return key === 'requestBody' ? [JSON.stringify({ hasChildren: 'YES', numberOfChildren: '4' })] : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            radioFieldValue: 'YES',
            currentNumberOfChildren: '4',
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          prisonId: 999,
          correlationId: req.id,
          page: Page.EditNumberOfChildren,
        }

        await action(req, res)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: any
      const action = async (req: any, response: any) => controller.numberOfChildren().submit(req, response, () => {})

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware: defaultMiddleware,
          params: { prisonerNumber: 'A1234BC' },
          body: { hasChildren: 'YES', numberOfChildren: '5' },
          flash: jest.fn(),
        } as any

        personalPageService.updateNumberOfChildren = jest.fn()
      })

      it('Updates the number of children', async () => {
        await action(validRequest, res)
        expect(personalPageService.updateNumberOfChildren).toHaveBeenCalledWith('token', prisonUserMock, 'A1234BC', 5)
      })

      it(`Updates the number of children to 0 if 'NO' selected as answer`, async () => {
        await action(
          {
            ...validRequest,
            body: { hasChildren: 'NO' },
          },
          res,
        )
        expect(personalPageService.updateNumberOfChildren).toHaveBeenCalledWith('token', prisonUserMock, 'A1234BC', 0)
      })

      it('Redirects to the personal page #number-of-children on success', async () => {
        await action(validRequest, res)
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#number-of-children')
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Number of children updated',
          type: FlashMessageType.success,
          fieldName: 'numberOfChildren',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updateNumberOfChildren = async () => {
          throw new Error()
        }

        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/children')
      })

      it('Sends a post success audit event', async () => {
        const request = { ...validRequest, id: 1, body: { hasChildren: 'YES', numberOfChildren: '5' } }
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          correlationId: request.id,
          action: PostAction.EditNumberOfChildren,
          details: { fieldName: numberOfChildrenFieldData.fieldName, previous: '2', updated: '5' },
        }

        await action(request, res)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })

  describe('Domestic status', () => {
    describe('Edit', () => {
      const action = async (req: any, response: any) => controller.domesticStatus().edit(req, response, () => {})
      const referenceData: ReferenceDataCodeDto[] = [
        {
          id: '1',
          code: 'S',
          description: 'Single',
          listSequence: 99,
          isActive: true,
        },
        {
          id: '2',
          code: 'M',
          description: 'Married',
          listSequence: 99,
          isActive: true,
        },
        {
          id: '3',
          code: 'N',
          description: 'The prefer not to say',
          listSequence: 99,
          isActive: true,
        },
      ]

      beforeEach(() => {
        personalPageService.getDomesticStatusReferenceData = jest.fn(async () => referenceData)
      })

      it('Renders the default edit page with the correct data', async () => {
        const expectedOptions = [
          { text: 'Single', value: 'S', checked: true },
          { text: 'Married', value: 'M' },
          { divider: 'Or' },
          { text: 'They prefer not to say', value: 'N' },
        ]

        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/edit/radioField', {
          pageTitle: 'Marital or civil partnership status - Prisoner personal details',
          formTitle: `What is First Last’s marital or civil partnership status?`,
          prisonerNumber: 'A1234BC',
          breadcrumbPrisonerName: 'Last, First',
          hintText: undefined,
          errors: [],
          options: expectedOptions,
          redirectAnchor: 'marriage-or-civil-partnership-status',
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber: 'A1234BC',
            prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
          },
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Populates the field value from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (key: string): any => {
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'M' })] : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.arrayContaining([expect.objectContaining({ value: 'M', checked: true })]),
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          prisonId: 999,
          correlationId: req.id,
          page: Page.EditDomesticStatus,
        }

        await action(req, res)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: any
      const action = async (req: any, response: any) => controller.domesticStatus().submit(req, response, () => {})

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware: defaultMiddleware,
          params: { prisonerNumber: 'A1234BC' },
          body: { radioField: 'M' },
          flash: jest.fn(),
        } as any
      })

      it('Updates the domestic status', async () => {
        await action(validRequest, res)
        expect(personalPageService.updateDomesticStatus).toHaveBeenCalledWith('token', prisonUserMock, 'A1234BC', 'M')
      })

      it('Redirects to the personal page #marriage-or-civil-partnership-status on success', async () => {
        await action(validRequest, res)
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#marriage-or-civil-partnership-status')
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Marital or civil partnership status updated',
          type: FlashMessageType.success,
          fieldName: 'domesticStatus',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updateDomesticStatus = async () => {
          throw new Error()
        }

        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/marital-status')
      })

      it('Sends a post success audit event', async () => {
        const request = { ...validRequest, id: 1, body: { radioField: 'M' } }
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          correlationId: request.id,
          action: PostAction.EditDomesticStatus,
          details: { fieldName: domesticStatusFieldData.fieldName, previous: 'S', updated: 'M' },
        }

        await action(request, res)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })

  describe('Emails', () => {
    describe('Creating an email', () => {
      describe('edit', () => {
        const action = async (req: any, response: any) => controller.globalEmails().add.edit(req, response, () => {})

        beforeEach(() => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn(async () => globalPhonesAndEmailsMock)
        })

        it('Renders the default edit page with the correct data', async () => {
          const req = {
            params: { prisonerNumber: 'A1234BC', emailAddressId: '234' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)

          expect(res.render).toHaveBeenCalledWith('pages/edit/textFields/addEmail', {
            pageTitle: 'Add this person’s email address - Prisoner personal details',
            formTitle: `Add First Last’s email address`,
            hintText: 'For example name@email.co.uk',
            fieldName: 'emailAddress',
            fieldValue: '',
            inputClasses: 'govuk-!-width-one-third',
            submitButtonText: 'Save and return to profile',
            prisonerNumber: 'A1234BC',
            breadcrumbPrisonerName: 'Last, First',
            redirectAnchor: 'phones-and-emails',
            errors: [],
            miniBannerData: {
              cellLocation: '2-3-001',
              prisonerName: 'Last, First',
              prisonerNumber: 'A1234BC',
              prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
            },
          })
        })

        it('Populates the errors from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'A1234BC', emailAddressId: '234' },
            flash: (key: string): any => {
              if (key === 'errors') return ['error']
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
        })

        it('Populates the field value from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'A1234BC', emailAddressId: '234' },
            flash: (key: string): any => {
              return key === 'requestBody' ? [JSON.stringify({ emailAddress: 'foo@bar.com' })] : []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ fieldValue: 'foo@bar.com' }),
          )
        })

        it('Sends a page view audit event', async () => {
          const req = {
            id: 1,
            params: { prisonerNumber: 'A1234BC', emailAddressId: '234' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'A1234BC',
            prisonId: 999,
            correlationId: req.id,
            page: Page.AddEmailAddress,
          }

          await action(req, res)

          expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })

      describe('submit', () => {
        let validRequest: any
        const action = async (req: any, response: any) => controller.globalEmails().add.submit(req, response, () => {})

        beforeEach(() => {
          validRequest = {
            id: '1',
            middleware: defaultMiddleware,
            params: { prisonerNumber: 'A1234BC', emailAddressId: '234' },
            body: { emailAddress: 'fOO@exaMple.com' },
            flash: jest.fn(),
          } as any

          personalPageService.getGlobalPhonesAndEmails = jest.fn(async () => globalPhonesAndEmailsMock)
        })

        it('Updates the email', async () => {
          await action(validRequest, res)
          expect(personalPageService.createGlobalEmail).toHaveBeenCalledWith('token', 'A1234BC', 'foo@example.com')
        })

        it('Redirects to the personal page #phones-and-emais on success', async () => {
          await action(validRequest, res)
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#phones-and-emails')
        })

        it('Redirects back when add another is added as a query param', async () => {
          await action({ ...validRequest, query: { addAnother: 'true' } }, res)
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/add-email-address')
        })

        it('Adds the success message to the flash', async () => {
          await action(validRequest, res)

          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Email address updated',
            type: FlashMessageType.success,
            fieldName: 'emailAddress',
          })
        })

        it('Handles duplicate emails', async () => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn().mockResolvedValue({
            emails: [{ email: 'foo@example.com' }],
            phones: [],
          })

          validRequest.body = { emailAddress: ' Foo@ eXAMplE.com' }

          await action(validRequest, res)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [
            {
              href: '#email',
              text: 'This email address already exists for this person. Add a new email or edit the saved one',
            },
          ])

          expect(validRequest.flash).not.toHaveBeenCalledWith('errors', [
            {
              text: 'There was an error please try again',
            },
          ])

          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/add-email-address')
        })

        it('Handles API errors', async () => {
          personalPageService.createGlobalEmail = async () => {
            throw new Error()
          }

          await action(validRequest, res)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/add-email-address')
        })

        it('Sends a post success audit event', async () => {
          const request = { ...validRequest, id: 1, body: { emailAddress: 'foo@bar.com' } }
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'A1234BC',
            correlationId: request.id,
            action: PostAction.AddEmailAddress,
            details: { fieldName: 'emailAddress', previous: '', updated: 'foo@bar.com' },
          }

          await action(request, res)

          expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })
    })
    describe('Edit an email', () => {
      describe('edit', () => {
        const action = async (req: any, response: any) => controller.globalEmails().edit.edit(req, response, () => {})

        beforeEach(() => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn(async () => globalPhonesAndEmailsMock)
        })

        it('Renders the default edit page with the correct data', async () => {
          const req = {
            params: { prisonerNumber: 'A1234BC', emailAddressId: '234' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)

          expect(res.render).toHaveBeenCalledWith('pages/edit/textField', {
            pageTitle: 'Change this person’s email address - Prisoner personal details',
            formTitle: `Change First Last’s email address`,
            hintText: 'For example name@email.co.uk',
            fieldName: 'emailAddress',
            fieldValue: 'one@example.com',
            inputClasses: 'govuk-!-width-one-third',
            submitButtonText: 'Save and return to profile',
            prisonerNumber: 'A1234BC',
            redirectAnchor: 'phones-and-emails',
            breadcrumbPrisonerName: 'Last, First',
            errors: [],
            miniBannerData: {
              cellLocation: '2-3-001',
              prisonerName: 'Last, First',
              prisonerNumber: 'A1234BC',
              prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
            },
          })
        })

        it('Populates the errors from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'A1234BC', emailAddressId: '234' },
            flash: (key: string): any => {
              if (key === 'errors') return ['error']
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
        })

        it('Populates the field value from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'A1234BC', emailAddressId: '234' },
            flash: (key: string): any => {
              return key === 'requestBody' ? [JSON.stringify({ emailAddress: 'foo@bar.com' })] : []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ fieldValue: 'foo@bar.com' }),
          )
        })

        it('Sends a page view audit event', async () => {
          const req = {
            id: 1,
            params: { prisonerNumber: 'A1234BC', emailAddressId: '234' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'A1234BC',
            prisonId: 999,
            correlationId: req.id,
            page: Page.EditEmailAddress,
          }

          await action(req, res)

          expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })
      describe('submit', () => {
        let validRequest: any
        const action = async (req: any, response: any) => controller.globalEmails().edit.submit(req, response, () => {})

        beforeEach(() => {
          validRequest = {
            id: '1',
            middleware: defaultMiddleware,
            params: { prisonerNumber: 'A1234BC', emailAddressId: '234' },
            body: { emailAddress: 'foo@example.com' },
            flash: jest.fn(),
          } as any

          personalPageService.getGlobalPhonesAndEmails = jest.fn(async () => globalPhonesAndEmailsMock)
        })

        it('Updates the email', async () => {
          await action(validRequest, res)
          expect(personalPageService.updateGlobalEmail).toHaveBeenCalledWith(
            'token',
            'A1234BC',
            '234',
            'foo@example.com',
          )
        })

        it('Redirects to the personal page #phones-and-emais on success', async () => {
          await action(validRequest, res)
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#phones-and-emails')
        })

        it('Adds the success message to the flash', async () => {
          await action(validRequest, res)

          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Email address updated',
            type: FlashMessageType.success,
            fieldName: 'emailAddress',
          })
        })

        it('Handles API errors', async () => {
          personalPageService.updateGlobalEmail = async () => {
            throw new Error()
          }

          await action(validRequest, res)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/change-email-address/234')
        })

        it('Handles duplicate emails', async () => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn().mockResolvedValue({
            emails: [
              { id: '234', email: 'foo@example.com' },
              { id: '555', email: 'something@example.com' },
            ],
            phones: [],
          })

          validRequest.body = { emailAddress: 'someThinG@exaM ple.com' }

          await action(validRequest, res)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [
            {
              href: '#email',
              text: 'This email address already exists for this person. Add a new email or edit the saved one',
            },
          ])

          expect(validRequest.flash).not.toHaveBeenCalledWith('errors', [
            {
              text: 'There was an error please try again',
            },
          ])

          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/change-email-address/234')
        })

        it('Sends a post success audit event', async () => {
          const request = { ...validRequest, id: 1, body: { emailAddress: 'foo@bar.com' } }
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'A1234BC',
            correlationId: request.id,
            action: PostAction.EditEmailAddress,
            details: { fieldName: 'emailAddress', previous: 'one@example.com', updated: 'foo@bar.com' },
          }

          await action(request, res)

          expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })
    })
  })

  describe('Phone numbers', () => {
    describe('Add a phone number', () => {
      describe('edit', () => {
        const action = async (req: any, response: any) => controller.globalNumbers().add.edit(req, response, () => {})
        const defaultReq = {
          params: { prisonerNumber: 'A1234BC' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        }

        it('Renders the default edit page with the correct data', async () => {
          await action(defaultReq, res)

          expect(res.render).toHaveBeenCalledWith('pages/edit/phone', {
            pageTitle: 'Add this person’s phone number - Prisoner personal details',
            formTitle: `Add First Last’s phone number`,
            phoneTypeOptions: expect.not.arrayContaining([expect.objectContaining({ checked: true })]),
            phoneExtension: undefined,
            phoneNumber: undefined,
            addAnotherEnabled: true,
            prisonerNumber: 'A1234BC',
            breadcrumbPrisonerName: 'Last, First',
            errors: [],
            miniBannerData: {
              cellLocation: '2-3-001',
              prisonerName: 'Last, First',
              prisonerNumber: 'A1234BC',
              prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
            },
          })
        })

        it('Populates the errors from the flash', async () => {
          const req = {
            ...defaultReq,
            flash: (key: string): any => {
              if (key === 'errors') return ['error']
              return []
            },
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
        })

        it('Populates the field value from the flash', async () => {
          const req = {
            ...defaultReq,
            flash: (key: string): any => {
              return key === 'requestBody'
                ? [JSON.stringify({ phoneNumberType: 'MOB', phoneNumber: '12345', phoneExtension: '123' })]
                : []
            },
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              phoneTypeOptions: expect.arrayContaining([{ checked: true, text: 'Mobile', value: 'MOB' }]),
              phoneNumber: '12345',
              phoneExtension: '123',
            }),
          )
        })

        it('Sends a page view audit event', async () => {
          const req = {
            ...defaultReq,
            id: 1,
          } as any
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'A1234BC',
            prisonId: 999,
            correlationId: req.id,
            page: Page.AddPhoneNumber,
          }

          await action(req, res)

          expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })

      describe('submit', () => {
        let validRequest: any
        const action = async (req: any, response: any) => controller.globalNumbers().add.submit(req, response, () => {})

        beforeEach(() => {
          validRequest = {
            id: '1',
            middleware: defaultMiddleware,
            params: { prisonerNumber: 'A1234BC' },
            body: { phoneNumberType: 'MOB', phoneNumber: '1234', phoneExtension: '4321' },
            flash: jest.fn(),
          } as any

          personalPageService.getGlobalPhonesAndEmails = jest.fn(async () => globalPhonesAndEmailsMock)
        })

        it('Updates the phone number', async () => {
          await action(validRequest, res)
          expect(personalPageService.createGlobalPhoneNumber).toHaveBeenCalledWith('token', 'A1234BC', {
            phoneNumberType: 'MOB',
            phoneNumber: '1234',
            phoneExtension: '4321',
          })
        })

        it('Redirects to the personal page #phones-and-emais on success', async () => {
          await action(validRequest, res)
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#phones-and-emails')
        })

        it('Redirects to the add phone number page on success with add another specified', async () => {
          await action({ ...validRequest, query: { addAnother: 'true' } }, res)
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/add-phone-number')
        })

        it('Adds the success message to the flash', async () => {
          await action(validRequest, res)

          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Phone number updated',
            type: FlashMessageType.success,
            fieldName: 'phoneNumber',
          })
        })

        it('Handles duplicate phone numbers with extensions', async () => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn().mockResolvedValue({
            phones: [
              {
                number: '(12)34',
                type: 'MOB',
                extension: '4321',
              },
            ],
            emails: [],
          })

          validRequest.body = { phoneNumberType: 'FAX', phoneNumber: '1(23)4', phoneExtension: '4321' }

          await action(validRequest, res)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [
            {
              href: '#phone-number',
              text: 'This phone number already exists for this person. Add a new number or edit the saved one',
            },
          ])
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/add-phone-number')
        })

        it('Handles duplicate phone numbers without extensions', async () => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn().mockResolvedValue({
            phones: [
              {
                number: '(12)34',
                type: 'MOB',
                extension: null,
              },
            ],
            emails: [],
          })

          validRequest.body = { phoneNumberType: 'FAX', phoneNumber: '1(23)4', phoneExtension: '' }

          await action(validRequest, res)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [
            {
              href: '#phone-number',
              text: 'This phone number already exists for this person. Add a new number or edit the saved one',
            },
          ])
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/add-phone-number')
        })

        it('Allows duplicate phone number if the extention differs', async () => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn().mockResolvedValue({
            phones: [
              {
                number: '(12)34',
                type: 'MOB',
                extension: '4321',
              },
            ],
            emails: [],
          })

          validRequest.body = { phoneNumberType: 'FAX', phoneNumber: '1(23)4', phoneExtension: '4322' }

          await action(validRequest, res)

          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Phone number updated',
            type: FlashMessageType.success,
            fieldName: 'phoneNumber',
          })
        })

        it('Handles API errors', async () => {
          personalPageService.createGlobalPhoneNumber = async () => {
            throw new Error()
          }

          await action(validRequest, res)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/add-phone-number')
        })

        it('Sends a post success audit event', async () => {
          const request = {
            ...validRequest,
            id: 1,
            body: { phoneNumberType: 'MOB', phoneNumber: '1234', phoneExtension: '4321' },
          }

          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'A1234BC',
            correlationId: request.id,
            action: PostAction.AddPhoneNumber,
            details: {
              fieldName: 'phoneNumber',
              previous: {},
              updated: {
                phoneExtension: '4321',
                phoneNumber: '1234',
                phoneNumberType: 'MOB',
              },
            },
          }

          await action(request, res)

          expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })
    })

    describe('Edit a phone number', () => {
      describe('edit', () => {
        const action = async (req: any, response: any) => controller.globalNumbers().edit.edit(req, response, () => {})
        const defaultReq = {
          params: { prisonerNumber: 'A1234BC', phoneNumberId: '123' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        }

        beforeEach(() => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn(async () => globalPhonesAndEmailsMock)
        })

        it('Renders the default edit page with the correct data', async () => {
          await action(defaultReq, res)

          expect(res.render).toHaveBeenCalledWith('pages/edit/phone', {
            pageTitle: 'Change this person’s phone number - Prisoner personal details',
            formTitle: `Change First Last’s phone number`,
            phoneTypeOptions: expect.arrayContaining([{ checked: true, text: 'Business', value: 'BUS' }]),
            phoneNumber: '12345 678 901',
            phoneExtension: '123',
            prisonerNumber: 'A1234BC',
            breadcrumbPrisonerName: 'Last, First',
            errors: [],
            miniBannerData: {
              cellLocation: '2-3-001',
              prisonerName: 'Last, First',
              prisonerNumber: 'A1234BC',
              prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=undefined&fullSizeImage=false',
            },
          })
        })

        it('Populates the errors from the flash', async () => {
          const req = {
            ...defaultReq,
            flash: (key: string): any => {
              if (key === 'errors') return ['error']
              return []
            },
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
        })

        it('Populates the field value from the flash', async () => {
          const req = {
            ...defaultReq,
            flash: (key: string): any => {
              return key === 'requestBody'
                ? [JSON.stringify({ phoneNumberType: 'MOB', phoneNumber: '12345', phoneExtension: '123' })]
                : []
            },
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              phoneTypeOptions: expect.arrayContaining([{ checked: true, text: 'Mobile', value: 'MOB' }]),
              phoneNumber: '12345',
              phoneExtension: '123',
            }),
          )
        })

        it('Sends a page view audit event', async () => {
          const req = {
            ...defaultReq,
            id: 1,
          } as any
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'A1234BC',
            prisonId: 999,
            correlationId: req.id,
            page: Page.EditPhoneNumber,
          }

          await action(req, res)

          expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })

      describe('submit', () => {
        let validRequest: any
        const action = async (req: any, response: any) =>
          controller.globalNumbers().edit.submit(req, response, () => {})

        beforeEach(() => {
          validRequest = {
            id: '1',
            middleware: defaultMiddleware,
            params: { prisonerNumber: 'A1234BC', phoneNumberId: '123' },
            body: { phoneNumberType: 'MOB', phoneNumber: '1234', phoneExtension: '4321' },
            flash: jest.fn(),
          } as any

          personalPageService.getGlobalPhonesAndEmails = jest.fn(async () => globalPhonesAndEmailsMock)
        })

        it('Updates the email', async () => {
          await action(validRequest, res)
          expect(personalPageService.updateGlobalPhoneNumber).toHaveBeenCalledWith('token', 'A1234BC', '123', {
            phoneNumberType: 'MOB',
            phoneNumber: '1234',
            phoneExtension: '4321',
          })
        })

        it('Redirects to the personal page #phones-and-emais on success', async () => {
          await action(validRequest, res)
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#phones-and-emails')
        })

        it('Adds the success message to the flash', async () => {
          await action(validRequest, res)

          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Phone number updated',
            type: FlashMessageType.success,
            fieldName: 'phoneNumber',
          })
        })

        it('Handles duplicate phone numbers', async () => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn().mockResolvedValue({
            phones: [
              {
                id: '123',
                number: '(12)34',
                type: 'MOB',
                extension: '1111',
              },
              {
                id: '1234',
                number: '(12)34',
                type: 'MOB',
                extension: '4321',
              },
            ],
            emails: [],
          })

          validRequest.body = { phoneNumberType: 'FAX', phoneNumber: '1(23)4', phoneExtension: '4321' }

          await action(validRequest, res)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [
            {
              href: '#phone-number',
              text: 'This phone number already exists for this person. Add a new number or edit the saved one',
            },
          ])

          expect(validRequest.flash).not.toHaveBeenCalledWith('errors', [
            {
              text: 'There was an error please try again',
            },
          ])
          expect(validRequest.flash).not.toHaveBeenCalledTimes(3)

          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/change-phone-number/123')
        })

        it('Allows duplicate phone number if the extention differs', async () => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn().mockResolvedValue({
            phones: [
              {
                id: '123',
                number: '(12)34',
                type: 'MOB',
                extension: '1111',
              },
              {
                id: '1234',
                number: '(12)34',
                type: 'MOB',
                extension: '4321',
              },
            ],
            emails: [],
          })

          validRequest.body = { phoneNumberType: 'FAX', phoneNumber: '1(23)4', phoneExtension: '5555' }

          await action(validRequest, res)

          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Phone number updated',
            type: FlashMessageType.success,
            fieldName: 'phoneNumber',
          })
        })

        it('Handles API errors', async () => {
          personalPageService.updateGlobalPhoneNumber = async () => {
            throw new Error()
          }

          await action(validRequest, res)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/change-phone-number/123')
        })

        it('Sends a post success audit event', async () => {
          const request = {
            ...validRequest,
            id: 1,
            body: { phoneNumberType: 'MOB', phoneNumber: '1234', phoneExtension: '4321' },
          }

          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'A1234BC',
            correlationId: request.id,
            action: PostAction.EditPhoneNumber,
            details: {
              fieldName: 'phoneNumber',
              previous: {
                phoneExtension: '123',
                phoneNumber: '12345 678 901',
                phoneNumberType: 'BUS',
              },
              updated: {
                phoneExtension: '4321',
                phoneNumber: '1234',
                phoneNumberType: 'MOB',
              },
            },
          }

          await action(request, res)

          expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })
    })
  })
})
