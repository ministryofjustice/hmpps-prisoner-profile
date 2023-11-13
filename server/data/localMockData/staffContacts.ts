import { convertToTitleCase } from '../../utils/utils'
import { keyWorkerMock } from './keyWorker'

export const StaffContactsMock = {
  keyWorker: {
    name: `${convertToTitleCase(keyWorkerMock.firstName)} ${convertToTitleCase(keyWorkerMock.lastName)}`,
    lastSession: '',
  },
  prisonOffenderManager: 'Andy Marke',
  coworkingPrisonOffenderManager: 'Andy Hudson',
  communityOffenderManager: 'Terry Scott',
}

export default {
  StaffContactsMock,
}
