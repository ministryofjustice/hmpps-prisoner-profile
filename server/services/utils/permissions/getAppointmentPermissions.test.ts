import { prisonerMDI, restrictedPrisonerMDI, userLEI, userMDI } from '../../../../tests/mocks/userMocks'
import getAppointmentPermissions from './getAppointmentPermissions'

describe('getAppointmentPermissions', () => {
  test.each`
    user       | prisoner                 | roles | editVisible
    ${userMDI} | ${prisonerMDI}           | ${[]} | ${true}
    ${userMDI} | ${restrictedPrisonerMDI} | ${[]} | ${false}
    ${userLEI} | ${prisonerMDI}           | ${[]} | ${false}
  `('roles: $roles; view: $editVisible', async ({ user, prisoner, roles, editVisible }) => {
    const permissions = getAppointmentPermissions({ ...user, userRoles: [...roles] }, prisoner)

    expect(permissions.edit).toEqual(editVisible)
  })
})
