import { Role } from '../../../data/enums/role'
import { userMDI } from '../../../../tests/mocks/userMocks'
import getPathfinderPermissions from './getPathfinderPermissions'

describe('getSocPermission', () => {
  test.each`
    roles                              | viewVisible
    ${[]}                              | ${false}
    ${[Role.PathfinderApproval]}       | ${true}
    ${[Role.PathfinderStdPrison]}      | ${true}
    ${[Role.PathfinderStdProbation]}   | ${true}
    ${[Role.PathfinderHQ]}             | ${true}
    ${[Role.PathfinderUser]}           | ${true}
    ${[Role.PathfinderLocalReader]}    | ${true}
    ${[Role.PathfinderNationalReader]} | ${true}
    ${[Role.PathfinderPolice]}         | ${true}
    ${[Role.PathfinderPsychologist]}   | ${true}
  `('roles: $roles; view: $viewVisible', async ({ roles, viewVisible }) => {
    const permissions = getPathfinderPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.view).toEqual(viewVisible)
  })

  test.each`
    roles                              | editVisible
    ${[]}                              | ${false}
    ${[Role.PathfinderApproval]}       | ${true}
    ${[Role.PathfinderStdPrison]}      | ${true}
    ${[Role.PathfinderStdProbation]}   | ${true}
    ${[Role.PathfinderHQ]}             | ${true}
    ${[Role.PathfinderUser]}           | ${true}
    ${[Role.PathfinderLocalReader]}    | ${false}
    ${[Role.PathfinderNationalReader]} | ${false}
    ${[Role.PathfinderPolice]}         | ${false}
    ${[Role.PathfinderPsychologist]}   | ${false}
  `('roles: $roles; edit: editVisible', async ({ roles, editVisible }) => {
    const permissions = getPathfinderPermissions({ ...userMDI, userRoles: [...roles] })

    expect(permissions.edit).toEqual(editVisible)
  })
})
