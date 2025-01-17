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
  foodAllergiesFieldData,
  heightFieldData,
  medicalDietFieldData,
  nationalityFieldData,
  RadioFieldData,
  shoeSizeFieldData,
  smokerOrVaperFieldData,
  weightFieldData,
} from './fieldData'
import { prisonUserMock } from '../../data/localMockData/user'
import { physicalCharacteristicsMock } from '../../data/localMockData/prisonPersonApi/physicalCharacteristicsMock'
import InmateDetail from '../../data/interfaces/prisonApi/InmateDetail'
import { ProfileInformationType } from '../../data/interfaces/prisonApi/ProfileInformation'
import {
  PrisonPerson,
  PrisonPersonCharacteristicCode,
  ReferenceDataCode,
  ReferenceDataCodeSimple,
} from '../../data/interfaces/prisonPersonApi/prisonPersonApiClient'
import PrisonPersonService from '../../services/prisonPersonService'
import { prisonPersonServiceMock } from '../../../tests/mocks/prisonPersonServiceMock'
import {
  mockFoodAllergiesReferenceDataDomain,
  mockMedicalDietReferenceDataDomain,
} from '../../data/localMockData/prisonPersonApi/referenceDataMocks'
import {
  ActiveCountryReferenceDataCodesMock,
  NationalityReferenceDataCodesMock,
} from '../../data/localMockData/personIntegrationReferenceDataMock'

describe('PersonalController', () => {
  let personalPageService: PersonalPageService
  let prisonPersonService: PrisonPersonService
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
      prisonerNumber: 'ABC123',
      prisonId: 999,
    },
    inmateDetail: {
      birthPlace: 'SHEFFIELD',
      profileInformation: [
        { question: 'Smoker or Vaper', resultValue: 'Yes', type: ProfileInformationType.SmokerOrVaper },
        { question: 'Nationality', resultValue: 'BRIT', type: ProfileInformationType.Nationality },
      ],
    } as InmateDetail,
  }

  const defaultLocals = {
    user: prisonUserMock,
  }

  const defaultPrisonPerson = {
    prisonerNumber: 'ABC123',
    physicalAttributes: {
      height: { value: 102, lastModifiedAt: '2024-07-01T01:02:03+0100', lastModifiedBy: 'USER1' },
      weight: { value: 60, lastModifiedAt: '2024-07-01T01:02:03+0100', lastModifiedBy: 'USER1' },
      hair: { value: { id: '', description: '' }, lastModifiedAt: '2024-07-01T01:02:03+0100', lastModifiedBy: 'USER1' },
      facialHair: {
        value: { id: '', description: '' },
        lastModifiedAt: '2024-07-01T01:02:03+0100',
        lastModifiedBy: 'USER1',
      },
      face: { value: { id: '', description: '' }, lastModifiedAt: '2024-07-01T01:02:03+0100', lastModifiedBy: 'USER1' },
      build: {
        value: { id: '', description: '' },
        lastModifiedAt: '2024-07-01T01:02:03+0100',
        lastModifiedBy: 'USER1',
      },
      leftEyeColour: {
        value: { id: '', description: '' },
        lastModifiedAt: '2024-07-01T01:02:03+0100',
        lastModifiedBy: 'USER1',
      },
      rightEyeColour: {
        value: { id: '', description: '' },
        lastModifiedAt: '2024-07-01T01:02:03+0100',
        lastModifiedBy: 'USER1',
      },
      shoeSize: { value: '11', lastModifiedAt: '2024-07-01T01:02:03+0100', lastModifiedBy: 'USER1' },
    },
    health: {
      smokerOrVaper: {
        value: { id: 'SMOKE_SMOKER', description: '', listSequence: 0, isActive: true },
        lastModifiedAt: '2024-07-01T01:02:03+0100',
        lastModifiedBy: 'USER1',
      },
      medicalDietaryRequirements: {
        value: [] as ReferenceDataCodeSimple[],
        lastModifiedAt: '2024-07-01T01:02:03+0100',
        lastModifiedBy: 'USER1',
      },
      foodAllergies: {
        value: [] as ReferenceDataCodeSimple[],
        lastModifiedAt: '2024-07-01T01:02:03+0100',
        lastModifiedBy: 'USER1',
      },
    },
  }

  beforeEach(() => {
    personalPageService = personalPageServiceMock() as PersonalPageService
    personalPageService.getPrisonPerson = jest.fn(async () => ({ ...defaultPrisonPerson }))
    personalPageService.getReferenceDataCodes = jest.fn(async (_, domain) => {
      if (domain === 'smoke')
        return [
          { id: 'SMOKE_SMOKER', description: 'Yes, they smoke' },
          { id: 'SMOKE_NO', description: 'No, they do not smoke or vape' },
        ] as ReferenceDataCode[]
      return physicalCharacteristicsMock.field as ReferenceDataCode[]
    })
    personalPageService.getReferenceDataDomain = jest.fn(async (_, domain) => {
      if (domain === 'medicalDiet') return mockMedicalDietReferenceDataDomain
      if (domain === 'foodAllergy') return mockFoodAllergiesReferenceDataDomain
      return null
    })
    personalPageService.getReferenceDataCodesFromProxy = jest.fn(async (_, domain) => {
      if (domain === 'COUNTRY') return ActiveCountryReferenceDataCodesMock
      if (domain === 'NAT') return NationalityReferenceDataCodesMock
      return null
    })
    personalPageService.updateSmokerOrVaper = jest.fn()
    auditService = auditServiceMock()
    careNeedsService = careNeedsServiceMock() as CareNeedsService
    prisonPersonService = prisonPersonServiceMock() as PrisonPersonService

    controller = new PersonalController(personalPageService, prisonPersonService, careNeedsService, auditService)
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
            params: { prisonerNumber: 'ABC123' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)

          expect(personalPageService.getPrisonPerson).toHaveBeenCalledWith('token', 'ABC123', true)
          expect(res.render).toHaveBeenCalledWith('pages/edit/heightMetric', {
            pageTitle: expect.anything(),
            prisonerNumber: 'ABC123',
            breadcrumbPrisonerName: 'Last, First',
            errors: [],
            fieldValue: 102,
            miniBannerData: {
              cellLocation: '2-3-001',
              prisonerName: 'Last, First',
              prisonerNumber: 'ABC123',
            },
          })
        })

        it('Populates the errors from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'ABC123' },
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
            params: { prisonerNumber: 'ABC123' },
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
            params: { prisonerNumber: 'ABC123' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'ABC123',
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
            params: { prisonerNumber: 'ABC123' },
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
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal#appearance')
          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Height edited',
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
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal/edit/height')
        })

        it('Sends a post success audit event', async () => {
          const request = { ...validRequest, id: 1, body: { editField: 157 } }
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'ABC123',
            correlationId: request.id,
            action: PostAction.EditPhysicalCharacteristics,
            details: { fieldName: heightFieldData.fieldName, previous: 102, updated: 157 },
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
            params: { prisonerNumber: 'ABC123' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)

          expect(res.render).toHaveBeenCalledWith('pages/edit/heightImperial', {
            pageTitle: expect.anything(),
            prisonerNumber: 'ABC123',
            breadcrumbPrisonerName: 'Last, First',
            errors: [],
            feetValue: 3,
            inchesValue: 4,
            miniBannerData: {
              cellLocation: '2-3-001',
              prisonerName: 'Last, First',
              prisonerNumber: 'ABC123',
            },
          })
        })

        it('Populates the errors from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'ABC123' },
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
            params: { prisonerNumber: 'ABC123' },
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
          personalPageService.getPrisonPerson = jest.fn(
            async (): Promise<PrisonPerson> => ({
              ...defaultPrisonPerson,
              physicalAttributes: { ...defaultPrisonPerson.physicalAttributes, height: undefined, weight: undefined },
            }),
          )
          const req = {
            params: { prisonerNumber: 'ABC123' },
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
            params: { prisonerNumber: 'ABC123' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'ABC123',
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
            params: { prisonerNumber: 'ABC123' },
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
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal#appearance')
          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Height edited',
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
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal/edit/height/imperial')
        })

        it('Sends a post success audit event', async () => {
          const request = { ...validRequest, id: 1, body: { feet: '5', inches: '2' } }
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'ABC123',
            correlationId: request.id,
            action: PostAction.EditPhysicalCharacteristics,
            details: { fieldName: heightFieldData.fieldName, previous: 102, updated: 157 },
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
            params: { prisonerNumber: 'ABC123' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)

          expect(personalPageService.getPrisonPerson).toHaveBeenCalledWith('token', 'ABC123', true)
          expect(res.render).toHaveBeenCalledWith('pages/edit/weightMetric', {
            pageTitle: expect.anything(),
            prisonerNumber: 'ABC123',
            breadcrumbPrisonerName: 'Last, First',
            errors: [],
            fieldName: expect.anything(),
            fieldValue: 60,
            miniBannerData: {
              prisonerNumber: 'ABC123',
              prisonerName: 'Last, First',
              cellLocation: '2-3-001',
            },
          })
        })

        it('Populates the errors from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'ABC123' },
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
            params: { prisonerNumber: 'ABC123' },
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
            params: { prisonerNumber: 'ABC123' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'ABC123',
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
            params: { prisonerNumber: 'ABC123' },
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
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal#appearance')
          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Weight edited',
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
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal/edit/weight')
        })

        it('Sends a post success audit event', async () => {
          const request = { ...validRequest, id: 1, body: { kilograms: '96' } }
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'ABC123',
            correlationId: request.id,
            action: PostAction.EditPhysicalCharacteristics,
            details: { fieldName: weightFieldData.fieldName, previous: 60, updated: 96 },
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
            params: { prisonerNumber: 'ABC123' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)

          expect(res.render).toHaveBeenCalledWith('pages/edit/weightImperial', {
            pageTitle: expect.anything(),
            prisonerNumber: 'ABC123',
            breadcrumbPrisonerName: 'Last, First',
            errors: [],
            stoneValue: 9,
            poundsValue: 6,
            miniBannerData: {
              prisonerNumber: 'ABC123',
              prisonerName: 'Last, First',
              cellLocation: '2-3-001',
            },
          })
        })

        it('Populates the errors from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'ABC123' },
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
            params: { prisonerNumber: 'ABC123' },
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
          personalPageService.getPrisonPerson = jest.fn(
            async (): Promise<PrisonPerson> => ({
              ...defaultPrisonPerson,
              physicalAttributes: { ...defaultPrisonPerson.physicalAttributes, height: undefined, weight: undefined },
            }),
          )
          const req = {
            params: { prisonerNumber: 'ABC123' },
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
            params: { prisonerNumber: 'ABC123' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'ABC123',
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
            params: { prisonerNumber: 'ABC123' },
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
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal#appearance')
          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Weight edited',
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
          expect(res.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal/edit/weight/imperial')
        })

        it('Sends a post success audit event', async () => {
          const request = { ...validRequest, id: 1, body: { stone: '15', pounds: '2' } }
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber: 'ABC123',
            correlationId: request.id,
            action: PostAction.EditPhysicalCharacteristics,
            details: { fieldName: weightFieldData.fieldName, previous: 60, updated: 96 },
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
      code: PrisonPersonCharacteristicCode.build,
      auditPage: 'PAGE' as Page,
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

        expect(personalPageService.getReferenceDataCodes).toHaveBeenCalledWith('token', 'build')
        expect(personalPageService.getPrisonPerson).toHaveBeenCalledWith('token', 'A1234BC', true)
        expect(res.render).toHaveBeenCalledWith('pages/edit/radioField', {
          pageTitle: 'Build - Prisoner personal details',
          formTitle: 'Build',
          prisonerNumber: 'A1234BC',
          breadcrumbPrisonerName: 'Last, First',
          errors: [],
          hintText: 'Hint text',
          options: [
            {
              text: 'Characteristic One',
              value: 'CODE1',
            },
            {
              text: 'Characteristic Two',
              value: 'CODE2',
            },
            {
              text: 'Characteristic Three',
              value: 'CODE3',
            },
          ],
          redirectAnchor: 'appearance',
          miniBannerData: {
            prisonerName: 'Last, First',
            prisonerNumber: 'A1234BC',
            cellLocation: '2-3-001',
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
            if (key === 'requestBody') return [JSON.stringify({ radioField: 'CODE2' })]
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.arrayContaining([{ checked: true, text: 'Characteristic Two', value: 'CODE2' }]),
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber: 'ABC123' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'ABC123',
          prisonId: 999,
          correlationId: req.id,
          page: fieldData.auditPage,
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
          body: { radioField: 'CODE3' },
          flash: jest.fn(),
        } as any
      })

      it('Updates the physical characteristic', async () => {
        await action(validRequest, res)
        expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith('token', prisonUserMock, 'A1234BC', {
          build: 'CODE3',
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
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/edit/build')
      })

      it('Sends a post success audit event', async () => {
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          correlationId: validRequest.id,
          action: PostAction.EditPhysicalCharacteristics,
          details: { fieldName: fieldData.fieldName, previous: '', updated: 'CODE3' },
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
          params: { prisonerNumber: 'ABC123' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/edit/radioField', {
          pageTitle: 'Smoker or vaper - Prisoner personal details',
          formTitle: 'Does First Last smoke or vape?',
          prisonerNumber: 'ABC123',
          breadcrumbPrisonerName: 'Last, First',
          hintText: undefined,
          errors: [],
          options: expect.arrayContaining([
            expect.objectContaining({ value: 'SMOKE_SMOKER' }),
            expect.objectContaining({ value: 'SMOKE_NO' }),
          ]),
          redirectAnchor: 'personal-details',
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber: 'ABC123',
          },
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'ABC123' },
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
          params: { prisonerNumber: 'ABC123' },
          flash: (key: string): any => {
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'SMOKE_NO' })] : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.arrayContaining([expect.objectContaining({ value: 'SMOKE_NO', checked: true })]),
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber: 'ABC123' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'ABC123',
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

      it('Redirects to the personal page #personal-details on success', async () => {
        await action(validRequest, res)
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#personal-details')
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Smoker or vaper updated',
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
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/edit/smoker-or-vaper')
      })

      it('Sends a post success audit event', async () => {
        const request = { ...validRequest, id: 1, body: { radioField: 'SMOKE_NO' } }
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          correlationId: request.id,
          action: PostAction.EditSmokerOrVaper,
          details: { fieldName: smokerOrVaperFieldData.fieldName, previous: 'SMOKE_SMOKER', updated: 'SMOKE_NO' },
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
          params: { prisonerNumber: 'ABC123' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/edit/radioField', {
          pageTitle: 'Nationality - Prisoner personal details',
          formTitle: `What is First Last's nationality?`,
          prisonerNumber: 'ABC123',
          breadcrumbPrisonerName: 'Last, First',
          hintText: undefined,
          errors: [],
          options: expect.arrayContaining([
            expect.objectContaining({ text: 'British', value: 'BRIT' }),
            expect.objectContaining({ text: 'French', value: 'FREN' }),
          ]),
          redirectAnchor: 'personal-details',
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber: 'ABC123',
          },
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'ABC123' },
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
          params: { prisonerNumber: 'ABC123' },
          flash: (key: string): any => {
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'BRIT' })] : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.arrayContaining([expect.objectContaining({ value: 'BRIT', checked: true })]),
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber: 'ABC123' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'ABC123',
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
          body: { radioField: 'FREN' },
          flash: jest.fn(),
        } as any
      })

      it('Updates the nationality', async () => {
        await action(validRequest, res)
        expect(personalPageService.updateNationality).toHaveBeenCalledWith('token', prisonUserMock, 'A1234BC', 'FREN')
      })

      it('Redirects to the personal page #personal-details on success', async () => {
        await action(validRequest, res)
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#personal-details')
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
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/edit/nationality')
      })

      it('Sends a post success audit event', async () => {
        const request = { ...validRequest, id: 1, body: { radioField: 'FREN' } }
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          correlationId: request.id,
          action: PostAction.EditNationality,
          details: { fieldName: nationalityFieldData.fieldName, previous: 'BRIT', updated: 'FREN' },
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
          params: { prisonerNumber: 'ABC123' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)

        expect(personalPageService.getPrisonPerson).toHaveBeenCalledWith('token', 'ABC123', true)
        expect(res.render).toHaveBeenCalledWith('pages/edit/textField', {
          pageTitle: 'Shoe size - Prisoner personal details',
          formTitle: 'Shoe size',
          prisonerNumber: 'ABC123',
          breadcrumbPrisonerName: 'Last, First',
          errors: [],
          hintText: shoeSizeFieldData.hintText,
          inputClasses: shoeSizeFieldData.inputClasses,
          fieldName: shoeSizeFieldData.fieldName,
          fieldValue: '11',
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber: 'ABC123',
          },
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'ABC123' },
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
          params: { prisonerNumber: 'ABC123' },
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
          params: { prisonerNumber: 'ABC123' },
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
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal#appearance')
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
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal/edit/shoe-size')
      })
    })
  })

  describe('city or town of birth', () => {
    describe('edit', () => {
      const action = async (req: any, response: any) =>
        controller.cityOrTownOfBirthTextInput().edit(req, response, () => {})

      it('Renders the default edit page with the correct data from the prison API', async () => {
        const req = {
          params: { prisonerNumber: 'ABC123' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/edit/textField', {
          pageTitle: 'City or town of birth - Prisoner personal details',
          formTitle: 'City or town of birth',
          prisonerNumber: 'ABC123',
          breadcrumbPrisonerName: 'Last, First',
          errors: [],
          hintText: cityOrTownOfBirthFieldData.hintText,
          inputClasses: cityOrTownOfBirthFieldData.inputClasses,
          fieldName: cityOrTownOfBirthFieldData.fieldName,
          fieldValue: 'Sheffield',
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber: 'ABC123',
          },
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'ABC123' },
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
          params: { prisonerNumber: 'ABC123' },
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
          params: { prisonerNumber: 'ABC123' },
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
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal#personal-details')
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
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal/edit/city-or-town-of-birth')
      })
    })
  })

  describe('country of birth', () => {
    describe('edit', () => {
      const action = async (req: any, response: any) => controller.countryOfBirth().edit(req, response, () => {})

      it('Renders the default edit page with the correct data from the prison API', async () => {
        const req = {
          params: { prisonerNumber: 'ABC123' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/edit/radioFieldWithAutocomplete', {
          pageTitle: 'Country of birth - Prisoner personal details',
          formTitle: 'What country was First Last born in?',
          prisonerNumber: 'ABC123',
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
            prisonerNumber: 'ABC123',
          },
          redirectAnchor: 'personal-details',
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'ABC123' },
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
          params: { prisonerNumber: 'ABC123' },
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
          params: { prisonerNumber: 'ABC123' },
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
          params: { prisonerNumber: 'ABC123' },
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
          params: { prisonerNumber: 'ABC123' },
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
          params: { prisonerNumber: 'ABC123' },
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
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal#personal-details')
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
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal/edit/country-of-birth')
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

        expect(personalPageService.getReferenceDataCodes).toHaveBeenCalledWith('token', 'eye')
        expect(personalPageService.getPrisonPerson).toHaveBeenCalledWith('token', 'A1234BC', true)
        expect(res.render).toHaveBeenCalledWith('pages/edit/eyeColour', {
          pageTitle: 'Eye colour - Prisoner personal details',
          formTitle: 'Eye colour',
          prisonerNumber: 'A1234BC',
          breadcrumbPrisonerName: 'Last, First',
          errors: [],
          options: [
            {
              text: 'Characteristic One',
              value: 'CODE1',
            },
            {
              text: 'Characteristic Two',
              value: 'CODE2',
            },
            {
              text: 'Characteristic Three',
              value: 'CODE3',
            },
          ],
          miniBannerData: {
            prisonerName: 'Last, First',
            prisonerNumber: 'A1234BC',
            cellLocation: '2-3-001',
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
            if (key === 'requestBody') return [JSON.stringify({ eyeColour: 'CODE2' })]
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.arrayContaining([{ checked: true, text: 'Characteristic Two', value: 'CODE2' }]),
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber: 'ABC123' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'ABC123',
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
          body: { eyeColour: 'CODE3' },
          flash: jest.fn(),
        } as any
      })

      it('Updates the physical characteristic', async () => {
        await action(validRequest, res)
        expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith('token', prisonUserMock, 'A1234BC', {
          leftEyeColour: 'CODE3',
          rightEyeColour: 'CODE3',
        })
      })

      it('Redirects to the personal page #appearance on success', async () => {
        await action(validRequest, res)
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#appearance')
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
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/edit/eye-colour')
      })

      it('Sends a post success audit event', async () => {
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          correlationId: validRequest.id,
          action: PostAction.EditPhysicalCharacteristics,
          details: {
            fieldName: 'eyeColour',
            previous: { leftEyeColour: '', rightEyeColour: '' },
            updated: { leftEyeColour: 'CODE3', rightEyeColour: 'CODE3' },
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

        expect(personalPageService.getReferenceDataCodes).toHaveBeenCalledWith('token', 'eye')
        expect(personalPageService.getPrisonPerson).toHaveBeenCalledWith('token', 'A1234BC', true)
        expect(res.render).toHaveBeenCalledWith('pages/edit/eyeColourIndividual', {
          pageTitle: 'Left and right eye colours - Prisoner personal details',
          formTitle: 'Left and right eye colours',
          prisonerNumber: 'A1234BC',
          breadcrumbPrisonerName: 'Last, First',
          errors: [],
          leftOptions: [
            {
              text: 'Characteristic One',
              value: 'CODE1',
            },
            {
              text: 'Characteristic Two',
              value: 'CODE2',
            },
            {
              text: 'Characteristic Three',
              value: 'CODE3',
            },
          ],
          rightOptions: [
            {
              text: 'Characteristic One',
              value: 'CODE1',
            },
            {
              text: 'Characteristic Two',
              value: 'CODE2',
            },
            {
              text: 'Characteristic Three',
              value: 'CODE3',
            },
          ],
          miniBannerData: {
            prisonerName: 'Last, First',
            prisonerNumber: 'A1234BC',
            cellLocation: '2-3-001',
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
            if (key === 'requestBody') return [JSON.stringify({ leftEyeColour: 'CODE2', rightEyeColour: 'CODE3' })]
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            leftOptions: expect.arrayContaining([{ checked: true, text: 'Characteristic Two', value: 'CODE2' }]),
            rightOptions: expect.arrayContaining([{ checked: true, text: 'Characteristic Three', value: 'CODE3' }]),
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber: 'ABC123' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'ABC123',
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
          body: { leftEyeColour: 'CODE3', rightEyeColour: 'CODE1' },
          flash: jest.fn(),
        } as any
      })

      it('Updates the physical characteristic', async () => {
        await action(validRequest, res)
        expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith('token', prisonUserMock, 'A1234BC', {
          leftEyeColour: 'CODE3',
          rightEyeColour: 'CODE1',
        })
      })

      it('Redirects to the personal page #appearance on success', async () => {
        await action(validRequest, res)
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#appearance')
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
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/edit/eye-colour-individual')
      })

      it('Sends a post success audit event', async () => {
        const request = { ...validRequest, id: 1, body: { leftEyeColour: 'CODE3', rightEyeColour: 'CODE1' } }
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          correlationId: request.id,
          action: PostAction.EditPhysicalCharacteristics,
          details: {
            fieldName: 'eyeColour',
            previous: { leftEyeColour: '', rightEyeColour: '' },
            updated: { leftEyeColour: 'CODE3', rightEyeColour: 'CODE1' },
          },
        }

        await action(request, res)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })

  describe('Medical diet', () => {
    describe('Edit', () => {
      const action = async (req: any, response: any) => controller.medicalDiet().edit(req, response, () => {})

      it('Renders the default edit page with the correct data from the prison person API', async () => {
        const req = {
          params: { prisonerNumber: 'ABC123' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/edit/checkboxField', {
          pageTitle: expect.anything(),
          prisonerNumber: 'ABC123',
          prisonerName: 'First Last',
          breadcrumbPrisonerName: 'Last, First',
          errors: [],
          checkboxInputs: expect.arrayContaining([
            expect.objectContaining({
              subValues: expect.objectContaining({
                options: expect.arrayContaining([
                  {
                    value: 'FREE_FROM_MONOAMINE',
                    text: 'Any foods that interact with monoamine oxidase inhibitors',
                  },
                ]),
              }),
            }),
            { text: 'Low fat', value: 'MEDICAL_DIET_LOW_FAT' },
          ]),
          checkedItems: [],
          fieldName: 'medicalDiet',
          formHint: 'Select all that apply',
          formOptions: { showDontKnow: true, showNo: false },
          formTitle: expect.anything(),
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber: 'ABC123',
          },
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'ABC123' },
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
          params: { prisonerNumber: 'ABC123' },
          flash: (key: string): any => {
            return key === 'requestBody'
              ? [
                  JSON.stringify({
                    medicalDiet: ['MEDICAL_DIET_FREE_FROM'],
                    'MEDICAL_DIET_FREE_FROM-subvalues': ['FREE_FROM_EGG'],
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
            checkedItems: ['MEDICAL_DIET_FREE_FROM', 'FREE_FROM_EGG'],
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber: 'ABC123' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'ABC123',
          prisonId: 999,
          correlationId: req.id,
          page: Page.EditMedicalDiet,
        }

        await action(req, res)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: any
      const action = async (req: any, response: any) => controller.medicalDiet().submit(req, response, () => {})

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware: defaultMiddleware,
          params: { prisonerNumber: 'A1234BC' },
          body: { medicalDiet: ['MEDICAL_DIET_FREE_FROM'], 'MEDICAL_DIET_FREE_FROM-subvalues': ['FREE_FROM_EGG'] },
          flash: jest.fn(),
        } as any
      })

      it('Redirects to the personal page #personal-details on success', async () => {
        await action(validRequest, res)
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#personal-details')
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Medical diet updated',
          type: FlashMessageType.success,
          fieldName: 'medicalDiet',
        })
      })

      it('Updates the prisoner health on success', async () => {
        await action(validRequest, res)
        expect(personalPageService.updateMedicalDietaryRequirements).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          'A1234BC',
          ['FREE_FROM_EGG', 'MEDICAL_DIET_FREE_FROM'],
        )
      })

      it('Handles API errors', async () => {
        personalPageService.updateMedicalDietaryRequirements = async () => {
          throw new Error()
        }

        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/edit/medical-diet')
      })

      it('Sends a post success audit event', async () => {
        const request = {
          ...validRequest,
          id: 1,
          body: {
            medicalDiet: ['MEDICAL_DIET_LOW_SALT', 'MEDICAL_DIET_FREE_FROM'],
            'MEDICAL_DIET_FREE_FROM-subvalues': ['FREE_FROM_EGG'],
          },
        }
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          correlationId: request.id,
          action: PostAction.EditMedicalDiet,
          details: {
            fieldName: medicalDietFieldData.fieldName,
            previous: [] as string[],
            updated: ['FREE_FROM_EGG', 'MEDICAL_DIET_FREE_FROM', 'MEDICAL_DIET_LOW_SALT'],
          },
        }

        await action(request, res)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })

  describe('Food allergies', () => {
    describe('Edit', () => {
      const action = async (req: any, response: any) => controller.foodAllergies().edit(req, response, () => {})

      it('Renders the default edit page with the correct data from the prison person API', async () => {
        const req = {
          params: { prisonerNumber: 'ABC123' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/edit/checkboxField', {
          pageTitle: expect.anything(),
          prisonerNumber: 'ABC123',
          prisonerName: 'First Last',
          breadcrumbPrisonerName: 'Last, First',
          errors: [],
          checkboxInputs: expect.arrayContaining([{ text: 'Cereals containing gluten', value: 'FOOD_ALLERGY_GLUTEN' }]),
          checkedItems: [],
          fieldName: 'foodAllergies',
          formHint: 'Select all that apply',
          formOptions: { showDontKnow: false, showNo: true },
          formTitle: expect.anything(),
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber: 'ABC123',
          },
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber: 'ABC123' },
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
          params: { prisonerNumber: 'ABC123' },
          flash: (key: string): any => {
            return key === 'requestBody'
              ? [JSON.stringify({ foodAllergies: ['FOOD_ALLERGY_EGG', 'FOOD_ALLERGY_GLUTEN'] })]
              : []
          },
          middleware: defaultMiddleware,
        } as any
        await action(req, res)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            checkedItems: ['FOOD_ALLERGY_EGG', 'FOOD_ALLERGY_GLUTEN'],
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber: 'ABC123' },
          flash: (): any => {
            return []
          },
          middleware: defaultMiddleware,
        } as any
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'ABC123',
          prisonId: 999,
          correlationId: req.id,
          page: Page.EditFoodAllergies,
        }

        await action(req, res)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: any
      const action = async (req: any, response: any) => controller.foodAllergies().submit(req, response, () => {})

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware: defaultMiddleware,
          params: { prisonerNumber: 'A1234BC' },
          body: { foodAllergies: ['FOOD_ALLERGY_EGG'] },
          flash: jest.fn(),
        } as any
      })

      it('Redirects to the personal page #personal-details on success', async () => {
        await action(validRequest, res)
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal#personal-details')
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Food allergies updated',
          type: FlashMessageType.success,
          fieldName: 'foodAllergies',
        })
      })

      it('Updates the prisoner health on success', async () => {
        await action(validRequest, res)
        expect(personalPageService.updateFoodAllergies).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          'A1234BC',
          ['FOOD_ALLERGY_EGG'],
        )
      })

      it('Handles API errors', async () => {
        personalPageService.updateFoodAllergies = async () => {
          throw new Error()
        }

        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/edit/food-allergies')
      })

      it('Sends a post success audit event', async () => {
        const request = {
          ...validRequest,
          id: 1,
          body: { foodAllergies: ['FOOD_ALLERGY_PEANUTS', 'FOOD_ALLERGY_EGG'] },
        }
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber: 'A1234BC',
          correlationId: request.id,
          action: PostAction.EditFoodAllergies,
          details: {
            fieldName: foodAllergiesFieldData.fieldName,
            previous: [] as string[],
            updated: ['FOOD_ALLERGY_EGG', 'FOOD_ALLERGY_PEANUTS'],
          },
        }

        await action(request, res)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })
})
