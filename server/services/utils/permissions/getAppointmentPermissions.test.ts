import { prisonerMDI, restrictedPrisonerMDI, userLEI, userMDI } from '../../../../tests/mocks/userMocks'
import getAppointmentPermissions from './getAppointmentPermissions'

describe('getAppointmentPermissions', () => {
  test.each`
    user       | prisoner                 | roles | editPermitted
    ${userMDI} | ${prisonerMDI}           | ${[]} | ${true}
    ${userMDI} | ${restrictedPrisonerMDI} | ${[]} | ${false}
    ${userLEI} | ${prisonerMDI}           | ${[]} | ${false}
  `('roles: $roles; view: $editPermitted', async ({ user, prisoner, roles, editPermitted }) => {
    const permissions = getAppointmentPermissions({ ...user, userRoles: [...roles] }, prisoner)

    expect(permissions.edit).toEqual(editPermitted)
  })
})
