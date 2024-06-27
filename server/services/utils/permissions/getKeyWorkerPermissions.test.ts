import getKeyWorkerPermissions from './getKeyworkerPermissions'

describe('getKeyWorkerPermissions', () => {
  test.each`
    staffRoles                 | editPermitted
    ${[]}                      | ${false}
    ${[{ role: 'KW' }]}        | ${true}
    ${[{ role: 'Something' }]} | ${false}
  `('roles: $roles; edit: editPermitted', async ({ staffRoles, editPermitted }) => {
    const permissions = getKeyWorkerPermissions(staffRoles)

    expect(permissions.edit).toEqual(editPermitted)
  })
})
