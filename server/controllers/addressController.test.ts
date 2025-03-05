import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import AddressController, { addressLookupErrorMessage } from './addressController'
import AddressService from '../services/addressService'
import { addressesNoStartDateMock, addressesPrimaryAndMailMock } from '../data/localMockData/addresses'
import { mockOsAddresses } from '../data/localMockData/osAddressesMock'

let req: any
let res: any
let controller: AddressController

describe('Address controller', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    controller = new AddressController(new AddressService(null, null), auditServiceMock())
  })

  describe('displayAddresses', () => {
    beforeEach(() => {
      req = {
        params: { prisonerNumber: '' },
        query: { page: '0', sort: 'dateCreated,ASC', alertType: 'R', from: '01/01/2023', to: '02/02/2023' },
        path: 'alerts/active',
        middleware: {
          clientToken: 'CLIENT_TOKEN',
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
        },
      }
      res = {
        locals: {
          user: {
            authSource: 'nomis',
            activeCaseLoadId: 'MDI',
            userRoles: [Role.UpdateAlert],
            caseLoads: CaseLoadsDummyDataA,
            token: 'TOKEN',
          },
        },
        render: jest.fn(),
      }
    })

    it('should render the addresses page', async () => {
      const getAddresses = jest
        .spyOn<any, string>(controller['addressService'], 'getAddresses')
        .mockResolvedValue([...addressesPrimaryAndMailMock, ...addressesNoStartDateMock])

      await controller.displayAddresses(req, res)

      expect(getAddresses).toHaveBeenCalledWith(req.middleware.clientToken, req.middleware.prisonerData.prisonerNumber)
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
        params: { query: '1,A123BC' },
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
      expect(res.json).toHaveBeenCalledWith(mockOsAddresses)
    })

    it('should handle errors correctly', async () => {
      const getAddressesMatchingQuery = jest
        .spyOn<any, string>(controller['addressService'], 'getAddressesMatchingQuery')
        .mockImplementation(() => {
          throw new Error('Test Error from service layer')
        })

      await controller.findAddressesByFreeTextQuery(req, res)
      expect(getAddressesMatchingQuery).toHaveBeenCalledWith(req.params.query)
      expect(res.status).toHaveBeenCalledWith(424)
      expect(res.json).toHaveBeenCalledWith(addressLookupErrorMessage)
    })
  })

  describe('findAddressesByPostcode', () => {
    beforeEach(() => {
      req = {
        params: { postcode: 'A123BC' },
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
        .spyOn<any, string>(controller['addressService'], 'getAddressesMatchingPostCode')
        .mockResolvedValue(mockOsAddresses)

      await controller.findAddressesByPostcode(req, res)
      expect(getAddressesMatchingQuery).toHaveBeenCalledWith(req.params.postcode)
      expect(res.json).toHaveBeenCalledWith(mockOsAddresses)
    })

    it('should handle errors correctly', async () => {
      const getAddressesMatchingQuery = jest
        .spyOn<any, string>(controller['addressService'], 'getAddressesMatchingPostCode')
        .mockImplementation(() => {
          throw new Error('Test Error from service layer')
        })

      await controller.findAddressesByPostcode(req, res)
      expect(getAddressesMatchingQuery).toHaveBeenCalledWith(req.params.postcode)
      expect(res.status).toHaveBeenCalledWith(424)
      expect(res.json).toHaveBeenCalledWith(addressLookupErrorMessage)
    })
  })
})
