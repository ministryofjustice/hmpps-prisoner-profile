import { userMDI, prisonerMDI, userLEI } from '../../../../tests/mocks/userMocks'
import getActivityPermissions from './getActivityPermissions'
import { Role } from '../../../data/enums/role'

describe('getActivityPermissions.ts', () => {
  test.each`
    user       | prisoner                                    | roles                 | editVisible
    ${userMDI} | ${prisonerMDI}                              | ${[]}                 | ${false}
    ${userMDI} | ${prisonerMDI}                              | ${[Role.ActivityHub]} | ${true}
    ${userLEI} | ${prisonerMDI}                              | ${[Role.ActivityHub]} | ${false}
    ${userMDI} | ${{ ...prisonerMDI, status: 'ACTIVE OUT' }} | ${[Role.ActivityHub]} | ${false}
  `('roles: $roles; edit: editVisible', async ({ user, prisoner, roles, editVisible }) => {
    const permissions = getActivityPermissions({ ...user, userRoles: [...roles] }, prisoner)

    expect(permissions.edit).toEqual(editVisible)
  })
})
