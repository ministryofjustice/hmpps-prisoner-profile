import { Role } from '../../../data/enums/role'
import { userMDI } from '../../../../tests/mocks/userMocks'
import getSensitiveCaseNotesPermissions from './getSensitiveCaseNotesPermissions'

describe('getOverviewAccessStatusCode.ts', () => {
  test.each`
    roles                            | viewPermitted
    ${[]}                            | ${false}
    ${[Role.PomUser]}                | ${true}
    ${[Role.ViewSensitiveCaseNotes]} | ${true}
    ${[Role.AddSensitiveCaseNotes]}  | ${true}
  `('roles: $roles; view: $viewPermitted', async ({ roles, viewPermitted }) => {
    const permissions = getSensitiveCaseNotesPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.view).toEqual(viewPermitted)
  })

  test.each`
    roles                              | deletePermitted
    ${[]}                              | ${false}
    ${[Role.PomUser]}                  | ${false}
    ${[Role.ViewSensitiveCaseNotes]}   | ${false}
    ${[Role.AddSensitiveCaseNotes]}    | ${false}
    ${[Role.DeleteSensitiveCaseNotes]} | ${true}
  `('roles: $roles; delete: deletePermitted', async ({ roles, deletePermitted }) => {
    const permissions = getSensitiveCaseNotesPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.delete).toEqual(deletePermitted)
  })

  test.each`
    roles                              | editPermitted
    ${[]}                              | ${false}
    ${[Role.PomUser]}                  | ${true}
    ${[Role.ViewSensitiveCaseNotes]}   | ${false}
    ${[Role.AddSensitiveCaseNotes]}    | ${true}
    ${[Role.DeleteSensitiveCaseNotes]} | ${false}
  `('roles: $roles; edit: $viewPermitted', async ({ roles, editPermitted }) => {
    const permissions = getSensitiveCaseNotesPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.edit).toEqual(editPermitted)
  })
})
