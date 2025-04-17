import { Role } from '../../../data/enums/role'
import { userMDI } from '../../../../tests/mocks/userMocks'
import getCalculateReleaseDatesPermissions from './getCalculateReleaseDatesPermissions'

describe('getCalculateReleaseDatesPermission', () => {
  test.each`
    roles                            | editPermitted
    ${[]}                            | ${false}
    ${[Role.ReleaseDatesCalculator]} | ${true}
  `('roles: $roles; edit: editPermitted', async ({ roles, editPermitted }) => {
    const permissions = getCalculateReleaseDatesPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.edit).toEqual(editPermitted)
  })
})
