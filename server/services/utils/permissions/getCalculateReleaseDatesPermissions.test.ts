import { Role } from '../../../data/enums/role'
import { userMDI } from '../../../../tests/mocks/userMocks'
import getCalculateReleaseDatesPermissions from './getCalculateReleaseDatesPermissions'

describe('getCalculateReleaseDatesPermission', () => {
  test.each`
    roles                            | editVisible
    ${[]}                            | ${false}
    ${[Role.ReleaseDatesCalculator]} | ${true}
  `('roles: $roles; edit: editVisible', async ({ roles, editVisible }) => {
    const permissions = getCalculateReleaseDatesPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.edit).toEqual(editVisible)
  })
})
