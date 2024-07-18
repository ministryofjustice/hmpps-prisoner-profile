import { NextFunction, Request, Response } from 'express'
import { PrisonUser } from '../../interfaces/HmppsUser'
import PersonalPageService from '../../services/personalPageService'
import CareNeedsService from '../../services/careNeedsService'
import {
  centimetresToFeetAndInches,
  feetAndInchesToCentimetres,
  kilogramsToStoneAndPounds,
  stoneAndPoundsToKilograms,
} from '../../utils/unitConversions'
import { mapHeaderData } from '../../mappers/headerMappers'
import { AuditService, Page, PostAction } from '../../services/auditService'
import { formatLocation, formatName, objectToSelectOptions, userHasRoles } from '../../utils/utils'
import { NameFormatStyle } from '../../data/enums/nameFormatStyle'
import { FlashMessageType } from '../../data/enums/flashMessageType'
import { enablePrisonPerson } from '../../utils/featureToggles'
import { FieldData } from './fieldData'
import logger from '../../../logger'
import miniBannerData from '../utils/miniBannerData'
import { requestBodyFromFlash } from '../../utils/requestBodyFromFlash'

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
      const { activeCaseLoadId, userRoles } = user
      const prisonPersonEnabled = enablePrisonPerson(activeCaseLoadId)

      const [personalPageData, careNeeds, xrays] = await Promise.all([
        this.personalPageService.get(clientToken, prisonerData, prisonPersonEnabled),
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
        editEnabled: enablePrisonPerson(activeCaseLoadId) && userHasRoles(['DPS_APPLICATION_DEVELOPER'], userRoles),
      })
    }
  }

  height() {
    return {
      metric: {
        edit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken, prisonerData } = req.middleware
          const { firstName, lastName } = prisonerData
          const requestBodyFlash = requestBodyFromFlash<{ editField: string }>(req)
          const errors = req.flash('errors')
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          await this.auditService.sendPageView({
            user: res.locals.user,
            prisonerNumber: prisonerData.prisonerNumber,
            prisonId: prisonerData.prisonId,
            correlationId: req.id,
            page: Page.EditHeight,
          })

          res.render('pages/edit/heightMetric', {
            pageTitle: 'Height - Prisoner personal details',
            prisonerNumber,
            breadcrumbPrisonerName: formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst }),
            errors,
            fieldValue: requestBodyFlash ? requestBodyFlash.editField : prisonPerson?.physicalAttributes.height,
            miniBannerData: miniBannerData(prisonerData),
          })
        },

        submit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const { editField } = req.body
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          const height = editField ? parseInt(editField, 10) : 0

          try {
            await this.personalPageService.updatePhysicalAttributes(clientToken, prisonerNumber, {
              height: editField ? height : null,
              weight: prisonPerson?.physicalAttributes.weight ?? null,
            })

            req.flash('flashMessage', { text: 'Height edited', type: FlashMessageType.success, fieldName: 'height' })

            this.auditService
              .sendPostSuccess({
                user: res.locals.user,
                prisonerNumber,
                correlationId: req.id,
                action: PostAction.EditPhysicalCharacteristics,
                details: { pageTitle: 'Height' },
              })
              .catch(error => logger.error(error))

            return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)
          } catch (e) {
            req.flash('requestBody', JSON.stringify(req.body))
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

          const requestBodyFlash = requestBodyFromFlash<{ feet: string; inches: string }>(req)
          const errors = req.flash('errors')

          await this.auditService.sendPageView({
            user: res.locals.user,
            prisonerNumber: prisonerData.prisonerNumber,
            prisonId: prisonerData.prisonId,
            correlationId: req.id,
            page: Page.EditHeight,
          })

          res.render('pages/edit/heightImperial', {
            pageTitle: 'Edit Height',
            prisonerNumber,
            breadcrumbPrisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
              style: NameFormatStyle.lastCommaFirst,
            }),
            errors,
            feetValue: requestBodyFlash ? requestBodyFlash.feet : feet,
            inchesValue: requestBodyFlash ? requestBodyFlash.inches : inches,
            miniBannerData: miniBannerData(prisonerData),
          })
        },

        submit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const { feet: feetString, inches: inchesString }: { feet: string; inches: string } = req.body
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          const feet = feetString ? parseInt(feetString, 10) : 0
          const inches = inchesString ? parseInt(inchesString, 10) : 0

          try {
            const height = feetAndInchesToCentimetres(feet, inches)
            await this.personalPageService.updatePhysicalAttributes(clientToken, prisonerNumber, {
              height: !feetString && !inchesString ? null : height,
              weight: prisonPerson?.physicalAttributes.weight,
            })

            req.flash('flashMessage', { text: 'Height edited', type: FlashMessageType.success, fieldName: 'height' })

            this.auditService
              .sendPostSuccess({
                user: res.locals.user,
                prisonerNumber,
                correlationId: req.id,
                action: PostAction.EditPhysicalCharacteristics,
                details: { pageTitle: 'Height' },
              })
              .catch(error => logger.error(error))

            return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)
          } catch (e) {
            req.flash('requestBody', JSON.stringify(req.body))
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
          const requestBodyFlash = requestBodyFromFlash<{ kilograms: string }>(req)
          const errors = req.flash('errors')
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          await this.auditService.sendPageView({
            user: res.locals.user,
            prisonerNumber: prisonerData.prisonerNumber,
            prisonId: prisonerData.prisonId,
            correlationId: req.id,
            page: Page.EditWeight,
          })

          res.render('pages/edit/weightMetric', {
            pageTitle: 'Edit weight',
            prisonerNumber,
            breadcrumbPrisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
              style: NameFormatStyle.lastCommaFirst,
            }),
            errors,
            fieldName: 'weight',
            fieldValue: requestBodyFlash ? requestBodyFlash.kilograms : prisonPerson?.physicalAttributes.weight,
            miniBannerData: miniBannerData(prisonerData),
          })
        },

        submit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const { kilograms } = req.body
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)
          const weight = parseInt(kilograms, 10)

          try {
            await this.personalPageService.updatePhysicalAttributes(clientToken, prisonerNumber, {
              weight: kilograms ? weight : null,
              height: prisonPerson?.physicalAttributes.height ?? null,
            })

            req.flash('flashMessage', { text: 'Weight edited', type: FlashMessageType.success, fieldName: 'weight' })
            return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)
          } catch (e) {
            req.flash('requestBody', JSON.stringify(req.body))
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

          const { stone, pounds } = kilogramsToStoneAndPounds(prisonPerson?.physicalAttributes.weight)

          const requestBodyFlash = requestBodyFromFlash<{ stone: string; pounds: string }>(req)
          const errors = req.flash('errors')

          await this.auditService.sendPageView({
            user: res.locals.user,
            prisonerNumber: prisonerData.prisonerNumber,
            prisonId: prisonerData.prisonId,
            correlationId: req.id,
            page: Page.EditWeight,
          })

          this.auditService
            .sendPostSuccess({
              user: res.locals.user,
              prisonerNumber,
              correlationId: req.id,
              action: PostAction.EditPhysicalCharacteristics,
              details: { pageTitle: 'Weight' },
            })
            .catch(error => logger.error(error))

          res.render('pages/edit/weightImperial', {
            pageTitle: 'Edit weight',
            prisonerNumber,
            breadcrumbPrisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
              style: NameFormatStyle.lastCommaFirst,
            }),
            errors,
            stoneValue: requestBodyFlash ? requestBodyFlash.stone : stone,
            poundsValue: requestBodyFlash ? requestBodyFlash.pounds : pounds,
            miniBannerData: miniBannerData(prisonerData),
          })
        },

        submit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const { stone: stoneString, pounds: poundsString }: { stone: string; pounds: string } = req.body
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          const stone = stoneString ? parseInt(stoneString, 10) : 0
          const pounds = poundsString ? parseInt(poundsString, 10) : 0

          try {
            const weight = stoneAndPoundsToKilograms(stone, pounds)
            await this.personalPageService.updatePhysicalAttributes(clientToken, prisonerNumber, {
              weight: !stoneString && !poundsString ? null : weight,
              height: prisonPerson?.physicalAttributes.height,
            })

            req.flash('flashMessage', { text: 'Weight edited', type: FlashMessageType.success, fieldName: 'weight' })

            this.auditService
              .sendPostSuccess({
                user: res.locals.user,
                prisonerNumber,
                correlationId: req.id,
                action: PostAction.EditPhysicalCharacteristics,
                details: { pageTitle: 'Weight' },
              })
              .catch(error => logger.error(error))

            return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)
          } catch (e) {
            req.flash('requestBody', JSON.stringify(req.body))
            req.flash('errors', [{ text: 'There was an error please try again' }])
            return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/weight/imperial`)
          }
        },
      },
    }
  }

  /**
   * Handler for editing single-value radio fields.
   *
   * @param fieldData - config for which physical characteristic to edit
   *
   * Handles editing:
   *   Hair type or colour
   *   Facial hair
   *   Face shape
   *   Build
   */
  radios(fieldData: FieldData) {
    return {
      edit: async (req: Request, res: Response, next: NextFunction) => {
        const { pageTitle, code, hintText, auditPage } = fieldData
        const { prisonerNumber } = req.params
        const { clientToken, prisonerData } = req.middleware
        const { firstName, lastName, cellLocation } = prisonerData
        const fieldValueFlash = req.flash('fieldValue')
        const errors = req.flash('errors')

        const prisonerBannerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })

        const [characteristics, prisonPerson] = await Promise.all([
          this.personalPageService.getReferenceDataCodes(clientToken, code),
          this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true),
        ])
        // TODO remove when API returns value
        if (prisonPerson) {
          prisonPerson.physicalCharacteristics = {
            hair: { code: '', description: '' },
            facialHair: { code: 'MOUSTACHE', description: 'Moustache' },
            face: { code: '', description: '' },
            build: { code: '', description: '' },
          }
        }

        const fieldValue =
          fieldValueFlash.length > 0 ? fieldValueFlash[0] : prisonPerson?.physicalCharacteristics[code]?.code

        await this.auditService.sendPageView({
          user: res.locals.user,
          prisonerNumber: prisonerData.prisonerNumber,
          prisonId: prisonerData.prisonId,
          correlationId: req.id,
          page: auditPage,
        })

        res.render('pages/edit/radios', {
          pageTitle,
          prisonerNumber,
          breadcrumbPrisonerName: prisonerBannerName,
          errors,
          hintText,
          options: objectToSelectOptions(characteristics, 'code', 'description', fieldValue),
          miniBannerData: {
            prisonerName: prisonerBannerName,
            prisonerNumber,
            cellLocation: formatLocation(cellLocation),
          },
        })
      },

      submit: async (req: Request, res: Response, next: NextFunction) => {
        const { pageTitle, code, fieldName, url } = fieldData
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const { radioField } = req.body

        try {
          await this.personalPageService.updatePhysicalCharacteristics(clientToken, prisonerNumber, {
            [code]: radioField,
          })
          req.flash('flashMessage', { text: `${pageTitle} updated`, type: FlashMessageType.success, fieldName })

          this.auditService
            .sendPostSuccess({
              user: res.locals.user,
              prisonerNumber,
              correlationId: req.id,
              action: PostAction.EditPhysicalCharacteristics,
              details: { pageTitle, code, fieldName, radioField, url },
            })
            .catch(error => logger.error(error))

          return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)
        } catch (e) {
          req.flash('errors', [{ text: 'There was an error please try again' }])
        }

        req.flash('fieldValue', radioField)
        return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/${url}`)
      },
    }
  }
}
