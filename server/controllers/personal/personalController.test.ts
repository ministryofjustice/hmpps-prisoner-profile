import { Response } from 'express'
import { auditServiceMock } from '../../../tests/mocks/auditServiceMock'
import { careNeedsServiceMock } from '../../../tests/mocks/careNeedsServiceMock'
import { personalPageServiceMock } from '../../../tests/mocks/personalPageServiceMock'
import { FlashMessageType } from '../../data/enums/flashMessageType'
import { AuditService, Page } from '../../services/auditService'
import CareNeedsService from '../../services/careNeedsService'
import PersonalPageService from '../../services/personalPageService'
import PersonalController from './personalController'
import { RadioFieldData, shoeSizeFieldData } from './fieldData'
import { prisonUserMock } from '../../data/localMockData/user'
import { physicalCharacteristicsMock } from '../../data/localMockData/prisonPersonApi/physicalCharacteristicsMock'
import { ReferenceDataCode } from '../../data/interfaces/prisonPersonApi/prisonPersonApiClient'

describe('PersonalController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let careNeedsService: CareNeedsService
  let controller: PersonalController
  let res: Response

  const defaultMiddleware = {
    clientToken: 'token',
    prisonerData: { firstName: 'First', lastName: 'Last', cellLocation: '2-3-001', prisonerNumber: 'ABC123' },
  }

  const defaultLocals = {
    user: prisonUserMock,
  }

  const defaultPrisonPerson = {
    prisonerNumber: 'ABC123',
    physicalAttributes: { height: 102, weight: 60, shoeSize: '7' },
    physicalCharacteristics: {
      hair: { code: '', description: '' },
      facialHair: { code: '', description: '' },
      face: { code: '', description: '' },
      build: { code: '', description: '' },
    },
  }

  beforeEach(() => {
    personalPageService = personalPageServiceMock() as PersonalPageService
    personalPageService.getPrisonPerson = jest.fn(async () => ({ ...defaultPrisonPerson }))
    personalPageService.getReferenceDataCodes = jest.fn(
      async () => physicalCharacteristicsMock.field as ReferenceDataCode[],
    )
    auditService = auditServiceMock()
    careNeedsService = careNeedsServiceMock() as CareNeedsService

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
              if (key === 'requestBody') return [JSON.stringify({ editField: '1234' })]
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ fieldValue: '1234' }))
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
              if (key === 'requestBody') return [JSON.stringify({ feet: '5', inches: '10' })]
              return []
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
          personalPageService.getPrisonPerson = jest.fn(async () => ({
            ...defaultPrisonPerson,
            physicalAttributes: { ...defaultPrisonPerson.physicalAttributes, height: undefined, weight: undefined },
          }))
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
              if (key === 'requestBody') return [JSON.stringify({ kilograms: '1234' })]
              return []
            },
            middleware: defaultMiddleware,
          } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ fieldValue: '1234' }))
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
          res = { redirect: jest.fn() } as any
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
              if (key === 'requestBody') return [JSON.stringify({ stone: '5', pounds: '10' })]
              return []
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
          personalPageService.getPrisonPerson = jest.fn(async () => ({
            ...defaultPrisonPerson,
            physicalAttributes: { ...defaultPrisonPerson.physicalAttributes, height: undefined, weight: undefined },
          }))
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
      })
    })
  })

  /**
   * Tests for the generic radios edit pages - covers editing Hair type or colour, Facial hair, Face shape and Build
   */
  describe('radios', () => {
    const fieldData: RadioFieldData = {
      pageTitle: 'Characteristic',
      fieldName: 'characteristic',
      code: 'build',
      auditPage: 'PAGE' as Page,
      url: 'characteristic-url',
      hintText: 'Hint text',
    }

    describe('edit', () => {
      const action = async (req: any, response: any) => controller.radios(fieldData).edit(req, response, () => {})

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
        expect(res.render).toHaveBeenCalledWith('pages/edit/radios', {
          pageTitle: 'Characteristic - Prisoner personal details',
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
            if (key === 'fieldValue') return ['CODE2']
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
    })

    describe('submit', () => {
      let validRequest: any
      const action = async (req: any, response: any) => controller.radios(fieldData).submit(req, response, () => {})

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
        expect(personalPageService.updatePhysicalCharacteristics).toHaveBeenCalledWith('token', 'A1234BC', {
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
          text: 'Characteristic updated',
          type: FlashMessageType.success,
          fieldName: 'characteristic',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updatePhysicalCharacteristics = async () => {
          throw new Error()
        }

        await action(validRequest, res)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/personal/edit/characteristic-url')
      })
    })
  })

  describe('Text input', () => {
    describe('edit', () => {
      const action = async (req: any, response: any) =>
        controller.textInput(shoeSizeFieldData).edit(req, response, () => {})

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
        expect(res.render).toHaveBeenCalledWith('pages/edit/singleField', {
          pageTitle: 'Shoe size - Prisoner personal details',
          prisonerNumber: 'ABC123',
          breadcrumbPrisonerName: 'Last, First',
          errors: [],
          hintText: shoeSizeFieldData.hintText,
          inputClasses: shoeSizeFieldData.inputClasses,
          fieldName: shoeSizeFieldData.fieldName,
          fieldValue: '7',
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
            if (key === 'requestBody') return [JSON.stringify({ shoeSize: '1234' })]
            return []
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
        controller.textInput(shoeSizeFieldData).submit(req, response, () => {})

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
})
