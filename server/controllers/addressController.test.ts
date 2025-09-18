import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import AddressController from './addressController'
import AddressService from '../services/addressService'
import { addressesNoStartDateMock, addressesPrimaryAndMailMock } from '../data/localMockData/addresses'
import { mockOsAddresses } from '../data/localMockData/osAddressesMock'
import { prisonUserMock } from '../data/localMockData/user'
import { addressServiceMock } from '../../tests/mocks/addressServiceMock'

let req: any
let res: any
let addressService: AddressService
let controller: AddressController

const testError = () => {
  return { message: 'Test Error Message', status: 500 }
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
      }
      res = {
        locals: { user: prisonUserMock },
        render: jest.fn(),
      }
    })

    it('should render the addresses page', async () => {
      const getAddressesFromPrisonAPI = jest
        .spyOn<any, string>(controller['addressService'], 'getAddressesFromPrisonAPI')
        .mockResolvedValue([...addressesPrimaryAndMailMock, ...addressesNoStartDateMock])

      await controller.displayAddresses(req, res)

      expect(getAddressesFromPrisonAPI).toHaveBeenCalledWith(
        req.middleware.clientToken,
        req.middleware.prisonerData.prisonerNumber,
      )
      expect(res.render).toHaveBeenCalledWith('pages/addresses/addresses', {
        pageTitle: 'Addresses',
        primaryAddressLabel: 'Primary and mail address',
        primaryAddress: addressesPrimaryAndMailMock[0],
        mailAddress: undefined,
        otherAddresses: addressesNoStartDateMock.reverse(),
        prisonerNumber: req.middleware.prisonerData.prisonerNumber,
        prisonerName: 'John Saunders',
        breadcrumbPrisonerName: 'Saunders, John',
      })
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
      }
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      }
    })

    it('should render the correct json response', async () => {
      const getAddressesMatchingQuery = jest
        .spyOn<any, string>(controller['addressService'], 'getAddressesMatchingQuery')
        .mockResolvedValue(mockOsAddresses)

      await controller.findAddressesByFreeTextQuery(req, res)
      expect(getAddressesMatchingQuery).toHaveBeenCalledWith(req.params.query)
      expect(res.json).toHaveBeenCalledWith({ results: mockOsAddresses, status: 200 })
    })

    it('should handle errors correctly', async () => {
      const getAddressesMatchingQuery = jest
        .spyOn<any, string>(controller['addressService'], 'getAddressesMatchingQuery')
        .mockImplementation(() => {
          throw testError()
        })

      await controller.findAddressesByFreeTextQuery(req, res)
      expect(getAddressesMatchingQuery).toHaveBeenCalledWith(req.params.query)
      expect(res.status).toHaveBeenCalledWith(testError().status)
      expect(res.json).toHaveBeenCalledWith({ error: testError().message, status: 500 })
    })
  })
})
