import { Role } from '../../../data/enums/role'
import { userMDI } from '../../../../tests/mocks/userMocks'
import getCategoryPermissions from './getCategoryPermissions'

describe('getCategoryPermissions', () => {
  test.each`
    roles                            | editPermitted
    ${[]}                            | ${false}
    ${[Role.CreateRecategorisation]} | ${true}
    ${[Role.ApproveCategorisation]}  | ${true}
    ${[Role.CreateRecategorisation]} | ${true}
    ${[Role.CategorisationSecurity]} | ${true}
  `('roles: $roles; edit: editPermitted', async ({ roles, editPermitted }) => {
    const permissions = getCategoryPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.edit).toEqual(editPermitted)
  })
})
