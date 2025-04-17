import { HmppsStatusCode } from '../../../../data/enums/hmppsStatusCode'
import { Role } from '../../../../data/enums/role'
import getOverviewAccessStatusCode from './getOverviewAccessStatusCode'
import {
  prisonerMDI,
  prisonerOUT,
  prisonerTRN,
  restrictedPrisonerMDI,
  userLEI,
  userMDI,
} from '../../../../../tests/mocks/userMocks'

describe('getOverviewAccessStatusCode.ts', () => {
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
    ${userMDI} | ${prisonerTRN}           | ${[Role.GlobalSearch]}               | ${HmppsStatusCode.OK}
    ${userMDI} | ${prisonerTRN}           | ${[Role.GlobalSearch]}               | ${HmppsStatusCode.OK}
    ${userMDI} | ${prisonerTRN}           | ${[Role.InactiveBookings]}           | ${HmppsStatusCode.OK}
    ${userLEI} | ${prisonerMDI}           | ${[]}                                | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userLEI} | ${prisonerMDI}           | ${[Role.GlobalSearch]}               | ${HmppsStatusCode.OK}
    ${userLEI} | ${prisonerMDI}           | ${[Role.PomUser]}                    | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userLEI} | ${prisonerMDI}           | ${[Role.GlobalSearch, Role.PomUser]} | ${HmppsStatusCode.OK}
    ${userMDI} | ${prisonerMDI}           | ${[]}                                | ${HmppsStatusCode.OK}
  `(' User should receive correct access code', async ({ user, prisoner, roles, expected }) => {
    const accessCode = await getOverviewAccessStatusCode({ ...user, userRoles: [...roles, Role.PrisonUser] }, prisoner)

    expect(accessCode).toEqual(expected)
  })

  it('Respects the allowGlobal flag', async () => {
    const accessCode = await getOverviewAccessStatusCode(
      {
        ...userLEI,
        userRoles: [Role.GlobalSearch, Role.PrisonUser],
      },
      prisonerMDI,
      {
        allowGlobal: false,
      },
    )

    expect(accessCode).toEqual(HmppsStatusCode.GLOBAL_USER_NOT_PERMITTED)
  })
})
