import { Role } from '../../../data/enums/role'
import { userMDI } from '../../../../tests/mocks/userMocks'
import getCategoryPermissions from './getCategoryPermissions'

describe('getCategoryPermissions', () => {
  test.each`
    roles                            | editVisible
    ${[]}                            | ${false}
    ${[Role.CreateRecategorisation]} | ${true}
    ${[Role.ApproveCategorisation]}  | ${true}
    ${[Role.CreateRecategorisation]} | ${true}
    ${[Role.CategorisationSecurity]} | ${true}
  `('roles: $roles; edit: editVisible', async ({ roles, editVisible }) => {
    const permissions = getCategoryPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.edit).toEqual(editVisible)
  })
})
