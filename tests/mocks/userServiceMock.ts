import Interface from './Interface'
import { UserService } from '../../server/services'

export const userServiceMock = (): Interface<UserService> => ({
  isUserAKeyWorker: jest.fn(),
})

export default { userServiceMock }
