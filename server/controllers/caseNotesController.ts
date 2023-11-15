import { NextFunction, Request, RequestHandler, Response } from 'express'
import { PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import { mapHeaderData } from '../mappers/headerMappers'
import { PrisonerSearchService } from '../services'
import CaseNotesService from '../services/caseNotesService'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { Role } from '../data/enums/role'
import { canAddCaseNotes, canViewCaseNotes } from '../utils/roleHelpers'
import { formatName, userHasRoles } from '../utils/utils'
import { RestClientBuilder } from '../data'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { formatDate } from '../utils/dateHelpers'
import config from '../config'
import { CaseNoteType } from '../interfaces/caseNoteType'
import { behaviourPrompts } from '../data/constants/caseNoteTypeBehaviourPrompts'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { CaseNoteForm } from '../interfaces/caseNotesApi/caseNote'
import { AuditService, Page, SearchPage } from '../services/auditService'

/**
 * Parse requests for case notes routes and orchestrate response
 */
export default class CaseNotesController {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly prisonerSearchService: PrisonerSearchService,
    private readonly caseNotesService: CaseNotesService,
    private readonly auditService: AuditService,
  ) {}

  public displayCaseNotes(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      // Parse query params for paging, sorting and filtering data
      const queryParams: PagedListQueryParams = {}
      const { clientToken } = res.locals
      const userToken = res.locals.user.token

      if (req.query.page) queryParams.page = +req.query.page
      if (req.query.sort) queryParams.sort = req.query.sort as string
      if (req.query.type) queryParams.type = req.query.type as string
      if (req.query.subType) queryParams.subType = req.query.subType as string
      if (req.query.startDate) queryParams.startDate = req.query.startDate as string
      if (req.query.endDate) queryParams.endDate = req.query.endDate as string
      if (req.query.showAll) queryParams.showAll = Boolean(req.query.showAll)

      // Get prisoner data for banner and for use in alerts generation
      const prisonerData = await this.prisonerSearchService.getPrisonerDetails(clientToken, req.params.prisonerNumber)

      // Set role based permissions
      const canDeleteSensitiveCaseNotes = userHasRoles([Role.DeleteSensitiveCaseNotes], res.locals.user.userRoles)

      // If user cannot view this prisoner's case notes, redirect to 404 page
      if (!canViewCaseNotes(res.locals.user, prisonerData)) {
        return next()
      }

      const addCaseNoteLinkUrl = canAddCaseNotes(res.locals.user, prisonerData)
        ? `/prisoner/${prisonerData.prisonerNumber}/add-case-note`
        : undefined

      // Get total count of case notes ignoring filters
      // Get case notes based on given query params
      // Get inmate detail for header
      const prisonApiClient = this.prisonApiClientBuilder(clientToken)
      const [caseNotesUsage, caseNotesPageData, inmateDetail] = await Promise.all([
        prisonApiClient.getCaseNotesUsage(req.params.prisonerNumber),
        this.caseNotesService.get(
          userToken,
          prisonerData,
          queryParams,
          canDeleteSensitiveCaseNotes,
          req.session.userDetails,
        ),
        prisonApiClient.getInmateDetail(prisonerData.bookingId),
      ])

      const hasCaseNotes = Array.isArray(caseNotesUsage) && caseNotesUsage.length
      const { types, subTypes, typeSubTypeMap } = this.mapCaseNoteTypes(
        caseNotesPageData.caseNoteTypes,
        queryParams.type,
      )
      const showingAll = queryParams.showAll

      // Get staffId to use in conditional logic for amend link
      const { staffId } = res.locals.user

      await this.auditService.sendSearch({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: res.locals.requestId,
        searchPage: SearchPage.CaseNotes,
        details: { queryParams },
      })

      // Render page
      return res.render('pages/caseNotes/caseNotesPage', {
        pageTitle: 'Case notes',
        ...mapHeaderData(prisonerData, inmateDetail, res.locals.user, 'case-notes'),
        ...caseNotesPageData,
        types,
        subTypes,
        typeSubTypeMap,
        showingAll,
        hasCaseNotes,
        addCaseNoteLinkUrl,
        staffId,
      })
    }
  }

  public displayAddCaseNote(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { clientToken } = res.locals
      const userToken = res.locals.user.token
      const { firstName, lastName, prisonerNumber, prisonId, restrictedPatient } =
        await this.prisonerSearchService.getPrisonerDetails(clientToken, req.params.prisonerNumber)
      const prisonerDisplayName = formatName(firstName, undefined, lastName, { style: NameFormatStyle.firstLast })

      // If user cannot view this prisoner's case notes, redirect to 404 page
      if (!canViewCaseNotes(res.locals.user, { prisonId, restrictedPatient })) {
        return next()
      }

      const now = new Date()
      const caseNoteFlash = req.flash('caseNote')
      const { type, subType } = req.query || {}
      const formValues: CaseNoteForm = caseNoteFlash?.length
        ? (caseNoteFlash[0] as never)
        : {
            type: type as string,
            subType: subType as string,
            text: '',
            date: formatDate(now.toISOString(), 'short'),
            hours: now.getHours().toString().padStart(2, '0'),
            minutes: now.getMinutes().toString().padStart(2, '0'),
          }
      const errors = req.flash('errors')

      const caseNoteTypes = await this.caseNotesService.getCaseNoteTypesForUser(userToken)
      const { types, subTypes, typeSubTypeMap } = this.mapCaseNoteTypes(caseNoteTypes, formValues.type, true)

      // Generate back link based on where the user came from - default to profile overview if no referer
      const addCaseNoteRefererUrlFlash = req.flash('addCaseNoteRefererUrl')

      const refererUrl = addCaseNoteRefererUrlFlash?.length
        ? addCaseNoteRefererUrlFlash[0]
        : req.headers.referer || `/prisoner/${prisonerNumber}`

      await this.auditService.sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber,
        prisonId,
        correlationId: res.locals.requestId,
        page: Page.AddCaseNote,
      })

      return res.render('pages/caseNotes/addCaseNote', {
        today: formatDate(now.toISOString(), 'short'),
        refererUrl,
        prisonerDisplayName,
        prisonerNumber,
        formValues,
        types,
        subTypes,
        typeSubTypeMap,
        behaviourPrompts: this.chooseBehaviourPrompts(),
        errors,
      })
    }
  }

  public post(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber } = req.params
      const { type, subType, text, date, hours, minutes, refererUrl } = req.body
      const caseNote = {
        type,
        subType,
        text,
        date,
        hours,
        minutes,
      }
      const errors = req.errors || []
      if (!errors.length) {
        try {
          await this.caseNotesService.addCaseNote(res.locals.user.token, prisonerNumber, caseNote)
        } catch (error) {
          if (error.status === 400) {
            errors.push({ text: error.message })
          } else throw error
        }
      }

      if (errors.length) {
        req.flash('caseNote', caseNote)
        req.flash('errors', errors)
        req.flash('addCaseNoteRefererUrl', refererUrl)
        return res.redirect(`/prisoner/${prisonerNumber}/add-case-note`)
      }

      if (type === 'REPORTS' && subType === 'REP_IEP') {
        return res.redirect(
          `${config.serviceUrls.digitalPrison}/prisoner/${prisonerNumber}/add-case-note/record-incentive-level`,
        )
      }

      req.flash('flashMessage', { text: 'Case note added', type: FlashMessageType.success })
      return res.redirect(refererUrl || `/prisoner/${prisonerNumber}/case-notes`)
    }
  }

  /**
   * Map CaseNoteType array into structures suitable for using in type > subtype dropdowns.
   *
   * @param caseNoteTypes
   * @param type - preselected type to determine list of subTypes
   * @param onlyActive - if true, filter out types/subtypes where activeFlag !== 'Y'
   */
  private mapCaseNoteTypes(caseNoteTypes: CaseNoteType[], type?: string, onlyActive = false) {
    const types = caseNoteTypes
      ?.filter(t => !onlyActive || t.activeFlag === 'Y')
      .map(t => ({ value: t.code, text: t.description }))

    const typeSubTypeMap: { [key: string]: { value: string; text: string }[] } = caseNoteTypes.reduce(
      (ts, t) => ({
        ...ts,
        [t.code]: t.subCodes?.map(s => ({ value: s.code, text: s.description })),
      }),
      {},
    )

    let subTypes: { value: string; text: string }[] = []
    if (type) {
      const selectedType = caseNoteTypes.find(t => t.code === type)
      if (selectedType) {
        subTypes = selectedType.subCodes
          ?.filter(t => !onlyActive || t.activeFlag === 'Y')
          .map(subType => ({
            value: subType.code,
            text: subType.description,
          }))
      }
    }

    return { types, subTypes, typeSubTypeMap }
  }

  /**
   * Choose a random prompt to be shown if the user selects positive or negative behaviour case note type.
   */
  private chooseBehaviourPrompts() {
    return Object.fromEntries(
      Object.entries(behaviourPrompts).map(([type, prompts]) => {
        const index = Math.floor(Math.random() * prompts.length)
        return [type, prompts[index]]
      }),
    )
  }
}
