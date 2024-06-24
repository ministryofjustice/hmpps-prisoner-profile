import { Role } from '../../../data/enums/role'
import { userMDI } from '../../../../tests/mocks/userMocks'
import getSensitiveCaseNotesPermissions from './getSensitiveCaseNotesPermissions'

describe('getOverviewAccessStatusCode.ts', () => {
  test.each`
    roles                            | viewVisible
    ${[]}                            | ${false}
    ${[Role.PomUser]}                | ${true}
    ${[Role.ViewSensitiveCaseNotes]} | ${true}
    ${[Role.AddSensitiveCaseNotes]}  | ${true}
  `('roles: $roles; view: $viewVisible', async ({ roles, viewVisible }) => {
    const permissions = getSensitiveCaseNotesPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.view).toEqual(viewVisible)
  })

  test.each`
    roles                              | deleteVisible
    ${[]}                              | ${false}
    ${[Role.PomUser]}                  | ${false}
    ${[Role.ViewSensitiveCaseNotes]}   | ${false}
    ${[Role.AddSensitiveCaseNotes]}    | ${false}
    ${[Role.DeleteSensitiveCaseNotes]} | ${true}
  `('roles: $roles; delete: deleteVisible', async ({ roles, deleteVisible }) => {
    const permissions = getSensitiveCaseNotesPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.delete).toEqual(deleteVisible)
  })

  test.each`
    roles                              | editVisible
    ${[]}                              | ${false}
    ${[Role.PomUser]}                  | ${true}
    ${[Role.ViewSensitiveCaseNotes]}   | ${false}
    ${[Role.AddSensitiveCaseNotes]}    | ${true}
    ${[Role.DeleteSensitiveCaseNotes]} | ${false}
  `('roles: $roles; edit: $viewVisible', async ({ roles, editVisible }) => {
    const permissions = getSensitiveCaseNotesPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.edit).toEqual(editVisible)
  })
})
