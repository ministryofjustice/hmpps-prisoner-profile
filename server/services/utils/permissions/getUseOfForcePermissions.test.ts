import {
  prisonerMDI,
  prisonerOUT,
  prisonerTRN,
  restrictedPrisonerMDI,
  userLEI,
  userMDI,
} from '../../../../tests/mocks/userMocks'
import getUseOfForcePermissions from './getUseOfForcePermissions'
import { Role } from '../../../data/enums/role'

const caseLoadListWithLei = [
  { caseLoadId: 'MDI', currentlyActive: true },
  { caseLoadId: 'LEI', currentlyActive: false },
]

describe('getUseOfForcePermissions', () => {
  test.each`
    user                                              | prisoner                 | roles                      | editPermitted
    ${userMDI}                                        | ${prisonerMDI}           | ${[]}                      | ${true}
    ${userMDI}                                        | ${restrictedPrisonerMDI} | ${[]}                      | ${false}
    ${userLEI}                                        | ${prisonerMDI}           | ${[]}                      | ${false}
    ${{ ...userLEI, caseLoads: caseLoadListWithLei }} | ${prisonerMDI}           | ${[]}                      | ${true}
    ${userLEI}                                        | ${prisonerOUT}           | ${[]}                      | ${false}
    ${userLEI}                                        | ${prisonerOUT}           | ${[Role.InactiveBookings]} | ${true}
    ${userLEI}                                        | ${prisonerTRN}           | ${[]}                      | ${false}
    ${userLEI}                                        | ${prisonerTRN}           | ${[Role.InactiveBookings]} | ${true}
    ${userLEI}                                        | ${restrictedPrisonerMDI} | ${[Role.InactiveBookings]} | ${false}
    ${userLEI}                                        | ${restrictedPrisonerMDI} | ${[Role.PomUser]}          | ${false}
  `('roles: $roles; edit: $editPermitted', async ({ user, prisoner, roles, editPermitted }) => {
    const permissions = getUseOfForcePermissions({ ...user, userRoles: [...roles] }, prisoner)

    expect(permissions.edit).toEqual(editPermitted)
  })
})
