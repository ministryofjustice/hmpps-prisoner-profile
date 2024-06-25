import { Role } from '../../../data/enums/role'
import { userMDI } from '../../../../tests/mocks/userMocks'
import getCellMovePermissions from './getCellMovePermissions'

describe('getCellMovePermission', () => {
  test.each`
    roles              | editPermitted
    ${[]}              | ${false}
    ${[Role.CellMove]} | ${true}
  `('roles: $roles; edit: editPermitted', async ({ roles, editPermitted }) => {
    const permissions = getCellMovePermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.edit).toEqual(editPermitted)
  })
})
