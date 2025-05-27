import PermissionsService from './permissionsService'
import { prisonUserMock } from '../data/localMockData/user'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { HmppsStatusCode } from '../data/enums/hmppsStatusCode'
import getMoneyAccessStatusCode from './utils/permissions/access/getMoneyAccessStatusCode'


jest.mock('./utils/permissions/access/getOverviewAccessStatusCode', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/access/getMoneyAccessStatusCode', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getSensitiveCaseNotesPermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/access/getActiveCaseLoadOnlyAccessStatusCode', () => ({
  __esModule: true,
  default: jest.fn(),
}))

describe('permissionsService', () => {
  let service: PermissionsService

  beforeEach(() => {
    service = new PermissionsService()
  })

  describe('getMoneyPermissions', () => {
    it.each([
      HmppsStatusCode.RESTRICTED_PATIENT,
      HmppsStatusCode.NOT_IN_CASELOAD,
      HmppsStatusCode.PRISONER_IS_TRANSFERRING,
      HmppsStatusCode.PRISONER_IS_RELEASED,
      HmppsStatusCode.OK,
    ])('should return just the access code if it is %s', statusCode => {
      ;(getMoneyAccessStatusCode as jest.Mock).mockReturnValue(statusCode)

      const permissions = service.getMoneyPermissions(prisonUserMock, PrisonerMockDataA)

      expect(permissions).toEqual({
        accessCode: statusCode,
      })
    })
  })
})
