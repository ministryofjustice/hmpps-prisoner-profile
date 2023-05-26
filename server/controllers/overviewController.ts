import { Request, Response } from 'express'
import { mapHeaderData } from '../mappers/headerMappers'
import { PrisonerSearchService } from '../services'
import PrisonApiRestClient from '../data/prisonApiClient'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import AllocationManagerClient from '../data/allocationManagerApiClient'
import KeyWorkersClient from '../data/keyWorkersApiClient'
import IncentivesApiRestClient from '../data/incentivesApiClient'
import OverviewPageService from '../services/overviewPageService'
import { canViewOrAddCaseNotes } from '../utils/roleHelpers'

/**
 * Parse request for overview page and orchestrate response
 */
export default class OverviewController {
  private prisonerSearchService: PrisonerSearchService

  private prisonApiClient: PrisonApiClient

  private allocationManagerClient: AllocationManagerClient

  private keyWorkersClient: KeyWorkersClient

  private incentivesApiClient: IncentivesApiRestClient

  constructor(clientToken: string) {
    this.prisonerSearchService = new PrisonerSearchService(clientToken)
    this.prisonApiClient = new PrisonApiRestClient(clientToken)
    this.allocationManagerClient = new AllocationManagerClient(clientToken)
    this.keyWorkersClient = new KeyWorkersClient(clientToken)
    this.incentivesApiClient = new IncentivesApiRestClient(clientToken)
  }

  public async displayOverview(req: Request, res: Response) {
    const overviewPageService = new OverviewPageService(
      this.prisonApiClient,
      this.allocationManagerClient,
      this.keyWorkersClient,
      this.incentivesApiClient,
    )

    // Get prisoner data for banner and for use in alerts generation
    const prisonerData = await this.prisonerSearchService.getPrisonerDetails(req.params.prisonerNumber)

    const overviewPageData = await overviewPageService.get(prisonerData)

    console.log(overviewPageData)

    // Set role based permissions
    const canViewCaseNotes = canViewOrAddCaseNotes(
      res.locals.user.userRoles,
      res.locals.user.activeCaseLoadId,
      prisonerData.prisonId,
    )
    const canAddCaseNotes = canViewCaseNotes

    res.render('pages/overviewPage', {
      pageTitle: 'Overview',
      ...mapHeaderData(prisonerData, canViewCaseNotes, 'overview'),
      ...overviewPageData,
      canViewCaseNotes,
      canAddCaseNotes,
    })
  }
}
