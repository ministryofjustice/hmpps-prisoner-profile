import { NextFunction, Request, Response, Router } from 'express'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'
import { getRequest, postRequest } from './routerUtils'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { formatName, hasLength } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import InmateDetail from '../data/interfaces/prisonApi/InmateDetail'
import { ProfileInformationType, getProfileInformationValue } from '../data/interfaces/prisonApi/ProfileInformation'
import { FlashMessageType } from '../data/enums/flashMessageType'
import HmppsError from '../interfaces/HmppsError'

// Number of edit routes will be large regardless of API related things
// Worth looking at how we can manage this generically with specific pages for more complex/bespoke content
export default function editRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const post = postRequest(router)

  type GetSingleFieldOptions<TField> = {
    fieldName: string
    fieldValue: (prisoner: Prisoner, inmateDetail: InmateDetail) => TField
    pageTitle: string
    fieldSuffix?: string
  }

  function getField<TField>({ fieldName, fieldValue, pageTitle, fieldSuffix }: GetSingleFieldOptions<TField>) {
    return async (req: Request, res: Response, _next: NextFunction) => {
      const { prisonerNumber } = req.params
      const prisonerData: Prisoner = req.middleware?.prisonerData
      const inmateDetail: InmateDetail = req.middleware?.inmateDetail
      const fieldValueFlash = req.flash('fieldValue')
      const errors = req.flash('errors')

      return res.render('pages/edit/edit', {
        pageTitle,
        fieldName,
        breadcrumbPrisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
          style: NameFormatStyle.lastCommaFirst,
        }),
        prisonerNumber,
        fieldValue: fieldValueFlash.length > 0 ? fieldValueFlash[0] : fieldValue(prisonerData, inmateDetail),
        fieldSuffix: fieldSuffix || undefined,
        errors: hasLength(errors) ? errors : [],
      })
    }
  }

  type PostSingleFieldOptions = {
    editRoute: (prisonerNumber: string) => string
    validate: (fieldValue: string, errors: HmppsError[]) => void
    onSuccess: (req: Request, res: Response) => void
  }

  function postField({ editRoute, validate, onSuccess }: PostSingleFieldOptions) {
    return async (req: Request, res: Response) => {
      const { prisonerNumber } = req.params
      const { editField } = req.body
      const errors: HmppsError[] = []

      validate(editField, errors)

      if (errors.length === 0) {
        return onSuccess(req, res)
      } else {
        req.flash('fieldValue', editField)
        req.flash('errors', errors)
        return res.redirect(editRoute(prisonerNumber))
      }
    }
  }

  function singleFieldPage<TField>(
    route: string,
    options: { get: GetSingleFieldOptions<TField>; post: PostSingleFieldOptions },
  ) {
    get(
      route,
      getPrisonerData(services),
      checkPrisonerInCaseload({ allowGlobal: false, allowInactive: false }),
      getField<TField>(options.get),
    )

    post(
      route,
      getPrisonerData(services),
      checkPrisonerInCaseload({ allowGlobal: false, allowInactive: false }),
      postField(options.post),
    )
  }

  singleFieldPage<number>('/prisoner/:prisonerNumber/edit/height', {
    get: {
      fieldName: 'height',
      pageTitle: 'Edit height',
      fieldSuffix: 'cm',
      fieldValue: (prisoner, _inmateDetail) => prisoner.heightCentimetres,
    },
    post: {
      editRoute: prisonerNumber => `/prisoner/${prisonerNumber}/edit/height`,
      validate: (fieldValue, errors) => {
        const height = parseInt(fieldValue)
        if (Number.isNaN(height) || height <= 0) {
          errors.push({ text: 'Enter a number greater than 0' })
        }
      },
      onSuccess: (req, res) => {
        const { prisonerNumber } = req.params
        console.log('Height edited')
        req.flash('flashMessage', { text: 'Height edited', type: FlashMessageType.success })
        return res.redirect(`/prisoner/${prisonerNumber}/personal`)
      },
    },
  })

  get(
    '/prisoner/:prisonerNumber/edit/weight',
    getPrisonerData(services),
    checkPrisonerInCaseload({ allowGlobal: false, allowInactive: false }),
    getField<number>({
      fieldName: 'weight',
      pageTitle: 'Edit weight',
      fieldValue: (prisoner, _inmateDetail) => prisoner.weightKilograms,
      fieldSuffix: 'kg',
    }),
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
    getField<string>({
      fieldName: 'number of children',
      pageTitle: 'Edit number of children',
      fieldValue: (_prisoner, inmateDetail) =>
        getProfileInformationValue(ProfileInformationType.NumberOfChildren, inmateDetail.profileInformation),
    }),
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
