import { Role } from '../../../data/enums/role'
import { userMDI } from '../../../../tests/mocks/userMocks'
import getCourtCasesPermissions from './getCourtCasesPermissions'

describe('getCourtCasesPermissions', () => {
  test.each`
    roles                            | viewVisible
    ${[]}                            | ${false}
    ${[Role.ReleaseDatesCalculator]} | ${true}
  `('roles: $roles; view: $viewVisible', async ({ roles, viewVisible }) => {
    const permissions = getCourtCasesPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.view).toEqual(viewVisible)
  })

  test.each`
    roles                           | editVisible
    ${[]}                           | ${false}
    ${[Role.AdjustmentsMaintainer]} | ${true}
  `('roles: $roles; edit: editVisible', async ({ roles, editVisible }) => {
    const permissions = getCourtCasesPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.edit).toEqual(editVisible)
  })
})
