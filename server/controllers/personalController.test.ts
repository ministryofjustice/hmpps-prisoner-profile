import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { careNeedsServiceMock } from '../../tests/mocks/careNeedsServiceMock'
import { personalPageServiceMock } from '../../tests/mocks/personalPageServiceMock'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { AuditService } from '../services/auditService'
import CareNeedsService from '../services/careNeedsService'
import PersonalPageService from '../services/personalPageService'
import PersonalController from './personalController'

describe('PersonalController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let careNeedsService: CareNeedsService
  let controller: PersonalController

  const defaultMiddleware = {
    clientToken: 'token',
    prisonerData: { firstName: 'First', lastName: 'Last' },
  }

  beforeEach(() => {
    personalPageService = personalPageServiceMock() as PersonalPageService
    personalPageService.getPrisonPerson = jest.fn(async () => ({
      prisonerNumber: 'ABC123',
      physicalAttributes: { height: 102, weight: 60 },
    }))
    auditService = auditServiceMock()
    careNeedsService = careNeedsServiceMock() as CareNeedsService

    controller = new PersonalController(personalPageService, careNeedsService, auditService)
  })

  describe('displayPersonalPage', () => {
    // Skipped to focus on the edit routes for now
    it.skip('Renders the page with information from the service', () => {})
  })

  describe('height', () => {
    describe('metric', () => {
      describe('edit', () => {
        const action = async (req: any, res: any) => controller.height().metric.edit(req, res, () => {})

        it('Renders the deefault edit page with the correct data from the prison person API', async () => {
          const req = {
            params: { prisonerNumber: 'ABC123' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          const res = { render: jest.fn() } as any
          await action(req, res)

          expect(personalPageService.getPrisonPerson).toHaveBeenCalledWith('token', 'ABC123', true)
          expect(res.render).toHaveBeenCalledWith('pages/edit/heightMetric', {
            pageTitle: expect.anything(),
            prisonerNumber: 'ABC123',
            breadcrumbPrisonerName: 'Last, First',
            errors: [],
            fieldName: expect.anything(),
            fieldValue: 102,
            fieldSuffix: expect.anything(),
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
          const res = { render: jest.fn() } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
        })

        it('Populates the field value from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'ABC123' },
            flash: (key: string): any => {
              if (key === 'fieldValue') return ['1234']
              return []
            },
            middleware: defaultMiddleware,
          } as any
          const res = { render: jest.fn() } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ fieldValue: '1234' }))
        })
      })

      describe('submit', () => {
        let validRequest: any
        let mockResponse: any
        const action = async (req: any, res: any) => controller.height().metric.submit(req, res, () => {})

        beforeEach(() => {
          validRequest = {
            middleware: defaultMiddleware,
            params: { prisonerNumber: 'ABC123' },
            body: { editField: '123' },
            flash: jest.fn(),
          } as any
          mockResponse = { redirect: jest.fn() } as any
        })

        it('Updates the physical attributes', async () => {
          await action(validRequest, mockResponse)
          expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith('token', 'ABC123', {
            height: 123,
            weight: 60,
          })
        })

        it('Redirects to the personal page on success', async () => {
          await action(validRequest, mockResponse)
          expect(mockResponse.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal')
        })

        it('Adds the success message to the flash', async () => {
          await action(validRequest, mockResponse)

          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Height edited',
            type: FlashMessageType.success,
          })
        })

        it('Handles API errors', async () => {
          personalPageService.updatePhysicalAttributes = async () => {
            throw new Error()
          }

          await action(validRequest, mockResponse)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
          expect(mockResponse.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal/edit/height')
        })

        it.each([
          ['-1', 'Enter a number greater than 0'],
          ['Example', 'Enter a number greater than 0'],
        ])('Validations: %s: %s', async (value: string, errorMessage: string) => {
          const req = {
            middleware: defaultMiddleware,
            params: { prisonerNumber: 'ABC123' },
            body: { editField: value },
            flash: jest.fn(),
          } as any
          await action(req, mockResponse)

          expect(req.flash).toHaveBeenCalledWith('errors', [{ text: errorMessage }])
          expect(mockResponse.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal/edit/height')
        })
      })
    })

    describe('imperial', () => {
      describe('edit', () => {
        const action = async (req: any, res: any) => controller.height().imperial.edit(req, res, () => {})

        it('Renders the default edit page with the correct data', async () => {
          const req = {
            params: { prisonerNumber: 'ABC123' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          const res = { render: jest.fn() } as any
          await action(req, res)

          expect(res.render).toHaveBeenCalledWith('pages/edit/heightImperial', {
            pageTitle: expect.anything(),
            prisonerNumber: 'ABC123',
            breadcrumbPrisonerName: 'Last, First',
            errors: [],
            feetValue: 3,
            inchesValue: 4,
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
          const res = { render: jest.fn() } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
        })

        it('Populates the field value from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'ABC123' },
            flash: (key: string): any => {
              if (key === 'feetValue') return ['5']
              if (key === 'inchesValue') return ['10']
              return []
            },
            middleware: defaultMiddleware,
          } as any
          const res = { render: jest.fn() } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ feetValue: '5', inchesValue: '10' }),
          )
        })
      })

      describe('submit', () => {
        let validRequest: any
        let mockResponse: any
        const action = async (req: any, res: any) => controller.height().imperial.submit(req, res, () => {})

        beforeEach(() => {
          validRequest = {
            middleware: defaultMiddleware,
            params: { prisonerNumber: 'ABC123' },
            body: { feet: '5', inches: '10' },
            flash: jest.fn(),
          } as any
          mockResponse = { redirect: jest.fn() } as any
        })

        it('Updates the physical attributes', async () => {
          await action(validRequest, mockResponse)
          expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith('token', 'ABC123', {
            height: 178,
            weight: 60,
          })
        })

        it('Redirects to the personal page on success', async () => {
          await action(validRequest, mockResponse)
          expect(mockResponse.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal')
        })

        it('Adds the success message to the flash', async () => {
          await action(validRequest, mockResponse)

          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Height edited',
            type: FlashMessageType.success,
          })
        })

        it('Handles API errors', async () => {
          personalPageService.updatePhysicalAttributes = async () => {
            throw new Error()
          }

          await action(validRequest, mockResponse)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
          expect(mockResponse.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal/edit/height/imperial')
        })

        // TODO: Update these
        it.each([
          ['-1', 'Enter a number greater than 0'],
          ['Example', 'Enter a number greater than 0'],
        ])('Validations: %s: %s', async (value: string, errorMessage: string) => {
          const req = {
            middleware: defaultMiddleware,
            params: { prisonerNumber: 'ABC123' },
            body: { editField: value },
            flash: jest.fn(),
          } as any
          await action(req, mockResponse)

          expect(req.flash).toHaveBeenCalledWith('errors', [{ text: errorMessage }])
          expect(mockResponse.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal/edit/height/imperial')
        })
      })
    })
  })

  describe('weight', () => {
    describe('metric', () => {
      describe('edit', () => {
        const action = async (req: any, res: any) => controller.weight().metric.edit(req, res, () => {})

        it('Renders the deefault edit page with the correct data from the prison person API', async () => {
          const req = {
            params: { prisonerNumber: 'ABC123' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          const res = { render: jest.fn() } as any
          await action(req, res)

          expect(personalPageService.getPrisonPerson).toHaveBeenCalledWith('token', 'ABC123', true)
          expect(res.render).toHaveBeenCalledWith('pages/edit/weightMetric', {
            pageTitle: expect.anything(),
            prisonerNumber: 'ABC123',
            breadcrumbPrisonerName: 'Last, First',
            errors: [],
            fieldName: expect.anything(),
            fieldValue: 60,
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
          const res = { render: jest.fn() } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
        })

        it('Populates the field value from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'ABC123' },
            flash: (key: string): any => {
              if (key === 'fieldValue') return ['1234']
              return []
            },
            middleware: defaultMiddleware,
          } as any
          const res = { render: jest.fn() } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ fieldValue: '1234' }))
        })
      })

      describe('submit', () => {
        let validRequest: any
        let mockResponse: any
        const action = async (req: any, res: any) => controller.weight().metric.submit(req, res, () => {})

        beforeEach(() => {
          validRequest = {
            middleware: defaultMiddleware,
            params: { prisonerNumber: 'ABC123' },
            body: { editField: '80' },
            flash: jest.fn(),
          } as any
          mockResponse = { redirect: jest.fn() } as any
        })

        it('Updates the physical attributes', async () => {
          await action(validRequest, mockResponse)
          expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith('token', 'ABC123', {
            height: 102,
            weight: 80,
          })
        })

        it('Redirects to the personal page on success', async () => {
          await action(validRequest, mockResponse)
          expect(mockResponse.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal')
        })

        it('Adds the success message to the flash', async () => {
          await action(validRequest, mockResponse)

          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Weight edited',
            type: FlashMessageType.success,
          })
        })

        it('Handles API errors', async () => {
          personalPageService.updatePhysicalAttributes = async () => {
            throw new Error()
          }

          await action(validRequest, mockResponse)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
          expect(mockResponse.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal/edit/weight')
        })

        it.each([
          ['-1', 'Enter a number greater than 0'],
          ['Example', 'Enter a number greater than 0'],
        ])('Validations: %s: %s', async (value: string, errorMessage: string) => {
          const req = {
            middleware: defaultMiddleware,
            params: { prisonerNumber: 'ABC123' },
            body: { editField: value },
            flash: jest.fn(),
          } as any
          await action(req, mockResponse)

          expect(req.flash).toHaveBeenCalledWith('errors', [{ text: errorMessage }])
          expect(mockResponse.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal/edit/weight')
        })
      })
    })

    describe('imperial', () => {
      describe('edit', () => {
        const action = async (req: any, res: any) => controller.weight().imperial.edit(req, res, () => {})

        it('Renders the default edit page with the correct data', async () => {
          const req = {
            params: { prisonerNumber: 'ABC123' },
            flash: (): any => {
              return []
            },
            middleware: defaultMiddleware,
          } as any
          const res = { render: jest.fn() } as any
          await action(req, res)

          expect(res.render).toHaveBeenCalledWith('pages/edit/weightImperial', {
            pageTitle: expect.anything(),
            prisonerNumber: 'ABC123',
            breadcrumbPrisonerName: 'Last, First',
            errors: [],
            stonesValue: 9,
            poundsValue: 6,
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
          const res = { render: jest.fn() } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
        })

        it('Populates the field value from the flash', async () => {
          const req = {
            params: { prisonerNumber: 'ABC123' },
            flash: (key: string): any => {
              if (key === 'stonesValue') return ['5']
              if (key === 'poundsValue') return ['10']
              return []
            },
            middleware: defaultMiddleware,
          } as any
          const res = { render: jest.fn() } as any
          await action(req, res)
          expect(res.render).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ stonesValue: '5', poundsValue: '10' }),
          )
        })
      })

      describe('submit', () => {
        let validRequest: any
        let mockResponse: any
        const action = async (req: any, res: any) => controller.weight().imperial.submit(req, res, () => {})

        beforeEach(() => {
          validRequest = {
            middleware: defaultMiddleware,
            params: { prisonerNumber: 'ABC123' },
            body: { stones: '10', pounds: '12' },
            flash: jest.fn(),
          } as any
          mockResponse = { redirect: jest.fn() } as any
        })

        it('Updates the physical attributes', async () => {
          await action(validRequest, mockResponse)
          expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith('token', 'ABC123', {
            height: 102,
            // TODO - conversions
            weight: 69,
          })
        })

        it('Redirects to the personal page on success', async () => {
          await action(validRequest, mockResponse)
          expect(mockResponse.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal')
        })

        it('Adds the success message to the flash', async () => {
          await action(validRequest, mockResponse)

          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Weight edited',
            type: FlashMessageType.success,
          })
        })

        it('Handles API errors', async () => {
          personalPageService.updatePhysicalAttributes = async () => {
            throw new Error()
          }

          await action(validRequest, mockResponse)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
          expect(mockResponse.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal/edit/weight/imperial')
        })

        // TODO: Update these
        it.each([
          ['-1', 'Enter a number greater than 0'],
          ['Example', 'Enter a number greater than 0'],
        ])('Validations: %s: %s', async (value: string, errorMessage: string) => {
          const req = {
            middleware: defaultMiddleware,
            params: { prisonerNumber: 'ABC123' },
            body: { editField: value },
            flash: jest.fn(),
          } as any
          await action(req, mockResponse)

          expect(req.flash).toHaveBeenCalledWith('errors', [{ text: errorMessage }])
          expect(mockResponse.redirect).toHaveBeenCalledWith('/prisoner/ABC123/personal/edit/weight/imperial')
        })
      })
    })
  })
})
