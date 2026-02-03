import { RequestHandler } from 'express'
import getCommonRequestData from '../../../../utils/getCommonRequestData'
import DistinguishingMarksService, {
  findBodyPartByCodeAndSideAndOrientation,
} from '../../../../services/distinguishingMarksService'
import {
  AllBodyPartSelection,
  bodyPartMap,
  BodyPartSelection,
  bodyPartSelections,
  MarkTypeSelection,
  markTypeSelections,
} from '../../../interfaces/distinguishingMarks/selectionTypes'
import MulterFile from '../../../interfaces/MulterFile'
import { getBodyPartDescription, getBodyPartToken } from '../../../../views/dataUtils/groupDistinguishingMarksForView'
import {
  BodyPartId,
  BodyPartSideId,
  PartOrientationId,
} from '../../../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { AuditService, Page, PostAction } from '../../../../services/auditService'
import logger from '../../../../../logger'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import ProblemSavingError from '../../../../utils/problemSavingError'

interface MulterFiles {
  [fieldname: string]: MulterFile[]
}

const updateMessages: Record<MarkTypeSelection, string> = {
  tattoo: 'Tattoos updated',
  scar: 'Scars updated',
  mark: 'Other marks updated',
}

const redirectAnchors: Record<MarkTypeSelection, string> = {
  tattoo: 'tattoos',
  scar: 'scars',
  mark: 'other-marks',
}

const photoErrorText =
  'There was an issue saving the photo. Your internet connection might be slow or there might be a problem with the file. Try uploading the file again.'

const photoErrorHtml = (linkHref: string) => `
<a href="${linkHref}">${photoErrorText}</a><br /><br />
<details class="govuk-details">
  <summary class="govuk-details__summary">
    <span class="govuk-details__summary-text">
      If you've tried to upload the photo more than once
    </span>
  </summary>
  <div class="govuk-details__text">
    <p>
      If there's an issue with your connection, you may need to cancel and try again later.<br /><br />
      If you've tried the same file more than once, there might be a problem with it. You may need to take the photo again and upload the new file.
    </p>
  </div>
</details>`

export default class DistinguishingMarksController {
  constructor(
    private readonly distinguishingMarksService: DistinguishingMarksService,
    private readonly auditService: AuditService,
  ) {
    this.newDistinguishingMark = this.newDistinguishingMark.bind(this)
    this.postNewDistinguishingMark = this.postNewDistinguishingMark.bind(this)
    this.postNewDistinguishingMarkWithDetail = this.postNewDistinguishingMarkWithDetail.bind(this)
    this.changeDistinguishingMark = this.changeDistinguishingMark.bind(this)
    this.changeBodyPart = this.changeBodyPart.bind(this)
    this.updateBodyPart = this.updateBodyPart.bind(this)
    this.changeLocation = this.changeLocation.bind(this)
    this.updateLocation = this.updateLocation.bind(this)
    this.changeDescription = this.changeDescription.bind(this)
    this.updateDescription = this.updateDescription.bind(this)
    this.changePhoto = this.changePhoto.bind(this)
    this.updatePhoto = this.updatePhoto.bind(this)
    this.addPhoto = this.addPhoto.bind(this)
    this.addNewPhoto = this.addNewPhoto.bind(this)
    this.viewAllImages = this.viewAllImages.bind(this)
  }

  public newDistinguishingMark: RequestHandler = async (req, res) => {
    const { prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)
    const { markType } = req.params
    const selected = req.query.selected as string

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    const verifiedSelection = bodyPartSelections.find(selection => selection === bodyPartMap[selected])

    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    await this.auditService.sendPageView({
      user: res.locals.user,
      prisonerNumber,
      prisonId,
      correlationId: req.id,
      page: Page.AddDistinguishingMark,
    })

    return res.render('pages/distinguishingMarks/addNewDistinguishingMark', {
      markType,
      selected,
      verifiedSelection,
      backLinkUrl: `/prisoner/${prisonerNumber}/personal#marks`,
      miniBannerData,
    })
  }

  public postNewDistinguishingMark: RequestHandler = async (req, res) => {
    const { clientToken, prisonerNumber } = getCommonRequestData(req, res)
    const { markType } = req.params
    const { bodyPart, action } = req.body

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    if (action === 'continue') {
      return res.redirect(`/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}/${bodyPart}/detail`)
    }

    try {
      const mark = await this.distinguishingMarksService.postNewDistinguishingMark(
        clientToken,
        res.locals.user as PrisonUser,
        prisonerNumber,
        verifiedMarkType,
        bodyPartMap[bodyPart] as BodyPartSelection,
      )

      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.AddDistinguishingMark,
          details: {
            markId: mark.id,
          },
        })
        .catch(error => logger.error(error))

      req.flash('flashMessage', {
        text: updateMessages[verifiedMarkType],
        fieldName: `distinguishing-marks-${verifiedMarkType}`,
      })
    } catch (error) {
      logger.error(error)
      throw new ProblemSavingError('Error while saving new distinguishing mark')
    }

    return res.redirect(`/prisoner/${prisonerNumber}/personal#${redirectAnchors[verifiedMarkType]}`)
  }

  public newDistinguishingMarkWithDetail: RequestHandler = async (req, res) => {
    const { prisonerNumber, miniBannerData } = getCommonRequestData(req, res)
    const { markType, bodyPart } = req.params

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    const verifiedBodyPart = bodyPartSelections.find(selection => selection === bodyPartMap[bodyPart])

    if (!verifiedMarkType || !verifiedBodyPart) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    return res.render('pages/distinguishingMarks/addNewDistinguishingMarkDetail', {
      markType,
      bodyPart: verifiedBodyPart,
      backLinkUrl: `/prisoner/${prisonerNumber}/personal/distinguishing-marks/${verifiedMarkType}?selected=${bodyPart}`,
      miniBannerData,
    })
  }

  public postNewDistinguishingMarkWithDetail: RequestHandler = async (req, res) => {
    const { clientToken, prisonerNumber } = getCommonRequestData(req, res)
    const { markType, bodyPart } = req.params
    const { specificBodyPart, action } = req.body
    const files = req.files as MulterFiles

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    try {
      const mark = await this.distinguishingMarksService.postNewDistinguishingMark(
        clientToken,
        res.locals.user as PrisonUser,
        prisonerNumber,
        verifiedMarkType,
        specificBodyPart as AllBodyPartSelection,
        req.body[`description-${specificBodyPart}`],
        files?.[`file-${specificBodyPart}`]?.[0],
      )

      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.AddDistinguishingMark,
          details: {
            markId: mark.id,
            photoId: mark.photographUuids?.find(id => id.latest)?.id,
          },
        })
        .catch(error => logger.error(error))

      req.flash('flashMessage', {
        text: updateMessages[verifiedMarkType],
        fieldName: `distinguishing-marks-${verifiedMarkType}`,
      })
    } catch (error) {
      logger.error(error)
      const displayError = files?.[`file-${specificBodyPart}`]?.[0]
        ? { text: photoErrorText, html: photoErrorHtml(`#file-${specificBodyPart}`), href: `#file-${specificBodyPart}` }
        : { text: `There was an error please try again` }

      req.flash('errors', [displayError])
      req.flash('requestBody', JSON.stringify(req.body))
      return res.redirect(
        `/prisoner/${prisonerNumber}/personal/distinguishing-marks/${verifiedMarkType}/${bodyPart}/detail`,
      )
    }

    return action === 'returnToProfile'
      ? res.redirect(`/prisoner/${prisonerNumber}/personal#${redirectAnchors[verifiedMarkType]}`)
      : res.redirect(`/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}`)
  }

  public changeDistinguishingMark: RequestHandler = async (req, res) => {
    const { clientToken, prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)
    const { markId, markType } = req.params
    const updated = (req.query.updated as string) === 'true'

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, prisonerNumber, markId)

    await this.auditService.sendPageView({
      user: res.locals.user,
      prisonerNumber,
      prisonId,
      correlationId: req.id,
      page: Page.EditDistinguishingMark,
    })

    return res.render('pages/distinguishingMarks/changeDistinguishingMark', {
      prisonerNumber,
      mark,
      markType,
      updated,
      miniBannerData,
    })
  }

  public returnToPrisonerProfileAfterUpdate: RequestHandler = async (req, res) => {
    const { prisonerNumber, markType } = req.params
    const verifiedMarkType = markTypeSelections.find(type => type === markType)

    if (verifiedMarkType) {
      req.flash('flashMessage', {
        text: updateMessages[verifiedMarkType],
        fieldName: `distinguishing-marks-${verifiedMarkType}`,
      })

      return res.redirect(`/prisoner/${prisonerNumber}/personal#${redirectAnchors[verifiedMarkType]}`)
    }

    return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)
  }

  public changeBodyPart: RequestHandler = async (req, res) => {
    const { clientToken, prisonerNumber, miniBannerData } = getCommonRequestData(req, res)
    const { markId, markType } = req.params

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, prisonerNumber, markId)

    const selected = (req.query.selected as string) || getBodyPartToken(mark)

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    const verifiedSelection = bodyPartSelections.find(selection => selection === bodyPartMap[selected])

    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    const cancelUrl = `/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}/${markId}`

    return res.render('pages/distinguishingMarks/changeBodyPart', {
      markType,
      selected,
      verifiedSelection,
      cancelUrl,
      miniBannerData,
    })
  }

  public updateBodyPart: RequestHandler = async (req, res) => {
    const { clientToken, prisonerNumber } = getCommonRequestData(req, res)
    const { markId, markType } = req.params
    const { bodyPart } = req.body

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    let bodyPartChanged
    try {
      const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, prisonerNumber, markId)
      const currentSpecificBodyPart = findBodyPartByCodeAndSideAndOrientation(
        mark.bodyPart?.code,
        mark.side?.code,
        mark?.partOrientation?.code,
      )
      const verifiedBodyPart = bodyPartMap[bodyPart] as BodyPartSelection
      bodyPartChanged = currentSpecificBodyPart !== verifiedBodyPart
      await this.distinguishingMarksService.updateDistinguishingMarkLocation(
        clientToken,
        res.locals.user as PrisonUser,
        prisonerNumber,
        markId,
        mark,
        verifiedMarkType,
        verifiedBodyPart,
      )
      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditDistinguishingMark,
          details: {
            markId,
            fieldName: 'location',
            previous: currentSpecificBodyPart,
            updated: verifiedBodyPart,
          },
        })
        .catch(error => logger.error(error))
    } catch (error) {
      logger.error(error)
      throw new ProblemSavingError('Error updating distinguishing mark body part')
    }

    // Neck and back have no specific locations to choose from, so return to the change summary screen
    if (bodyPart === 'neck' || bodyPart === 'back') {
      return res.redirect(
        `/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}/${markId}?updated=true`,
      )
    }

    return res.redirect(
      `/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}/${markId}/location?bodyPart=${bodyPart}&bodyPartChanged=${bodyPartChanged}&referer=body-part`,
    )
  }

  public changeLocation: RequestHandler = async (req, res) => {
    const { clientToken, prisonerNumber, miniBannerData } = getCommonRequestData(req, res)
    const { markId, markType } = req.params
    const bodyPart = req.query.bodyPart as string
    const referer = req.query.referer as string
    const bodyPartChanged = (req.query.bodyPartChanged as string) === 'true'

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, prisonerNumber, markId)
    const bodyPartCode: BodyPartId = mark.bodyPart.code as BodyPartId
    const sideCode = mark.side?.code as BodyPartSideId
    const orientationCode = mark.partOrientation?.code as PartOrientationId
    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    const verifiedBodyPart = bodyPartSelections.find(selection => selection === bodyPartMap[bodyPart])
    const specificBodyPart = findBodyPartByCodeAndSideAndOrientation(bodyPartCode, sideCode, orientationCode)

    if (!verifiedMarkType || !verifiedBodyPart) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    const cancelUrl = `/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}/${markId}`
    const backLinkUrl = referer === 'body-part' ? `${cancelUrl}/body-part?selected=${bodyPart}` : undefined

    return res.render('pages/distinguishingMarks/changeLocation', {
      markId,
      markType,
      bodyPart: verifiedBodyPart,
      ...(bodyPartChanged ? {} : { specificBodyPart }),
      backLinkUrl,
      cancelUrl,
      miniBannerData,
    })
  }

  public updateLocation: RequestHandler = async (req, res) => {
    const { clientToken, prisonerNumber } = getCommonRequestData(req, res)
    const { markId, markType } = req.params
    const { specificBodyPart } = req.body

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    try {
      const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, prisonerNumber, markId)
      const currentSpecificBodyPart = findBodyPartByCodeAndSideAndOrientation(
        mark.bodyPart?.code,
        mark.side?.code,
        mark.partOrientation?.code,
      )
      await this.distinguishingMarksService.updateDistinguishingMarkLocation(
        clientToken,
        res.locals.user as PrisonUser,
        prisonerNumber,
        markId,
        mark,
        verifiedMarkType,
        specificBodyPart as AllBodyPartSelection,
      )

      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditDistinguishingMark,
          details: {
            markId,
            fieldName: 'location',
            previous: currentSpecificBodyPart,
            updated: specificBodyPart,
          },
        })
        .catch(error => logger.error(error))
    } catch (error) {
      logger.error(error)
      throw new ProblemSavingError('Error updating distinguishing mark location')
    }

    return res.redirect(`/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}/${markId}?updated=true`)
  }

  public changeDescription: RequestHandler = async (req, res) => {
    const { clientToken, prisonerNumber, miniBannerData } = getCommonRequestData(req, res)
    const { markId, markType } = req.params

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, prisonerNumber, markId)

    const verifiedMarkType = markTypeSelections.find(type => type === markType)

    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    const cancelUrl = `/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}/${markId}`

    const formValues = res.locals.formValues ?? {
      description: mark.comment,
    }

    return res.render('pages/distinguishingMarks/changeDescription', {
      markId,
      markType,
      formValues,
      cancelUrl,
      miniBannerData,
    })
  }

  public updateDescription: RequestHandler = async (req, res) => {
    const { clientToken, prisonerNumber } = getCommonRequestData(req, res)
    const { markId, markType } = req.params
    const { description } = req.body

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    try {
      const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, prisonerNumber, markId)
      const currentDescription = mark.comment
      await this.distinguishingMarksService.updateDistinguishingMarkDescription(
        clientToken,
        res.locals.user as PrisonUser,
        prisonerNumber,
        markId,
        mark,
        verifiedMarkType,
        description,
      )

      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditDistinguishingMark,
          details: {
            markId,
            fieldName: 'description',
            previous: currentDescription,
            updated: description,
          },
        })
        .catch(error => logger.error(error))
    } catch (error) {
      logger.error(error)
      throw new ProblemSavingError('Error updating distinguishing mark description')
    }

    return res.redirect(`/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}/${markId}?updated=true`)
  }

  public changePhoto: RequestHandler = async (req, res) => {
    const { clientToken, prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)
    const { photoId, markId, markType } = req.params
    const upload = req.query.upload !== undefined

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, prisonerNumber, markId)

    const verifiedMarkType = markTypeSelections.find(type => type === markType)

    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    const cancelUrl = `/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}/${markId}`

    await this.auditService.sendPageView({
      user: res.locals.user,
      prisonerNumber,
      prisonId,
      correlationId: req.id,
      page: Page.EditDistinguishingMarkPhoto,
    })

    return res.render('pages/distinguishingMarks/changePhoto', {
      markId,
      markType,
      photo: {
        url: `/api/distinguishing-mark-image/${photoId}?nocache=${Date.now().toString()}`,
        alt: `Image of ${mark.markType.description} on ${getBodyPartDescription(mark)}`,
      },
      cancelUrl,
      upload,
      miniBannerData,
    })
  }

  public addNewPhoto: RequestHandler = async (req, res) => {
    const { prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)
    const { markId, markType } = req.params
    const upload = req.query.upload !== undefined
    const updated = (req.query.updated as string) === 'true'

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    const cancelUrl = `/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}/${markId}${updated ? '?updated=true' : ''}`

    await this.auditService.sendPageView({
      user: res.locals.user,
      prisonerNumber,
      prisonId,
      correlationId: req.id,
      page: Page.AddDistinguishingMarkPhoto,
    })

    return res.render('pages/distinguishingMarks/addPhoto', {
      markId,
      markType,
      upload,
      cancelUrl,
      miniBannerData,
    })
  }

  public updatePhoto: RequestHandler = async (req, res) => {
    const { clientToken, prisonerNumber } = getCommonRequestData(req, res)
    const { markId, markType, photoId } = req.params
    const file = req.file as MulterFile

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    try {
      await this.distinguishingMarksService.updateDistinguishingMarkPhoto(
        clientToken,
        res.locals.user as PrisonUser,
        prisonerNumber,
        photoId,
        file,
      )

      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditDistinguishingMarkPhoto,
          details: {
            markId,
            photoId,
          },
        })
        .catch(error => logger.error(error))
    } catch (error) {
      logger.error(error)
      req.flash('errors', [{ text: photoErrorText, html: photoErrorHtml('#file-upload'), href: '#file-upload' }])
      return res.redirect(
        `/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}/${markId}/photo/${photoId}`,
      )
    }

    return res.redirect(`/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}/${markId}?updated=true`)
  }

  public addPhoto: RequestHandler = async (req, res) => {
    const { clientToken, prisonerNumber } = getCommonRequestData(req, res)
    const { markId, markType } = req.params
    const { action } = req.body
    const file = req.file as MulterFile

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    try {
      const updatedMark = await this.distinguishingMarksService.addDistinguishingMarkPhoto(
        clientToken,
        res.locals.user as PrisonUser,
        prisonerNumber,
        markId,
        file,
      )
      const newPhotoId = updatedMark.photographUuids?.find(photo => photo.latest)?.id

      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.AddDistinguishingMarkPhoto,
          details: {
            markId,
            photoId: newPhotoId,
          },
        })
        .catch(error => logger.error(error))
    } catch (error) {
      logger.error(error)
      req.flash('errors', [{ text: photoErrorText, html: photoErrorHtml('#file-upload'), href: '#file-upload' }])
      return res.redirect(`/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}/${markId}/photo`)
    }

    return action === 'addAnotherPhoto'
      ? res.redirect(
          `/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}/${markId}/photo?updated=true`,
        )
      : res.redirect(`/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}/${markId}?updated=true`)
  }

  public viewAllImages: RequestHandler = async (req, res) => {
    const { clientToken, prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)
    const { markId, markType } = req.params

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, prisonerNumber, markId)

    await this.auditService.sendPageView({
      user: res.locals.user,
      prisonerNumber,
      prisonId,
      correlationId: req.id,
      page: Page.DistinguishingMarkAllPhotos,
    })

    return res.render('pages/distinguishingMarks/viewAllImages', {
      mark,
      markType,
      miniBannerData,
    })
  }
}
