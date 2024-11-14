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
import getProbationDocumentsAccessStatusCode from './getProbationDocumentsAccessStatusCode'

describe('getProbationDocumentsAccessStatusCode', () => {
  test.each`
    user       | prisoner                                                   | roles                                               | expected
    ${userMDI} | ${restrictedPrisonerMDI}                                   | ${[]}                                               | ${HmppsStatusCode.NOT_FOUND}
    ${userMDI} | ${restrictedPrisonerMDI}                                   | ${[Role.ViewProbationDocuments]}                    | ${HmppsStatusCode.RESTRICTED_PATIENT}
    ${userMDI} | ${restrictedPrisonerMDI}                                   | ${[Role.PomUser]}                                   | ${HmppsStatusCode.RESTRICTED_PATIENT}
    ${userLEI} | ${restrictedPrisonerMDI}                                   | ${[Role.PomUser]}                                   | ${HmppsStatusCode.RESTRICTED_PATIENT}
    ${userLEI} | ${{ ...restrictedPrisonerMDI, supportingPrisonId: 'LEI' }} | ${[Role.PomUser]}                                   | ${HmppsStatusCode.OK}
    ${userLEI} | ${{ ...restrictedPrisonerMDI, supportingPrisonId: 'LEI' }} | ${[Role.PomUser, Role.ViewProbationDocuments]}      | ${HmppsStatusCode.OK}
    ${userMDI} | ${{ ...restrictedPrisonerMDI, supportingPrisonId: 'MDI' }} | ${[Role.PomUser]}                                   | ${HmppsStatusCode.OK}
    ${userLEI} | ${restrictedPrisonerMDI}                                   | ${[Role.InactiveBookings]}                          | ${HmppsStatusCode.NOT_FOUND}
    ${userMDI} | ${prisonerOUT}                                             | ${[]}                                               | ${HmppsStatusCode.NOT_FOUND}
    ${userMDI} | ${prisonerOUT}                                             | ${[Role.InactiveBookings]}                          | ${HmppsStatusCode.NOT_FOUND}
    ${userMDI} | ${prisonerTRN}                                             | ${[]}                                               | ${HmppsStatusCode.NOT_FOUND}
    ${userMDI} | ${prisonerTRN}                                             | ${[Role.PomUser]}                                   | ${HmppsStatusCode.PRISONER_IS_TRANSFERRING}
    ${userMDI} | ${prisonerTRN}                                             | ${[Role.GlobalSearch]}                              | ${HmppsStatusCode.NOT_FOUND}
    ${userMDI} | ${prisonerTRN}                                             | ${[Role.GlobalSearch]}                              | ${HmppsStatusCode.NOT_FOUND}
    ${userMDI} | ${prisonerTRN}                                             | ${[Role.InactiveBookings]}                          | ${HmppsStatusCode.NOT_FOUND}
    ${userMDI} | ${prisonerTRN}                                             | ${[Role.GlobalSearch, Role.PomUser]}                | ${HmppsStatusCode.OK}
    ${userMDI} | ${prisonerTRN}                                             | ${[Role.InactiveBookings, Role.PomUser]}            | ${HmppsStatusCode.OK}
    ${userLEI} | ${prisonerMDI}                                             | ${[Role.ViewProbationDocuments]}                    | ${HmppsStatusCode.NOT_IN_CASELOAD}
    ${userLEI} | ${prisonerMDI}                                             | ${[]}                                               | ${HmppsStatusCode.NOT_FOUND}
    ${userLEI} | ${prisonerMDI}                                             | ${[Role.GlobalSearch]}                              | ${HmppsStatusCode.NOT_FOUND}
    ${userLEI} | ${prisonerMDI}                                             | ${[Role.GlobalSearch, Role.ViewProbationDocuments]} | ${HmppsStatusCode.GLOBAL_USER_NOT_PERMITTED}
    ${userLEI} | ${prisonerMDI}                                             | ${[Role.PomUser]}                                   | ${HmppsStatusCode.OK}
    ${userMDI} | ${prisonerMDI}                                             | ${[]}                                               | ${HmppsStatusCode.NOT_FOUND}
    ${userMDI} | ${prisonerMDI}                                             | ${[Role.ViewProbationDocuments]}                    | ${HmppsStatusCode.OK}
  `(' User should receive correct access code', ({ user, prisoner, roles, expected }) => {
    const accessCode = getProbationDocumentsAccessStatusCode({ ...user, userRoles: [...roles] }, prisoner)

    expect(accessCode).toEqual(expected)
  })
})
