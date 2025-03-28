import { NextFunction, Request, Response } from 'express'
import AliasController from './aliasController'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { AuditService, Page, PostAction } from '../services/auditService'
import { prisonUserMock } from '../data/localMockData/user'
import AliasService, { Name } from '../services/aliasService'
import { aliasServiceMock } from '../../tests/mocks/aliasServiceMock'
import { PseudonymResponseMock } from '../data/localMockData/personIntegrationApiReferenceDataMock'
import { FlashMessageType } from '../data/enums/flashMessageType'

describe('Alias Controller', () => {
  let req: Request
  let res: Response
  let next: NextFunction
  let aliasService: AliasService
  let auditService: AuditService
  let controller: AliasController

  beforeEach(() => {
    req = {
      id: '123',
      params: { prisonerNumber: 'G6123VU' },
      middleware: { clientToken: 'CLIENT_TOKEN', prisonerData: PrisonerMockDataA },
      flash: jest.fn().mockReturnValue([]),
      body: {},
    } as unknown as Request

    res = {
      locals: { user: prisonUserMock },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response

    next = jest.fn()

    auditService = auditServiceMock()
    aliasService = aliasServiceMock() as AliasService
    controller = new AliasController(aliasService, auditService)
  })

  describe('Change name purpose page', () => {
    it('should render the change name purpose page', async () => {
      await controller.displayChangeNamePurpose()(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/edit/alias/changeNamePurpose', {
        pageTitle: `Why are you changing this person's name? - Prisoner personal details`,
        formTitle: `Why are you changing John Saunders’ name?`,
        errors: [],
        miniBannerData: {
          prisonerNumber: 'G6123VU',
          prisonerName: 'Saunders, John',
        },
      })

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: prisonUserMock,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        prisonId: PrisonerMockDataA.prisonId,
        correlationId: req.id,
        page: Page.EditNamePurpose,
      })
    })

    it.each([
      [undefined, 'change-name'],
      ['name-wrong', 'enter-corrected-name'],
      ['name-changed', 'enter-new-name'],
    ])('for choice %s should redirect to %s page', async (purpose: string, redirect: string) => {
      req = { ...req, body: { purpose } } as unknown as Request

      await controller.submitChangeNamePurpose()(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/G6123VU/personal/${redirect}`)

      if (!purpose) {
        expect(req.flash).toHaveBeenCalledWith('errors', [{ text: `Select why you're changing John Saunders’ name` }])
      } else {
        expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
          user: prisonUserMock,
          prisonerNumber: PrisonerMockDataA.prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditNamePurpose,
          details: { purpose },
        })
      }
    })
  })

  describe('Change name (correction) page', () => {
    it('should render the change name correction page', async () => {
      await controller.displayChangeNameCorrection()(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/edit/alias/changeName', {
        pageTitle: `Enter this person's correct name - Prisoner personal details`,
        formTitle: `Enter John Saunders’ correct name`,
        warningText: 'This will become their main name in DPS and NOMIS.',
        errors: [],
        formValues: {
          firstName: 'John',
          middleName1: 'Middle',
          middleName2: 'Names',
          lastName: 'Saunders',
        },
        miniBannerData: {
          prisonerNumber: 'G6123VU',
          prisonerName: 'Saunders, John',
        },
      })
    })

    it('Populates the errors from the flash', async () => {
      req = {
        ...req,
        flash: (key: string): any => {
          if (key === 'errors') return ['error']
          return []
        },
      } as any

      await controller.displayChangeNameCorrection()(req, res, next)

      expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
    })

    it('Populates the field value from the flash', async () => {
      req = {
        ...req,
        flash: (key: string): any => {
          return key === 'requestBody' ? [JSON.stringify({ firstName: 'first' })] : []
        },
      } as any

      await controller.displayChangeNameCorrection()(req, res, next)

      expect(res.render).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ formValues: { firstName: 'first' } }),
      )
    })

    it('Sends a page view audit event', async () => {
      await controller.displayChangeNameCorrection()(req, res, next)

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: prisonUserMock,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        prisonId: PrisonerMockDataA.prisonId,
        correlationId: req.id,
        page: Page.EditNameCorrection,
      })
    })

    it('submits the name change', async () => {
      const newName: Name = {
        firstName: 'first',
        middleName1: 'middleone',
        middleName2: 'middletwo',
        lastName: 'last',
      }

      req = { ...req, body: newName } as unknown as Request

      aliasService.updateWorkingName = jest.fn().mockResolvedValue({ ...PseudonymResponseMock, ...newName })

      await controller.submitChangeNameCorrection()(req, res, next)

      expect(aliasService.updateWorkingName).toHaveBeenCalledWith(
        expect.anything(),
        prisonUserMock,
        PrisonerMockDataA.prisonerNumber,
        newName,
      )

      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/personal#personal-details`,
      )

      expect(req.flash).toHaveBeenCalledWith('flashMessage', {
        text: 'Name updated',
        type: FlashMessageType.success,
        fieldName: 'full-name',
      })
    })

    it('Submission handles API errors', async () => {
      aliasService.updateWorkingName = async () => {
        throw new Error()
      }

      await controller.submitChangeNameCorrection()(req, res, next)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/personal/enter-corrected-name`,
      )
    })

    it('Sends a post success audit event', async () => {
      const newName: Name = {
        firstName: 'first',
        middleName1: 'middleone',
        middleName2: 'middletwo',
        lastName: 'last',
      }

      req = { ...req, body: newName } as unknown as Request

      aliasService.updateWorkingName = jest.fn().mockResolvedValue({ ...PseudonymResponseMock, ...newName })

      await controller.submitChangeNameCorrection()(req, res, next)

      const expectedAuditEvent = {
        user: prisonUserMock,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        correlationId: req.id,
        action: PostAction.EditNameCorrection,
        details: {
          fieldName: 'name',
          previous: {
            firstName: 'JOHN',
            middleName1: 'MIDDLE',
            middleName2: 'NAMES',
            lastName: 'SAUNDERS',
          },
          updated: newName,
        },
      }

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
    })
  })

  describe('Change name (legal name change) page', () => {
    it('should render the change name (legal name change) page', async () => {
      await controller.displayChangeNameLegal()(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/edit/alias/changeName', {
        pageTitle: `Enter this person's new name - Prisoner personal details`,
        formTitle: `Enter John Saunders’ new name`,
        warningText:
          'This will become their main name in DPS and NOMIS. The previous name will be recorded as an alias.',
        errors: [],
        formValues: {
          firstName: 'John',
          middleName1: 'Middle',
          middleName2: 'Names',
          lastName: 'Saunders',
        },
        miniBannerData: {
          prisonerNumber: 'G6123VU',
          prisonerName: 'Saunders, John',
        },
      })
    })

    it('Populates the errors from the flash', async () => {
      req = {
        ...req,
        flash: (key: string): any => {
          if (key === 'errors') return ['error']
          return []
        },
      } as any

      await controller.displayChangeNameLegal()(req, res, next)

      expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
    })

    it('Populates the field value from the flash', async () => {
      req = {
        ...req,
        flash: (key: string): any => {
          return key === 'requestBody' ? [JSON.stringify({ firstName: 'first' })] : []
        },
      } as any

      await controller.displayChangeNameLegal()(req, res, next)

      expect(res.render).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ formValues: { firstName: 'first' } }),
      )
    })

    it('Sends a page view audit event', async () => {
      await controller.displayChangeNameLegal()(req, res, next)

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: prisonUserMock,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        prisonId: PrisonerMockDataA.prisonId,
        correlationId: req.id,
        page: Page.EditNameLegal,
      })
    })

    it('submits the name change', async () => {
      const newName: Name = {
        firstName: 'first',
        middleName1: 'middleone',
        middleName2: 'middletwo',
        lastName: 'last',
      }

      req = { ...req, body: newName } as unknown as Request

      aliasService.createNewWorkingName = jest.fn().mockResolvedValue({ ...PseudonymResponseMock, ...newName })

      await controller.submitChangeNameLegal()(req, res, next)

      expect(aliasService.createNewWorkingName).toHaveBeenCalledWith(
        expect.anything(),
        prisonUserMock,
        PrisonerMockDataA.prisonerNumber,
        newName,
      )

      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/personal#personal-details`,
      )

      expect(req.flash).toHaveBeenCalledWith('flashMessage', {
        text: 'Name updated',
        type: FlashMessageType.success,
        fieldName: 'full-name',
      })
    })

    it('Submission handles API errors', async () => {
      aliasService.createNewWorkingName = async () => {
        throw new Error()
      }

      await controller.submitChangeNameLegal()(req, res, next)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${PrisonerMockDataA.prisonerNumber}/personal/enter-new-name`)
    })

    it('Sends a post success audit event', async () => {
      const newName: Name = {
        firstName: 'first',
        middleName1: 'middleone',
        middleName2: 'middletwo',
        lastName: 'last',
      }

      req = { ...req, body: newName } as unknown as Request

      aliasService.createNewWorkingName = jest.fn().mockResolvedValue({ ...PseudonymResponseMock, ...newName })

      await controller.submitChangeNameLegal()(req, res, next)

      const expectedAuditEvent = {
        user: prisonUserMock,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        correlationId: req.id,
        action: PostAction.EditNameLegal,
        details: {
          fieldName: 'name',
          previous: {
            firstName: 'JOHN',
            middleName1: 'MIDDLE',
            middleName2: 'NAMES',
            lastName: 'SAUNDERS',
          },
          updated: newName,
        },
      }

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
    })
  })
})
