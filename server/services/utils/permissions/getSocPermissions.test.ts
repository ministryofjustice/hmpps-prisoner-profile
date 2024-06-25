import { Role } from '../../../data/enums/role'
import { userMDI } from '../../../../tests/mocks/userMocks'
import getSocPermissions from './getSocPermissions'

describe('getSocPermission', () => {
  test.each`
    roles                  | viewPermitted
    ${[]}                  | ${false}
    ${[Role.SocCommunity]} | ${true}
    ${[Role.SocCustody]}   | ${true}
  `('roles: $roles; view: $viewPermitted', async ({ roles, viewPermitted }) => {
    const permissions = getSocPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.view).toEqual(viewPermitted)
  })

  test.each`
    roles                    | editPermitted
    ${[]}                    | ${false}
    ${[Role.SocCustody]}     | ${true}
    ${[Role.SocCommunity]}   | ${true}
    ${[Role.SocDataAnalyst]} | ${true}
    ${[Role.SocDataManager]} | ${true}
  `('roles: $roles; edit: editPermitted', async ({ roles, editPermitted }) => {
    const permissions = getSocPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.edit).toEqual(editPermitted)
  })
})
