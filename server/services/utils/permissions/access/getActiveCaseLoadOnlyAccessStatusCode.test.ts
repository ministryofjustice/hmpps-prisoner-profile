import { HmppsStatusCode } from '../../../../data/enums/hmppsStatusCode'
import { Role } from '../../../../data/enums/role'
import {
  prisonerMDI,
  prisonerOUT,
  prisonerTRN,
  restrictedPrisonerMDI,
  userLEI,
  userMDI,
} from '../../../../../tests/mocks/userMocks'
import getActiveCaseLoadOnlyAccessStatusCode from './getActiveCaseLoadOnlyAccessStatusCode'

describe('getActiveCaseLoadOnlyAccessStatusCode.ts', () => {
  test.each`
    user       | prisoner                                                   | roles                      | expected
    ${userMDI} | ${restrictedPrisonerMDI}                                   | ${[]}                      | ${HmppsStatusCode.RESTRICTED_PATIENT}
    ${userMDI} | ${restrictedPrisonerMDI}                                   | ${[Role.PomUser]}          | ${HmppsStatusCode.RESTRICTED_PATIENT}
    ${userLEI} | ${restrictedPrisonerMDI}                                   | ${[Role.PomUser]}          | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userLEI} | ${{ ...restrictedPrisonerMDI, supportingPrisonId: 'LEI' }} | ${[Role.PomUser]}          | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userMDI} | ${{ ...restrictedPrisonerMDI, supportingPrisonId: 'MDI' }} | ${[Role.PomUser]}          | ${HmppsStatusCode.OK}
    ${userLEI} | ${restrictedPrisonerMDI}                                   | ${[Role.InactiveBookings]} | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userMDI} | ${prisonerOUT}                                             | ${[]}                      | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userMDI} | ${prisonerOUT}                                             | ${[Role.InactiveBookings]} | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userMDI} | ${prisonerTRN}                                             | ${[]}                      | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userMDI} | ${prisonerTRN}                                             | ${[Role.GlobalSearch]}     | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userMDI} | ${prisonerTRN}                                             | ${[Role.GlobalSearch]}     | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userMDI} | ${prisonerTRN}                                             | ${[Role.InactiveBookings]} | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userLEI} | ${prisonerMDI}                                             | ${[]}                      | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userLEI} | ${prisonerMDI}                                             | ${[Role.GlobalSearch]}     | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userLEI} | ${prisonerMDI}                                             | ${[Role.PomUser]}          | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userMDI} | ${prisonerMDI}                                             | ${[]}                      | ${HmppsStatusCode.OK}
  `(' User should receive correct access code', async ({ user, prisoner, roles, expected }) => {
    const accessCode = await getActiveCaseLoadOnlyAccessStatusCode({ ...user, userRoles: [...roles] }, prisoner)

    expect(accessCode).toEqual(expected)
  })
})
