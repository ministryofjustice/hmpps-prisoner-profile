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
import getCaseNotesAccessStatusCode from './getCaseNotesAccessStatusCode'

describe('getCaseNotesAccessStatusCode.ts', () => {
  test.each`
    user       | prisoner                 | roles                                | expected
    ${userMDI} | ${restrictedPrisonerMDI} | ${[]}                                | ${HmppsStatusCode.RESTRICTED_PATIENT}
    ${userMDI} | ${restrictedPrisonerMDI} | ${[Role.PomUser]}                    | ${HmppsStatusCode.RESTRICTED_PATIENT}
    ${userLEI} | ${restrictedPrisonerMDI} | ${[Role.PomUser]}                    | ${HmppsStatusCode.RESTRICTED_PATIENT}
    ${userLEI} | ${{
  ...restrictedPrisonerMDI,
  supportingPrisonId: 'LEI',
}} | ${[Role.PomUser]} | ${HmppsStatusCode.OK}
    ${userMDI} | ${{
  ...restrictedPrisonerMDI,
  supportingPrisonId: 'MDI',
}} | ${[Role.PomUser]} | ${HmppsStatusCode.OK}
    ${userLEI} | ${restrictedPrisonerMDI} | ${[Role.InactiveBookings]}           | ${HmppsStatusCode.OK}
    ${userMDI} | ${prisonerOUT}           | ${[]}                                | ${HmppsStatusCode.PRISONER_IS_RELEASED}
    ${userMDI} | ${prisonerOUT}           | ${[Role.InactiveBookings]}           | ${HmppsStatusCode.OK}
    ${userMDI} | ${prisonerTRN}           | ${[]}                                | ${HmppsStatusCode.PRISONER_IS_TRANSFERRING}
    ${userMDI} | ${prisonerTRN}           | ${[Role.GlobalSearch]}               | ${HmppsStatusCode.PRISONER_IS_TRANSFERRING}
    ${userMDI} | ${prisonerTRN}           | ${[Role.GlobalSearch]}               | ${HmppsStatusCode.PRISONER_IS_TRANSFERRING}
    ${userMDI} | ${prisonerTRN}           | ${[Role.InactiveBookings]}           | ${HmppsStatusCode.OK}
    ${userLEI} | ${prisonerMDI}           | ${[]}                                | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userLEI} | ${prisonerMDI}           | ${[Role.GlobalSearch]}               | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userLEI} | ${prisonerMDI}           | ${[Role.PomUser]}                    | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userLEI} | ${prisonerMDI}           | ${[Role.PomUser, Role.GlobalSearch]} | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userMDI} | ${prisonerMDI}           | ${[]}                                | ${HmppsStatusCode.OK}
  `(' User should receive correct access code', ({ user, prisoner, roles, expected }) => {
    const accessCode = getCaseNotesAccessStatusCode({ ...user, userRoles: [...roles, Role.PrisonUser] }, prisoner)

    expect(accessCode).toEqual(expected)
  })
})
