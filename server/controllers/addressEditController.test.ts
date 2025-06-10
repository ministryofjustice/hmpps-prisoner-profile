import { NextFunction, Request, Response } from 'express'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { AuditService, Page, PostAction } from '../services/auditService'
import { prisonUserMock } from '../data/localMockData/user'
import AddressEditController from './addressEditController'
import AddressService from '../services/addressService'
import EphemeralDataService from '../services/EphemeralDataService'
import { ephemeralDataServiceMock } from '../../tests/mocks/ephemeralDataServiceMock'
import { addressServiceMock } from '../../tests/mocks/addressServiceMock'
import OsAddress from '../data/interfaces/osPlacesApi/osAddress'

const uprn = 1234

describe('Address Edit Controller', () => {
  let req: Request
  let res: Response
  let next: NextFunction
  let addressService: AddressService
  let ephemeralDataService: EphemeralDataService
  let auditService: AuditService
  let controller: AddressEditController

  beforeEach(() => {
    req = {
      id: '123',
      query: {},
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

    addressService = addressServiceMock() as AddressService
    ephemeralDataService = ephemeralDataServiceMock() as EphemeralDataService
    auditService = auditServiceMock()

    controller = new AddressEditController(addressService, ephemeralDataService, auditService)
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

  describe('Find UK address page', () => {
    describe('Rendering the page', () => {
      it('should render the find UK address page', async () => {
        await controller.displayFindUkAddress()(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/edit/address/findUkAddress', {
          pageTitle: 'Find a UK address - Prisoner personal details',
          formTitle: `Find a UK address for John Saunders`,
          errors: [],
          prisonerNumber: 'G6123VU',
          breadcrumbPrisonerName: 'Saunders, John',
          miniBannerData: { prisonerNumber: 'G6123VU', prisonerName: 'Saunders, John' },
        })

        expect(auditService.sendPageView).toHaveBeenCalledWith({
          user: prisonUserMock,
          prisonerNumber: PrisonerMockDataA.prisonerNumber,
          prisonId: PrisonerMockDataA.prisonId,
          correlationId: req.id,
          page: Page.EditAddressFindUkAddress,
        })
      })
    })

    describe('Submitting the page', () => {
      it.each([
        [undefined, 'find-uk-address'],
        [uprn, 'confirm-address'],
      ])(`should handle uprn: '%s' and redirect to '%s' page`, async (uprnResponse: number, redirect: string) => {
        const address = { uprn } as OsAddress
        req = { ...req, body: { uprn: uprnResponse } } as unknown as Request
        addressService.getAddressesByUprn = jest.fn().mockReturnValue([address])

        await controller.submitFindUkAddress()(req, res, next)

        if (!uprnResponse) {
          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/G6123VU/personal/${redirect}`)
          expect(req.flash).toHaveBeenCalledWith('errors', [
            { text: 'Enter a UK address', href: '#address-autosuggest-input' },
          ])
        } else {
          expect(res.redirect).toHaveBeenCalledWith(
            expect.stringContaining(`/prisoner/G6123VU/personal/${redirect}?address=`),
          )
          expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
            user: prisonUserMock,
            prisonerNumber: PrisonerMockDataA.prisonerNumber,
            correlationId: req.id,
            action: PostAction.EditAddressFindUkAddress,
            details: { uprn },
          })
        }
      })

      it('throws NotFoundError if address not returned for uprn', async () => {
        req = { ...req, body: { uprn } } as unknown as Request
        addressService.getAddressesByUprn = jest.fn().mockReturnValue([])

        await expect(controller.submitFindUkAddress()(req, res, next)).rejects.toThrow(
          'Could not find unique address by UPRN',
        )
      })

      it('throws NotFoundError if multiple addresses returned for uprn', async () => {
        req = { ...req, body: { uprn } } as unknown as Request
        addressService.getAddressesByUprn = jest.fn().mockReturnValue([{ uprn: 1 }, { uprn: 2 }])

        await expect(controller.submitFindUkAddress()(req, res, next)).rejects.toThrow(
          'Could not find unique address by UPRN',
        )
      })
    })
  })
})
