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
import { formatLocation, formatName, hasLength, objectToSelectOptions, userHasRoles } from '../../utils/utils'
import { NameFormatStyle } from '../../data/enums/nameFormatStyle'
import { FlashMessageType } from '../../data/enums/flashMessageType'
import HmppsError from '../../interfaces/HmppsError'
import { enablePrisonPerson } from '../../utils/featureToggles'
import { FieldData } from './fieldData'
import logger from '../../../logger'
import miniBannerData from '../utils/miniBannerData'

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
          const fieldValueFlash = req.flash('fieldValue')
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
            errors: hasLength(errors) ? errors : [],
            fieldValue: fieldValueFlash.length > 0 ? fieldValueFlash[0] : prisonPerson?.physicalAttributes.height,
            miniBannerData: miniBannerData(prisonerData),
          })
        },

        submit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const { editField } = req.body
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          const height = editField ? parseInt(editField, 10) : 0

          const validatedInput = (): { valid: boolean; errorMessage?: string } => {
            // Empty input is allowed
            if (editField === '') {
              return { valid: true }
            }

            if (Number.isNaN(height)) {
              return { valid: false, errorMessage: "Enter this person's height" }
            }

            if (height < 50 || height > 280) {
              return { valid: false, errorMessage: 'Height must be between 50 centimetres and 280 centimetres' }
            }

            return { valid: true }
          }

          const { valid, errorMessage } = validatedInput()

          if (!valid) {
            req.flash('fieldValue', editField)
            req.flash('errors', [{ text: errorMessage, href: '#height' }])
            return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/height`)
          }

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
            errors: hasLength(errors) ? errors : [],
            feetValue: hasLength(feetValueFlash) ? feetValueFlash[0] : feet,
            inchesValue: hasLength(inchesValueFlash) ? inchesValueFlash[0] : inches,
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

          const validatedInput = () => {
            // Empty input is allowed for both or inches only
            if ((!feetString && !inchesString) || (feetString && !inchesString)) {
              return { valid: true }
            }

            if (Number.isNaN(feet) || Number.isNaN(inches)) {
              return { valid: false, errorMessage: "Enter this person's height" }
            }

            if (!feetString || (feet >= 1 && feet <= 9 && inches < 0)) {
              return { valid: false, errorMessage: 'Feet must be between 1 and 9. Inches must be between 0 and 11' }
            }

            if (feet < 1 || feet > 9 || (feet === 9 && inches > 0)) {
              return { valid: false, errorMessage: 'Height must be between 1 feet and 9 feet' }
            }

            return { valid: true }
          }

          const { valid, errorMessage } = validatedInput()

          if (!valid) {
            req.flash('feetValue', feetString)
            req.flash('inchesValue', inchesString)
            req.flash('errors', [{ text: errorMessage, href: '#feet' }])
            return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/height/imperial`)
          }

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
            errors: hasLength(errors) ? errors : [],
            fieldName: 'weight',
            fieldValue: fieldValueFlash.length > 0 ? fieldValueFlash[0] : prisonPerson?.physicalAttributes.weight,
            miniBannerData: miniBannerData(prisonerData),
          })
        },

        submit: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const { kilograms } = req.body
          const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)

          const weight = parseInt(kilograms, 10)
          const validatedInput = (): { valid: boolean; errorMessage?: string } => {
            // Empty input is allowed
            if (kilograms === '') {
              return { valid: true }
            }

            if (Number.isNaN(weight)) {
              return { valid: false, errorMessage: "Enter this person's weight" }
            }

            if (weight < 12 || weight > 640) {
              return { valid: false, errorMessage: 'Weight must be between 12 kilograms and 640 kilograms' }
            }

            return { valid: true }
          }

          const { valid, errorMessage } = validatedInput()

          if (!valid) {
            req.flash('kilogramsValue', kilograms)
            req.flash('errors', [{ text: errorMessage, href: '#kilograms' }])
            return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/weight`)
          }

          try {
            await this.personalPageService.updatePhysicalAttributes(clientToken, prisonerNumber, {
              weight: kilograms ? weight : null,
              height: prisonPerson?.physicalAttributes.height ?? null,
            })

            req.flash('flashMessage', { text: 'Weight edited', type: FlashMessageType.success, fieldName: 'weight' })
            return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)
          } catch (e) {
            req.flash('kilogramsValue', kilograms)
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

          const stoneValueFlash = req.flash('stoneValue')
          const poundsValueFlash = req.flash('poundsValue')
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
            errors: hasLength(errors) ? errors : [],
            stoneValue: hasLength(stoneValueFlash) ? stoneValueFlash[0] : stone,
            poundsValue: hasLength(poundsValueFlash) ? poundsValueFlash[0] : pounds,
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

          const validatedInput = () => {
            // Empty input is allowed for both or pounds only
            if ((!stoneString && !poundsString) || (stoneString && !poundsString)) {
              return { valid: true }
            }

            if (Number.isNaN(stone) || Number.isNaN(pounds)) {
              return { valid: false, errorMessage: "Enter this person's weight" }
            }

            if (!stoneString || (stone >= 2 && stone <= 100 && (pounds < 0 || pounds > 13))) {
              return { valid: false, errorMessage: 'Stone must be between 2 and 100. Pounds must be between 0 and 13' }
            }

            if (stone < 2 || stone > 100 || (stone === 100 && pounds > 0)) {
              return { valid: false, errorMessage: 'Weight must be between 2 stone and 100 stone' }
            }

            return { valid: true }
          }

          const { valid, errorMessage } = validatedInput()

          if (!valid) {
            req.flash('stoneValue', stoneString)
            req.flash('poundsValue', poundsString)
            req.flash('errors', [{ text: errorMessage, href: '#stone' }])
            return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/weight/imperial`)
          }
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
            req.flash('stoneValue', stone)
            req.flash('poundsValue', pounds)
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
        const { pageTitle, fieldName, hintText, auditPage } = fieldData
        const { prisonerNumber } = req.params
        const { clientToken, prisonerData } = req.middleware
        const { firstName, lastName, cellLocation } = prisonerData
        const fieldValueFlash = req.flash('fieldValue')
        const errors = req.flash('errors')

        const prisonerBannerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })

        const characteristics = await this.personalPageService.getPhysicalCharacteristics(clientToken, fieldName)
        const prisonPerson = await this.personalPageService.getPrisonPerson(clientToken, prisonerNumber, true)
        // TODO remove when API returns value
        if (prisonPerson) {
          prisonPerson.physicalCharacteristics = {
            hair: { code: '', description: '' },
            facialHair: { code: '', description: '' },
            faceShape: { code: '', description: '' },
            build: { code: '', description: '' },
          }
        }

        const fieldValue =
          fieldValueFlash.length > 0 ? fieldValueFlash[0] : prisonPerson?.physicalCharacteristics[fieldName]

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
          errors: hasLength(errors) ? errors : [],
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
        const { pageTitle, fieldName, url } = fieldData
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const { radioField } = req.body
        const errors: HmppsError[] = []

        try {
          await this.personalPageService.updatePhysicalCharacteristics(clientToken, prisonerNumber, {
            [fieldName]: radioField,
          })
          req.flash('flashMessage', { text: `${pageTitle} updated`, type: FlashMessageType.success, fieldName })

          this.auditService
            .sendPostSuccess({
              user: res.locals.user,
              prisonerNumber,
              correlationId: req.id,
              action: PostAction.EditPhysicalCharacteristics,
              details: { pageTitle, fieldName, radioField, url },
            })
            .catch(error => logger.error(error))

          return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)
        } catch (e) {
          errors.push({ text: 'There was an error please try again' })
        }

        req.flash('fieldValue', radioField)
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/personal/edit/${url}`)
      },
    }
  }
}