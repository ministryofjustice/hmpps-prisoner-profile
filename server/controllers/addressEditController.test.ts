import { NextFunction, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { AuditService, Page, PostAction } from '../services/auditService'
import { prisonUserMock } from '../data/localMockData/user'
import AddressEditController from './addressEditController'
import AddressService from '../services/addressService'
import EphemeralDataService from '../services/ephemeralDataService'
import { ephemeralDataServiceMock } from '../../tests/mocks/ephemeralDataServiceMock'
import { addressServiceMock } from '../../tests/mocks/addressServiceMock'
import OsAddress from '../data/interfaces/osPlacesApi/osAddress'
import { AddressRequestDto } from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { AddressLocation } from '../services/mappers/addressMapper'

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
  addressTypes: ['HOME'],
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
        formTitle: 'Where is John Saunders’ address?',
        options: [
          { value: 'uk', text: 'United Kingdom' },
          { value: 'overseas', text: 'Overseas' },
          { divider: 'or' },
          { value: 'no_fixed_address', text: 'No fixed address' },
        ],
        errors: [],
        breadcrumbPrisonerName: 'Saunders, John',
        prisonerNumber,
        redirectAnchor: 'addresses',
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
          manualEntryUrl: '/prisoner/G6123VU/personal/add-uk-address',
          cancelLink: `/prisoner/${prisonerNumber}/personal#addresses`,
          backLinkUrl: 'where-is-address',
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
        addressService.getCityCode = jest.fn().mockReturnValue({ description: 'My Town' })
        addressService.getCountyCode = jest.fn().mockReturnValue({ description: 'My County' })
        addressService.getCountryCode = jest.fn().mockReturnValue({ description: 'England' })

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
          backLinkUrl: `/prisoner/${prisonerNumber}/personal/find-uk-address`,
          cancelLink: `/prisoner/${prisonerNumber}/personal#addresses`,
          enterDifferentAddressLink: `/prisoner/${prisonerNumber}/personal/where-is-address`,
          confirmPrimaryOrPostalAddress: true,
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
          expect.objectContaining({
            address: { ...address, cacheId: addressCacheId },
          }),
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
        addressService.getCityCode = jest.fn().mockReturnValue({ description: 'My Town' })
        addressService.getCountyCode = jest.fn().mockReturnValue({ description: 'My County' })
        addressService.getCountryCode = jest.fn().mockReturnValue({ description: 'England' })

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
          backLinkUrl: `/prisoner/${prisonerNumber}/personal/confirm-address?address=${addressCacheId}`,
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
          prisonUserMock,
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

      it('handles empty address strings', async () => {
        req = { ...req, body: { primaryOrPostal: 'primary' }, query: { address: addressCacheId } } as unknown as Request

        ephemeralDataService.getData = jest.fn().mockReturnValue({
          key: addressCacheId,
          value: { address: { ...addressRequest, thoroughfareName: '' }, route: 'find-uk-address' },
        })

        await controller.submitPrimaryOrPostalAddress()(req, res, next)

        expect(addressService.createAddress).toHaveBeenCalledWith(
          clientToken,
          prisonerNumber,
          expect.objectContaining({ thoroughfareName: null }),
          prisonUserMock,
        )
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

  describe('Manual Address pages', () => {
    const pageTitlePrefix = 'Page title prefix'
    const formTitlePrefix = 'Form title prefix'

    beforeEach(async () => {
      addressService.getCityReferenceData = jest.fn().mockReturnValue([{ code: 'TOWN1', description: 'My Town' }])
      addressService.getCountyReferenceData = jest.fn().mockReturnValue([{ code: 'COUNTY1', description: 'My County' }])
      addressService.getCountryReferenceData = jest
        .fn()
        .mockReturnValue([{ code: 'COUNTRY1', description: 'My Country' }])
    })

    describe('Rendering the page', () => {
      test.each`
        addressLocation                     | auditPage                               | uk       | noFixedAddress | noFixedAddressOption | backLinkUrl
        ${AddressLocation.uk}               | ${Page.EditAddressUkManual}             | ${true}  | ${false}       | ${false}             | ${'find-uk-address'}
        ${AddressLocation.no_fixed_address} | ${Page.EditAddressNoFixedAddressManual} | ${true}  | ${true}        | ${false}             | ${'where-is-address'}
        ${AddressLocation.overseas}         | ${Page.EditAddressOverseasManual}       | ${false} | ${false}       | ${true}              | ${'where-is-address'}
      `(
        `Location: '$addressLocation', audit: '$auditPage', uk: '$uk', noFixedAddress: '$noFixedAddress', noFixedAddressOption: '$noFixedAddressOption', backLinkUrl: '$backLink'`,
        async ({ addressLocation, auditPage, uk, noFixedAddress, noFixedAddressOption, backLinkUrl }) => {
          await controller.displayManualEditAddress({ addressLocation, auditPage, formTitlePrefix, pageTitlePrefix })(
            req,
            res,
            next,
          )

          expect(res.render).toHaveBeenCalledWith('pages/edit/address/manualAddress', {
            pageTitle: `${pageTitlePrefix} - Prisoner personal details`,
            formTitle: `${formTitlePrefix} for John Saunders`,
            errors: [],
            requestBody: null,
            townOrCityOptions: [{ value: 'TOWN1', text: 'My Town' }],
            countyOptions: [{ value: 'COUNTY1', text: 'My County' }],
            countryOptions: [{ value: 'COUNTRY1', text: 'My Country' }],
            ukAddress: uk,
            noFixedAddress,
            noFixedAddressCheckbox: noFixedAddressOption,
            backLinkUrl,
            cancelLink: `/prisoner/${prisonerNumber}/personal#addresses`,
            prisonerNumber,
            breadcrumbPrisonerName: 'Saunders, John',
            miniBannerData: { prisonerNumber, prisonerName: 'Saunders, John' },
          })

          expect(auditService.sendPageView).toHaveBeenCalledWith({
            user: prisonUserMock,
            prisonerNumber,
            prisonId: PrisonerMockDataA.prisonId,
            correlationId: req.id,
            page: auditPage,
          })
        },
      )

      it('selects options from the requestBody', async () => {
        req = {
          ...req,
          flash: (key: string): any => {
            return key === 'requestBody'
              ? [JSON.stringify({ townOrCity: 'TOWN1', county: 'COUNTY1', country: 'COUNTRY1' })]
              : []
          },
        } as Request

        await controller.displayManualEditAddress({
          addressLocation: AddressLocation.uk,
          auditPage: Page.EditAddressUkManual,
          formTitlePrefix,
          pageTitlePrefix,
        })(req, res, next)

        expect(res.render).toHaveBeenCalledWith(
          'pages/edit/address/manualAddress',
          expect.objectContaining({
            townOrCityOptions: [{ selected: true, value: 'TOWN1', text: 'My Town' }],
            countyOptions: [{ selected: true, value: 'COUNTY1', text: 'My County' }],
            countryOptions: [{ selected: true, value: 'COUNTRY1', text: 'My Country' }],
          }),
        )
      })
    })

    describe('Submitting the page', () => {
      test.each`
        addressLocation                     | auditAction                                   | noFixedAddressChecked | noFixedAbode
        ${AddressLocation.uk}               | ${PostAction.EditAddressUkManual}             | ${undefined}          | ${false}
        ${AddressLocation.no_fixed_address} | ${PostAction.EditAddressNoFixedAddressManual} | ${undefined}          | ${true}
        ${AddressLocation.overseas}         | ${PostAction.EditAddressOverseasManual}       | ${false}              | ${false}
        ${AddressLocation.overseas}         | ${PostAction.EditAddressOverseasManual}       | ${true}               | ${true}
      `(
        `Location: '$addressLocation', audit: '$auditAction', noFixedAddressChecked: '$noFixedAddressChecked', noFixedAbode: '$noFixedAbode'`,
        async ({ addressLocation, auditAction, noFixedAddressChecked, noFixedAbode }) => {
          addressService.sanitisePostcode = jest.fn().mockReturnValue('SW1H 9AJ')
          const submittedAddress = {
            noFixedAddress: noFixedAddressChecked,
            houseOrBuildingName: 'house or building name',
            houseNumber: '123',
            addressLine1: 'address line 1',
            addressLine2: 'address line 2',
            townOrCity: 'TOWN1',
            county: 'COUNTY1',
            postcode: 'sW1h9aJ',
            country: 'COUNTRY1',
          }

          const cachedAddress = {
            noFixedAbode,
            buildingNumber: '123',
            thoroughfareName: 'Address Line 1',
            dependantLocality: 'Address Line 2',
            postTownCode: 'TOWN1',
            postCode: 'SW1H 9AJ',
            countyCode: 'COUNTY1',
            countryCode: 'COUNTRY1',
          } as AddressRequestDto

          req = { ...req, body: submittedAddress, path: '/path' } as unknown as Request

          await controller.submitManualEditAddress({ addressLocation, auditAction })(req, res, next)

          expect(ephemeralDataService.cacheData).toHaveBeenCalledWith({
            address: expect.objectContaining(cachedAddress),
            route: 'path',
          })

          expect(res.redirect).toHaveBeenCalledWith(
            `/prisoner/${prisonerNumber}/personal/confirm-address?address=${addressCacheId}`,
          )

          expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
            user: prisonUserMock,
            prisonerNumber,
            correlationId: req.id,
            action: auditAction,
            details: { address: expect.objectContaining(cachedAddress) },
          })
        },
      )
    })
  })
})
