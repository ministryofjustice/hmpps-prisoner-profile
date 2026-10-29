import { Request, Response } from 'express'
import { addressServiceMock } from '../../tests/mocks/addressServiceMock'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { mockAddresses } from '../data/localMockData/addresses'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { prisonUserMock } from '../data/localMockData/user'
import { Page, PostAction } from '../services/auditService'
import AddressService from '../services/addressService'
import AddressPhoneNumberController from './addressPhoneNumberController'

describe('AddressPhoneNumberController', () => {
  it('submits all phone numbers and returns to the personal page', async () => {
    const addressService = addressServiceMock() as AddressService
    addressService.addAddressPhoneNumbers = jest
      .fn()
      .mockResolvedValue([{ phoneId: 123, number: '01234', type: 'MOB' }])
    const controller = new AddressPhoneNumberController(addressService, auditServiceMock())
    const req = {
      id: 'request-id',
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
      },
      params: { addressId: '5622837' },
      query: {},
      body: {
        phoneNumberType0: 'MOB',
        phoneNumber0: '01234567890',
        phoneExtension0: '123',
        phoneNumberType1: 'HOME',
        phoneNumber1: '01234567891',
        phoneExtension1: '',
      },
      flash: jest.fn(),
    } as unknown as Request
    const res = {
      locals: { user: prisonUserMock, prisonerNumber: PrisonerMockDataA.prisonerNumber },
      redirect: jest.fn(),
    } as unknown as Response

    await controller.submit()(req, res, jest.fn())

    expect(addressService.addAddressPhoneNumbers).toHaveBeenCalledWith(
      'CLIENT_TOKEN',
      PrisonerMockDataA.prisonerNumber,
      5622837,
      [
        { phoneNumber: '01234 567890', phoneNumberType: 'MOB', extension: '123' },
        { phoneNumber: '01234 567891', phoneNumberType: 'HOME', extension: undefined },
      ],
    )
    expect(req.flash).toHaveBeenCalledWith('flashMessage', {
      text: 'Address phone number updated',
      fieldName: 'addressPhoneNumbers',
      phoneIds: [123],
    })
    expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${PrisonerMockDataA.prisonerNumber}/personal#addresses`)
  })

  it('normalises an 11-digit number before saving', async () => {
    const addressService = addressServiceMock() as AddressService
    addressService.getAddressesFromPrisonAPI = jest.fn().mockResolvedValue([])
    const controller = new AddressPhoneNumberController(addressService, auditServiceMock())
    const req = {
      id: 'request-id',
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
      },
      params: { addressId: '5622837' },
      query: {},
      body: { phoneNumberType0: 'MOB', phoneNumber0: ' (01234)567890 ', phoneExtension0: '' },
      flash: jest.fn(),
    } as unknown as Request
    const res = {
      locals: { user: prisonUserMock, prisonerNumber: PrisonerMockDataA.prisonerNumber },
      redirect: jest.fn(),
    } as unknown as Response

    await controller.submit()(req, res, jest.fn())

    expect(addressService.addAddressPhoneNumbers).toHaveBeenCalledWith(
      'CLIENT_TOKEN',
      PrisonerMockDataA.prisonerNumber,
      5622837,
      [{ phoneNumber: '01234 567890', phoneNumberType: 'MOB', extension: undefined }],
    )
  })

  it('rejects a duplicate address phone number after normalising it', async () => {
    const addressService = addressServiceMock() as AddressService
    addressService.getAddressesFromPrisonAPI = jest
      .fn()
      .mockResolvedValue([{ addressId: 5622837, phones: [{ phoneId: 456, number: '01234 567890' }] }])
    const controller = new AddressPhoneNumberController(addressService, auditServiceMock())
    const req = {
      id: 'request-id',
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
      },
      params: { addressId: '5622837' },
      query: {},
      body: { phoneNumberType0: 'MOB', phoneNumber0: '(01234)567890', phoneExtension0: '' },
      originalUrl: `/prisoner/${PrisonerMockDataA.prisonerNumber}/addresses/5622837/add-address-phone-number`,
      flash: jest.fn(),
    } as unknown as Request
    const res = {
      locals: { user: prisonUserMock, prisonerNumber: PrisonerMockDataA.prisonerNumber },
      redirect: jest.fn(),
    } as unknown as Response

    await controller.submit()(req, res, jest.fn())

    expect(addressService.addAddressPhoneNumbers).not.toHaveBeenCalled()
    expect(req.flash).toHaveBeenCalledWith('errors', [
      {
        href: '#phone-number-0',
        text: 'This phone number already exists for this address. Add a new number or edit the saved one',
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(
      `/prisoner/${PrisonerMockDataA.prisonerNumber}/addresses/5622837/add-address-phone-number`,
    )
  })

  it('handles an error fetching the address for duplicate checking', async () => {
    const addressService = addressServiceMock() as AddressService
    addressService.getAddressesFromPrisonAPI = jest.fn().mockRejectedValue(new Error('Prison API unavailable'))
    const controller = new AddressPhoneNumberController(addressService, auditServiceMock())
    const originalUrl = `/prisoner/${PrisonerMockDataA.prisonerNumber}/addresses/5622837/add-address-phone-number`
    const req = {
      id: 'request-id',
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
      },
      params: { addressId: '5622837' },
      query: {},
      body: { phoneNumberType0: 'MOB', phoneNumber0: '01234567890', phoneExtension0: '' },
      originalUrl,
      flash: jest.fn(),
    } as unknown as Request
    const res = {
      locals: { user: prisonUserMock, prisonerNumber: PrisonerMockDataA.prisonerNumber },
      redirect: jest.fn(),
    } as unknown as Response

    await controller.submit()(req, res, jest.fn())

    expect(addressService.addAddressPhoneNumbers).not.toHaveBeenCalled()
    expect(req.flash).toHaveBeenCalledWith('errors', [{ text: 'There was an error please try again' }])
    expect(req.flash).toHaveBeenCalledWith('requestBody', JSON.stringify(req.body))
    expect(res.redirect).toHaveBeenCalledWith(originalUrl)
  })

  it('allows the same address phone number when its extension differs', async () => {
    const addressService = addressServiceMock() as AddressService
    addressService.addAddressPhoneNumbers = jest
      .fn()
      .mockResolvedValue([{ phoneId: 457, number: '01234 567890', type: 'MOB' }])
    addressService.getAddressesFromPrisonAPI = jest
      .fn()
      .mockResolvedValue([{ addressId: 5622837, phones: [{ phoneId: 456, number: '01234 567890', ext: '123' }] }])
    const controller = new AddressPhoneNumberController(addressService, auditServiceMock())
    const req = {
      id: 'request-id',
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
      },
      params: { addressId: '5622837' },
      query: {},
      body: { phoneNumberType0: 'MOB', phoneNumber0: '(01234)567890', phoneExtension0: '456' },
      flash: jest.fn(),
    } as unknown as Request
    const res = {
      locals: { user: prisonUserMock, prisonerNumber: PrisonerMockDataA.prisonerNumber },
      redirect: jest.fn(),
    } as unknown as Response

    await controller.submit()(req, res, jest.fn())

    expect(addressService.addAddressPhoneNumbers).toHaveBeenCalledWith(
      'CLIENT_TOKEN',
      PrisonerMockDataA.prisonerNumber,
      5622837,
      [{ phoneNumber: '01234 567890', phoneNumberType: 'MOB', extension: '456' }],
    )
    expect(req.flash).not.toHaveBeenCalledWith('errors', expect.anything())
  })

  it('allows the same number with different extensions in one address submission', async () => {
    const addressService = addressServiceMock() as AddressService
    addressService.addAddressPhoneNumbers = jest
      .fn()
      .mockResolvedValue([{ phoneId: 457, number: '01234 567890', type: 'MOB' }])
    addressService.getAddressesFromPrisonAPI = jest.fn().mockResolvedValue([])
    const controller = new AddressPhoneNumberController(addressService, auditServiceMock())
    const req = {
      id: 'request-id',
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
      },
      params: { addressId: '5622837' },
      query: {},
      body: {
        phoneNumberType0: 'MOB',
        phoneNumber0: '(01234)567890',
        phoneExtension0: '123',
        phoneNumberType1: 'BUS',
        phoneNumber1: '01234 567890',
        phoneExtension1: '456',
      },
      flash: jest.fn(),
    } as unknown as Request
    const res = {
      locals: { user: prisonUserMock, prisonerNumber: PrisonerMockDataA.prisonerNumber },
      redirect: jest.fn(),
    } as unknown as Response

    await controller.submit()(req, res, jest.fn())

    expect(addressService.addAddressPhoneNumbers).toHaveBeenCalledWith(
      'CLIENT_TOKEN',
      PrisonerMockDataA.prisonerNumber,
      5622837,
      [
        { phoneNumber: '01234 567890', phoneNumberType: 'MOB', extension: '123' },
        { phoneNumber: '01234 567890', phoneNumberType: 'BUS', extension: '456' },
      ],
    )
  })

  it('prefills the selected phone number on the change page', async () => {
    const addressService = addressServiceMock() as AddressService
    addressService.getAddressesFromPrisonAPI = jest.fn().mockResolvedValue(mockAddresses)
    const auditService = auditServiceMock()
    const controller = new AddressPhoneNumberController(addressService, auditService)
    const req = {
      id: 'request-id',
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
      },
      params: { addressId: '5622837', phoneId: '1324254' },
      flash: jest.fn().mockReturnValue([]),
    } as unknown as Request
    const res = {
      locals: {
        user: prisonUserMock,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        prisonId: 999,
        prisonerPermissions: {},
      },
      render: jest.fn(),
    } as unknown as Response

    await controller.display()(req, res, jest.fn())

    expect(res.render).toHaveBeenCalledWith(
      'pages/edit/addressPhoneNumbers',
      expect.objectContaining({
        pageTitle: 'Change a phone number for this address - Prisoner personal details',
        formTitle: 'Change the phone number for this address',
        phoneNumbers: [
          expect.objectContaining({
            phoneNumberType: 'VISIT',
            phoneNumber: '4444555566',
            phoneExtension: '',
            phoneTypeOptions: expect.arrayContaining([
              expect.objectContaining({ text: 'Agency visit line', value: 'VISIT', checked: true }),
            ]),
          }),
        ],
        isChanging: true,
      }),
    )
    expect(auditService.sendPageView).toHaveBeenCalledWith(
      expect.objectContaining({ page: Page.EditAddressPhoneNumber }),
    )
  })

  it('updates a phone number and returns to the personal page', async () => {
    const addressService = addressServiceMock() as AddressService
    addressService.updateAddressPhoneNumber = jest
      .fn()
      .mockResolvedValue({ phoneId: 1324254, number: '02012345678', type: 'HOME', ext: '321' })
    const auditService = auditServiceMock()
    const controller = new AddressPhoneNumberController(addressService, auditService)
    const req = {
      id: 'request-id',
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
      },
      params: { addressId: '5622837', phoneId: '1324254' },
      query: {},
      body: { phoneNumberType0: 'HOME', phoneNumber0: '02012345678', phoneExtension0: '321' },
      originalUrl: `/prisoner/${PrisonerMockDataA.prisonerNumber}/addresses/5622837/change-address-phone-number/1324254`,
      flash: jest.fn(),
    } as unknown as Request
    const res = {
      locals: { user: prisonUserMock, prisonerNumber: PrisonerMockDataA.prisonerNumber },
      redirect: jest.fn(),
    } as unknown as Response

    await controller.submit()(req, res, jest.fn())

    expect(addressService.updateAddressPhoneNumber).toHaveBeenCalledWith(
      'CLIENT_TOKEN',
      PrisonerMockDataA.prisonerNumber,
      5622837,
      1324254,
      { phoneNumber: '02012 345678', phoneNumberType: 'HOME', extension: '321' },
    )
    expect(req.flash).toHaveBeenCalledWith('flashMessage', {
      text: 'Address phone number updated',
      fieldName: 'addressPhoneNumbers',
      phoneIds: [1324254],
    })
    expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
      user: prisonUserMock,
      prisonerNumber: PrisonerMockDataA.prisonerNumber,
      correlationId: 'request-id',
      action: PostAction.EditAddressPhoneNumber,
      details: {
        addressId: 5622837,
        phoneId: 1324254,
        phoneNumber: { phoneNumber: '02012 345678', phoneNumberType: 'HOME', extension: '321' },
      },
    })
    expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${PrisonerMockDataA.prisonerNumber}/personal#addresses`)
  })
})
