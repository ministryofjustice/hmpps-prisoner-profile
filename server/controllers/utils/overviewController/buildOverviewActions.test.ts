import type HeaderFooterMeta from '@ministryofjustice/hmpps-connect-dps-components/dist/types/HeaderFooterMeta'
import { Role } from '../../../data/enums/role'
import buildOverviewActions from './buildOverviewActions'
import { PrisonerMockDataA } from '../../../data/localMockData/prisoner'
import { prisonUserMock } from '../../../data/localMockData/user'
import config from '../../../config'
import Nominal from '../../../data/interfaces/manageSocCasesApi/Nominal'

const pathfinderNominal = { id: 1 }
const socNominal = { id: 2 }
const staffRoles = [{ role: 'KW' }]
describe('buildOverviewActions', () => {
  describe('Calculate release dates', () => {
    test.each`
      roles                            | visible
      ${[Role.ReleaseDatesCalculator]} | ${true}
      ${[Role.GlobalSearch]}           | ${false}
    `('user with roles: $expected, can see: $visible', ({ roles, visible }) => {
      const user = { ...prisonUserMock, userRoles: roles }
      const resp = buildOverviewActions(
        PrisonerMockDataA,
        pathfinderNominal,
        socNominal,
        user,
        staffRoles,
        config,
        undefined,
      )
      expect(
        !!resp.find(
          action =>
            action.url === `${config.serviceUrls.calculateReleaseDates}/?prisonId=${PrisonerMockDataA.prisonerNumber}`,
        ),
      ).toEqual(visible)
    })
  })

  describe('Add case notes', () => {
    test.each`
      roles                                | caseLoads  | prisonId | restrictedPatient | visible
      ${[Role.GlobalSearch, Role.PomUser]} | ${['MDI']} | ${'MDI'} | ${false}          | ${true}
      ${[Role.GlobalSearch]}               | ${['LEI']} | ${'MDI'} | ${false}          | ${false}
      ${[Role.PomUser]}                    | ${['LEI']} | ${'MDI'} | ${false}          | ${false}
      ${[]}                                | ${['MDI']} | ${'MDI'} | ${false}          | ${true}
      ${[]}                                | ${['LEI']} | ${'OUT'} | ${false}          | ${false}
      ${[]}                                | ${['LEI']} | ${'TRN'} | ${false}          | ${false}
      ${[Role.InactiveBookings]}           | ${['LEI']} | ${'OUT'} | ${false}          | ${true}
      ${[Role.InactiveBookings]}           | ${['LEI']} | ${'TRN'} | ${false}          | ${true}
      ${[]}                                | ${['LEI']} | ${'MDI'} | ${true}           | ${false}
      ${[Role.PomUser]}                    | ${['LEI']} | ${'MDI'} | ${true}           | ${true}
    `('user with roles: $expected, can see: $visible', ({ roles, caseLoads, prisonId, restrictedPatient, visible }) => {
      const user = {
        ...prisonUserMock,
        userRoles: roles,
        caseLoads: caseLoads.map((cl: string) => ({ caseLoadId: cl })),
      }
      const prisoner = { ...PrisonerMockDataA, prisonId, restrictedPatient }

      const resp = buildOverviewActions(prisoner, pathfinderNominal, socNominal, user, staffRoles, config, undefined)
      expect(
        !!resp.find(action => action.url === `/prisoner/${PrisonerMockDataA.prisonerNumber}/add-case-note`),
      ).toEqual(visible)
    })
  })

  describe('Add key worker session', () => {
    test.each`
      staffRolesToUse            | visible
      ${[{ role: 'KW' }]}        | ${true}
      ${[{ role: 'SOMETHING' }]} | ${false}
      ${[]}                      | ${false}
    `('user with roles: $expected, can see: $visible', ({ staffRolesToUse, visible }) => {
      const resp = buildOverviewActions(
        PrisonerMockDataA,
        pathfinderNominal,
        socNominal,
        prisonUserMock,
        staffRolesToUse,
        config,
        undefined,
      )
      expect(
        !!resp.find(
          action => action.url === `/prisoner/${PrisonerMockDataA.prisonerNumber}/add-case-note?type=KA&subType=KS`,
        ),
      ).toEqual(visible)
    })
  })

  describe('Log an activity application', () => {
    test.each`
      roles                 | activeCaseLoadId | prisonId | availableServices                           | prisonerStatus  | visible
      ${[Role.ActivityHub]} | ${'MDI'}         | ${'MDI'} | ${[{ id: 'activities', navEnabled: true }]} | ${'SOMETHING'}  | ${true}
      ${[Role.ActivityHub]} | ${'LEI'}         | ${'MDI'} | ${[{ id: 'activities', navEnabled: true }]} | ${'SOMETHING'}  | ${false}
      ${[Role.ActivityHub]} | ${'MDI'}         | ${'LEI'} | ${[{ id: 'activities', navEnabled: true }]} | ${'SOMETHING'}  | ${false}
      ${[Role.ActivityHub]} | ${'MDI'}         | ${'MDI'} | ${[{ id: 'something', navEnabled: false }]} | ${'SOMETHING'}  | ${false}
      ${[Role.ActivityHub]} | ${'MDI'}         | ${'MDI'} | ${[{ id: 'activities', navEnabled: true }]} | ${'ACTIVE OUT'} | ${false}
      ${[]}                 | ${'MDI'}         | ${'MDI'} | ${[{ id: 'activities', navEnabled: true }]} | ${'SOMETHING'}  | ${false}
    `('user can see: $visible', ({ roles, activeCaseLoadId, prisonId, availableServices, prisonerStatus, visible }) => {
      const user = { ...prisonUserMock, userRoles: roles, activeCaseLoadId }
      const prisoner = { ...PrisonerMockDataA, status: prisonerStatus, prisonId }

      const resp = buildOverviewActions(prisoner, pathfinderNominal, socNominal, user, staffRoles, config, {
        services: availableServices,
      } as HeaderFooterMeta)
      expect(
        !!resp.find(
          action => action.url === `${config.serviceUrls.activities}/waitlist/${prisoner.prisonerNumber}/apply`,
        ),
      ).toEqual(visible)
    })
  })

  describe('Add appointment', () => {
    test.each`
      activeCaseLoadId | prisonId | restrictedPatient | visible
      ${'MDI'}         | ${'MDI'} | ${false}          | ${true}
      ${'MDI'}         | ${'MDI'} | ${true}           | ${false}
      ${'LEI'}         | ${'MDI'} | ${false}          | ${false}
    `('user can see: $visible', ({ activeCaseLoadId, prisonId, restrictedPatient, visible }) => {
      const user = { ...prisonUserMock, activeCaseLoadId }
      const prisoner = { ...PrisonerMockDataA, prisonId, restrictedPatient }

      const resp = buildOverviewActions(prisoner, pathfinderNominal, socNominal, user, staffRoles, config, undefined)
      expect(!!resp.find(action => action.dataQA === 'add-appointment-action-link')).toEqual(visible)
    })
  })

  describe('Report use of force', () => {
    test.each`
      roles                      | caseLoads  | prisonId | restrictedPatient | disabledPrisons | visible
      ${[]}                      | ${['MDI']} | ${'MDI'} | ${false}          | ${[]}           | ${true}
      ${[]}                      | ${['LEI']} | ${'OUT'} | ${false}          | ${[]}           | ${false}
      ${[]}                      | ${['LEI']} | ${'TRN'} | ${false}          | ${[]}           | ${false}
      ${[Role.InactiveBookings]} | ${['LEI']} | ${'OUT'} | ${false}          | ${[]}           | ${true}
      ${[Role.InactiveBookings]} | ${['LEI']} | ${'TRN'} | ${false}          | ${[]}           | ${true}
      ${[]}                      | ${['LEI']} | ${'MDI'} | ${true}           | ${[]}           | ${false}
      ${[Role.PomUser]}          | ${['LEI']} | ${'MDI'} | ${true}           | ${[]}           | ${false}
      ${[]}                      | ${['MDI']} | ${'MDI'} | ${false}          | ${['MDI']}      | ${false}
    `('user can see: $visible', ({ roles, caseLoads, prisonId, restrictedPatient, disabledPrisons, visible }) => {
      const user = {
        ...prisonUserMock,
        userRoles: roles,
        caseLoads: caseLoads.map((cl: string) => ({ caseLoadId: cl })),
      }
      const prisoner = { ...PrisonerMockDataA, prisonId, restrictedPatient }

      const resp = buildOverviewActions(
        prisoner,
        pathfinderNominal,
        socNominal,
        user,
        staffRoles,
        {
          ...config,
          featureToggles: { ...config.featureToggles, useOfForceDisabledPrisons: disabledPrisons },
        },
        undefined,
      )
      expect(
        !!resp.find(
          action => action.url === `${config.serviceUrls.useOfForce}/report/${prisoner.bookingId}/report-use-of-force`,
        ),
      ).toEqual(visible)
    })
  })

  describe('Refer to Pathfinder', () => {
    test.each`
      roles                            | pathfinderNominalToUse | visible
      ${[Role.PathfinderApproval]}     | ${undefined}           | ${true}
      ${[Role.PathfinderStdPrison]}    | ${undefined}           | ${true}
      ${[Role.PathfinderStdProbation]} | ${undefined}           | ${true}
      ${[Role.PathfinderHQ]}           | ${undefined}           | ${true}
      ${[Role.PathfinderUser]}         | ${undefined}           | ${true}
      ${[]}                            | ${undefined}           | ${false}
      ${[Role.PathfinderHQ]}           | ${pathfinderNominal}   | ${false}
    `('user with roles: $expected, can see: $visible', ({ roles, pathfinderNominalToUse, visible }) => {
      const user = { ...prisonUserMock, userRoles: roles }
      const resp = buildOverviewActions(
        PrisonerMockDataA,
        pathfinderNominalToUse,
        socNominal,
        user,
        staffRoles,
        config,
        undefined,
      )
      expect(
        !!resp.find(
          action =>
            action.url === `${config.serviceUrls.pathfinder}/refer/offender/${PrisonerMockDataA.prisonerNumber}`,
        ),
      ).toEqual(visible)
    })
  })

  test.each([
    [[Role.SocCustody], undefined, true],
    [[Role.SocCommunity], undefined, true],
    [[Role.SocDataAnalyst], undefined, true],
    [[Role.SocDataManager], undefined, true],
    [[], undefined, false],
    [[Role.SocHq], undefined, false],
    [[Role.SocCustody], socNominal, false],
  ])(
    `user with roles: %s and soc nominal: %s, can see: $s`,
    (roles: Role[], socNominalToUse: Nominal | undefined, visible: boolean) => {
      const user = { ...prisonUserMock, userRoles: roles }
      const resp = buildOverviewActions(
        PrisonerMockDataA,
        pathfinderNominal,
        socNominalToUse,
        user,
        staffRoles,
        config,
        undefined,
      )
      expect(
        !!resp.find(
          action =>
            action.url === `${config.serviceUrls.manageSocCases}/refer/offender/${PrisonerMockDataA.prisonerNumber}`,
        ),
      ).toEqual(visible)
    },
  )

  describe('Calculate release dates', () => {
    test.each`
      roles                  | socNominalToUse | visible
      ${[Role.SocCustody]}   | ${undefined}    | ${true}
      ${[Role.SocCommunity]} | ${undefined}    | ${true}
      ${[Role.SocCommunity]} | ${socNominal}   | ${false}
      ${[]}                  | ${undefined}    | ${false}
    `('user with roles: $expected, can see: $visible', ({ roles, socNominalToUse, visible }) => {
      const user = { ...prisonUserMock, userRoles: roles }
      const resp = buildOverviewActions(
        PrisonerMockDataA,
        pathfinderNominal,
        socNominalToUse,
        user,
        staffRoles,
        config,
        undefined,
      )
      expect(
        !!resp.find(
          action =>
            action.url === `${config.serviceUrls.manageSocCases}/refer/offender/${PrisonerMockDataA.prisonerNumber}`,
        ),
      ).toEqual(visible)
    })
  })

  describe('Manage category', () => {
    test.each`
      roles                            | visible
      ${[Role.CreateCategorisation]}   | ${true}
      ${[Role.ApproveCategorisation]}  | ${true}
      ${[Role.CreateRecategorisation]} | ${true}
      ${[Role.CategorisationSecurity]} | ${true}
      ${[]}                            | ${false}
    `('user with roles: $expected, can see: $visible', ({ roles, visible }) => {
      const user = { ...prisonUserMock, userRoles: roles }
      const resp = buildOverviewActions(
        PrisonerMockDataA,
        pathfinderNominal,
        socNominal,
        user,
        staffRoles,
        config,
        undefined,
      )
      expect(
        !!resp.find(
          action => action.url === `${config.serviceUrls.offenderCategorisation}/${PrisonerMockDataA.bookingId}`,
        ),
      ).toEqual(visible)
    })
  })
})
