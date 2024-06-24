import { Role } from '../../../data/enums/role'
import { userMDI } from '../../../../tests/mocks/userMocks'
import getSocPermissions from './getSocPermissions'

describe('getSocPermission', () => {
  test.each`
    roles                  | viewVisible
    ${[]}                  | ${false}
    ${[Role.SocCommunity]} | ${true}
    ${[Role.SocCustody]}   | ${true}
  `('roles: $roles; view: $viewVisible', async ({ roles, viewVisible }) => {
    const permissions = getSocPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.view).toEqual(viewVisible)
  })

  test.each`
    roles                    | editVisible
    ${[]}                    | ${false}
    ${[Role.SocCustody]}     | ${true}
    ${[Role.SocCommunity]}   | ${true}
    ${[Role.SocDataAnalyst]} | ${true}
    ${[Role.SocDataManager]} | ${true}
  `('roles: $roles; edit: editVisible', async ({ roles, editVisible }) => {
    const permissions = getSocPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.edit).toEqual(editVisible)
  })
})
