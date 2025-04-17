import { prisonerMDI, prisonerOUT, restrictedPrisonerMDI, userLEI, userMDI } from '../../../../tests/mocks/userMocks'
import getCSIPPermissions from './getCSIPPermissions'

const caseLoadListWithMdi = [
  { caseLoadId: 'MDI', currentlyActive: false },
  { caseLoadId: 'LEI', currentlyActive: true },
]

describe('getCSIPPermissions.ts', () => {
  test.each`
    user                                              | prisoner                 | viewPermitted
    ${userMDI}                                        | ${prisonerMDI}           | ${true}
    ${{ ...userLEI, caseLoads: caseLoadListWithMdi }} | ${prisonerMDI}           | ${true}
    ${userLEI}                                        | ${prisonerMDI}           | ${false}
    ${userMDI}                                        | ${prisonerOUT}           | ${false}
    ${userMDI}                                        | ${restrictedPrisonerMDI} | ${false}
  `('view: $viewPermitted', async ({ user, prisoner, viewPermitted }) => {
    const permissions = getCSIPPermissions(user, prisoner)

    expect(permissions.view).toEqual(viewPermitted)
  })
})
