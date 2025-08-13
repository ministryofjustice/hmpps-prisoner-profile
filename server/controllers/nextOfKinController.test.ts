import { Request, Response } from 'express'
import { randomUUID, UUID } from 'node:crypto'
import NextOfKinService from '../services/nextOfKinService'
import { AuditService, Page, PostAction } from '../services/auditService'
import NextOfKinController, { PersonalRelationshipsContactForm } from './nextOfKinController'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { PersonalRelationshipsReferenceDataDomain } from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import {
  OfficialRelationshipsReferenceCodesMock,
  SocialRelationshipsReferenceCodesMock,
} from '../data/localMockData/personalRelationshipsApiMock'
import AddressService from '../services/addressService'
import { addressServiceMock } from '../../tests/mocks/addressServiceMock'
import { ephemeralDataServiceMock } from '../../tests/mocks/ephemeralDataServiceMock'
import EphemeralDataService from '../services/ephemeralDataService'
import { AddressLocation } from '../services/mappers/addressMapper'
import { AddressRequestDto } from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import OsAddress from '../data/interfaces/osPlacesApi/osAddress'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'

describe('NextOfKinController', () => {
  let nextOfKinService: NextOfKinService
  let addressService: AddressService
  let ephemeralDataService: EphemeralDataService
  let auditService: AuditService
  let controller: NextOfKinController
  let req: Request
  let res: Response
  let next: () => void
  const prisonerNumber = 'A1234BC'
  const clientToken = 'CLIENT_TOKEN'
  const uprn = 1234
  const addressCacheId = randomUUID()
  const contactCacheId = randomUUID()
  const cachedContact = {
    id: 9876,
    name: 'Albert Wesker',
  }
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

  beforeEach(() => {
    nextOfKinService = {
      getReferenceData: jest.fn().mockResolvedValue({
        Title: [],
        OfficialRelationship: OfficialRelationshipsReferenceCodesMock,
        SocialRelationship: SocialRelationshipsReferenceCodesMock,
        City: [],
      }),
      createContact: jest.fn().mockResolvedValue({
        createdContact: {
          id: 12345,
          firstName: 'Albert',
          lastName: 'Wesker',
        },
      }),
    } as unknown as NextOfKinService

    addressService = addressServiceMock() as AddressService
    ephemeralDataService = ephemeralDataServiceMock() as EphemeralDataService
    auditService = auditServiceMock()

    controller = new NextOfKinController(nextOfKinService, addressService, ephemeralDataService, auditService)

    req = {
      middleware: {
        prisonerData: {
          ...PrisonerMockDataA,
          prisonerNumber,
        },
        inmateDetail: inmateDetailMock,
        clientToken,
      },
      flash: jest.fn(),
      body: {},
      query: {},
      params: { prisonerNumber },
      id: 'request-id',
    } as Partial<Request> as Request

    res = {
      locals: {
        user: {
          username: 'USER1',
          staffId: 123,
        },
      },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('displayNextOfKinEmergencyContact', () => {
    it('should render the next of kin and emergency contacts page with data from flash', async () => {
      const requestBodyFlash: Partial<PersonalRelationshipsContactForm> = {
        firstName: 'John',
        lastName: 'Doe',
      }

      req.flash = jest.fn().mockImplementation(key => {
        if (key === 'requestBody') return [JSON.stringify(requestBodyFlash)]
        return []
      })

      const handler = controller.displayNextOfKinEmergencyContact()
      await handler(req, res, next)

      expect(nextOfKinService.getReferenceData).toHaveBeenCalledWith(clientToken, [
        PersonalRelationshipsReferenceDataDomain.Title,
        PersonalRelationshipsReferenceDataDomain.OfficialRelationship,
        PersonalRelationshipsReferenceDataDomain.SocialRelationship,
        PersonalRelationshipsReferenceDataDomain.City,
      ])

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: res.locals.user,
        prisonerNumber,
        prisonId: 'MDI',
        correlationId: req.id,
        page: Page.EditNextOfKin,
      })

      expect(res.render).toHaveBeenCalledWith('pages/nextOfKin/nextOfKinEmergencyContacts', {
        pageTitle: 'Next of kin and emergency contacts - Prisoner personal details',
        title: 'Add a next of kin or emergency contact for John Saunders',
        formValues: requestBodyFlash,
        errors: [],
        titleOptions: expect.arrayContaining([{ value: '', text: 'Select title' }]),
        naturalPrisonerName: 'John Saunders',
        relationshipOptions: expect.arrayContaining([{ value: 'S_SIS', text: 'Sister', selected: false }]),
        cityOptions: expect.arrayContaining([{ value: '', text: '' }]),
        miniBannerData: {
          cellLocation: '1-1-035',
          prisonerName: 'Saunders, John',
          prisonerNumber: 'A1234BC',
          prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=1413311&fullSizeImage=false',
        },
      })
    })

    it('should render the page with default form values if there is no flash data', async () => {
      req.flash = jest.fn().mockImplementation(() => [])

      const handler = controller.displayNextOfKinEmergencyContact()
      await handler(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/nextOfKin/nextOfKinEmergencyContacts', {
        pageTitle: 'Next of kin and emergency contacts - Prisoner personal details',
        title: 'Add a next of kin or emergency contact for John Saunders',
        formValues: {},
        errors: [],
        titleOptions: expect.arrayContaining([{ value: '', text: 'Select title' }]),
        naturalPrisonerName: 'John Saunders',
        relationshipOptions: expect.arrayContaining([{ value: 'S_SIS', text: 'Sister', selected: false }]),
        cityOptions: expect.arrayContaining([{ value: '', text: '' }]),
        miniBannerData: {
          cellLocation: '1-1-035',
          prisonerName: 'Saunders, John',
          prisonerNumber: 'A1234BC',
          prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=1413311&fullSizeImage=false',
        },
      })
    })
  })

  describe('submitNextOfKinEmergencyContact', () => {
    it('should handle successful form submission and redirect to the success page', async () => {
      const formBody = {
        firstName: 'John',
        lastName: 'Doe',
        relationshipTypeId: 'S_SIS',
        contactType: 'nextOfKin',
        noFixedAddress: false,
      }

      req.body = formBody

      const handler = controller.submitNextOfKinEmergencyContact()
      await handler(req, res, next)

      expect(nextOfKinService.createContact).toHaveBeenCalledWith(
        clientToken,
        res.locals.user,
        controller['mapFormToRequest'](formBody, req.params.prisonerNumber, res.locals.user.username),
      )
      expect(req.flash).toHaveBeenCalledWith('flashMessage', {
        fieldName: 'next-of-kin',
        type: 'success',
        text: 'Next of kin and emergency contacts added',
      })

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
        user: res.locals.user,
        prisonerNumber,
        correlationId: req.id,
        action: PostAction.EditNextOfKin,
        details: { formValues: req.body },
      })

      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#next-of-kin`)
    })

    it.each([
      [
        'Home number',
        {
          type: 'HOME',
          numbers: {
            home: {
              number: '123',
            },
          },
        },
        {
          phoneType: 'HOME',
          phoneNumber: '123',
        },
      ],
      [
        'Mobile number',
        {
          type: 'MOB',
          numbers: {
            mobile: {
              number: '123',
            },
          },
        },
        {
          phoneType: 'MOB',
          phoneNumber: '123',
        },
      ],
      [
        'Business number',
        {
          type: 'BUS',
          numbers: {
            business: {
              number: '123',
            },
          },
        },
        {
          phoneType: 'BUS',
          phoneNumber: '123',
        },
      ],
      [
        'Business number with extension',
        {
          type: 'BUS',
          numbers: {
            business: {
              number: '123',
              extension: '456',
            },
          },
        },
        {
          phoneType: 'BUS',
          phoneNumber: '123',
          extNumber: '456',
        },
      ],
      [
        'No phone number',
        {
          type: 'NONE',
        },
        undefined,
      ],
      [
        'Multiple numbers (should select the one indicated by the type)',
        {
          type: 'BUS',
          numbers: {
            home: {
              number: '11111',
              extension: '22222',
            },
            business: {
              number: '123',
              extension: '456',
            },
            mobile: {
              number: '33333',
              extension: '44444',
            },
          },
        },
        {
          phoneType: 'BUS',
          phoneNumber: '123',
          extNumber: '456',
        },
      ],
    ])('Should map phone numbers to the request correctly - %s', async (_, phoneNumber, expected) => {
      const formBody = {
        firstName: 'John',
        lastName: 'Doe',
        relationshipTypeId: 'S_SIS',
        contactType: 'nextOfKin',
        noFixedAddress: false,
        phoneNumber,
      }

      req.body = formBody

      const handler = controller.submitNextOfKinEmergencyContact()
      await handler(req, res, next)

      expect(nextOfKinService.createContact).toHaveBeenCalledWith(
        clientToken,
        res.locals.user,
        expect.objectContaining({
          phoneNumbers: [expected],
        }),
      )
    })

    it('should handle validation errors and re-render the form with error messages', async () => {
      req.body = {
        contactType: 'nextOfKin',
        firstName: '',
        lastName: 'Doe',
        relationshipTypeId: '',
      }
      req.errors = [
        { text: 'First name is required', href: '#firstName' },
        { text: 'Relationship type is required', href: '#relationshipTypeId' },
      ]

      const handler = controller.submitNextOfKinEmergencyContact()
      await handler(req, res, next)

      // Ensure the service was not called
      expect(nextOfKinService.createContact).not.toHaveBeenCalled()

      // Ensure audit service is not called in case of validation errors
      expect(auditService.sendEvent).not.toHaveBeenCalled()

      // Ensure flash contains validation errors
      expect(req.flash).toHaveBeenCalledWith('errors', req.errors)

      // Ensure the user is redirected back to the form
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/next-of-kin-emergency-contacts`)
    })

    it('should handle unexpected errors and throw them to the global error handler', async () => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        relationshipTypeId: 'S_SIS',
        contactType: 'nextOfKin',
        noFixedAddress: false,
      }

      const error = { status: 400, message: 'Bad request' }
      nextOfKinService.createContact = jest.fn().mockRejectedValue(error)

      const errors = [{ text: error.message }]

      const handler = controller.submitNextOfKinEmergencyContact()
      await handler(req, res, next)

      // Ensure the service method was called
      expect(nextOfKinService.createContact).toHaveBeenCalled()

      // Ensure audit service is not called in case of validation errors
      expect(auditService.sendEvent).not.toHaveBeenCalled()

      // Ensure flash contains validation errors
      expect(req.flash).toHaveBeenCalledWith('errors', errors)

      // Ensure the user is redirected back to the form
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/next-of-kin-emergency-contacts`)
    })
  })

  describe('Where is the address page', () => {
    it('should render the where is the address page', async () => {
      req = { ...req, query: { contact: contactCacheId } } as unknown as Request
      req.flash = jest.fn().mockImplementation(() => [])
      setupCachedDataMocks()

      await controller.displayWhereIsTheAddress()(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/edit/radioField', {
        pageTitle: `Where is this contact’s address? - Prisoner personal details`,
        formTitle: 'Where is Albert Wesker’s address?',
        options: [
          { value: 'uk', text: 'United Kingdom' },
          { value: 'overseas', text: 'Overseas' },
          { divider: 'or' },
          { value: 'no_fixed_address', text: 'No fixed address' },
        ],
        errors: [],
        breadcrumbPrisonerName: 'Saunders, John',
        prisonerNumber,
        redirectAnchor: 'next-of-kin',
        submitButtonText: 'Continue',
        miniBannerData: {
          prisonerNumber,
          prisonerName: 'Saunders, John',
          cellLocation: '1-1-035',
          prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=1413311&fullSizeImage=false',
        },
      })

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: res.locals.user,
        prisonerNumber,
        prisonId: PrisonerMockDataA.prisonId,
        correlationId: req.id,
        page: Page.EditNextOfKinAddressLocation,
      })
    })

    it.each([
      ['uk', 'find-uk-next-of-kin-address'],
      ['overseas', 'add-next-of-kin-overseas-address'],
      ['no_fixed_address', 'add-uk-next-of-kin-no-fixed-address'],
    ])('for choice %s should redirect to %s page', async (location: string, redirect: string) => {
      req = { ...req, body: { radioField: location }, query: { contact: contactCacheId } } as unknown as Request

      await controller.submitWhereIsTheAddress()(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${prisonerNumber}/personal/${redirect}?contact=${contactCacheId}`,
      )

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
        user: res.locals.user,
        prisonerNumber,
        correlationId: req.id,
        action: PostAction.EditNextOfKinAddressLocation,
        details: { location },
      })
    })
  })

  describe('Find UK address page', () => {
    describe('Rendering the page', () => {
      it('should render the find UK address page', async () => {
        req = { ...req, query: { contact: contactCacheId } } as unknown as Request
        req.flash = jest.fn().mockImplementation(() => [])

        setupCachedDataMocks()

        await controller.displayFindUkAddress()(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/edit/address/findUkAddress', {
          pageTitle: 'Find a UK address for this contact - Prisoner personal details',
          formTitle: `Find a UK address for Albert Wesker`,
          errors: [],
          prisonerNumber,
          manualEntryUrl: `/prisoner/${prisonerNumber}/personal/add-uk-next-of-kin-address?contact=${contactCacheId}`,
          backLinkUrl: `where-is-next-of-kin-address?contact=${contactCacheId}`,
          cancelLink: `/prisoner/${prisonerNumber}/personal#next-of-kin`,
          breadcrumbPrisonerName: 'Saunders, John',
          miniBannerData: {
            prisonerNumber,
            prisonerName: 'Saunders, John',
            cellLocation: '1-1-035',
            prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=1413311&fullSizeImage=false',
          },
        })

        expect(auditService.sendPageView).toHaveBeenCalledWith({
          user: res.locals.user,
          prisonerNumber,
          prisonId: PrisonerMockDataA.prisonId,
          correlationId: req.id,
          page: Page.EditNextOfKinAddressFindUkAddress,
        })
      })
    })

    describe('Submitting the page', () => {
      it('should submit the selected uprn', async () => {
        const address = { uprn } as OsAddress
        req = { ...req, body: { uprn }, query: { contact: contactCacheId } } as unknown as Request
        ephemeralDataService.cacheData = jest.fn().mockReturnValue(addressCacheId)
        addressService.getAddressByUprn = jest.fn().mockReturnValue(address)

        await controller.submitFindUkAddress()(req, res, next)

        expect(ephemeralDataService.cacheData).toHaveBeenCalledWith({
          address,
          route: `find-uk-next-of-kin-address?contact=${contactCacheId}`,
        })
        expect(res.redirect).toHaveBeenCalledWith(
          `/prisoner/${prisonerNumber}/personal/confirm-next-of-kin-address?address=${addressCacheId}&contact=${contactCacheId}`,
        )

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditNextOfKinAddressFindUkAddress,
          details: { uprn },
        })
      })
    })
  })

  describe('Manual Address pages', () => {
    const pageTitlePrefix = 'Page title prefix'
    const formTitlePrefix = 'Form title prefix'

    beforeEach(async () => {
      req = { ...req, query: { contact: contactCacheId } } as unknown as Request
      req.flash = jest.fn().mockImplementation(() => [])
      ephemeralDataService.cacheData = jest.fn().mockReturnValue(addressCacheId)
      setupCachedDataMocks()
      addressService.getCityReferenceData = jest.fn().mockReturnValue([{ code: 'TOWN1', description: 'My Town' }])
      addressService.getCountyReferenceData = jest.fn().mockReturnValue([{ code: 'COUNTY1', description: 'My County' }])
      addressService.getCountryReferenceData = jest
        .fn()
        .mockReturnValue([{ code: 'COUNTRY1', description: 'My Country' }])
    })

    describe('Rendering the page', () => {
      test.each`
        addressLocation                     | auditPage                                        | uk       | noFixedAddress | noFixedAddressOption | backLink
        ${AddressLocation.uk}               | ${Page.EditNextOfKinAddressUkManual}             | ${true}  | ${false}       | ${false}             | ${'find-uk-next-of-kin-address'}
        ${AddressLocation.no_fixed_address} | ${Page.EditNextOfKinAddressNoFixedAddressManual} | ${true}  | ${true}        | ${false}             | ${'where-is-next-of-kin-address'}
        ${AddressLocation.overseas}         | ${Page.EditNextOfKinAddressOverseasManual}       | ${false} | ${false}       | ${true}              | ${'where-is-next-of-kin-address'}
      `(
        `Location: '$addressLocation', audit: '$auditPage', uk: '$uk', noFixedAddress: '$noFixedAddress', noFixedAddressOption: '$noFixedAddressOption', backLink: '$backLink'`,
        async ({ addressLocation, auditPage, uk, noFixedAddress, noFixedAddressOption, backLink }) => {
          await controller.displayManualEditAddress({ addressLocation, auditPage, formTitlePrefix, pageTitlePrefix })(
            req,
            res,
            next,
          )

          expect(res.render).toHaveBeenCalledWith('pages/edit/address/manualAddress', {
            pageTitle: `${pageTitlePrefix} - Prisoner personal details`,
            formTitle: `${formTitlePrefix} for Albert Wesker`,
            errors: [],
            requestBody: null,
            townOrCityOptions: [{ value: 'TOWN1', text: 'My Town' }],
            countyOptions: [{ value: 'COUNTY1', text: 'My County' }],
            countryOptions: [{ value: 'COUNTRY1', text: 'My Country' }],
            ukAddress: uk,
            noFixedAddress,
            noFixedAddressCheckbox: noFixedAddressOption,
            backLinkUrl: `${backLink}?contact=${contactCacheId}`,
            cancelLink: `/prisoner/${prisonerNumber}/personal#next-of-kin`,
            prisonerNumber,
            breadcrumbPrisonerName: 'Saunders, John',
            miniBannerData: {
              prisonerNumber,
              prisonerName: 'Saunders, John',
              cellLocation: '1-1-035',
              prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=1413311&fullSizeImage=false',
            },
          })

          expect(auditService.sendPageView).toHaveBeenCalledWith({
            user: res.locals.user,
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
        addressLocation                     | auditAction                                            | noFixedAddressChecked | noFixedAbode
        ${AddressLocation.uk}               | ${PostAction.EditNextOfKinAddressUkManual}             | ${undefined}          | ${false}
        ${AddressLocation.no_fixed_address} | ${PostAction.EditNextOfKinAddressNoFixedAddressManual} | ${undefined}          | ${true}
        ${AddressLocation.overseas}         | ${PostAction.EditNextOfKinAddressOverseasManual}       | ${false}              | ${false}
        ${AddressLocation.overseas}         | ${PostAction.EditNextOfKinAddressOverseasManual}       | ${true}               | ${true}
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

          req = { ...req, body: submittedAddress, path: `/path` } as unknown as Request

          await controller.submitManualEditAddress({ addressLocation, auditAction })(req, res, next)

          expect(ephemeralDataService.cacheData).toHaveBeenCalledWith({
            address: expect.objectContaining(cachedAddress),
            route: `path?contact=${contactCacheId}`,
          })

          expect(res.redirect).toHaveBeenCalledWith(
            `/prisoner/${prisonerNumber}/personal/confirm-next-of-kin-address?address=${addressCacheId}&contact=${contactCacheId}`,
          )

          expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
            user: res.locals.user,
            prisonerNumber,
            correlationId: req.id,
            action: auditAction,
            details: { address: expect.objectContaining(cachedAddress) },
          })
        },
      )
    })
  })

  describe('Confirm address page', () => {
    describe('Rendering the page', () => {
      it('should render the confirm address page', async () => {
        req = { ...req, query: { address: addressCacheId, contact: contactCacheId } } as unknown as Request
        setupCachedDataMocks({ address: addressRequest, route: 'find-uk-next-of-kin-address' })
        addressService.getCityCode = jest.fn().mockReturnValue({ description: 'My Town' })
        addressService.getCountyCode = jest.fn().mockReturnValue({ description: 'My County' })
        addressService.getCountryCode = jest.fn().mockReturnValue({ description: 'England' })

        await controller.displayConfirmAddress()(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/edit/address/confirmAddress', {
          pageTitle: 'Confirm address - Prisoner personal details',
          formTitle: 'Confirm Albert Wesker’s address',
          address: {
            ...addressRequest,
            cacheId: addressCacheId,
            city: 'My Town',
            county: 'My County',
            country: 'England',
          },
          prisonerNumber,
          breadcrumbPrisonerName: 'Saunders, John',
          miniBannerData: {
            prisonerNumber,
            prisonerName: 'Saunders, John',
            cellLocation: '1-1-035',
            prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=1413311&fullSizeImage=false',
          },
          backLinkUrl: `/prisoner/${prisonerNumber}/personal/find-uk-next-of-kin-address`,
          cancelLink: `/prisoner/${prisonerNumber}/personal#next-of-kin`,
          enterDifferentAddressLink: `/prisoner/${prisonerNumber}/personal/where-is-next-of-kin-address?contact=${contactCacheId}`,
          confirmPrimaryOrPostalAddress: false,
        })

        expect(auditService.sendPageView).toHaveBeenCalledWith({
          user: res.locals.user,
          prisonerNumber,
          prisonId: PrisonerMockDataA.prisonId,
          correlationId: req.id,
          page: Page.EditNextOfKinAddressConfirm,
        })
      })

      it('should throw not found error if address uuid not provided', async () => {
        req = { ...req, query: { contact: contactCacheId } } as unknown as Request
        setupCachedDataMocks()

        await expect(controller.displayConfirmAddress()(req, res, next)).rejects.toThrow(
          'Could not find cached address',
        )

        expect(res.render).not.toHaveBeenCalled()
      })

      it('should throw not found error if address uuid not provided', async () => {
        await expect(controller.displayConfirmAddress()(req, res, next)).rejects.toThrow(
          'Could not find cached contact name',
        )

        expect(res.render).not.toHaveBeenCalled()
      })

      it('should throw not found error if address uuid not present in cache', async () => {
        req = { ...req, query: { contact: contactCacheId, address: addressCacheId } } as unknown as Request
        setupCachedDataMocks()

        await expect(controller.displayConfirmAddress()(req, res, next)).rejects.toThrow(
          'Could not find cached address',
        )

        expect(res.render).not.toHaveBeenCalled()
      })

      it('should throw not found error if contact uuid not present in cache', async () => {
        req = { ...req, query: { contact: contactCacheId, address: addressCacheId } } as unknown as Request
        setupCachedDataMocks(null, null)

        await expect(controller.displayConfirmAddress()(req, res, next)).rejects.toThrow(
          'Could not find cached contact name',
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

        req = { ...req, query: { contact: contactCacheId, address: addressCacheId } } as unknown as Request
        setupCachedDataMocks({ address, route: 'find-uk-next-of-kin-address' })

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

  const setupCachedDataMocks = (address: unknown = undefined, contact: unknown = cachedContact) => {
    ephemeralDataService.getData = jest.fn().mockImplementation((key: UUID) => {
      if (key === addressCacheId && address) {
        return {
          key: addressCacheId,
          value: address,
        }
      }
      if (key === contactCacheId && contact) {
        return {
          key: addressCacheId,
          value: contact,
        }
      }
      return undefined
    })
  }
})
