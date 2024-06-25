import {
  prisonerMDI,
  prisonerOUT,
  prisonerTRN,
  restrictedPrisonerMDI,
  userLEI,
  userMDI,
} from '../../../../tests/mocks/userMocks'
import { Role } from '../../../data/enums/role'
import getAlertsPermissions from './getAlertsPermissions'

const caseLoadListWithLei = [
  { caseLoadId: 'MDI', currentlyActive: true },
  { caseLoadId: 'LEI', currentlyActive: false },
]

// same as userCanEdit but only when user has Role.UpdateAlert
describe('getAlertsPermissions', () => {
  test.each`
    user                                              | prisoner                 | roles                                        | editPermitted
    ${userMDI}                                        | ${prisonerMDI}           | ${[]}                                        | ${false}
    ${userMDI}                                        | ${prisonerMDI}           | ${[Role.UpdateAlert]}                        | ${true}
    ${userMDI}                                        | ${restrictedPrisonerMDI} | ${[]}                                        | ${false}
    ${userMDI}                                        | ${restrictedPrisonerMDI} | ${[Role.UpdateAlert]}                        | ${true}
    ${userLEI}                                        | ${prisonerMDI}           | ${[]}                                        | ${false}
    ${userLEI}                                        | ${prisonerMDI}           | ${[Role.UpdateAlert]}                        | ${false}
    ${{ ...userLEI, caseLoads: caseLoadListWithLei }} | ${prisonerMDI}           | ${[]}                                        | ${false}
    ${{ ...userLEI, caseLoads: caseLoadListWithLei }} | ${prisonerMDI}           | ${[Role.UpdateAlert]}                        | ${true}
    ${userLEI}                                        | ${prisonerOUT}           | ${[]}                                        | ${false}
    ${userLEI}                                        | ${prisonerOUT}           | ${[Role.InactiveBookings]}                   | ${false}
    ${userLEI}                                        | ${prisonerOUT}           | ${[Role.InactiveBookings, Role.UpdateAlert]} | ${true}
    ${userLEI}                                        | ${prisonerTRN}           | ${[]}                                        | ${false}
    ${userLEI}                                        | ${prisonerTRN}           | ${[Role.UpdateAlert]}                        | ${false}
    ${userLEI}                                        | ${prisonerTRN}           | ${[Role.InactiveBookings]}                   | ${false}
    ${userLEI}                                        | ${prisonerTRN}           | ${[Role.InactiveBookings, Role.UpdateAlert]} | ${true}
    ${userLEI}                                        | ${restrictedPrisonerMDI} | ${[Role.InactiveBookings]}                   | ${false}
    ${userLEI}                                        | ${restrictedPrisonerMDI} | ${[Role.InactiveBookings, Role.UpdateAlert]} | ${false}
    ${userLEI}                                        | ${restrictedPrisonerMDI} | ${[Role.PomUser]}                            | ${false}
    ${userLEI}                                        | ${restrictedPrisonerMDI} | ${[Role.PomUser, Role.UpdateAlert]}          | ${true}
  `('roles: $roles; edit: $editPermitted', async ({ user, prisoner, roles, editPermitted }) => {
    const permissions = getAlertsPermissions({ ...user, userRoles: [...roles] }, prisoner)

    expect(permissions.edit).toEqual(editPermitted)
  })
})
