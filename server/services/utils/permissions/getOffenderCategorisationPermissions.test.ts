import { Role } from '../../../data/enums/role'
import { userMDI } from '../../../../tests/mocks/userMocks'
import getOffenderCategorisationPermissions from './getOffenderCategorisationPermissions'

describe('getOffenderCategorisationPermissions', () => {
  test.each`
    roles                            | editPermitted
    ${[]}                            | ${false}
    ${[Role.CreateCategorisation]}   | ${true}
    ${[Role.ApproveCategorisation]}  | ${true}
    ${[Role.CreateRecategorisation]} | ${true}
    ${[Role.CategorisationSecurity]} | ${true}
  `('roles: $roles; edit: $editPermitted', async ({ roles, editPermitted }) => {
    const permissions = getOffenderCategorisationPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.edit).toEqual(editPermitted)
  })
})
