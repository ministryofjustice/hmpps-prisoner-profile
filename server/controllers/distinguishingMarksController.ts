import { Request, Response } from 'express'
import DistinguishingMarksService, {
  findBodyPartByCodeAndSideAndOrientation,
} from '../services/distinguishingMarksService'
import {
  AllBodyPartSelection,
  bodyPartMap,
  BodyPartSelection,
  bodyPartSelections,
  MarkTypeSelection,
  markTypeSelections,
} from './interfaces/distinguishingMarks/selectionTypes'
import MulterFile from './interfaces/MulterFile'
import { getBodyPartDescription, getBodyPartToken } from '../views/dataUtils/groupDistinguishingMarksForView'
import { FlashMessageType } from '../data/enums/flashMessageType'
import {
  BodyPartId,
  BodyPartSideId,
  PartOrientationId,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { AuditService, Page, PostAction } from '../services/auditService'
import logger from '../../logger'
import { PrisonUser } from '../interfaces/HmppsUser'

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

  public async newDistinguishingMark(req: Request, res: Response) {
    const { markType, prisonerNumber } = req.params
    const { prisonerData } = req.middleware
    const selected = req.query.selected as string

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    const verifiedSelection = bodyPartSelections.find(selection => selection === bodyPartMap[selected])

    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    await this.auditService.sendPageView({
      user: res.locals.user,
      prisonerNumber: prisonerData.prisonerNumber,
      prisonId: prisonerData.prisonId,
      correlationId: req.id,
      page: Page.AddDistinguishingMark,
    })

    return res.render('pages/distinguishingMarks/addNewDistinguishingMark', {
      markType,
      selected,
      verifiedSelection,
      backLinkUrl: `/prisoner/${prisonerNumber}/personal#marks`,
    })
  }

  public async postNewDistinguishingMark(req: Request, res: Response) {
    const { markType, prisonerNumber } = req.params
    const { bodyPart, action } = req.body
    const { clientToken } = req.middleware

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
        type: FlashMessageType.success,
        fieldName: `distinguishing-marks-${verifiedMarkType}`,
      })
    } catch (error) {
      req.flash('errors', [{ text: 'There was an error please try again' }])
      logger.error(error)
      return res.redirect(
        `/prisoner/${prisonerNumber}/personal/distinguishing-marks/${verifiedMarkType}?selected=${bodyPart}`,
      )
    }

    return res.redirect(`/prisoner/${prisonerNumber}/personal#${redirectAnchors[verifiedMarkType]}`)
  }

  public async newDistinguishingMarkWithDetail(req: Request, res: Response) {
    const { markType, prisonerNumber, bodyPart } = req.params

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    const verifiedBodyPart = bodyPartSelections.find(selection => selection === bodyPartMap[bodyPart])

    if (!verifiedMarkType || !verifiedBodyPart) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    return res.render('pages/distinguishingMarks/addNewDistinguishingMarkDetail', {
      markType,
      bodyPart: verifiedBodyPart,
      backLinkUrl: `/prisoner/${prisonerNumber}/personal/distinguishing-marks/${verifiedMarkType}?selected=${bodyPart}`,
    })
  }

  public async postNewDistinguishingMarkWithDetail(req: Request, res: Response) {
    const { markType, bodyPart, prisonerNumber } = req.params
    const { specificBodyPart, action } = req.body
    const { clientToken } = req.middleware
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
        type: FlashMessageType.success,
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

  public async changeDistinguishingMark(req: Request, res: Response) {
    const { clientToken, prisonerData } = req.middleware
    const { prisonerNumber, markId, markType } = req.params
    const updated = (req.query.updated as string) === 'true'

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, prisonerNumber, markId)

    await this.auditService.sendPageView({
      user: res.locals.user,
      prisonerNumber: prisonerData.prisonerNumber,
      prisonId: prisonerData.prisonId,
      correlationId: req.id,
      page: Page.EditDistinguishingMark,
    })

    return res.render('pages/distinguishingMarks/changeDistinguishingMark', {
      prisonerNumber,
      mark,
      markType,
      updated,
    })
  }

  public async returnToPrisonerProfileAfterUpdate(req: Request, res: Response) {
    const { prisonerNumber, markType } = req.params
    const verifiedMarkType = markTypeSelections.find(type => type === markType)

    if (verifiedMarkType) {
      req.flash('flashMessage', {
        text: updateMessages[verifiedMarkType],
        type: FlashMessageType.success,
        fieldName: `distinguishing-marks-${verifiedMarkType}`,
      })

      return res.redirect(`/prisoner/${prisonerNumber}/personal#${redirectAnchors[verifiedMarkType]}`)
    }

    return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)
  }

  public async changeBodyPart(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const { clientToken } = req.middleware

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
    })
  }

  public async updateBodyPart(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const { bodyPart, initialBodyPart } = req.body
    const { clientToken } = req.middleware
    const bodyPartChanged = bodyPartMap[bodyPart] !== initialBodyPart

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    if (bodyPartChanged) {
      const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, prisonerNumber, markId)
      const currentSpecificBodyPart = findBodyPartByCodeAndSideAndOrientation(
        mark.bodyPart?.code,
        mark.side?.code,
        mark?.partOrientation?.code,
      )
      const verifiedBodyPart = bodyPartMap[bodyPart] as BodyPartSelection
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

  public async changeLocation(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const bodyPart = req.query.bodyPart as string
    const referer = req.query.referer as string
    const bodyPartChanged = (req.query.bodyPartChanged as string) === 'true'
    const { clientToken } = req.middleware

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
    })
  }

  public async updateLocation(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const { specificBodyPart } = req.body
    const { clientToken } = req.middleware

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

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

    return res.redirect(`/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}/${markId}?updated=true`)
  }

  public async changeDescription(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const { clientToken } = req.middleware

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
    })
  }

  public async updateDescription(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const { description } = req.body
    const { clientToken } = req.middleware

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

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

    return res.redirect(`/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}/${markId}?updated=true`)
  }

  public async changePhoto(req: Request, res: Response) {
    const { photoId, markId, markType, prisonerNumber } = req.params
    const { clientToken, prisonerData } = req.middleware
    const upload = req.query.upload !== undefined

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, prisonerNumber, markId)

    const verifiedMarkType = markTypeSelections.find(type => type === markType)

    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    const cancelUrl = `/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}/${markId}`

    await this.auditService.sendPageView({
      user: res.locals.user,
      prisonerNumber: prisonerData.prisonerNumber,
      prisonId: prisonerData.prisonId,
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
    })
  }

  public async addNewPhoto(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const { prisonerData } = req.middleware
    const upload = req.query.upload !== undefined
    const updated = (req.query.updated as string) === 'true'

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    const cancelUrl = `/prisoner/${prisonerNumber}/personal/distinguishing-marks/${markType}/${markId}${updated ? '?updated=true' : ''}`

    await this.auditService.sendPageView({
      user: res.locals.user,
      prisonerNumber: prisonerData.prisonerNumber,
      prisonId: prisonerData.prisonId,
      correlationId: req.id,
      page: Page.AddDistinguishingMarkPhoto,
    })

    return res.render('pages/distinguishingMarks/addPhoto', {
      markId,
      markType,
      upload,
      cancelUrl,
    })
  }

  public async updatePhoto(req: Request, res: Response) {
    const { markId, markType, prisonerNumber, photoId } = req.params
    const { clientToken } = req.middleware
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

  public async addPhoto(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const { action } = req.body
    const { clientToken } = req.middleware
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

  public async viewAllImages(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const { clientToken, prisonerData } = req.middleware

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, prisonerNumber, markId)

    await this.auditService.sendPageView({
      user: res.locals.user,
      prisonerNumber: prisonerData.prisonerNumber,
      prisonId: prisonerData.prisonId,
      correlationId: req.id,
      page: Page.DistinguishingMarkAllPhotos,
    })

    return res.render('pages/distinguishingMarks/viewAllImages', {
      mark,
      markType,
    })
  }
}
