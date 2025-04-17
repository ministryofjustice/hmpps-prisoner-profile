import { Role } from '../../../data/enums/role'
import { userMDI } from '../../../../tests/mocks/userMocks'
import getCourtCasesPermissions from './getCourtCasesPermissions'

describe('getCourtCasesPermissions', () => {
  test.each`
    roles                            | viewPermitted
    ${[]}                            | ${false}
    ${[Role.ReleaseDatesCalculator]} | ${true}
  `('roles: $roles; view: $viewPermitted', async ({ roles, viewPermitted }) => {
    const permissions = getCourtCasesPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.view).toEqual(viewPermitted)
  })

  test.each`
    roles                           | editPermitted
    ${[]}                           | ${false}
    ${[Role.AdjustmentsMaintainer]} | ${true}
  `('roles: $roles; edit: editPermitted', async ({ roles, editPermitted }) => {
    const permissions = getCourtCasesPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.edit).toEqual(editPermitted)
  })
})
