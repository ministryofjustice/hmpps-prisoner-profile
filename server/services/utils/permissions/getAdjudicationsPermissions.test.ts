import { prisonerMDI, userLEI, userMDI } from '../../../../tests/mocks/userMocks'
import { Role } from '../../../data/enums/role'
import getAdjudicationsPermissions from './getAdjudicationsPermissions'

const caseLoadListWithMdi = [
  { caseLoadId: 'MDI', currentlyActive: false },
  { caseLoadId: 'LEI', currentlyActive: true },
]

describe('getAdjudicationsPermissions', () => {
  test.each`
    user                                              | prisoner       | roles                   | viewPermitted
    ${userMDI}                                        | ${prisonerMDI} | ${[]}                   | ${true}
    ${userLEI}                                        | ${prisonerMDI} | ${[]}                   | ${false}
    ${userLEI}                                        | ${prisonerMDI} | ${[Role.GlobalSearch]}  | ${false}
    ${userLEI}                                        | ${prisonerMDI} | ${[Role.PomUser]}       | ${true}
    ${userLEI}                                        | ${prisonerMDI} | ${[Role.ReceptionUser]} | ${true}
    ${{ ...userLEI, caseLoads: caseLoadListWithMdi }} | ${prisonerMDI} | ${[]}                   | ${true}
  `('roles: $roles; view: $viewPermitted', async ({ user, prisoner, roles, viewPermitted }) => {
    const permissions = getAdjudicationsPermissions({ ...user, userRoles: [...roles] }, prisoner)

    expect(permissions.view).toEqual(viewPermitted)
  })
})
