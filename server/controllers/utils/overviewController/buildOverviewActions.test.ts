import type HeaderFooterSharedData from '@ministryofjustice/hmpps-connect-dps-components/dist/types/HeaderFooterSharedData'
import {
  CaseNotesPermission,
  isGranted,
  PathfinderPermission,
  PersonInterventionsPermission,
  PersonPrisonCategoryPermission,
  PrisonerPermission,
  PrisonerPermissions,
  PrisonerSchedulePermission,
  SOCPermission,
  UseOfForcePermission,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import buildOverviewActions from './buildOverviewActions'
import { PrisonerMockDataA } from '../../../data/localMockData/prisoner'
import { prisonUserMock } from '../../../data/localMockData/user'
import config from '../../../config'

jest.mock('@ministryofjustice/hmpps-prison-permissions-lib')

const pathfinderNominal = { id: 1 }
const socNominal = { id: 2 }
const permissions = {} as PrisonerPermissions
const isGrantedMock = isGranted as jest.MockedFunction<typeof isGranted>

describe('buildOverviewActions', () => {
  describe('Add case notes', () => {
    it.each([true, false])(`User with permission can see 'add case notes' link: %s`, (permissionGranted: boolean) => {
      mockPermissionCheck(CaseNotesPermission.edit, permissionGranted)

      const resp = buildOverviewActions(
        PrisonerMockDataA,
        pathfinderNominal,
        socNominal,
        prisonUserMock,
        config,
        undefined,
        permissions,
      )
      expect(
        !!resp.find(action => action.url === `/prisoner/${PrisonerMockDataA.prisonerNumber}/add-case-note`),
      ).toEqual(permissionGranted)
    })
  })

  describe('Add key worker session', () => {
    it.each([true, false])('When user is a keyworker: %s', (keyworker: boolean) => {
      const resp = buildOverviewActions(
        PrisonerMockDataA,
        pathfinderNominal,
        socNominal,
        prisonUserMock,
        config,
        {
          services: keyworker ? [{ id: 'my-key-worker-allocations', navEnabled: true }] : [],
        } as HeaderFooterSharedData,
        {} as PrisonerPermissions,
      )
      expect(
        !!resp.find(action => action.url === `/prisoner/${PrisonerMockDataA.prisonerNumber}/add-case-note?type=KA`),
      ).toEqual(keyworker)
    })
  })

  describe('Add personal officer entry', () => {
    it.each([true, false])('When user is a personal officer: %s', (personalOfficer: boolean) => {
      const resp = buildOverviewActions(
        PrisonerMockDataA,
        pathfinderNominal,
        socNominal,
        prisonUserMock,
        config,
        {
          services: personalOfficer ? [{ id: 'my-personal-officer-allocations', navEnabled: true }] : [],
        } as HeaderFooterSharedData,
        {} as PrisonerPermissions,
      )
      expect(
        !!resp.find(
          action =>
            action.url === `/prisoner/${PrisonerMockDataA.prisonerNumber}/add-case-note?type=REPORT&subType=POE`,
        ),
      ).toEqual(personalOfficer)
    })
  })

  describe('Log an activity application', () => {
    test.each`
      permissionGranted | availableServices                            | visible
      ${true}           | ${[{ id: 'activities', navEnabled: true }]}  | ${true}
      ${true}           | ${[{ id: 'activities', navEnabled: false }]} | ${false}
      ${false}          | ${[{ id: 'activities', navEnabled: true }]}  | ${false}
    `(
      'user with permission granted: $permissionGranted and navEnabled: $availableServices.0.navEnabled can see Log an activity application: $visible',
      ({ permissionGranted, availableServices, visible }) => {
        mockPermissionCheck(PrisonerSchedulePermission.edit_activity, permissionGranted)

        const resp = buildOverviewActions(
          PrisonerMockDataA,
          pathfinderNominal,
          socNominal,
          prisonUserMock,
          config,
          { services: availableServices } as HeaderFooterSharedData,
          permissions,
        )
        expect(
          !!resp.find(
            action =>
              action.url === `${config.serviceUrls.activities}/waitlist/${PrisonerMockDataA.prisonerNumber}/apply`,
          ),
        ).toEqual(visible)
      },
    )
  })

  describe('Add appointment', () => {
    it.each([true, false])(`User with permission can see 'add appointment' link: %s`, (permissionGranted: boolean) => {
      mockPermissionCheck(PrisonerSchedulePermission.edit_appointment, permissionGranted)

      const resp = buildOverviewActions(
        PrisonerMockDataA,
        pathfinderNominal,
        socNominal,
        prisonUserMock,
        config,
        undefined,
        permissions,
      )
      expect(!!resp.find(action => action.dataQA === 'add-appointment-action-link')).toEqual(permissionGranted)
    })
  })

  describe('Report use of force', () => {
    test.each`
      permissionGranted | disabledPrisons | visible
      ${true}           | ${[]}           | ${true}
      ${true}           | ${['MDI']}      | ${false}
      ${false}          | ${[]}           | ${false}
    `(
      'user with permission granted: $permissionGranted and disabledPrison: $disabledPrisons can see add appointment: $visible',
      ({ permissionGranted, disabledPrisons, visible }) => {
        mockPermissionCheck(UseOfForcePermission.edit, permissionGranted)

        const resp = buildOverviewActions(
          PrisonerMockDataA,
          pathfinderNominal,
          socNominal,
          prisonUserMock,
          {
            ...config,
            featureToggles: { ...config.featureToggles, useOfForceDisabledPrisons: disabledPrisons },
          },
          undefined,
          permissions,
        )
        expect(
          !!resp.find(
            action =>
              action.url ===
              `${config.serviceUrls.useOfForce}/report/${PrisonerMockDataA.bookingId}/report-use-of-force`,
          ),
        ).toEqual(visible)
      },
    )
  })

  describe('Refer to Pathfinder', () => {
    test.each`
      permissionGranted | pathfinderNominalToUse | visible
      ${true}           | ${undefined}           | ${true}
      ${true}           | ${pathfinderNominal}   | ${false}
      ${false}          | ${undefined}           | ${false}
    `(
      'user with permission granted: $permissionGranted with pathfinderNominal: $pathfinderNominalToUse can see refer to pathfinder: $visible',
      ({ permissionGranted, pathfinderNominalToUse, visible }) => {
        mockPermissionCheck(PathfinderPermission.edit, permissionGranted)

        const resp = buildOverviewActions(
          PrisonerMockDataA,
          pathfinderNominalToUse,
          socNominal,
          prisonUserMock,
          config,
          undefined,
          permissions,
        )
        expect(
          !!resp.find(
            action =>
              action.url === `${config.serviceUrls.pathfinder}/refer/offender/${PrisonerMockDataA.prisonerNumber}`,
          ),
        ).toEqual(visible)
      },
    )
  })

  describe('Add to SOC', () => {
    test.each`
      permissionGranted | socNominalToUse | visible
      ${true}           | ${undefined}    | ${true}
      ${true}           | ${socNominal}   | ${false}
      ${false}          | ${undefined}    | ${false}
    `(
      'user with permission granted: $permissionGranted with socNominal: socNominalToUse can see add to soc: $visible',
      ({ permissionGranted, socNominalToUse, visible }) => {
        mockPermissionCheck(SOCPermission.edit, permissionGranted)

        const resp = buildOverviewActions(
          PrisonerMockDataA,
          pathfinderNominal,
          socNominalToUse,
          prisonUserMock,
          config,
          undefined,
          permissions,
        )
        expect(
          !!resp.find(
            action =>
              action.url === `${config.serviceUrls.manageSocCases}/refer/offender/${PrisonerMockDataA.prisonerNumber}`,
          ),
        ).toEqual(visible)
      },
    )
  })

  describe('Manage category', () => {
    it.each([true, false])(`User with permission can see 'Manage category' link: %s`, (permissionGranted: boolean) => {
      mockPermissionCheck(PersonPrisonCategoryPermission.edit, permissionGranted)

      const resp = buildOverviewActions(
        PrisonerMockDataA,
        pathfinderNominal,
        socNominal,
        prisonUserMock,
        config,
        undefined,
        permissions,
      )
      expect(
        !!resp.find(
          action => action.url === `${config.serviceUrls.offenderCategorisation}/${PrisonerMockDataA.bookingId}`,
        ),
      ).toEqual(permissionGranted)
    })
  })

  describe('Make CSIP referral', () => {
    test.each`
      permissionGranted | availableServices                        | visible
      ${true}           | ${[{ id: 'csipUI', navEnabled: true }]}  | ${true}
      ${true}           | ${[{ id: 'csipUI', navEnabled: false }]} | ${false}
      ${true}           | ${[]}                                    | ${false}
      ${false}          | ${[{ id: 'csipUI', navEnabled: true }]}  | ${false}
    `(
      'user with permission granted: $permissionGranted and navEnabled: $availableServices.0.navEnabled can see Make CSIP referral: $visible',
      ({ permissionGranted, availableServices, visible }) => {
        mockPermissionCheck(PersonInterventionsPermission.read_csip, permissionGranted)

        const resp = buildOverviewActions(
          PrisonerMockDataA,
          pathfinderNominal,
          socNominal,
          prisonUserMock,
          config,
          { services: availableServices } as HeaderFooterSharedData,
          permissions,
        )
        expect(
          !!resp.find(
            action =>
              action.url === `${config.serviceUrls.csip}/prisoners/${PrisonerMockDataA.prisonerNumber}/referral/start`,
          ),
        ).toEqual(visible)
      },
    )
  })

  describe('Manage activity allocations', () => {
    test.each`
      manageAllocationsEnabled | permissionGranted | availableServices                            | visible
      ${false}                 | ${true}           | ${[{ id: 'activities', navEnabled: true }]}  | ${false}
      ${true}                  | ${true}           | ${[{ id: 'activities', navEnabled: true }]}  | ${true}
      ${true}                  | ${true}           | ${[{ id: 'activities', navEnabled: true }]}  | ${true}
      ${true}                  | ${true}           | ${[{ id: 'activities', navEnabled: false }]} | ${false}
      ${true}                  | ${false}          | ${[{ id: 'activities', navEnabled: true }]}  | ${false}
    `(
      'user with permission granted: $permissionGranted and navEnabled: $availableServices.0.navEnabled can see Log an activity application: $visible',
      ({ manageAllocationsEnabled, permissionGranted, availableServices, visible }) => {
        mockPermissionCheck(PrisonerSchedulePermission.edit_activity, permissionGranted)

        const resp = buildOverviewActions(
          PrisonerMockDataA,
          pathfinderNominal,
          socNominal,
          prisonUserMock,
          {
            ...config,
            featureToggles: {
              ...config.featureToggles,
              manageAllocationsEnabled,
            },
          },
          { services: availableServices } as HeaderFooterSharedData,
          permissions,
        )
        expect(
          !!resp.find(
            action =>
              action.url ===
              `${config.serviceUrls.activities}/prisoner-allocations/${PrisonerMockDataA.prisonerNumber}`,
          ),
        ).toEqual(visible)
      },
    )
  })
})

function mockPermissionCheck(permission: PrisonerPermission, granted: boolean) {
  isGrantedMock.mockImplementation((perm, perms) => perm === permission && perms === permissions && granted)
}
