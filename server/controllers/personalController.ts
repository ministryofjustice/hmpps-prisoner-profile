import { NextFunction, Request, Response } from 'express'
import { PrisonUser } from '../interfaces/HmppsUser'
import { mapHeaderData } from '../mappers/headerMappers'
import { AuditService, Page } from '../services/auditService'
import PersonalPageService from '../services/personalPageService'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { formatName, hasLength } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { FlashMessageType } from '../data/enums/flashMessageType'
import HmppsError from '../interfaces/HmppsError'
import CareNeedsService from '../services/careNeedsService'
import { enablePrisonPerson } from '../utils/featureToggles'
import { centimetresToFeetAndInches, feetAndInchesToCentimetres } from '../utils/unitConversions'

export default class PersonalController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    private readonly careNeedsService: CareNeedsService,
    private readonly auditService: AuditService,
  ) {}

  displayPersonalPage() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const {
        prisonerData,
        inmateDetail,
        alertSummaryData: { alertFlags },
        clientToken,
      } = req.middleware
      const { bookingId } = prisonerData
      const user = res.locals.user as PrisonUser
      const { activeCaseLoadId } = user

      const [personalPageData, careNeeds, xrays] = await Promise.all([
        this.personalPageService.get(clientToken, prisonerData, enablePrisonPerson(activeCaseLoadId)),
        this.careNeedsService.getCareNeedsAndAdjustments(clientToken, bookingId),
        this.careNeedsService.getXrayBodyScanSummary(clientToken, bookingId),
      ])

      await this.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.Personal,
      })

      res.render('pages/personalPage', {
        pageTitle: 'Personal',
        ...mapHeaderData(prisonerData, inmateDetail, alertFlags, res.locals.user, 'personal'),
        ...personalPageData,
        careNeeds: careNeeds.filter(need => need.isOngoing).sort((a, b) => b.startDate?.localeCompare(a.startDate)),
        security: { ...personalPageData.security, xrays },
        hasPastCareNeeds: careNeeds.some(need => !need.isOngoing),
      })
    }
  }

  height() {
    return {
      metric: {
        edit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const prisonerData: Prisoner = req.middleware?.prisonerData
          const fieldValueFlash = req.flash('fieldValue')
          const errors = req.flash('errors')
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          res.render('pages/edit/singleField', {
            pageTitle: 'Edit Height',
            prisonerNumber,
            breadcrumbPrisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
              style: NameFormatStyle.lastCommaFirst,
            }),
            errors: hasLength(errors) ? errors : [],
            fieldName: 'Height',
            fieldValue: fieldValueFlash.length > 0 ? fieldValueFlash[0] : prisonPerson.physicalAttributes.height,
            fieldSuffix: 'cm',
          })
        },

        submit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const { editField } = req.body
          const errors: HmppsError[] = []
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          const height = parseInt(editField, 10)
          if (Number.isNaN(height) || height <= 0) {
            errors.push({ text: 'Enter a number greater than 0' })
          }

          if (errors.length === 0) {
            try {
              await this.personalPageService.updatePhysicalAttributes(clientToken, prisonerNumber, {
                height,
                weight: prisonPerson.physicalAttributes.weight ?? null,
              })

              req.flash('flashMessage', { text: 'Height edited', type: FlashMessageType.success })
              return res.redirect(`/prisoner/${prisonerNumber}/personal`)
            } catch (e) {
              errors.push({ text: 'There was an error please try again' })
            }
          }

          req.flash('fieldValue', editField)
          req.flash('errors', errors)
          return res.redirect(`/prisoner/${prisonerNumber}/edit/height`)
        },
      },

      imperial: {
        edit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const prisonerData: Prisoner = req.middleware?.prisonerData
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          const { feet, inches } = centimetresToFeetAndInches(prisonPerson.physicalAttributes.height)

          const feetValueFlash = req.flash('feetValue')
          const inchesValueFlash = req.flash('inchesValue')
          const errors = req.flash('errors')

          // Imperial is two fields so we can't use single field
          res.render('pages/edit/heightImperial', {
            pageTitle: 'Edit Height',
            prisonerNumber,
            breadcrumbPrisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
              style: NameFormatStyle.lastCommaFirst,
            }),
            errors: hasLength(errors) ? errors : [],
            feetValue: hasLength(feetValueFlash) ? feetValueFlash[0] : feet,
            inchesValue: hasLength(inchesValueFlash) ? inchesValueFlash[0] : inches,
          })
        },

        submit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const { feet: feetString, inches: inchesString }: { feet: string; inches: string } = req.body
          const errors: HmppsError[] = []
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          const feet = parseInt(feetString, 10)
          const inches = parseInt(inchesString, 10)

          if (Number.isNaN(feet) || feet <= 0 || Number.isNaN(inches) || inches <= 0) {
            errors.push({ text: 'Enter a number greater than 0' })
          }

          if (errors.length === 0) {
            try {
              const height = feetAndInchesToCentimetres(feet, inches)
              await this.personalPageService.updatePhysicalAttributes(clientToken, prisonerNumber, {
                height,
                weight: prisonPerson.physicalAttributes.weight,
              })

              req.flash('flashMessage', { text: 'Height edited', type: FlashMessageType.success })
              return res.redirect(`/prisoner/${prisonerNumber}/personal`)
            } catch (e) {
              errors.push({ text: 'There was an error please try again' })
            }
          }

          req.flash('feetValue', feet)
          req.flash('inchesValue', inches)
          req.flash('errors', errors)
          return res.redirect(`/prisoner/${prisonerNumber}/edit/height/imperial`)
        },
      },
    }
  }
}
