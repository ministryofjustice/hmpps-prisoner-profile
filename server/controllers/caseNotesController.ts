import { RequestHandler } from 'express'
import { CaseNotesPermission, isGranted } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { mapHeaderData } from '../mappers/headerMappers'
import CaseNotesService from '../services/caseNotesService'
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
import { isServiceEnabled } from '../utils/isServiceEnabled'
import { Result } from '../utils/result/result'
import getCommonRequestData from '../utils/getCommonRequestData'
import { errorHasStatus } from '../utils/errorHelpers'

/**
 * Parse requests for case notes routes and orchestrate response
 */
export default class CaseNotesController {
  constructor(
    readonly caseNotesService: CaseNotesService,
    private readonly auditService: AuditService,
  ) {}

  public displayCaseNotes(): RequestHandler {
    return async (req, res) => {
      // Parse query params for paging, sorting and filtering data
      const queryParams: CaseNotesListQueryParams = {}
      const { clientToken, prisonerData, inmateDetail, alertSummaryData } = req.middleware
      const { prisonerPermissions } = res.locals

      queryParams.sort = (req.query.sort as string) || 'createdAt,DESC'
      if (req.query.page) queryParams.page = +req.query.page
      if (req.query.type) queryParams.type = req.query.type as string
      if (req.query.subType) queryParams.subType = req.query.subType as string
      if (req.query.startDate) queryParams.startDate = req.query.startDate as string
      if (req.query.endDate) queryParams.endDate = req.query.endDate as string
      if (req.query.showAll) queryParams.showAll = Boolean(req.query.showAll)

      const caseNotesPageData = await Result.wrap(
        this.caseNotesService.get({
          token: clientToken,
          prisonerData,
          queryParams,
          canViewSensitiveCaseNotes: isGranted(CaseNotesPermission.read_sensitive, prisonerPermissions),
          canDeleteSensitiveCaseNotes: isGranted(CaseNotesPermission.delete_sensitive, prisonerPermissions),
          currentUserDetails: res.locals.user,
        }),
      )

      if (!caseNotesPageData.isFulfilled()) {
        return res.render('pages/caseNotes/caseNotesPage', {
          pageTitle: 'Case notes',
          ...mapHeaderData(prisonerData, inmateDetail, alertSummaryData, res.locals.user, 'case-notes'),
          caseNotesApiUnavailable: true,
        })
      }

      const { types, subTypes, typeSubTypeMap } = this.mapCaseNoteTypes(
        caseNotesPageData.getOrThrow().caseNoteTypes,
        queryParams.type,
      )
      const showingAll = queryParams.showAll

      this.auditService
        .sendSearch({
          user: res.locals.user,
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
        ...mapHeaderData(prisonerData, inmateDetail, alertSummaryData, res.locals.user, 'case-notes'),
        ...caseNotesPageData.getOrThrow(),
        types,
        subTypes,
        typeSubTypeMap,
        showingAll,
        addCaseNoteLinkUrl: `/prisoner/${prisonerData.prisonerNumber}/add-case-note`,
        canAddMoreDetails: isServiceEnabled('caseNotesApi', res.locals.feComponents?.sharedData),
      })
    }
  }

  public displayAddCaseNote(): RequestHandler {
    return async (req, res) => {
      const { prisonerNumber, prisonId, miniBannerData, prisonerPermissions } = getCommonRequestData(req, res)

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

      const caseNoteTypes = await this.caseNotesService.getCaseNoteTypesForUser({
        token: req.middleware.clientToken,
        canEditSensitiveCaseNotes: isGranted(CaseNotesPermission.edit_sensitive, prisonerPermissions),
      })
      const { types, subTypes, typeSubTypeMap } = this.mapCaseNoteTypes(caseNoteTypes, formValues.type, true)

      // Generate back link based on where the user came from - default to profile overview if no referer
      const addCaseNoteRefererUrlFlash = req.flash('addCaseNoteRefererUrl')

      const refererUrl = addCaseNoteRefererUrlFlash?.length
        ? addCaseNoteRefererUrlFlash[0]
        : req.headers.referer || `/prisoner/${prisonerNumber}`

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.AddCaseNote,
        })
        .catch(error => logger.error(error))

      return res.render('pages/caseNotes/addCaseNote', {
        today: formatDate(now.toISOString(), 'short'),
        refererUrl,
        formValues,
        types,
        subTypes,
        typeSubTypeMap,
        behaviourPrompts: this.chooseBehaviourPrompts(),
        errors,
        miniBannerData,
      })
    }
  }

  public post(): RequestHandler {
    return async (req, res, next) => {
      const { prisonerPermissions } = res.locals
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
        const allowedCaseNoteTypes = await this.caseNotesService.getCaseNoteTypesForUser({
          token: req.middleware.clientToken,
          canEditSensitiveCaseNotes: isGranted(CaseNotesPermission.edit_sensitive, prisonerPermissions),
        })
        if (!allowedCaseNoteTypes.some(allowedType => allowedType.code === type)) {
          logger.info(`User not permitted to create case note of type: ${type}`)
          return next()
        }

        try {
          await this.caseNotesService.addCaseNote(
            req.middleware.clientToken,
            prisonerNumber,
            req.middleware.prisonerData.prisonId,
            caseNote,
          )
        } catch (error) {
          if (errorHasStatus(error, 400)) {
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
          user: res.locals.user,
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
    return async (req, res, next) => {
      const { caseNoteId } = req.params
      const { clientToken, prisonerNumber, prisonId, prisonerPermissions, miniBannerData } = getCommonRequestData(
        req,
        res,
      )

      const currentCaseNote = await this.caseNotesService.getCaseNote(clientToken, prisonerNumber, prisonId, caseNoteId)

      if (currentCaseNote.sensitive && !isGranted(CaseNotesPermission.edit_sensitive, prisonerPermissions)) {
        logger.info(`User not permitted to edit sensitive case note: ${caseNoteId}`)
        return next()
      }

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
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.UpdateCaseNote,
        })
        .catch(error => logger.error(error))

      return res.render('pages/caseNotes/updateCaseNote', {
        refererUrl,
        caseNoteText,
        currentCaseNote,
        currentLength,
        maxLength,
        isOMICOpen,
        isExternal,
        miniBannerData,
        errors,
      })
    }
  }

  public postUpdate(): RequestHandler {
    return async (req, res, next) => {
      const { prisonerNumber, caseNoteId } = req.params
      const { text } = req.body
      const { clientToken } = req.middleware
      const { prisonerPermissions } = res.locals
      const { prisonId } = req.middleware.prisonerData
      const currentCaseNote = await this.caseNotesService.getCaseNote(clientToken, prisonerNumber, prisonId, caseNoteId)

      if (currentCaseNote.sensitive && !isGranted(CaseNotesPermission.edit_sensitive, prisonerPermissions)) {
        logger.info(`User not permitted to edit sensitive case notes`)
        return next()
      }

      const errors = req.errors || []
      if (!errors.length) {
        try {
          await this.caseNotesService.addCaseNoteAmendment(
            req.middleware.clientToken,
            prisonerNumber,
            prisonId,
            caseNoteId,
            text,
          )
        } catch (error) {
          if (errorHasStatus(error, 400)) {
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
          user: res.locals.user,
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
   * @param onlyActive - if true, filter out types/subtypes where active is true
   */
  private mapCaseNoteTypes(caseNoteTypes: CaseNoteType[], type?: string, onlyActive = false) {
    const types = caseNoteTypes?.map(t => ({ value: t.code, text: t.description }))

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
          ?.filter(t => !onlyActive || t.active)
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
