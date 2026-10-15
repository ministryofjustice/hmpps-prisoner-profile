import { Request, Response } from 'express'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import AddressController from './addressController'
import AddressService from '../services/addressService'
import type { AddressForDisplay } from '../services/interfaces/personalPageService/PersonalPage'
import { mockOsAddresses } from '../data/localMockData/osAddressesMock'
import { prisonUserMock } from '../data/localMockData/user'
import { addressServiceMock } from '../../tests/mocks/addressServiceMock'

let req: Request
let res: Response
let addressService: AddressService
let controller: AddressController

const testError = (status?: number) => {
  return { message: 'Test Error Message', status }
}

describe('Address controller', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    addressService = addressServiceMock() as AddressService
    controller = new AddressController(addressService, auditServiceMock())
  })

  describe('displayAddresses', () => {
    beforeEach(() => {
      req = {
        params: { prisonerNumber: '' },
        middleware: {
          clientToken: 'CLIENT_TOKEN',
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
        },
      } as unknown as Request
      res = {
        locals: { user: prisonUserMock },
        render: jest.fn(),
      } as unknown as Response
    })

    it('should render the addresses page', async () => {
      const primaryAndPostalAddress = {
        addressId: 5622837,
        primaryAddress: true,
        postalAddress: true,
        fromDate: '2024-01-01',
      } as AddressForDisplay
      const otherAddress = {
        primaryAddress: false,
        postalAddress: false,
        fromDate: '2023-11-20',
      } as AddressForDisplay
      const latestOtherAddress = {
        primaryAddress: false,
        postalAddress: false,
        fromDate: '2024-03-15',
      } as AddressForDisplay
      const getAddressesForDisplay = jest
        .spyOn(controller.addressService, 'getAddressesForDisplay')
        .mockResolvedValue([primaryAndPostalAddress, otherAddress, latestOtherAddress])

      await controller.displayAddresses(req, res)

      expect(getAddressesForDisplay).toHaveBeenCalledWith(
        req.middleware.clientToken,
        req.middleware.prisonerData.prisonerNumber,
      )
      expect(res.render).toHaveBeenCalledWith(
        'pages/addresses/addresses',
        expect.objectContaining({
          pageTitle: 'Addresses',
          primaryAddressLabel: 'Primary and postal address',
          primaryAddress: primaryAndPostalAddress,
          mailAddress: undefined,
          otherAddresses: [latestOtherAddress, otherAddress],
          editEnabled: expect.any(Boolean),
          editAddressSpecificPhoneNumbersEnabled: expect.any(Boolean),
        }),
      )
    })
  })

  describe('findAddressesByFreeTextQuery', () => {
    beforeEach(() => {
      req = {
        params: { query: '1 the road' },
        query: {},
        middleware: {
          clientToken: 'CLIENT_TOKEN',
        },
      } as unknown as Request
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response
    })

    it('should render the correct json response', async () => {
      const getAddressesMatchingQuery = jest
        .spyOn(controller.addressService, 'getAddressesMatchingQuery')
        .mockResolvedValue(mockOsAddresses)

      await controller.findAddressesByFreeTextQuery(req, res)
      expect(getAddressesMatchingQuery).toHaveBeenCalledWith(req.params.query)
      expect(res.json).toHaveBeenCalledWith({ results: mockOsAddresses, status: 200 })
    })

    it('should handle errors with a status correctly', async () => {
      const error = testError(503)
      const getAddressesMatchingQuery = jest
        .spyOn(controller.addressService, 'getAddressesMatchingQuery')
        .mockImplementation(() => {
          throw error
        })

      await controller.findAddressesByFreeTextQuery(req, res)
      expect(getAddressesMatchingQuery).toHaveBeenCalledWith(req.params.query)
      expect(res.status).toHaveBeenCalledWith(error.status)
      expect(res.json).toHaveBeenCalledWith({ error: error.message, status: error.status })
    })

    it('should treat errors without a status as internal server errors', async () => {
      const error = testError(undefined)
      const getAddressesMatchingQuery = jest
        .spyOn(controller.addressService, 'getAddressesMatchingQuery')
        .mockImplementation(() => {
          throw error
        })

      await controller.findAddressesByFreeTextQuery(req, res)
      expect(getAddressesMatchingQuery).toHaveBeenCalledWith(req.params.query)
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: error.message, status: 500 })
    })
  })
})
