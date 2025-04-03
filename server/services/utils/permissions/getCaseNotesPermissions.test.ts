import {
  prisonerMDI,
  prisonerOUT,
  prisonerTRN,
  restrictedPatientMDI,
  userLEI,
  userMDI,
} from '../../../../tests/mocks/userMocks'
import { Role } from '../../../data/enums/role'
import getCaseNotesPermissions from './getCaseNotesPermissions'

const caseLoadListWithMdi = [
  { caseLoadId: 'MDI', currentlyActive: false },
  { caseLoadId: 'LEI', currentlyActive: true },
]

describe('getCaseNotesPermissions', () => {
  test.each`
    user                                              | prisoner                | roles                                | editPermitted
    ${userMDI}                                        | ${prisonerMDI}          | ${[]}                                | ${true}
    ${userLEI}                                        | ${prisonerMDI}          | ${[]}                                | ${false}
    ${{ ...userLEI, caseLoads: caseLoadListWithMdi }} | ${prisonerMDI}          | ${[]}                                | ${true}
    ${userLEI}                                        | ${prisonerOUT}          | ${[]}                                | ${false}
    ${userLEI}                                        | ${prisonerOUT}          | ${[Role.InactiveBookings]}           | ${true}
    ${userLEI}                                        | ${prisonerTRN}          | ${[]}                                | ${false}
    ${userLEI}                                        | ${prisonerTRN}          | ${[Role.InactiveBookings]}           | ${true}
    ${userLEI}                                        | ${restrictedPatientMDI} | ${[Role.InactiveBookings]}           | ${true}
    ${userMDI}                                        | ${restrictedPatientMDI} | ${[Role.PomUser]}                    | ${true}
    ${userLEI}                                        | ${prisonerMDI}          | ${[Role.GlobalSearch, Role.PomUser]} | ${false}
    ${userLEI}                                        | ${prisonerMDI}          | ${[Role.GlobalSearch]}               | ${false}
    ${userLEI}                                        | ${prisonerMDI}          | ${[Role.PomUser]}                    | ${false}
  `('roles: $roles; view: $editPermitted', async ({ user, prisoner, roles, editPermitted }) => {
    const permissions = getCaseNotesPermissions({ ...user, userRoles: [...roles] }, prisoner)

    expect(permissions.edit).toEqual(editPermitted)
  })
})
