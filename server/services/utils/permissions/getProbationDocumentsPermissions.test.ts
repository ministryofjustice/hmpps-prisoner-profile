import { prisonerMDI, prisonerOUT, prisonerTRN, userLEI, userMDI } from '../../../../tests/mocks/userMocks'
import getProbationDocumentsPermissions from './getProbationDocumentsPermissions'
import { Role } from '../../../data/enums/role'

describe('getProbationDocumentsPermissions.ts', () => {
  test.each`
    user       | prisoner       | roles                                          | viewVisible
    ${userMDI} | ${prisonerMDI} | ${[]}                                          | ${false}
    ${userMDI} | ${prisonerMDI} | ${[Role.PomUser]}                              | ${true}
    ${userMDI} | ${prisonerMDI} | ${[Role.ViewProbationDocuments]}               | ${true}
    ${userMDI} | ${prisonerMDI} | ${[Role.PomUser, Role.ViewProbationDocuments]} | ${true}
    ${userLEI} | ${prisonerMDI} | ${[Role.ViewProbationDocuments]}               | ${false}
    ${userLEI} | ${prisonerOUT} | ${[Role.ViewProbationDocuments]}               | ${true}
    ${userLEI} | ${prisonerOUT} | ${[]}                                          | ${false}
    ${userLEI} | ${prisonerTRN} | ${[Role.ViewProbationDocuments]}               | ${true}
    ${userLEI} | ${prisonerTRN} | ${[]}                                          | ${false}
  `('roles: $roles; view: $viewVisible', async ({ user, prisoner, roles, viewVisible }) => {
    const permissions = getProbationDocumentsPermissions({ ...user, userRoles: [...roles] }, prisoner)

    expect(permissions.view).toEqual(viewVisible)
  })
})
