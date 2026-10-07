import { Request, Response } from 'express'
import { addressServiceMock } from '../../tests/mocks/addressServiceMock'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { prisonUserMock } from '../data/localMockData/user'
import AddressService from '../services/addressService'
import AddressPhoneNumberController from './addressPhoneNumberController'

describe('AddressPhoneNumberController', () => {
  it('submits a phone number and returns to the personal page', async () => {
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
        phoneNumberType: 'MOB',
        phoneNumber: '01234567890',
        phoneExtension: '123',
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
      [{ phoneNumber: '01234567890', phoneNumberType: 'MOB', extension: '123' }],
    )
    expect(req.flash).toHaveBeenCalledWith('flashMessage', {
      text: 'Address phone number updated',
      fieldName: 'addressPhoneNumbers',
      phoneIds: [123],
    })
    expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${PrisonerMockDataA.prisonerNumber}/personal#addresses`)
  })
})
