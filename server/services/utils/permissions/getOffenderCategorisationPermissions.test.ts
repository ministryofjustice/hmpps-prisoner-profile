import { Role } from '../../../data/enums/role'
import { userMDI } from '../../../../tests/mocks/userMocks'
import getOffenderCategorisationPermissions from './getOffenderCategorisationPermissions'

describe('getOffenderCategorisationPermissions', () => {
  test.each`
    roles                            | editVisible
    ${[]}                            | ${false}
    ${[Role.CreateCategorisation]}   | ${true}
    ${[Role.ApproveCategorisation]}  | ${true}
    ${[Role.CreateRecategorisation]} | ${true}
    ${[Role.CategorisationSecurity]} | ${true}
  `('roles: $roles; edit: $editVisible', async ({ roles, editVisible }) => {
    const permissions = getOffenderCategorisationPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.edit).toEqual(editVisible)
  })
})
