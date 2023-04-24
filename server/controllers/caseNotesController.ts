import { Request, Response } from 'express'
import { PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import { mapHeaderData } from '../mappers/headerMappers'
import { PrisonerSearchService } from '../services'
import CaseNotesService from '../services/caseNotesService'
import PrisonApiRestClient from '../data/prisonApiClient'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'

/**
 * Parse request for case notes page and orchestrate response
 */
export default class CaseNotesController {
  private prisonerSearchService: PrisonerSearchService

  private caseNotesService: CaseNotesService

  private prisonApiClient: PrisonApiClient

  constructor(clientToken: string) {
    this.prisonerSearchService = new PrisonerSearchService(clientToken)
    this.caseNotesService = new CaseNotesService(clientToken)
    this.prisonApiClient = new PrisonApiRestClient(clientToken)
  }

  public async displayCaseNotes(req: Request, res: Response) {
    // Parse query params for paging, sorting and filtering data
    const queryParams: PagedListQueryParams = {}
    if (req.query.page) queryParams.page = +req.query.page
    if (req.query.sort) queryParams.sort = req.query.sort as string
    if (req.query.type) queryParams.type = req.query.type as string
    if (req.query.subType) queryParams.subType = req.query.subType as string
    if (req.query.startDate) queryParams.startDate = req.query.startDate as string
    if (req.query.endDate) queryParams.endDate = req.query.endDate as string

    // Get prisoner data for banner and for use in alerts generation
    const prisonerData = await this.prisonerSearchService.getPrisonerDetails(req.params.prisonerNumber)

    // Get total count of case notes ignoring filters
    const caseNotesUsage = await this.prisonApiClient.getCaseNotesUsage(req.params.prisonerNumber)
    const hasCaseNotes = Array.isArray(caseNotesUsage) && caseNotesUsage.length

    // Get case notes based on given query params
    const caseNotesPageData = await this.caseNotesService.get(prisonerData, queryParams)

    // Get staffId to use in conditional logic for amend link
    const { staffId } = res.locals.user

    // Render page
    return res.render('pages/caseNotesPage', {
      ...mapHeaderData(prisonerData, 'case-notes'),
      ...caseNotesPageData,
      hasCaseNotes,
      staffId,
    })
  }
}
