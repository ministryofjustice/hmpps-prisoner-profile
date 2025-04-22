import { Request, RequestHandler, Response } from 'express'
import { formatLocation, formatName, mapRelationshipDescriptionByCode, objectToSelectOptions } from '../utils/utils'
import { AuditService, Page, PostAction } from '../services/auditService'
import NextOfKinService from '../services/nextOfKinService'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import logger from '../../logger'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'
import {
  PersonalRelationshipsContactRequest,
  PersonalRelationshipsReferenceDataDomain,
  PersonalRelationshipType,
} from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { PrisonUser } from '../interfaces/HmppsUser'
import { dateToIsoDate } from '../utils/dateHelpers'

export interface PersonalRelationshipsContactForm {
  titleCode?: string
  lastName: string
  firstName: string
  middleNames?: string
  dateOfBirth?: string
  'dateOfBirth-day'?: string
  'dateOfBirth-month'?: string
  'dateOfBirth-year'?: string
  relationshipTypeId: string
  contactType: string[] | string
  property?: string
  street?: string
  cityCode?: string
  postcode?: string
  noFixedAddress: boolean
  phoneNumber?: string
}

export default class NextOfKinController {
  constructor(
    private readonly nextOfKinService: NextOfKinService,
    private readonly auditService: AuditService,
  ) {}

  public displayNextOfKinEmergencyContact(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerName, titlePrisonerName, prisonerNumber, prisonId, cellLocation, clientToken } =
        this.getCommonRequestData(req)
      const requestBodyFlash = requestBodyFromFlash<PersonalRelationshipsContactForm>(req)
      const errors = req.flash('errors')

      const formValues: PersonalRelationshipsContactForm = requestBodyFlash ?? ({} as PersonalRelationshipsContactForm)

      const {
        Title: titles,
        OfficialRelationship: officialRelationships,
        SocialRelationship: socialRelationships,
        City: cities,
      } = await this.nextOfKinService.getReferenceData(clientToken, [
        PersonalRelationshipsReferenceDataDomain.Title,
        PersonalRelationshipsReferenceDataDomain.OfficialRelationship,
        PersonalRelationshipsReferenceDataDomain.SocialRelationship,
        PersonalRelationshipsReferenceDataDomain.City,
      ])

      const relationshipOptions = [
        { value: '', text: '' },
        ...officialRelationships.map(({ code, description }) => ({
          value: `${PersonalRelationshipType.Official}_${code}`,
          text: mapRelationshipDescriptionByCode(code, description),
          selected: formValues.relationshipTypeId === `${PersonalRelationshipType.Official}_${code}`,
        })),
        ...socialRelationships.map(({ code, description }) => ({
          value: `${PersonalRelationshipType.Social}_${code}`,
          text: mapRelationshipDescriptionByCode(code, description),
          selected: formValues.relationshipTypeId === `${PersonalRelationshipType.Social}_${code}`,
        })),
      ]
      const titleOptions = [
        { value: '', text: 'Select title' },
        ...objectToSelectOptions(titles, 'code', 'description', formValues.titleCode),
      ]
      const cityOptions = [
        { value: '', text: '' },
        ...objectToSelectOptions(cities, 'code', 'description', formValues.cityCode),
      ]

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.EditNextOfKin,
        })
        .catch(error => logger.error(error))

      return res.render('pages/nextOfKin/nextOfKinEmergencyContacts', {
        pageTitle: `Next of kin and emergency contacts - Prisoner personal details`,
        title: `Add a next of kin or emergency contact for ${titlePrisonerName}`,
        formValues,
        errors,
        titleOptions,
        titlePrisonerName,
        relationshipOptions,
        cityOptions,
        miniBannerData: {
          prisonerNumber,
          prisonerName,
          cellLocation: formatLocation(cellLocation),
        },
      })
    }
  }

  public submitNextOfKinEmergencyContact(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware
      const formValues = req.body

      const errors = req.errors || []

      if (!errors.length) {
        const contactRequest: PersonalRelationshipsContactRequest = this.mapFormToRequest(
          formValues,
          prisonerNumber,
          res.locals.user.username,
        )

        try {
          await this.nextOfKinService.createContact(clientToken, res.locals.user as PrisonUser, contactRequest)
        } catch (error) {
          if (error.status === 400) {
            errors.push({ text: error.message })
          } else throw error
        }
      }

      if (errors.length) {
        req.flash('requestBody', JSON.stringify(formValues))
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/personal/next-of-kin-emergency-contacts`)
      }

      req.flash('flashMessage', {
        text: `Next of kin emergency contact has been added`,
        type: FlashMessageType.success,
        ...(formValues.action === 'continue' ? {} : { fieldName: 'next-of-kin' }),
      })
      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditNextOfKin,
          details: { formValues },
        })
        .catch(error => logger.error(error))

      if (formValues.action === 'continue') {
        return res.redirect(`/prisoner/${prisonerNumber}/personal/next-of-kin-emergency-contacts`)
      }
      return res.redirect(`/prisoner/${prisonerNumber}/personal#next-of-kin`)
    }
  }

  private mapFormToRequest(
    formValues: PersonalRelationshipsContactForm,
    prisonerNumber: string,
    username: string,
  ): PersonalRelationshipsContactRequest {
    const {
      titleCode,
      lastName,
      firstName,
      middleNames,
      'dateOfBirth-day': dateOfBirthDay,
      'dateOfBirth-month': dateOfBirthMonth,
      'dateOfBirth-year': dateOfBirthYear,
      relationshipTypeId,
      contactType,
      noFixedAddress,
      property,
      street,
      cityCode,
      postcode,
      phoneNumber,
    } = formValues
    const [relationshipTypeCode, relationshipToPrisonerCode] = relationshipTypeId.split('_')
    const isNextOfKin = contactType.includes('nextOfKin')
    const isEmergencyContact = contactType.includes('emergencyContact')
    const dateOfBirth =
      dateOfBirthDay &&
      dateOfBirthMonth &&
      dateOfBirthYear &&
      dateToIsoDate(`${dateOfBirthDay}/${dateOfBirthMonth}/${dateOfBirthYear}`)
    const address = (property || street || cityCode || postcode || noFixedAddress) && [
      {
        ...(property && { property }),
        ...(street && { street }),
        ...(cityCode && { cityCode }),
        ...(postcode && { postcode }),
        noFixedAddress,
      },
    ]
    const phone = phoneNumber
      ? [
          {
            phoneType: 'HOME',
            phoneNumber,
          },
        ]
      : undefined

    return {
      ...(titleCode && { titleCode }),
      lastName,
      firstName,
      ...(middleNames && { middleNames }),
      ...(dateOfBirth && { dateOfBirth }),
      isStaff: false,
      relationship: {
        prisonerNumber,
        relationshipTypeCode,
        relationshipToPrisonerCode,
        isNextOfKin,
        isEmergencyContact,
        isApprovedVisitor: false,
      },
      addresses: address ?? [],
      phoneNumbers: phone ?? [],
      createdBy: username,
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
