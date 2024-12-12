import type HeaderFooterSharedData from '@ministryofjustice/hmpps-connect-dps-components/dist/types/HeaderFooterSharedData'
import buildOverviewActions from './buildOverviewActions'
import { PrisonerMockDataA } from '../../../data/localMockData/prisoner'
import { prisonUserMock } from '../../../data/localMockData/user'
import config from '../../../config'

const pathfinderNominal = { id: 1 }
const socNominal = { id: 2 }
describe('buildOverviewActions', () => {
  describe('Add case notes', () => {
    test.each`
      perms                             | visible
      ${{ caseNotes: { edit: true } }}  | ${true}
      ${{ caseNotes: { edit: false } }} | ${false}
    `('user with caseNotes.edit: $perms.caseNotes.edit, can see add case notes: $visible', ({ perms, visible }) => {
      const resp = buildOverviewActions(
        PrisonerMockDataA,
        pathfinderNominal,
        socNominal,
        prisonUserMock,
        config,
        undefined,
        perms,
      )
      expect(
        !!resp.find(action => action.url === `/prisoner/${PrisonerMockDataA.prisonerNumber}/add-case-note`),
      ).toEqual(visible)
    })
  })

  describe('Add key worker session', () => {
    test.each`
      perms                             | visible
      ${{ keyWorker: { edit: true } }}  | ${true}
      ${{ keyWorker: { edit: false } }} | ${false}
    `('user with keyWorker.view: $perms.keyWorker.view, can see add key worker: $visible', ({ perms, visible }) => {
      const resp = buildOverviewActions(
        PrisonerMockDataA,
        pathfinderNominal,
        socNominal,
        prisonUserMock,
        config,
        undefined,
        perms,
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
      perms                            | availableServices                            | visible
      ${{ activity: { edit: true } }}  | ${[{ id: 'activities', navEnabled: true }]}  | ${true}
      ${{ activity: { edit: true } }}  | ${[{ id: 'activities', navEnabled: false }]} | ${false}
      ${{ activity: { edit: false } }} | ${[{ id: 'activities', navEnabled: true }]}  | ${false}
    `(
      'user with activity.edit: $perms.activity.edit and navEnabled: $availableServices.0.navEnabled can see Log an activity application: $visible',
      ({ perms, availableServices, visible }) => {
        const resp = buildOverviewActions(
          PrisonerMockDataA,
          pathfinderNominal,
          socNominal,
          prisonUserMock,
          config,
          { services: availableServices } as HeaderFooterSharedData,
          perms,
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
    test.each`
      perms                               | visible
      ${{ appointment: { edit: true } }}  | ${true}
      ${{ appointment: { edit: false } }} | ${false}
    `(
      'user with appointment.edit: $perms.appointment.edit, can see add appointment: $visible',
      ({ perms, visible }) => {
        const resp = buildOverviewActions(
          PrisonerMockDataA,
          pathfinderNominal,
          socNominal,
          prisonUserMock,
          config,
          undefined,
          perms,
        )
        expect(!!resp.find(action => action.dataQA === 'add-appointment-action-link')).toEqual(visible)
      },
    )
  })

  describe('Report use of force', () => {
    test.each`
      perms                              | disabledPrisons | visible
      ${{ useOfForce: { edit: true } }}  | ${[]}           | ${true}
      ${{ useOfForce: { edit: true } }}  | ${['MDI']}      | ${false}
      ${{ useOfForce: { edit: false } }} | ${[]}           | ${false}
    `(
      'user with useOfForce.edit: $perms.useOfForce.edit and disabledPrison: $disabledPrisons can see add appointment: $visible',
      ({ perms, disabledPrisons, visible }) => {
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
          perms,
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
      perms                              | pathfinderNominalToUse | visible
      ${{ pathfinder: { edit: true } }}  | ${undefined}           | ${true}
      ${{ pathfinder: { edit: true } }}  | ${pathfinderNominal}   | ${false}
      ${{ pathfinder: { edit: false } }} | ${undefined}           | ${false}
    `(
      'user with pathfinder.edit: $perms.pathfinder.edit with pathfinderNominal: $pathfinderNominalToUse can see refer to pathfinder: $visible',
      ({ perms, pathfinderNominalToUse, visible }) => {
        const resp = buildOverviewActions(
          PrisonerMockDataA,
          pathfinderNominalToUse,
          socNominal,
          prisonUserMock,
          config,
          undefined,
          perms,
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
      perms                       | socNominalToUse | visible
      ${{ soc: { edit: true } }}  | ${undefined}    | ${true}
      ${{ soc: { edit: true } }}  | ${socNominal}   | ${false}
      ${{ soc: { edit: false } }} | ${undefined}    | ${false}
    `(
      'user with pathfinder.edit: $perms.soc.edit with socNominal: socNominalToUse can see add to soc: $visible',
      ({ perms, socNominalToUse, visible }) => {
        const resp = buildOverviewActions(
          PrisonerMockDataA,
          pathfinderNominal,
          socNominalToUse,
          prisonUserMock,
          config,
          undefined,
          perms,
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

  describe('Calculate release dates', () => {
    test.each`
      perms                                         | courCasesSummaryEnabled | visible
      ${{ calculateReleaseDates: { edit: true } }}  | ${false}                | ${true}
      ${{ calculateReleaseDates: { edit: true } }}  | ${true}                 | ${false}
      ${{ calculateReleaseDates: { edit: false } }} | ${true}                 | ${false}
    `(
      'user with calculateReleaseDates.edit: $perms.calculateReleaseDates.edit and courCasesSummaryEnabled: $disabledPrisons can see calculate release date: $visible',
      ({ perms, courCasesSummaryEnabled, visible }) => {
        const resp = buildOverviewActions(
          PrisonerMockDataA,
          pathfinderNominal,
          socNominal,
          prisonUserMock,
          {
            ...config,
            featureToggles: { ...config.featureToggles, courCasesSummaryEnabled },
          },
          undefined,
          perms,
        )
        expect(
          !!resp.find(
            action =>
              action.url ===
              `${config.serviceUrls.calculateReleaseDates}/?prisonId=${PrisonerMockDataA.prisonerNumber}`,
          ),
        ).toEqual(visible)
      },
    )
  })

  describe('Manage category', () => {
    test.each`
      perms                                          | visible
      ${{ offenderCategorisation: { edit: true } }}  | ${true}
      ${{ offenderCategorisation: { edit: false } }} | ${false}
    `(
      'user with offenderCategorisation.edit: $perms.offenderCategorisation.edit, can see add key worker: $visible',
      ({ perms, visible }) => {
        const resp = buildOverviewActions(
          PrisonerMockDataA,
          pathfinderNominal,
          socNominal,
          prisonUserMock,
          config,
          undefined,
          perms,
        )
        expect(
          !!resp.find(
            action => action.url === `${config.serviceUrls.offenderCategorisation}/${PrisonerMockDataA.bookingId}`,
          ),
        ).toEqual(visible)
      },
    )
  })

  describe('Make CSIP referral', () => {
    test.each`
      perms                        | availableServices                        | visible
      ${{ csip: { view: true } }}  | ${[{ id: 'csipUI', navEnabled: true }]}  | ${true}
      ${{ csip: { view: true } }}  | ${[{ id: 'csipUI', navEnabled: false }]} | ${false}
      ${{ csip: { view: true } }}  | ${[]}                                    | ${false}
      ${{ csip: { view: false } }} | ${[{ id: 'csipUI', navEnabled: true }]}  | ${false}
    `(
      'user with csip.view: $perms.csip.view and navEnabled: $availableServices.0.navEnabled can see Make CSIP referral: $visible',
      ({ perms, availableServices, visible }) => {
        const resp = buildOverviewActions(
          PrisonerMockDataA,
          pathfinderNominal,
          socNominal,
          prisonUserMock,
          config,
          { services: availableServices } as HeaderFooterSharedData,
          perms,
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
})
