import { NextFunction, Request, Response } from 'express'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { AuditService, Page, PostAction } from '../services/auditService'
import { prisonUserMock } from '../data/localMockData/user'
import AddressEditController from './addressEditController'

describe('Address Edit Controller', () => {
  let req: Request
  let res: Response
  let next: NextFunction
  let auditService: AuditService
  let controller: AddressEditController

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

    controller = new AddressEditController(auditService)
  })

  describe('Where is the address page', () => {
    it('should render the where is the address page', async () => {
      await controller.displayWhereIsTheAddress()(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/edit/radioField', {
        pageTitle: `Where is this person’s address? - Prisoner personal details`,
        formTitle: 'Where is the address?',
        options: [
          { value: 'uk', text: 'United Kingdom' },
          { value: 'overseas', text: 'Overseas' },
          { divider: 'or' },
          { value: 'no_fixed_address', text: 'No fixed address' },
        ],
        errors: [],
        breadcrumbPrisonerName: 'Saunders, John',
        prisonerNumber: 'G6123VU',
        submitButtonText: 'Continue',
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
        page: Page.EditAddressLocation,
      })
    })

    it.each([
      [undefined, 'where-is-address'],
      ['uk', 'find-uk-address'],
      ['overseas', 'add-overseas-address'],
      ['no_fixed_address', 'add-uk-no-fixed-address'],
    ])('for choice %s should redirect to %s page', async (location: string, redirect: string) => {
      req = { ...req, body: { radioField: location } } as unknown as Request

      await controller.submitWhereIsTheAddress()(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/G6123VU/personal/${redirect}`)

      if (!location) {
        expect(req.flash).toHaveBeenCalledWith('errors', [{ text: 'Select where the address is', href: '#radio' }])
      } else {
        expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
          user: prisonUserMock,
          prisonerNumber: PrisonerMockDataA.prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditAddressLocation,
          details: { location },
        })
      }
    })
  })
})
