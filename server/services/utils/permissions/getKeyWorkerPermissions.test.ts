import getKeyWorkerPermissions from './getKeyworkerPermissions'

describe('getKeyWorkerPermissions', () => {
  test.each`
    staffRoles                 | editVisible
    ${[]}                      | ${false}
    ${[{ role: 'KW' }]}        | ${true}
    ${[{ role: 'Something' }]} | ${false}
  `('roles: $roles; edit: editVisible', async ({ staffRoles, editVisible }) => {
    const permissions = getKeyWorkerPermissions(staffRoles)

    expect(permissions.edit).toEqual(editVisible)
  })
})
