import Interface from './Interface'
import { UserService } from '../../server/services'

export const userServiceMock = (): Interface<UserService> => ({
  getUser: jest.fn(),
  getUserCaseLoads: jest.fn(),
  getStaffRoles: jest.fn(),
})
