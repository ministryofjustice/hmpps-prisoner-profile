import { Request, Response } from 'express'
import { PrisonerPermissions } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { personalPageServiceMock } from '../../../tests/mocks/personalPageServiceMock'
import PersonalPageService from '../../services/personalPageService'
import { corePersonPhysicalAttributesMock } from '../../data/localMockData/physicalAttributesMock'
import { PersonalRelationshipsDomesticStatusMock } from '../../data/localMockData/personalRelationshipsApiMock'
import PersonalController from './personalController'
import CareNeedsService, { type CareNeed } from '../../services/careNeedsService'
import PrisonerPropertyService from '../../services/prisonerPropertyService'
import { auditServiceMock } from '../../../tests/mocks/auditServiceMock'
import { PrisonerMockDataA } from '../../data/localMockData/prisoner'
import { inmateDetailMock } from '../../data/localMockData/inmateDetailMock'
import { CaseLoadsDummyDataA } from '../../data/localMockData/caseLoad'
import { propertySummaryMock } from '../../data/localMockData/prisonerPropertySummaryMock'
import type { PrisonerPropertySummary } from '../../data/interfaces/prisonerPropertyApi'
import config from '../../config'
import { Result } from '../../utils/result/result'

describe('PersonalController', () => {
  let personalPageService: PersonalPageService

  beforeEach(() => {
    personalPageService = personalPageServiceMock() as PersonalPageService
    personalPageService.getPhysicalAttributes = jest.fn(async () => corePersonPhysicalAttributesMock)
    personalPageService.updateSmokerOrVaper = jest.fn()
    personalPageService.getNumberOfChildren = jest.fn()
    personalPageService.getDomesticStatus = jest.fn(async () => PersonalRelationshipsDomesticStatusMock)
  })

  describe('displayPersonalPage', () => {
    // Skipped to focus on the edit routes for now
    it.skip('Renders the page with information from the service', () => {})
  })

  describe('the property summary card', () => {
    let req: Request
    let res: Response
    let careNeedsService: CareNeedsService
    let prisonerPropertyService: PrisonerPropertyService

    const buildController = () =>
      new PersonalController(personalPageService, careNeedsService, auditServiceMock(), prisonerPropertyService)

    const renderedWith = () => (res.render as jest.Mock).mock.calls[0][1]

    beforeEach(() => {
      config.featureToggles.propertySummaryTileEnabled = true

      // Only the parts of the page data the controller itself reads before rendering
      personalPageService.get = jest.fn(async () => ({
        identityNumbers: { personal: {}, homeOffice: {} },
        physicalCharacteristics: Result.fulfilled({}),
        security: {},
      })) as unknown as PersonalPageService['get']

      careNeedsService = {
        getCareNeedsAndAdjustments: jest.fn(async (): Promise<CareNeed[]> => []),
        getXrayBodyScanSummary: jest.fn(async () => ({ total: 0, since: '' })),
      } as unknown as CareNeedsService

      prisonerPropertyService = {
        isPrisonActive: jest.fn(async () => true),
        getPropertySummary: jest.fn(async () => propertySummaryMock),
      } as unknown as PrisonerPropertyService

      req = {
        id: 'request-id',
        middleware: {
          clientToken: 'CLIENT_TOKEN',
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
          alertSummaryData: { alertFlags: [] },
        },
      } as unknown as Request

      res = {
        locals: {
          user: {
            authSource: 'nomis',
            activeCaseLoadId: 'MDI',
            userRoles: [],
            caseLoads: CaseLoadsDummyDataA,
            token: 'TOKEN',
          },
          prisonerPermissions: {} as PrisonerPermissions,
          apiErrorCallback: jest.fn(),
        },
        render: jest.fn(),
      } as unknown as Response
    })

    afterEach(() => {
      config.featureToggles.propertySummaryTileEnabled = false
    })

    it('passes the summary to the view for a prison the property service is switched on for', async () => {
      await buildController().displayPersonalPage()(req, res, null)

      expect(prisonerPropertyService.getPropertySummary).toHaveBeenCalledWith(
        'CLIENT_TOKEN',
        PrisonerMockDataA.prisonerNumber,
      )
      expect(renderedWith().propertySummary).toEqual(propertySummaryMock)
      expect(renderedWith().propertyUiUrl).toEqual(config.serviceUrls.prisonerProperty)
    })

    it('does not call the property service at all when the feature is switched off', async () => {
      config.featureToggles.propertySummaryTileEnabled = false

      await buildController().displayPersonalPage()(req, res, null)

      expect(prisonerPropertyService.isPrisonActive).not.toHaveBeenCalled()
      expect(prisonerPropertyService.getPropertySummary).not.toHaveBeenCalled()
      expect(renderedWith().propertySummary).toEqual(null)
    })

    it('does not fetch a summary for a prison the property service is not switched on for', async () => {
      prisonerPropertyService.isPrisonActive = jest.fn(async () => false)

      await buildController().displayPersonalPage()(req, res, null)

      expect(prisonerPropertyService.isPrisonActive).toHaveBeenCalledWith('CLIENT_TOKEN', PrisonerMockDataA.prisonId)
      expect(prisonerPropertyService.getPropertySummary).not.toHaveBeenCalled()
      expect(renderedWith().propertySummary).toEqual(null)
    })

    it('still renders the page when the summary could not be retrieved', async () => {
      prisonerPropertyService.getPropertySummary = jest.fn(async (): Promise<PrisonerPropertySummary> => null)

      await buildController().displayPersonalPage()(req, res, null)

      expect(res.render).toHaveBeenCalled()
      expect(renderedWith().propertySummary).toEqual(null)
    })
  })
})
