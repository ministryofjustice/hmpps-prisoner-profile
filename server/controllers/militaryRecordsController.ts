import { Request, RequestHandler, Response } from 'express'
import { apostrophe, formatLocation, formatName, objectToRadioOptions } from '../utils/utils'
import { AuditService, Page, PostAction } from '../services/auditService'
import logger from '../../logger'
import MilitaryRecordsService from '../services/militaryRecordsService'
import {
  Conflicts,
  CorePersonRecordReferenceDataDomain,
  DischargeDetails,
  DisciplinaryAction,
  MilitaryServiceInformation,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { PrisonUser } from '../interfaces/HmppsUser'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'
import { dateToIsoDate } from '../utils/dateHelpers'
import { ReferenceDataCodeDto } from '../data/interfaces/referenceData'

export default class MilitaryRecordsController {
  constructor(
    private readonly militaryRecordsService: MilitaryRecordsService,
    private readonly auditService: AuditService,
  ) {}

  public displayMilitaryServiceInformation(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerName, titlePrisonerName, prisonerNumber, prisonId, cellLocation, clientToken } =
        this.getCommonRequestData(req)
      const militarySeq = +req.params.militarySeq
      const requestBodyFlash = requestBodyFromFlash<MilitaryServiceInformation>(req)
      const errors = req.flash('errors')

      const militaryServiceInformation: MilitaryServiceInformation =
        militarySeq && !errors.length
          ? (await this.militaryRecordsService.getMilitaryRecords(clientToken, prisonerNumber))
              ?.filter(record => record.militarySeq === militarySeq)
              ?.map(record => ({
                militarySeq: record.militarySeq,
                serviceNumber: record.serviceNumber,
                militaryBranchCode: record.militaryBranchCode,
                militaryRankCode: record.militaryRankCode,
                unitNumber: record.unitNumber,
                startDate: record.startDate,
                enlistmentLocation: record.enlistmentLocation,
                description: record.description,
              }))[0]
          : ({} as MilitaryServiceInformation)
      if (requestBodyFlash) {
        Object.assign(militaryServiceInformation, {
          ...requestBodyFlash,
          startDate: dateToIsoDate(`01/${requestBodyFlash['startDate-month']}/${requestBodyFlash['startDate-year']}`),
        })
      }

      const { militaryRank, militaryBranch } = await this.militaryRecordsService.getReferenceData(clientToken, [
        CorePersonRecordReferenceDataDomain.militaryBranch,
        CorePersonRecordReferenceDataDomain.militaryRank,
      ])

      const militaryBranchOptions = objectToRadioOptions(
        militaryBranch,
        'code',
        'description',
        militaryServiceInformation?.militaryBranchCode,
      )

      const rankOptions = () => {
        const ranksByBranch = militaryRank.reduce((acc: Record<string, ReferenceDataCodeDto[]>, rank) => {
          const { parentCode } = rank
          if (!acc[parentCode]) {
            acc[parentCode] = []
          }
          acc[parentCode].push({
            ...rank,
            description: rank.description.replace(/\(Army\)|\(Navy\)|\(RAF\)|\(Royal Marines\)/g, '').trim(),
          })
          return acc
        }, {})

        return {
          rankOptionsArmy: objectToRadioOptions(
            ranksByBranch.ARM || [],
            'code',
            'description',
            militaryServiceInformation?.militaryRankCode,
          ),
          rankOptionsNavy: objectToRadioOptions(
            ranksByBranch.NAV || [],
            'code',
            'description',
            militaryServiceInformation?.militaryRankCode,
          ),
          rankOptionsRAF: objectToRadioOptions(
            ranksByBranch.RAF || [],
            'code',
            'description',
            militaryServiceInformation?.militaryRankCode,
          ),
          rankOptionsRoyalMarines: objectToRadioOptions(
            ranksByBranch.RMA || [],
            'code',
            'description',
            militaryServiceInformation?.militaryRankCode,
          ),
        }
      }

      const { rankOptionsArmy, rankOptionsNavy, rankOptionsRAF, rankOptionsRoyalMarines } = rankOptions()

      const formValues = militaryServiceInformation
        ? {
            ...militaryServiceInformation,
            'startDate-year':
              militaryServiceInformation['startDate-year'] ?? militaryServiceInformation.startDate?.split('-')[0],
            'startDate-month':
              militaryServiceInformation['startDate-month'] ?? militaryServiceInformation.startDate?.split('-')[1],
          }
        : {}

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: militarySeq ? Page.EditMilitaryServiceInformation : Page.AddMilitaryServiceInformation,
        })
        .catch(error => logger.error(error))

      return res.render('pages/militaryRecords/militaryServiceInformation', {
        pageTitle: `UK military service information - Prisoner personal details`,
        title: `${apostrophe(titlePrisonerName)} UK military service information`,
        militarySeq,
        formValues,
        errors,
        militaryBranchOptions,
        rankOptionsArmy,
        rankOptionsNavy,
        rankOptionsRAF,
        rankOptionsRoyalMarines,
        miniBannerData: {
          prisonerNumber,
          prisonerName,
          cellLocation: formatLocation(cellLocation),
        },
      })
    }
  }

  public postMilitaryServiceInformation(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber, militarySeq } = req.params
      const { clientToken } = req.middleware
      const formValues = {
        serviceNumber: req.body.serviceNumber,
        militaryBranchCode: req.body.militaryBranchCode,
        militaryRankCode: req.body.militaryRankCode,
        unitNumber: req.body.unitNumber,
        startDate: dateToIsoDate(`01/${req.body['startDate-month']}/${req.body['startDate-year']}`),
        enlistmentLocation: req.body.enlistmentLocation,
        description: req.body.description,
      }
      const { action } = req.body

      const errors = req.errors || []
      if (!errors.length) {
        try {
          if (!militarySeq) {
            await this.militaryRecordsService.createMilitaryRecord(
              clientToken,
              res.locals.user as PrisonUser,
              prisonerNumber,
              formValues,
            )
          } else {
            await this.militaryRecordsService.updateMilitaryRecord(
              clientToken,
              res.locals.user as PrisonUser,
              prisonerNumber,
              +militarySeq,
              formValues,
            )
          }
        } catch (error) {
          if (error.status === 400) {
            errors.push({ text: error.message })
          } else throw error
        }
      }

      if (errors.length) {
        req.flash('requestBody', JSON.stringify(formValues))
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/personal/military-service-information/${militarySeq}`)
      }

      req.flash('flashMessage', {
        text: `UK military service information ${militarySeq ? 'updated' : 'added'}`,
        type: FlashMessageType.success,
        ...(action === 'continue' ? {} : { fieldName: 'military-service-information' }),
      })

      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: militarySeq ? PostAction.EditMilitaryServiceInformation : PostAction.AddMilitaryServiceInformation,
          details: { formValues },
        })
        .catch(error => logger.error(error))

      if (action === 'continue') {
        return res.redirect(`/prisoner/${prisonerNumber}/personal/conflicts/${militarySeq ? `${militarySeq}` : '1'}`)
      }
      return res.redirect(`/prisoner/${prisonerNumber}/personal#military-service-information`)
    }
  }

  public displayConflicts(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerName, titlePrisonerName, prisonerNumber, prisonId, cellLocation, clientToken } =
        this.getCommonRequestData(req)
      const militarySeq = +req.params.militarySeq
      const requestBodyFlash = requestBodyFromFlash<Conflicts>(req)
      const errors = req.flash('errors')

      const conflicts: Conflicts =
        militarySeq && !errors.length
          ? (await this.militaryRecordsService.getMilitaryRecords(clientToken, prisonerNumber))
              ?.filter(record => record.militarySeq === militarySeq)
              ?.map(record => ({ militarySeq: record.militarySeq, warZoneCode: record.warZoneCode }))[0]
          : ({} as Conflicts)
      if (requestBodyFlash) {
        Object.assign(conflicts, requestBodyFlash)
      }

      const { warZone } = await this.militaryRecordsService.getReferenceData(clientToken, [
        CorePersonRecordReferenceDataDomain.warZone,
      ])

      const warZoneOptions = [
        ...objectToRadioOptions(warZone, 'code', 'description', conflicts?.warZoneCode),
        { divider: 'or' },
        { text: 'Unknown', value: null },
      ]

      const formValues = conflicts ?? {}

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.EditConflicts,
        })
        .catch(error => logger.error(error))

      return res.render('pages/militaryRecords/conflicts', {
        pageTitle: `Most recent conflict - Prisoner personal details`,
        title: `What was the most recent conflict ${titlePrisonerName} served in?`,
        militarySeq,
        formValues,
        errors,
        warZoneOptions,
        miniBannerData: {
          prisonerNumber,
          prisonerName,
          cellLocation: formatLocation(cellLocation),
        },
      })
    }
  }

  public postConflicts(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber, militarySeq } = req.params
      const { clientToken } = req.middleware
      const formValues = {
        warZoneCode: req.body.warZoneCode || null,
      }
      const { action } = req.body

      const errors = req.errors || []
      if (!errors.length) {
        try {
          await this.militaryRecordsService.updateMilitaryRecord(
            clientToken,
            res.locals.user as PrisonUser,
            prisonerNumber,
            +militarySeq,
            formValues,
          )
        } catch (error) {
          if (error.status === 400) {
            errors.push({ text: error.message })
          } else throw error
        }
      }

      if (errors.length) {
        req.flash('requestBody', JSON.stringify(formValues))
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/personal/conflicts/${militarySeq}`)
      }

      req.flash('flashMessage', {
        text: `UK military service information updated`,
        type: FlashMessageType.success,
        ...(action === 'continue' ? {} : { fieldName: 'military-service-information' }),
      })
      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditConflicts,
          details: { formValues },
        })
        .catch(error => logger.error(error))

      if (action === 'continue') {
        return res.redirect(`/prisoner/${prisonerNumber}/personal/disciplinary-action/${militarySeq}`)
      }
      return res.redirect(`/prisoner/${prisonerNumber}/personal#military-service-information`)
    }
  }

  public displayDisciplinaryAction(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerName, titlePrisonerName, prisonerNumber, prisonId, cellLocation, clientToken } =
        this.getCommonRequestData(req)
      const militarySeq = +req.params.militarySeq
      const requestBodyFlash = requestBodyFromFlash<DisciplinaryAction>(req)
      const errors = req.flash('errors')

      const disciplinaryActionForm: DisciplinaryAction =
        militarySeq && !errors.length
          ? (await this.militaryRecordsService.getMilitaryRecords(clientToken, prisonerNumber))
              ?.filter(record => record.militarySeq === militarySeq)
              ?.map(record => ({
                militarySeq: record.militarySeq,
                disciplinaryActionCode: record.disciplinaryActionCode,
              }))[0]
          : ({} as DisciplinaryAction)
      if (requestBodyFlash) {
        Object.assign(disciplinaryActionForm, requestBodyFlash)
      }

      const { disciplinaryAction } = await this.militaryRecordsService.getReferenceData(clientToken, [
        CorePersonRecordReferenceDataDomain.disciplinaryAction,
      ])

      const disciplinaryActionOptions = [
        ...objectToRadioOptions(
          disciplinaryAction,
          'code',
          'description',
          disciplinaryActionForm?.disciplinaryActionCode,
        ),
        { divider: 'or' },
        { text: 'Unknown', value: null },
      ]

      const formValues = disciplinaryActionForm ?? {}

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.EditDisciplinaryAction,
        })
        .catch(error => logger.error(error))

      return res.render('pages/militaryRecords/disciplinaryAction', {
        pageTitle: `Disciplinary action - Prisoner personal details`,
        title: `Was ${titlePrisonerName} subject to any of the following disciplinary action?`,
        militarySeq,
        formValues,
        errors,
        disciplinaryActionOptions,
        miniBannerData: {
          prisonerNumber,
          prisonerName,
          cellLocation: formatLocation(cellLocation),
        },
      })
    }
  }

  public postDisciplinaryAction(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber, militarySeq } = req.params
      const { clientToken } = req.middleware
      const formValues = {
        disciplinaryActionCode: req.body.disciplinaryActionCode || null,
      }
      const { action } = req.body

      const errors = req.errors || []
      if (!errors.length) {
        try {
          await this.militaryRecordsService.updateMilitaryRecord(
            clientToken,
            res.locals.user as PrisonUser,
            prisonerNumber,
            +militarySeq,
            formValues,
          )
        } catch (error) {
          if (error.status === 400) {
            errors.push({ text: error.message })
          } else throw error
        }
      }

      if (errors.length) {
        req.flash('requestBody', JSON.stringify(formValues))
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/personal/disciplinary-action/${militarySeq}`)
      }

      req.flash('flashMessage', {
        text: `UK military service information updated`,
        type: FlashMessageType.success,
        ...(action === 'continue' ? {} : { fieldName: 'military-service-information' }),
      })
      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditDisciplinaryAction,
          details: { formValues },
        })
        .catch(error => logger.error(error))

      if (action === 'continue') {
        return res.redirect(`/prisoner/${prisonerNumber}/personal/discharge-details/${militarySeq}`)
      }
      return res.redirect(`/prisoner/${prisonerNumber}/personal#military-service-information`)
    }
  }

  public displayDischargeDetails(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerName, titlePrisonerName, prisonerNumber, prisonId, cellLocation, clientToken } =
        this.getCommonRequestData(req)
      const militarySeq = +req.params.militarySeq
      const requestBodyFlash = requestBodyFromFlash<DischargeDetails>(req)
      const errors = req.flash('errors')

      const dischargeDetailsForm: DischargeDetails =
        militarySeq && !errors.length
          ? (await this.militaryRecordsService.getMilitaryRecords(clientToken, prisonerNumber))
              ?.filter(record => record.militarySeq === militarySeq)
              ?.map(record => ({
                militarySeq: record.militarySeq,
                dischargeLocation: record.dischargeLocation,
                endDate: record.endDate,
                militaryDischargeCode: record.militaryDischargeCode,
              }))[0]
          : ({} as DischargeDetails)
      if (requestBodyFlash) {
        Object.assign(dischargeDetailsForm, {
          ...requestBodyFlash,
          endDate: dateToIsoDate(`01/${requestBodyFlash['endDate-month']}/${requestBodyFlash['endDate-year']}`),
        })
      }

      const { militaryDischarge } = await this.militaryRecordsService.getReferenceData(clientToken, [
        CorePersonRecordReferenceDataDomain.militaryDischarge,
      ])

      const dischargeOptions = objectToRadioOptions(
        militaryDischarge,
        'code',
        'description',
        dischargeDetailsForm?.militaryDischargeCode,
      )

      const formValues = dischargeDetailsForm
        ? {
            ...dischargeDetailsForm,
            'endDate-year': dischargeDetailsForm['endDate-year'] ?? dischargeDetailsForm.endDate?.split('-')[0],
            'endDate-month': dischargeDetailsForm['endDate-month'] ?? dischargeDetailsForm.endDate?.split('-')[1],
          }
        : {}

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.EditDischargeDetails,
        })
        .catch(error => logger.error(error))

      return res.render('pages/militaryRecords/dischargeDetails', {
        pageTitle: `Discharge details - Prisoner personal details`,
        title: `${apostrophe(titlePrisonerName)} discharge details`,
        militarySeq,
        formValues,
        errors,
        dischargeOptions,
        miniBannerData: {
          prisonerNumber,
          prisonerName,
          cellLocation: formatLocation(cellLocation),
        },
      })
    }
  }

  public postDischargeDetails(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber, militarySeq } = req.params
      const { clientToken } = req.middleware
      const formValues = {
        dischargeLocation: req.body.dischargeLocation,
        endDate: dateToIsoDate(`01/${req.body['endDate-month']}/${req.body['endDate-year']}`),
        militaryDischargeCode: req.body.militaryDischargeCode || null,
      }
      const { action } = req.body

      const errors = req.errors || []
      if (!errors.length) {
        try {
          await this.militaryRecordsService.updateMilitaryRecord(
            clientToken,
            res.locals.user as PrisonUser,
            prisonerNumber,
            +militarySeq,
            formValues,
          )
        } catch (error) {
          if (error.status === 400) {
            errors.push({ text: error.message })
          } else throw error
        }
      }

      if (errors.length) {
        req.flash('requestBody', JSON.stringify(formValues))
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/personal/discharge-details/${militarySeq}`)
      }

      req.flash('flashMessage', {
        text: `UK military service information updated`,
        type: FlashMessageType.success,
        ...(action === 'continue' ? {} : { fieldName: 'military-service-information' }),
      })
      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditDischargeDetails,
          details: { formValues },
        })
        .catch(error => logger.error(error))

      return res.redirect(`/prisoner/${prisonerNumber}/personal#military-service-information`)
    }
  }

  private getCommonRequestData(req: Request) {
    const { firstName, lastName, prisonerNumber, prisonId, cellLocation } = req.middleware.prisonerData
    const prisonerName = formatName(firstName, '', lastName, { style: NameFormatStyle.lastCommaFirst })
    const titlePrisonerName = formatName(firstName, '', lastName, { style: NameFormatStyle.firstLast })
    const { clientToken } = req.middleware
    return { prisonerNumber, prisonId, cellLocation, prisonerName, titlePrisonerName, clientToken }
  }
}
