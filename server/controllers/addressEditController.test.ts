import { NextFunction, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
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
import { AddressRequestDto } from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { FlashMessageType } from '../data/enums/flashMessageType'

const clientToken = 'CLIENT_TOKEN'
const { prisonerNumber } = PrisonerMockDataA
const uprn = 1234
const addressCacheId = uuidv4()
const addressRequest: AddressRequestDto = {
  uprn,
  buildingNumber: '1',
  thoroughfareName: 'The Road',
  postTownCode: '111',
  countyCode: '222',
  countryCode: '333',
  postCode: 'A12 3BC',
  fromDate: '2025-06-09',
  addressTypes: [],
}

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
      params: { prisonerNumber },
      middleware: { clientToken, prisonerData: PrisonerMockDataA },
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

    ephemeralDataService.cacheData = jest.fn().mockReturnValue(addressCacheId)
    controller = new AddressEditController(addressService, ephemeralDataService, auditService)
  })

  afterEach(() => {
    jest.resetAllMocks()
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
        prisonerNumber,
        submitButtonText: 'Continue',
        miniBannerData: {
          prisonerNumber,
          prisonerName: 'Saunders, John',
        },
      })

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: prisonUserMock,
        prisonerNumber,
        prisonId: PrisonerMockDataA.prisonId,
        correlationId: req.id,
        page: Page.EditAddressLocation,
      })
    })

    it.each([
      ['uk', 'find-uk-address'],
      ['overseas', 'add-overseas-address'],
      ['no_fixed_address', 'add-uk-no-fixed-address'],
    ])('for choice %s should redirect to %s page', async (location: string, redirect: string) => {
      req = { ...req, body: { radioField: location } } as unknown as Request

      await controller.submitWhereIsTheAddress()(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/${redirect}`)

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
        user: prisonUserMock,
        prisonerNumber,
        correlationId: req.id,
        action: PostAction.EditAddressLocation,
        details: { location },
      })
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
          prisonerNumber,
          breadcrumbPrisonerName: 'Saunders, John',
          miniBannerData: { prisonerNumber, prisonerName: 'Saunders, John' },
        })

        expect(auditService.sendPageView).toHaveBeenCalledWith({
          user: prisonUserMock,
          prisonerNumber,
          prisonId: PrisonerMockDataA.prisonId,
          correlationId: req.id,
          page: Page.EditAddressFindUkAddress,
        })
      })
    })

    describe('Submitting the page', () => {
      it('should submit the selected uprn', async () => {
        const address = { uprn } as OsAddress
        req = { ...req, body: { uprn } } as unknown as Request
        addressService.getAddressByUprn = jest.fn().mockReturnValue(address)

        await controller.submitFindUkAddress()(req, res, next)

        expect(ephemeralDataService.cacheData).toHaveBeenCalledWith({ address, route: 'find-uk-address' })
        expect(res.redirect).toHaveBeenCalledWith(
          `/prisoner/${prisonerNumber}/personal/confirm-address?address=${addressCacheId}`,
        )

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
          user: prisonUserMock,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditAddressFindUkAddress,
          details: { uprn },
        })
      })
    })
  })

  describe('Confirm address page', () => {
    describe('Rendering the page', () => {
      it('should render the confirm address page', async () => {
        req = { ...req, query: { address: addressCacheId } } as unknown as Request
        ephemeralDataService.getData = jest
          .fn()
          .mockReturnValue({ key: addressCacheId, value: { address: addressRequest, route: 'find-uk-address' } })
        addressService.getCityReferenceData = jest.fn().mockReturnValue({ description: 'My Town' })
        addressService.getCountyReferenceData = jest.fn().mockReturnValue({ description: 'My County' })
        addressService.getCountryReferenceData = jest.fn().mockReturnValue({ description: 'England' })

        await controller.displayConfirmAddress()(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/edit/address/confirmAddress', {
          pageTitle: 'Confirm address - Prisoner personal details',
          formTitle: 'Confirm address',
          address: {
            ...addressRequest,
            cacheId: addressCacheId,
            city: 'My Town',
            county: 'My County',
            country: 'England',
          },
          prisonerNumber,
          breadcrumbPrisonerName: 'Saunders, John',
          miniBannerData: { prisonerNumber, prisonerName: 'Saunders, John' },
          backLink: `/prisoner/${prisonerNumber}/personal/find-uk-address`,
        })

        expect(auditService.sendPageView).toHaveBeenCalledWith({
          user: prisonUserMock,
          prisonerNumber,
          prisonId: PrisonerMockDataA.prisonId,
          correlationId: req.id,
          page: Page.EditAddressConfirm,
        })
      })

      it('should throw not found error if address uuid not provided', async () => {
        req = { ...req, query: {} } as unknown as Request

        await expect(controller.displayConfirmAddress()(req, res, next)).rejects.toThrow(
          'Could not find cached address',
        )

        expect(res.render).not.toHaveBeenCalled()
      })

      it('should throw not found error if address uuid not present in cache', async () => {
        req = { ...req, query: { address: addressCacheId } } as unknown as Request
        ephemeralDataService.getData = jest.fn().mockReturnValue(undefined)

        await expect(controller.displayConfirmAddress()(req, res, next)).rejects.toThrow(
          'Could not find cached address',
        )

        expect(res.render).not.toHaveBeenCalled()
      })

      it('should handle missing city, county and country codes', async () => {
        const address: AddressRequestDto = {
          ...addressRequest,
          postTownCode: undefined,
          countyCode: undefined,
          countryCode: undefined,
        }

        req = { ...req, query: { address: addressCacheId } } as unknown as Request
        ephemeralDataService.getData = jest
          .fn()
          .mockReturnValue({ key: addressCacheId, value: { address, route: 'find-uk-address' } })

        await controller.displayConfirmAddress()(req, res, next)

        expect(res.render).toHaveBeenCalledWith(
          'pages/edit/address/confirmAddress',
          expect.objectContaining({ address: { ...address, cacheId: addressCacheId } }),
        )
      })
    })
  })

  describe('Primary or postal address page', () => {
    describe('Rendering the page', () => {
      beforeEach(() => {
        addressService.getAddresses = jest.fn().mockReturnValue([])
      })

      it('Should render the primary or postal address page', async () => {
        req = { ...req, query: { address: addressCacheId } } as unknown as Request
        ephemeralDataService.getData = jest
          .fn()
          .mockReturnValue({ key: addressCacheId, value: { address: addressRequest, route: 'find-uk-address' } })
        addressService.getCityReferenceData = jest.fn().mockReturnValue({ description: 'My Town' })
        addressService.getCountyReferenceData = jest.fn().mockReturnValue({ description: 'My County' })
        addressService.getCountryReferenceData = jest.fn().mockReturnValue({ description: 'England' })

        await controller.displayPrimaryOrPostalAddress()(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/edit/address/primaryOrPostalAddress', {
          pageTitle: 'Select if primary or postal address - Prisoner personal details',
          formTitle: 'Is this John Saunders’ primary or postal address?',
          address: {
            ...addressRequest,
            cacheId: addressCacheId,
            city: 'My Town',
            county: 'My County',
            country: 'England',
          },
          existingPrimary: false,
          existingPostal: false,
          errors: [],
          prisonerNumber,
          breadcrumbPrisonerName: 'Saunders, John',
          miniBannerData: { prisonerNumber, prisonerName: 'Saunders, John' },
          backLink: `/prisoner/${prisonerNumber}/personal/confirm-address?address=${addressCacheId}`,
        })

        expect(auditService.sendPageView).toHaveBeenCalledWith({
          user: prisonUserMock,
          prisonerNumber,
          prisonId: PrisonerMockDataA.prisonId,
          correlationId: req.id,
          page: Page.EditAddressPrimaryOrPostal,
        })
      })

      it('should throw not found error if address uuid not provided', async () => {
        req = { ...req, query: {} } as unknown as Request

        await expect(controller.displayPrimaryOrPostalAddress()(req, res, next)).rejects.toThrow(
          'Could not find cached address',
        )

        expect(res.render).not.toHaveBeenCalled()
      })

      it('should throw not found error if address uuid not present in cache', async () => {
        req = { ...req, query: { address: addressCacheId } } as unknown as Request
        ephemeralDataService.getData = jest.fn().mockReturnValue(undefined)

        await expect(controller.displayPrimaryOrPostalAddress()(req, res, next)).rejects.toThrow(
          'Could not find cached address',
        )

        expect(res.render).not.toHaveBeenCalled()
      })

      it('should handle missing city, county and country codes', async () => {
        const address: AddressRequestDto = {
          ...addressRequest,
          postTownCode: undefined,
          countyCode: undefined,
          countryCode: undefined,
        }

        req = { ...req, query: { address: addressCacheId } } as unknown as Request
        ephemeralDataService.getData = jest
          .fn()
          .mockReturnValue({ key: addressCacheId, value: { address, route: 'find-uk-address' } })

        await controller.displayPrimaryOrPostalAddress()(req, res, next)

        expect(res.render).toHaveBeenCalledWith(
          'pages/edit/address/primaryOrPostalAddress',
          expect.objectContaining({ address: { ...address, cacheId: addressCacheId } }),
        )
      })

      it('should warn of existing primary or postal addresses', async () => {
        addressService.getAddresses = jest.fn().mockReturnValue([{ primaryAddress: true, postalAddress: true }])

        req = { ...req, query: { address: addressCacheId } } as unknown as Request
        ephemeralDataService.getData = jest
          .fn()
          .mockReturnValue({ key: addressCacheId, value: { address: addressRequest, route: 'find-uk-address' } })

        await controller.displayPrimaryOrPostalAddress()(req, res, next)

        expect(res.render).toHaveBeenCalledWith(
          'pages/edit/address/primaryOrPostalAddress',
          expect.objectContaining({ existingPrimary: true, existingPostal: true }),
        )
      })
    })

    describe('Submitting the page', () => {
      it.each([
        // response, primary, postal
        ['primary', true, false],
        ['postal', false, true],
        ['neither', false, false],
        [['primary', 'postal'], true, true],
      ])(`handles response '%s': submitting primary: %s, postal: %s`, async (primaryOrPostal, primary, postal) => {
        const expectedAddressSubmission = {
          ...addressRequest,
          primaryAddress: primary,
          postalAddress: postal,
        }

        req = { ...req, body: { primaryOrPostal }, query: { address: addressCacheId } } as unknown as Request

        ephemeralDataService.getData = jest
          .fn()
          .mockReturnValue({ key: addressCacheId, value: { address: addressRequest, route: 'find-uk-address' } })

        await controller.submitPrimaryOrPostalAddress()(req, res, next)

        expect(addressService.createAddress).toHaveBeenCalledWith(
          clientToken,
          prisonerNumber,
          expectedAddressSubmission,
        )

        expect(req.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Address updated',
          type: FlashMessageType.success,
          fieldName: 'addresses',
        })

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
          user: prisonUserMock,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditAddressPrimaryOrPostal,
          details: { address: expectedAddressSubmission },
        })

        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#addresses`)
      })

      it('handles missing address cache id', async () => {
        req = { ...req, body: { primaryOrPostal: 'neither' }, query: {} } as unknown as Request

        await expect(controller.submitPrimaryOrPostalAddress()(req, res, next)).rejects.toThrow(
          'Could not find cached address',
        )
      })

      it('handles API error', async () => {
        req = { ...req, body: { primaryOrPostal: 'neither' }, query: { address: addressCacheId } } as unknown as Request

        ephemeralDataService.getData = jest
          .fn()
          .mockReturnValue({ key: addressCacheId, value: { address: addressRequest, route: 'find-uk-address' } })

        addressService.createAddress = async () => {
          throw new Error()
        }

        await controller.submitPrimaryOrPostalAddress()(req, res, next)

        expect(req.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith(
          `/prisoner/${prisonerNumber}/personal/primary-or-postal-address?address=${addressCacheId}`,
        )
      })
    })
  })
})
