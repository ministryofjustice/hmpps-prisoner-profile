import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import AddressController from './addressController'
import AddressService from '../services/addressService'
import { addressesPrimaryAndMailMock } from '../data/localMockData/addresses'

let req: any
let res: any
let controller: AddressController

describe('Address controller', () => {
  beforeEach(() => {
    jest.resetAllMocks()
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
    controller = new AddressController(new AddressService(null), auditServiceMock())
  })

  describe('displayAddresses', () => {
    it('should render the addresses page', async () => {
      const getAddresses = jest
        .spyOn<any, string>(controller['addressService'], 'getAddresses')
        .mockResolvedValue(addressesPrimaryAndMailMock)

      await controller.displayAddresses(req, res)

      expect(getAddresses).toHaveBeenCalledWith(req.middleware.clientToken, req.middleware.prisonerData.prisonerNumber)
      expect(res.render).toHaveBeenCalledWith('pages/addresses/addresses', {
        pageTitle: 'Addresses',
        primaryAddressLabel: 'Primary and mail address',
        primaryAddress: addressesPrimaryAndMailMock[0],
        mailAddress: undefined,
        otherAddresses: [],
        prisonerNumber: req.middleware.prisonerData.prisonerNumber,
        prisonerName: 'John Saunders',
        breadcrumbPrisonerName: 'Saunders, John',
      })
    })
  })
})
