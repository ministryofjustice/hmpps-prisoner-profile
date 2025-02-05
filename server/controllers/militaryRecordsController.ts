import { Request, RequestHandler, Response } from 'express'
import { apostrophe, formatLocation, formatName, objectToRadioOptions } from '../utils/utils'
import { AuditService, Page, PostAction } from '../services/auditService'
import logger from '../../logger'
import MilitaryRecordsService from '../services/militaryRecordsService'
import {
  MilitaryServiceInformation,
  ProxyReferenceDataDomain,
  ReferenceDataCodeDto,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { PrisonUser } from '../interfaces/HmppsUser'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'
import { dateToIsoDate } from '../utils/dateHelpers'

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
          ? (await this.militaryRecordsService.getMilitaryRecords(clientToken, prisonerNumber)).filter(
              record => record.militarySeq === militarySeq,
            )[0]
          : ({} as MilitaryServiceInformation)
      if (requestBodyFlash) {
        Object.assign(militaryServiceInformation, {
          ...requestBodyFlash,
          startDate: dateToIsoDate(`01/${requestBodyFlash['startDate-month']}/${requestBodyFlash['startDate-year']}`),
        })
      }

      const { militaryRank, militaryBranch } = await this.militaryRecordsService.getReferenceData(clientToken, [
        ProxyReferenceDataDomain.militaryBranch,
        ProxyReferenceDataDomain.militaryRank,
      ])

      const militaryBranchOptions = objectToRadioOptions(
        militaryBranch,
        'code',
        'description',
        militaryServiceInformation?.militaryBranchCode,
      )

      const rankOptions = () => {
        const ranksByBranch = militaryRank.reduce((acc: Record<string, ReferenceDataCodeDto[]>, rank) => {
          // TODO remove this after the API has been updated to return the parentCode in the ref data dto
          const parentCode = ['ARM', 'NAV', 'RMA', 'RAF'][rank.listSequence - 1] || 'OTH'
          const cleanedRank = {
            ...rank,
            parentCode, // TODO remove as above
            description: rank.description.replace(/\(Army\)|\(Navy\)|\(RAF\)|\(Royal Marines\)/g, '').trim(),
          }

          if (!acc[parentCode]) {
            acc[parentCode] = []
          }
          acc[parentCode].push(cleanedRank) // TODO inline the cleanedRank creation
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
        ...(militarySeq ? { militarySeq: +militarySeq } : {}),
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
        text: `Military service information ${militarySeq ? 'updated' : 'added'}`,
        type: FlashMessageType.success,
        fieldName: 'military-service-information',
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
        return res.redirect(`/prisoner/${prisonerNumber}/personal#military-service-information`)
        // TODO use this url when conflicts page is done return res.redirect(`/prisoner/${prisonerNumber}/personal/conflicts/${militarySeq ? `${militarySeq}` : '1'}`)
      }
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
