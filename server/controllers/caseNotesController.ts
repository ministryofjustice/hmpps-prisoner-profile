import { NextFunction, Request, RequestHandler, Response } from 'express'
import { mapHeaderData } from '../mappers/headerMappers'
import CaseNotesService from '../services/caseNotesService'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { Role } from '../data/enums/role'
import { canAddCaseNotes, canViewCaseNotes } from '../utils/roleHelpers'
import { formatLocation, formatName, userHasRoles } from '../utils/utils'
import { RestClientBuilder } from '../data'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { formatDate } from '../utils/dateHelpers'
import config from '../config'
import { behaviourPrompts } from '../data/constants/caseNoteTypeBehaviourPrompts'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { AuditService, Page, PostAction, PutAction, SearchAction } from '../services/auditService'
import logger from '../../logger'
import { prisonApiAdditionalCaseNoteTextLength } from '../validators/updateCaseNoteValidator'
import CaseNoteForm from '../data/interfaces/caseNotesApi/CaseNoteForm'
import CaseNoteType from '../data/interfaces/caseNotesApi/CaseNoteType'
import CaseNote from '../data/interfaces/caseNotesApi/CaseNote'
import { CaseNotesListQueryParams } from '../data/interfaces/prisonApi/PagedList'

/**
 * Parse requests for case notes routes and orchestrate response
 */
export default class CaseNotesController {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly caseNotesService: CaseNotesService,
    private readonly auditService: AuditService,
  ) {}

  public displayCaseNotes(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      // Parse query params for paging, sorting and filtering data
      const queryParams: CaseNotesListQueryParams = {}
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
      const { prisonerData } = req.middleware

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

      this.auditService
        .sendSearch({
          userId: res.locals.user.username,
          userCaseLoads: res.locals.user.caseLoads,
          userRoles: res.locals.user.userRoles,
          prisonerNumber: prisonerData.prisonerNumber,
          prisonId: prisonerData.prisonId,
          correlationId: req.id,
          searchPage: SearchAction.CaseNotes,
          details: { queryParams },
        })
        .catch(error => logger.error(error))

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
      const userToken = res.locals.user.token
      const { firstName, lastName, prisonerNumber, prisonId, restrictedPatient, cellLocation } =
        req.middleware.prisonerData
      const prisonerBannerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })

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

      this.auditService
        .sendPageView({
          userId: res.locals.user.username,
          userCaseLoads: res.locals.user.caseLoads,
          userRoles: res.locals.user.userRoles,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.AddCaseNote,
        })
        .catch(error => logger.error(error))

      return res.render('pages/caseNotes/addCaseNote', {
        today: formatDate(now.toISOString(), 'short'),
        refererUrl,
        prisonerNumber,
        formValues,
        types,
        subTypes,
        typeSubTypeMap,
        behaviourPrompts: this.chooseBehaviourPrompts(),
        errors,
        miniBannerData: {
          prisonerName: prisonerBannerName,
          prisonerNumber,
          cellLocation: formatLocation(cellLocation),
        },
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
      this.auditService
        .sendPostSuccess({
          userId: res.locals.user.username,
          userCaseLoads: res.locals.user.caseLoads,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.CaseNote,
          details: {},
        })
        .catch(error => logger.error(error))
      return res.redirect(refererUrl || `/prisoner/${prisonerNumber}/case-notes`)
    }
  }

  public displayUpdateCaseNote(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const userToken = res.locals.user.token
      const { caseNoteId } = req.params
      const { firstName, lastName, prisonerNumber, prisonId, restrictedPatient } = req.middleware.prisonerData
      const prisonerDisplayName = formatName(firstName, undefined, lastName, { style: NameFormatStyle.firstLast })

      // If user cannot view this prisoner's case notes, redirect to 404 page
      if (!canViewCaseNotes(res.locals.user, { prisonId, restrictedPatient })) {
        return next()
      }

      const currentCaseNote = await this.caseNotesService.getCaseNote(userToken, prisonerNumber, caseNoteId)
      const currentLength = this.calculateCaseNoteTotalLength(currentCaseNote)
      const isOMICOpen = currentCaseNote.subType === 'OPEN_COMM'
      const isExternal = Number.isNaN(+currentCaseNote.caseNoteId) // External case notes have non-numeric IDs

      // Prison API adds " ...[%s updated the case notes on yyyy/MM/dd HH:mm:ss] " to the text (%s is variable length username)
      const maxLength = isExternal
        ? 4000
        : 4000 - currentLength - prisonApiAdditionalCaseNoteTextLength - res.locals.user.username.length
      const caseNoteFlash = req.flash('caseNoteText')
      const caseNoteText: string = caseNoteFlash?.length ? (caseNoteFlash[0] as string) : ''
      const errors = req.flash('errors')

      const refererUrl = `/prisoner/${prisonerNumber}/case-notes`

      this.auditService
        .sendPageView({
          userId: res.locals.user.username,
          userCaseLoads: res.locals.user.caseLoads,
          userRoles: res.locals.user.userRoles,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.UpdateCaseNote,
        })
        .catch(error => logger.error(error))

      return res.render('pages/caseNotes/updateCaseNote', {
        refererUrl,
        prisonerDisplayName,
        prisonerNumber,
        caseNoteText,
        currentCaseNote,
        currentLength,
        maxLength,
        isOMICOpen,
        isExternal,
        errors,
      })
    }
  }

  public postUpdate(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber, caseNoteId } = req.params
      const { text, isExternal, currentLength, username } = req.body

      const errors = req.errors || []
      if (!errors.length) {
        try {
          await this.caseNotesService.updateCaseNote(res.locals.user.token, prisonerNumber, caseNoteId, {
            text,
            isExternal,
            currentLength: +currentLength,
            username,
          })
        } catch (error) {
          if (error.status === 400) {
            errors.push({ text: error.message })
          } else throw error
        }
      }

      if (errors.length) {
        req.flash('caseNoteText', text)
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/update-case-note/${caseNoteId}`)
      }

      req.flash('flashMessage', { text: 'Case note updated', type: FlashMessageType.success })
      this.auditService
        .sendPutSuccess({
          userId: res.locals.user.username,
          userCaseLoads: res.locals.user.caseLoads,
          prisonerNumber,
          correlationId: req.id,
          action: PutAction.CaseNote,
          details: { caseNoteId },
        })
        .catch(error => logger.error(error))
      return res.redirect(`/prisoner/${prisonerNumber}/case-notes`)
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

  private calculateCaseNoteTotalLength(caseNote: CaseNote): number {
    return (
      caseNote.text.length +
      (caseNote.amendments?.reduce(
        (totalLength: number, amendment) =>
          totalLength + amendment.additionalNoteText.length + prisonApiAdditionalCaseNoteTextLength + 8, // TODO + amendment.authorUserName.length - needs Offender Case Note API & PrisonAPI change
        0,
      ) || 0)
    )
  }
}
