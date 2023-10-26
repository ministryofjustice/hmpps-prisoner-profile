import { Role } from '../../data/enums/role'
import buildOverviewActions from './buildOverviewActions'
import { PrisonerMockDataA } from '../../data/localMockData/prisoner'
import { userMock } from '../../data/localMockData/user'
import config from '../../config'

const pathfinderNominal = { id: 1 }
const socNominal = { id: 2 }
const staffRoles = ['KW']
describe('buildOverviewActions', () => {
  describe('Calculate release dates', () => {
    test.each`
      roles                            | visible
      ${[Role.ReleaseDatesCalculator]} | ${true}
      ${[Role.GlobalSearch]}           | ${false}
    `('user with roles: $expected, can see: $visible', ({ roles, visible }) => {
      const user = { ...userMock, userRoles: roles }
      const resp = buildOverviewActions(PrisonerMockDataA, pathfinderNominal, socNominal, user, staffRoles, config)
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
      const user = { ...userMock, userRoles: roles, caseLoads: caseLoads.map((cl: string) => ({ caseLoadId: cl })) }
      const prisoner = { ...PrisonerMockDataA, prisonId, restrictedPatient }

      const resp = buildOverviewActions(prisoner, pathfinderNominal, socNominal, user, staffRoles, config)
      expect(
        !!resp.find(action => action.url === `/prisoner/${PrisonerMockDataA.prisonerNumber}/add-case-note`),
      ).toEqual(visible)
    })
  })

  describe('Add key worker session', () => {
    test.each`
      staffRolesToUse  | visible
      ${['KW']}        | ${true}
      ${['SOMETHING']} | ${false}
      ${[]}            | ${false}
    `('user with roles: $expected, can see: $visible', ({ staffRolesToUse, visible }) => {
      const resp = buildOverviewActions(
        PrisonerMockDataA,
        pathfinderNominal,
        socNominal,
        userMock,
        staffRolesToUse,
        config,
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
      roles                 | activeCaseLoadId | prisonId | activitiesEnabledPrisons | prisonerStatus  | visible
      ${[Role.ActivityHub]} | ${'MDI'}         | ${'MDI'} | ${['MDI']}               | ${'SOMETHING'}  | ${true}
      ${[Role.ActivityHub]} | ${'LEI'}         | ${'MDI'} | ${['MDI']}               | ${'SOMETHING'}  | ${false}
      ${[Role.ActivityHub]} | ${'MDI'}         | ${'LEI'} | ${['MDI']}               | ${'SOMETHING'}  | ${false}
      ${[Role.ActivityHub]} | ${'MDI'}         | ${'MDI'} | ${['LEI']}               | ${'SOMETHING'}  | ${false}
      ${[Role.ActivityHub]} | ${'MDI'}         | ${'MDI'} | ${['MDI']}               | ${'ACTIVE OUT'} | ${false}
      ${[]}                 | ${'MDI'}         | ${'MDI'} | ${['MDI']}               | ${'SOMETHING'}  | ${false}
    `(
      'user can see: $visible',
      ({ roles, activeCaseLoadId, prisonId, activitiesEnabledPrisons, prisonerStatus, visible }) => {
        const user = { ...userMock, userRoles: roles, activeCaseLoadId }
        const prisoner = { ...PrisonerMockDataA, status: prisonerStatus, prisonId }

        const resp = buildOverviewActions(prisoner, pathfinderNominal, socNominal, user, staffRoles, {
          ...config,
          activitiesEnabledPrisons,
        })
        expect(
          !!resp.find(
            action => action.url === `${config.serviceUrls.activities}/waitlist/${prisoner.prisonerNumber}/apply`,
          ),
        ).toEqual(visible)
      },
    )
  })

  describe('Add appointment', () => {
    test.each`
      activeCaseLoadId | prisonId | restrictedPatient | visible
      ${'MDI'}         | ${'MDI'} | ${false}          | ${true}
      ${'MDI'}         | ${'MDI'} | ${true}           | ${false}
      ${'LEI'}         | ${'MDI'} | ${false}          | ${false}
    `('user can see: $visible', ({ activeCaseLoadId, prisonId, restrictedPatient, visible }) => {
      const user = { ...userMock, activeCaseLoadId }
      const prisoner = { ...PrisonerMockDataA, prisonId, restrictedPatient }

      const resp = buildOverviewActions(prisoner, pathfinderNominal, socNominal, user, staffRoles, config)
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
      const user = { ...userMock, userRoles: roles, caseLoads: caseLoads.map((cl: string) => ({ caseLoadId: cl })) }
      const prisoner = { ...PrisonerMockDataA, prisonId, restrictedPatient }

      const resp = buildOverviewActions(prisoner, pathfinderNominal, socNominal, user, staffRoles, {
        ...config,
        useOfForceDisabledPrisons: disabledPrisons,
      })
      expect(
        !!resp.find(
          action => action.url === `${config.serviceUrls.useOfForce}/report/${prisoner.bookingId}/report-use-of-force`,
        ),
      ).toEqual(visible)
    })
  })

  describe('Log an activity application', () => {
    test.each`
      roles                 | activeCaseLoadId | prisonId | activitiesEnabledPrisons | prisonerStatus  | visible
      ${[Role.ActivityHub]} | ${'MDI'}         | ${'MDI'} | ${['MDI']}               | ${'SOMETHING'}  | ${true}
      ${[Role.ActivityHub]} | ${'LEI'}         | ${'MDI'} | ${['MDI']}               | ${'SOMETHING'}  | ${false}
      ${[Role.ActivityHub]} | ${'MDI'}         | ${'LEI'} | ${['MDI']}               | ${'SOMETHING'}  | ${false}
      ${[Role.ActivityHub]} | ${'MDI'}         | ${'MDI'} | ${['LEI']}               | ${'SOMETHING'}  | ${false}
      ${[Role.ActivityHub]} | ${'MDI'}         | ${'MDI'} | ${['MDI']}               | ${'ACTIVE OUT'} | ${false}
      ${[]}                 | ${'MDI'}         | ${'MDI'} | ${['MDI']}               | ${'SOMETHING'}  | ${false}
    `(
      'user can see: $visible',
      ({ roles, activeCaseLoadId, prisonId, activitiesEnabledPrisons, prisonerStatus, visible }) => {
        const user = { ...userMock, userRoles: roles, activeCaseLoadId }
        const prisoner = { ...PrisonerMockDataA, status: prisonerStatus, prisonId }

        const resp = buildOverviewActions(prisoner, pathfinderNominal, socNominal, user, staffRoles, {
          ...config,
          activitiesEnabledPrisons,
        })
        expect(
          !!resp.find(
            action => action.url === `${config.serviceUrls.activities}/waitlist/${prisoner.prisonerNumber}/apply`,
          ),
        ).toEqual(visible)
      },
    )
  })

  describe('Refer to Pathfinder', () => {
    test.each`
      roles                            | pathfinderNominalToUse | visible
      ${[Role.PathfinderApproval]}     | ${undefined}           | ${true}
      ${[Role.PathfinderStdPrison]}    | ${undefined}           | ${true}
      ${[Role.PathfinderStdProbation]} | ${undefined}           | ${true}
      ${[Role.PathfinderHQ]}           | ${undefined}           | ${true}
      ${[]}                            | ${undefined}           | ${false}
      ${[Role.PathfinderHQ]}           | ${pathfinderNominal}   | ${false}
    `('user with roles: $expected, can see: $visible', ({ roles, pathfinderNominalToUse, visible }) => {
      const user = { ...userMock, userRoles: roles }
      const resp = buildOverviewActions(PrisonerMockDataA, pathfinderNominalToUse, socNominal, user, staffRoles, config)
      expect(
        !!resp.find(
          action =>
            action.url === `${config.serviceUrls.pathfinder}/refer/offender/${PrisonerMockDataA.prisonerNumber}`,
        ),
      ).toEqual(visible)
    })
  })

  describe('Calculate release dates', () => {
    test.each`
      roles                  | socNominalToUse | visible
      ${[Role.SocCustody]}   | ${undefined}    | ${true}
      ${[Role.SocCommunity]} | ${undefined}    | ${true}
      ${[Role.SocCommunity]} | ${socNominal}   | ${false}
      ${[]}                  | ${undefined}    | ${false}
    `('user with roles: $expected, can see: $visible', ({ roles, socNominalToUse, visible }) => {
      const user = { ...userMock, userRoles: roles }
      const resp = buildOverviewActions(PrisonerMockDataA, pathfinderNominal, socNominalToUse, user, staffRoles, config)
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
      const user = { ...userMock, userRoles: roles }
      const resp = buildOverviewActions(PrisonerMockDataA, pathfinderNominal, socNominal, user, staffRoles, config)
      expect(
        !!resp.find(
          action => action.url === `${config.serviceUrls.offenderCategorisation}/${PrisonerMockDataA.bookingId}`,
        ),
      ).toEqual(visible)
    })
  })
})
