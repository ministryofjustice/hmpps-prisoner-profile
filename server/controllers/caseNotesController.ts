import { Request, RequestHandler, Response } from 'express'
import { isFuture } from 'date-fns'
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
import { formatDate, isRealDate, parseDate } from '../utils/dateHelpers'
import { HmppsError } from '../interfaces/hmppsError'
import config from '../config'
import { CaseNoteType } from '../interfaces/caseNoteType'
import { behaviourPrompts } from '../data/constants/caseNoteTypeBehaviourPrompts'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { Prisoner } from '../interfaces/prisoner'
import { CaseNoteForm } from '../interfaces/caseNotesApi/caseNote'

/**
 * Parse requests for case notes routes and orchestrate response
 */
export default class CaseNotesController {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly prisonerSearchService: PrisonerSearchService,
    private readonly caseNotesService: CaseNotesService,
  ) {}

  public displayCaseNotes(): RequestHandler {
    return async (req: Request, res: Response) => {
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
        return res.render('notFound.njk', {
          url: req.headers.referer || `/prisoner/${prisonerData.prisonerNumber}`,
        })
      }

      let addCaseNoteLinkUrl: string
      if (canAddCaseNotes(res.locals.user, prisonerData)) {
        addCaseNoteLinkUrl = `/prisoner/${prisonerData.prisonerNumber}/add-case-note`
      }

      // Get total count of case notes ignoring filters
      const caseNotesUsage = await this.prisonApiClientBuilder(clientToken).getCaseNotesUsage(req.params.prisonerNumber)
      const hasCaseNotes = Array.isArray(caseNotesUsage) && caseNotesUsage.length

      // Get case notes based on given query params
      const caseNotesPageData = await this.caseNotesService.get(
        userToken,
        prisonerData,
        queryParams,
        canDeleteSensitiveCaseNotes,
      )

      const { types, subTypes, typeSubTypeMap } = this.mapCaseNoteTypes(
        caseNotesPageData.caseNoteTypes,
        queryParams.type,
      )

      const showingAll = queryParams.showAll

      // Get staffId to use in conditional logic for amend link
      const { staffId } = res.locals.user

      // Render page
      return res.render('pages/caseNotes/caseNotesPage', {
        pageTitle: 'Case notes',
        ...mapHeaderData(prisonerData, res.locals.user, 'case-notes'),
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
    return async (req: Request, res: Response) => {
      const { clientToken } = res.locals
      const userToken = res.locals.user.token
      const { firstName, lastName, prisonerNumber, prisonId, restrictedPatient } =
        await this.prisonerSearchService.getPrisonerDetails(clientToken, req.params.prisonerNumber)
      const prisonerDisplayName = formatName(firstName, undefined, lastName, { style: NameFormatStyle.firstLast })

      // If user cannot view this prisoner's case notes, redirect to 404 page
      if (!canViewCaseNotes(res.locals.user, { prisonId, restrictedPatient } as Prisoner)) {
        return res.render('notFound.njk', {
          url: req.headers.referer || `/prisoner/${prisonerNumber}`,
        })
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
      const errors = this.validate(type, subType, text, date, hours, minutes)
      if (!errors.length) {
        try {
          await this.caseNotesService.addCaseNote(res.locals.user.token, prisonerNumber, caseNote)
        } catch (error) {
          if (error.status === 400) {
            errors.push({ text: error.message, href: '' })
          } else throw error
        }
      }

      if (errors.length) {
        req.flash('caseNote', caseNote as never)
        req.flash('errors', errors as never[])
        req.flash('addCaseNoteRefererUrl', refererUrl)
        return res.redirect(`/prisoner/${prisonerNumber}/add-case-note`)
      }

      if (type === 'REPORTS' && subType === 'REP_IEP') {
        return res.redirect(
          `${config.serviceUrls.digitalPrison}/prisoner/${prisonerNumber}/add-case-note/record-incentive-level`,
        )
      }

      req.flash('flashMessage', { text: 'Case note added', type: FlashMessageType.success } as never)
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
    const typeSubTypeMap: { [key: string]: { value: string; text: string }[] } = {}
    let subTypes: { value: string; text: string }[] = []

    const types = caseNoteTypes
      ?.filter(t => !onlyActive || t.activeFlag === 'Y')
      .map(t => ({ value: t.code, text: t.description }))
    caseNoteTypes.forEach(t => {
      typeSubTypeMap[t.code] = t.subCodes?.map(s => ({ value: s.code, text: s.description }))
    })
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

  /**
   * Validate case note.
   *
   * @param type
   * @param subType
   * @param text
   * @param date
   * @param hours
   * @param minutes
   */
  private validate(type: string, subType: string, text: string, date: string, hours: string, minutes: string) {
    const errors: HmppsError[] = []
    let invalidTime = false

    if (!type) {
      errors.push({
        text: 'Select the case note type',
        href: '#type',
      })
    }

    if (!subType) {
      errors.push({
        text: 'Select the case note sub-type',
        href: '#subType',
      })
    }

    if (text && text.length > 4000) {
      errors.push({
        text: 'Enter what happened using 4,000 characters or less',
        href: '#text',
      })
    }

    if (!text || !text.trim()) {
      errors.push({
        text: 'Enter what happened',
        href: '#text',
      })
    }

    if (!date) {
      errors.push({
        text: 'Select the date when this happened',
        href: '#date',
      })
    }

    if (date && !isRealDate(date)) {
      errors.push({
        text: 'Enter a real date in the format DD/MM/YYYY - for example, 27/03/2023',
        href: '#date',
      })
    }

    if (date && isRealDate(date) && isFuture(parseDate(date))) {
      errors.push({
        text: 'Enter a date which is not in the future in the format DD/MM/YYYY - for example, 27/03/2020',
        href: '#date',
      })
    }

    // eslint-disable-next-line no-restricted-globals
    if (hours && isNaN(parseInt(hours, 10))) {
      invalidTime = true
      errors.push({
        text: 'Enter an hour using numbers only',
        href: '#hours',
      })
    }

    // eslint-disable-next-line no-restricted-globals
    if (minutes && isNaN(parseInt(minutes, 10))) {
      invalidTime = true
      errors.push({
        text: 'Enter the minutes using numbers only',
        href: '#minutes',
      })
    }

    if ((hours && parseInt(hours, 10) > 23) || !hours) {
      invalidTime = true
      errors.push({
        text: 'Enter an hour which is 23 or less',
        href: '#hours',
      })
    }

    if ((minutes && parseInt(minutes, 10) > 59) || !minutes) {
      invalidTime = true
      errors.push({
        text: 'Enter the minutes using 59 or less',
        href: '#minutes',
      })
    }

    if (!hours && !minutes) {
      invalidTime = true
      errors.push({
        text: 'Select the time when this happened',
        href: '#hours',
      })
    }

    if (!invalidTime) {
      const dateTime = date && parseDate(date).setHours(+hours, +minutes, 0)
      if (dateTime && dateTime > new Date().getTime()) {
        errors.push({
          text: 'Enter a time which is not in the future',
          href: '#hours',
        })
      }
    }

    return errors
  }
}
