import { NextFunction, Request, Response } from 'express'
import AliasController from './aliasController'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { AuditService, Page, PostAction } from '../services/auditService'
import { prisonUserMock } from '../data/localMockData/user'

describe('Alias Controller', () => {
  let req: Request
  let res: Response
  let next: NextFunction
  let auditService: AuditService
  let controller: AliasController

  beforeEach(() => {
    req = {
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
    controller = new AliasController(auditService)
  })

  describe('Change name decision page', () => {
    it('should render the change name decision page', async () => {
      await controller.displayChangeNameDecision()(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/edit/alias/changeNameDecision', {
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
        page: Page.EditNameDecision,
      })
    })

    it.each([
      [undefined, 'change-name'],
      ['name-wrong', 'enter-corrected-name'],
      ['name-changed', 'enter-new-name'],
    ])('for choice %s should redirect to %s page', async (decision: string, redirect: string) => {
      req = { ...req, body: { decision } } as unknown as Request

      await controller.submitChangeNameDecision()(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/G6123VU/personal/${redirect}`)

      if (!decision) {
        expect(req.flash).toHaveBeenCalledWith('errors', [{ text: `Select why you're changing John Saunders’ name` }])
      } else {
        expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
          user: prisonUserMock,
          prisonerNumber: PrisonerMockDataA.prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditNameDecision,
          details: { decision },
        })
      }
    })
  })
})
