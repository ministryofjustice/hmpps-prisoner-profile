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
  it('submits all phone numbers and returns to the page it came from', async () => {
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
      query: { returnTo: 'addresses' },
      body: {
        phoneNumberType0: 'MOB',
        phoneNumber0: '01234567890',
        phoneExtension0: '123',
        phoneNumberType1: 'HOME',
        phoneNumber1: '01234567891',
        phoneExtension1: '',
        returnTo: 'addresses',
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
        { phoneNumber: '01234567890', phoneNumberType: 'MOB', extension: '123' },
        { phoneNumber: '01234567891', phoneNumberType: 'HOME', extension: undefined },
      ],
    )
    expect(req.flash).toHaveBeenCalledWith('flashMessage', {
      text: 'Address phone number updated',
      fieldName: 'addressPhoneNumbers',
      phoneIds: [123],
    })
    expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${PrisonerMockDataA.prisonerNumber}/addresses`)
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
      query: { returnTo: 'addresses' },
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
        returnToAddresses: true,
      }),
    )
    expect(auditService.sendPageView).toHaveBeenCalledWith(
      expect.objectContaining({ page: Page.EditAddressPhoneNumber }),
    )
  })

  it('updates a phone number and returns to the page it came from', async () => {
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
      query: { returnTo: 'addresses' },
      body: { phoneNumberType0: 'HOME', phoneNumber0: '02012345678', phoneExtension0: '321', returnTo: 'addresses' },
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
      { phoneNumber: '02012345678', phoneNumberType: 'HOME', extension: '321' },
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
        phoneNumber: { phoneNumber: '02012345678', phoneNumberType: 'HOME', extension: '321' },
      },
    })
    expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${PrisonerMockDataA.prisonerNumber}/addresses`)
  })
})
