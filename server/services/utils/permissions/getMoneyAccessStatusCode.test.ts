import { HmppsStatusCode } from '../../../data/enums/hmppsStatusCode'
import { Role } from '../../../data/enums/role'
import getMoneyAccessStatusCode from './getMoneyAccessStatusCode'
import {
  prisonerMDI,
  prisonerOUT,
  prisonerTRN,
  restrictedPrisonerMDI,
  userLEI,
  userMDI,
} from '../../../../tests/mocks/userMocks'

describe('getMoneyAccessStatusCode.ts', () => {
  test.each`
    user       | prisoner                                                   | roles                      | expected
    ${userMDI} | ${restrictedPrisonerMDI}                                   | ${[]}                      | ${HmppsStatusCode.RESTRICTED_PATIENT}
    ${userMDI} | ${restrictedPrisonerMDI}                                   | ${[Role.PomUser]}          | ${HmppsStatusCode.RESTRICTED_PATIENT}
    ${userLEI} | ${restrictedPrisonerMDI}                                   | ${[Role.PomUser]}          | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userLEI} | ${{ ...restrictedPrisonerMDI, supportingPrisonId: 'LEI' }} | ${[Role.PomUser]}          | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userMDI} | ${{ ...restrictedPrisonerMDI, supportingPrisonId: 'MDI' }} | ${[Role.PomUser]}          | ${HmppsStatusCode.OK}
    ${userMDI} | ${restrictedPrisonerMDI}                                   | ${[Role.InactiveBookings]} | ${HmppsStatusCode.OK}
    ${userLEI} | ${restrictedPrisonerMDI}                                   | ${[Role.InactiveBookings]} | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userMDI} | ${prisonerOUT}                                             | ${[]}                      | ${HmppsStatusCode.PRISONER_IS_RELEASED}
    ${userMDI} | ${prisonerOUT}                                             | ${[Role.InactiveBookings]} | ${HmppsStatusCode.PRISONER_IS_RELEASED}
    ${userMDI} | ${prisonerTRN}                                             | ${[]}                      | ${HmppsStatusCode.PRISONER_IS_TRANSFERRING}
    ${userMDI} | ${prisonerTRN}                                             | ${[Role.GlobalSearch]}     | ${HmppsStatusCode.PRISONER_IS_TRANSFERRING}
    ${userMDI} | ${prisonerTRN}                                             | ${[Role.GlobalSearch]}     | ${HmppsStatusCode.PRISONER_IS_TRANSFERRING}
    ${userMDI} | ${prisonerTRN}                                             | ${[Role.InactiveBookings]} | ${HmppsStatusCode.PRISONER_IS_TRANSFERRING}
    ${userLEI} | ${prisonerMDI}                                             | ${[]}                      | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userLEI} | ${prisonerMDI}                                             | ${[Role.GlobalSearch]}     | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userLEI} | ${prisonerMDI}                                             | ${[Role.PomUser]}          | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userMDI} | ${prisonerMDI}                                             | ${[]}                      | ${HmppsStatusCode.OK}
  `('some name', ({ user, prisoner, roles, expected }) => {
    const accessCode = getMoneyAccessStatusCode({ ...user, userRoles: [...roles] }, prisoner)

    expect(accessCode).toEqual(expected)
  })
})
