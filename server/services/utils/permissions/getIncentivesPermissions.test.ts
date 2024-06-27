import { prisonerMDI, userLEI, userMDI } from '../../../../tests/mocks/userMocks'
import { Role } from '../../../data/enums/role'
import getIncentivesPermissions from './getIncentivesPermissions'

const caseLoadListWithMdi = [
  { caseLoadId: 'MDI', currentlyActive: false },
  { caseLoadId: 'LEI', currentlyActive: true },
]

describe('getIncentivesPermissions', () => {
  test.each`
    user                                              | prisoner       | roles                  | viewPermitted
    ${userMDI}                                        | ${prisonerMDI} | ${[]}                  | ${true}
    ${userLEI}                                        | ${prisonerMDI} | ${[]}                  | ${false}
    ${userLEI}                                        | ${prisonerMDI} | ${[Role.GlobalSearch]} | ${true}
    ${{ ...userLEI, caseLoads: caseLoadListWithMdi }} | ${prisonerMDI} | ${[]}                  | ${true}
  `('roles: $roles; view: $viewPermitted', async ({ user, prisoner, roles, viewPermitted }) => {
    const permissions = getIncentivesPermissions({ ...user, userRoles: [...roles] }, prisoner)

    expect(permissions.view).toEqual(viewPermitted)
  })
})
