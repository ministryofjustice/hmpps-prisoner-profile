import { Router } from 'express'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest, postRequest } from './routerUtils'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { formatName, hasLength } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import InmateDetail from '../data/interfaces/prisonApi/InmateDetail'
import { ProfileInformationType, getProfileInformationValue } from '../data/interfaces/prisonApi/ProfileInformation'
import { isNumberObject } from 'util/types'
import { FlashMessageType } from '../data/enums/flashMessageType'
import HmppsError from '../interfaces/HmppsError'

// Number of edit routes will be large regardless of API related things
// Worth looking at how we can manage this generically with specific pages for more complex/bespoke content
export default function editRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const post = postRequest(router)

  const fieldConfig = {
    height: {},
    weight: {},
    'number-of-children': {},
  }

  // Generic field edit page for basic things? Going off one field per page gov design
  // Easier for validations/etc
  get(
    '/prisoner/:prisonerNumber/edit/height',
    getPrisonerData(services),
    checkPrisonerInCaseload({ allowGlobal: false, allowInactive: false }),
    async (req, res, next) => {
      const { prisonerNumber } = req.params
      const prisonerData: Prisoner = req.middleware?.prisonerData
      const fieldValueFlash = req.flash('fieldValue')
      const errors = req.flash('errors')

      return res.render('pages/edit/edit', {
        pageTitle: 'Edit height',
        fieldName: 'height',
        breadcrumbPrisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
          style: NameFormatStyle.lastCommaFirst,
        }),
        prisonerNumber,
        fieldValue: fieldValueFlash.length > 0 ? fieldValueFlash[0] : prisonerData.heightCentimetres,
        fieldSuffix: 'cm',
        errors: hasLength(errors) ? errors : []
      })
    },
  )

  post(
    '/prisoner/:prisonerNumber/edit/height',
    getPrisonerData(services),
    checkPrisonerInCaseload({ allowGlobal: false, allowInactive: false }),
    async (req, res, next) => {
      const { prisonerNumber } = req.params
      const { editField } = req.body
      const errors: HmppsError[] = []

      const validate = (str: string, errors: HmppsError[]) => {
        const height = parseInt(str)
        if (Number.isNaN(height) || height <= 0) {
          errors.push({ text: 'Enter a number greater than 0' })
        }
      }

      validate(editField, errors)

      if (errors.length === 0) {
        console.log('Height edited')
        req.flash('flashMessage', { text: 'Height edited', type: FlashMessageType.success })
        return res.redirect(`/prisoner/${prisonerNumber}/personal`)
      } else {
        req.flash('fieldValue', editField)
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/edit/height`)
      }
    },
  )

  get(
    '/prisoner/:prisonerNumber/edit/weight',
    getPrisonerData(services),
    checkPrisonerInCaseload({ allowGlobal: false, allowInactive: false }),
    async (req, res, next) => {
      const { prisonerNumber } = req.params
      const prisonerData: Prisoner = req.middleware?.prisonerData
      const fieldValueFlash = req.flash('fieldValue')
      const errors = req.flash('errors')

      return res.render('pages/edit/edit', {
        pageTitle: 'Edit weight',
        fieldName: 'weight',
        breadcrumbPrisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
          style: NameFormatStyle.lastCommaFirst,
        }),
        prisonerNumber,
        errors,
        fieldValue: hasLength(fieldValueFlash) ? fieldValueFlash[0] : prisonerData.weightKilograms,
        fieldSuffix: 'kg',
      })
    },
  )

  post(
    '/prisoner/:prisonerNumber/edit/weight',
    getPrisonerData(services),
    checkPrisonerInCaseload({ allowGlobal: false, allowInactive: false }),
    async (req, res, next) => {
      const { prisonerNumber } = req.params
      const { editField } = req.body
      const errors: HmppsError[] = []

      const validate = (str: string, errors: HmppsError[]) => {
        const weight = parseFloat(str)
        if (Number.isNaN(weight) || weight <= 0) {
          errors.push({ text: 'Enter a number greater than 0' })
        }
      }

      validate(editField, errors)

      if (errors.length === 0) {
        console.log('Weight edited')
        req.flash('flashMessage', { text: 'Weight edited', type: FlashMessageType.success })
        return res.redirect(`/prisoner/${prisonerNumber}/personal`)
      } else {
        req.flash('fieldValue', editField)
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/edit/weight`)
      }
    },
  )

  get(
    '/prisoner/:prisonerNumber/edit/number-of-children',
    getPrisonerData(services),
    checkPrisonerInCaseload({ allowGlobal: false, allowInactive: false }),
    async (req, res, next) => {
      const { prisonerNumber, caseNoteId } = req.params
      const prisonerData: Prisoner = req.middleware?.prisonerData
      const inmateDetail: InmateDetail = req.middleware?.inmateDetail

      return res.render('pages/edit/edit', {
        pageTitle: 'Edit number of children',
        fieldName: 'number of children',
        breadcrumbPrisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
          style: NameFormatStyle.lastCommaFirst,
        }),
        prisonerNumber,
        fieldValue: getProfileInformationValue(
          ProfileInformationType.NumberOfChildren,
          inmateDetail.profileInformation,
        ),
      })
    },
  )

  post(
    '/prisoner/:prisonerNumber/edit/number-of-children',
    getPrisonerData(services),
    checkPrisonerInCaseload({ allowGlobal: false, allowInactive: false }),
    async (req, res, next) => {
      const { prisonerNumber } = req.params
      const { editField } = req.body
      const errors: HmppsError[] = []

      const validate = (str: string, errors: HmppsError[]) => {
        const numberOfChildren = parseInt(str)
        if (Number.isNaN(numberOfChildren) || numberOfChildren < 0) {
          errors.push({ text: 'Enter a number 0 or above' })
        }
      }

      validate(editField, errors)

      if (errors.length === 0) {
        console.log('Number of children edited')
        req.flash('flashMessage', { text: 'Number of children edited', type: FlashMessageType.success })
        return res.redirect(`/prisoner/${prisonerNumber}/personal`)
      } else {
        req.flash('fieldValue', editField)
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/edit/number-of-children`)
      }
    },
  )

  return router
}
