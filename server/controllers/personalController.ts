import { NextFunction, Request, Response } from 'express'
import { PrisonUser } from '../interfaces/HmppsUser'
import { mapHeaderData } from '../mappers/headerMappers'
import { AuditService, Page } from '../services/auditService'
import PersonalPageService from '../services/personalPageService'
import { formatName, hasLength } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { FlashMessageType } from '../data/enums/flashMessageType'
import CareNeedsService from '../services/careNeedsService'
import { enablePrisonPerson } from '../utils/featureToggles'
import {
  centimetresToFeetAndInches,
  feetAndInchesToCentimetres,
  kilogramsToStoneAndPounds,
  stonesAndPoundsToKilograms,
} from '../utils/unitConversions'

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
          const { clientToken, prisonerData } = req.middleware
          const fieldValueFlash = req.flash('fieldValue')
          const errors = req.flash('errors')
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          res.render('pages/edit/heightMetric', {
            pageTitle: 'Edit Height',
            prisonerNumber,
            breadcrumbPrisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
              style: NameFormatStyle.lastCommaFirst,
            }),
            errors: hasLength(errors) ? errors : [],
            fieldName: 'Height',
            fieldValue: fieldValueFlash.length > 0 ? fieldValueFlash[0] : prisonPerson?.physicalAttributes.height,
            fieldSuffix: 'cm',
          })
        },

        submit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const { editField } = req.body
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          const height = parseInt(editField, 10)
          if (Number.isNaN(height) || height <= 0) {
            req.flash('fieldValue', editField)
            req.flash('errors', [{ text: 'Enter a number greater than 0' }])
            return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/height`)
          }

          try {
            await this.personalPageService.updatePhysicalAttributes(clientToken, prisonerNumber, {
              height,
              weight: prisonPerson?.physicalAttributes.weight ?? null,
            })

            req.flash('flashMessage', { text: 'Height edited', type: FlashMessageType.success })
            return res.redirect(`/prisoner/${prisonerNumber}/personal`)
          } catch (e) {
            req.flash('fieldValue', editField)
            req.flash('errors', [{ text: 'There was an error please try again' }])
            return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/height`)
          }
        },
      },

      imperial: {
        edit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken, prisonerData } = req.middleware
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          const { feet, inches } = centimetresToFeetAndInches(prisonPerson?.physicalAttributes.height)

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
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          const feet = parseInt(feetString, 10)
          const inches = parseInt(inchesString, 10)

          if (Number.isNaN(feet) || feet <= 0 || Number.isNaN(inches) || inches <= 0) {
            req.flash('feetValue', feet)
            req.flash('inchesValue', inches)
            req.flash('errors', [{ text: 'Enter a number greater than 0' }])
            return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/height/imperial`)
          }

          try {
            const height = feetAndInchesToCentimetres(feet, inches)
            await this.personalPageService.updatePhysicalAttributes(clientToken, prisonerNumber, {
              height,
              weight: prisonPerson?.physicalAttributes.weight,
            })

            req.flash('flashMessage', { text: 'Height edited', type: FlashMessageType.success })
            return res.redirect(`/prisoner/${prisonerNumber}/personal`)
          } catch (e) {
            req.flash('feetValue', feet)
            req.flash('inchesValue', inches)
            req.flash('errors', [{ text: 'There was an error please try again' }])
            return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/height/imperial`)
          }
        },
      },
    }
  }

  weight() {
    return {
      metric: {
        edit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken, prisonerData } = req.middleware
          const fieldValueFlash = req.flash('fieldValue')
          const errors = req.flash('errors')
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          res.render('pages/edit/weightMetric', {
            pageTitle: 'Edit weight',
            prisonerNumber,
            breadcrumbPrisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
              style: NameFormatStyle.lastCommaFirst,
            }),
            errors: hasLength(errors) ? errors : [],
            fieldName: 'weight',
            fieldValue: fieldValueFlash.length > 0 ? fieldValueFlash[0] : prisonPerson?.physicalAttributes.weight,
          })
        },

        submit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const { editField } = req.body
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          const weight = parseInt(editField, 10)
          if (Number.isNaN(weight) || weight <= 0) {
            req.flash('fieldValue', editField)
            req.flash('errors', [{ text: 'Enter a number greater than 0' }])
            return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/weight`)
          }

          try {
            await this.personalPageService.updatePhysicalAttributes(clientToken, prisonerNumber, {
              weight,
              height: prisonPerson?.physicalAttributes.height ?? null,
            })

            req.flash('flashMessage', { text: 'Weight edited', type: FlashMessageType.success })
            return res.redirect(`/prisoner/${prisonerNumber}/personal`)
          } catch (e) {
            req.flash('fieldValue', editField)
            req.flash('errors', [{ text: 'There was an error please try again' }])
            return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/weight`)
          }
        },
      },

      imperial: {
        edit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken, prisonerData } = req.middleware
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          const { stones, pounds } = kilogramsToStoneAndPounds(prisonPerson?.physicalAttributes.weight)

          const stonesValueFlash = req.flash('stonesValue')
          const poundsValueFlash = req.flash('poundsValue')
          const errors = req.flash('errors')

          res.render('pages/edit/weightImperial', {
            pageTitle: 'Edit weight',
            prisonerNumber,
            breadcrumbPrisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
              style: NameFormatStyle.lastCommaFirst,
            }),
            errors: hasLength(errors) ? errors : [],
            stonesValue: hasLength(stonesValueFlash) ? stonesValueFlash[0] : stones,
            poundsValue: hasLength(poundsValueFlash) ? poundsValueFlash[0] : pounds,
          })
        },

        submit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const { stones: stonesString, pounds: poundsString }: { stones: string; pounds: string } = req.body
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          const stones = parseInt(stonesString, 10)
          const pounds = parseInt(poundsString, 10)

          if (Number.isNaN(stones) || stones <= 0 || Number.isNaN(pounds) || pounds <= 0) {
            req.flash('stonesValue', stones)
            req.flash('poundsValue', pounds)
            req.flash('errors', [{ text: 'Enter a number greater than 0' }])
            return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/weight/imperial`)
          }

          try {
            const weight = stonesAndPoundsToKilograms(stones, pounds)
            await this.personalPageService.updatePhysicalAttributes(clientToken, prisonerNumber, {
              weight,
              height: prisonPerson?.physicalAttributes.height,
            })

            req.flash('flashMessage', { text: 'Weight edited', type: FlashMessageType.success })
            return res.redirect(`/prisoner/${prisonerNumber}/personal`)
          } catch (e) {
            req.flash('stonesValue', stones)
            req.flash('poundsValue', pounds)
            req.flash('errors', [{ text: 'There was an error please try again' }])
            return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/weight/imperial`)
          }
        },
      },
    }
  }
}
