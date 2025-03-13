import { Request, Response } from 'express'
import DistinguishingMarksService, { findBodyPartByCodeAndSide } from '../services/distinguishingMarksService'
import {
  AllBodyPartSelection,
  bodyPartMap,
  BodyPartSelection,
  bodyPartSelections,
  markTypeSelections,
} from './interfaces/distinguishingMarks/selectionTypes'
import MulterFile from './interfaces/MulterFile'
import { getBodyPartDescription, getBodyPartToken } from '../views/dataUtils/groupDistinguishingMarksForView'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { convertToTitleCase, formatName } from '../utils/utils'
import { BodyPartId, BodyPartSideId } from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'

export default class DistinguishingMarksController {
  constructor(private readonly distinguishingMarksService: DistinguishingMarksService) {
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

  public newDistinguishingMark(req: Request, res: Response) {
    const { markType, prisonerNumber } = req.params
    const selected = req.query.selected as string

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    const verifiedSelection = bodyPartSelections.find(selection => selection === bodyPartMap[selected])

    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    return res.render('pages/distinguishingMarks/addNewDistinguishingMark', {
      markType,
      selected,
      verifiedSelection,
    })
  }

  public async postNewDistinguishingMark(req: Request, res: Response) {
    const { markType, prisonerNumber } = req.params
    const { bodyPart, action } = req.body
    const { clientToken } = req.middleware

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    if (action === 'continue') {
      return res.redirect(`/prisoner/${prisonerNumber}/personal/${markType}/${bodyPart}`)
    }

    await this.distinguishingMarksService.postNewDistinguishingMark(
      clientToken,
      prisonerNumber,
      verifiedMarkType,
      bodyPartMap[bodyPart] as BodyPartSelection,
    )

    req.flash('flashMessage', {
      text: `${convertToTitleCase(verifiedMarkType)} added`,
      type: FlashMessageType.success,
      fieldName: 'distinguishing-mark',
    })

    return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)
  }

  public newDistinguishingMarkWithDetail(req: Request, res: Response) {
    const { markType, prisonerNumber, bodyPart } = req.params

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    const verifiedBodyPart = bodyPartSelections.find(selection => selection === bodyPartMap[bodyPart])

    if (!verifiedMarkType || !verifiedBodyPart) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    return res.render('pages/distinguishingMarks/addNewDistinguishingMarkDetail', {
      markType,
      bodyPart: verifiedBodyPart,
    })
  }

  public async postNewDistinguishingMarkWithDetail(req: Request, res: Response) {
    const { markType, prisonerNumber } = req.params
    const { specificBodyPart, action } = req.body
    const { clientToken } = req.middleware

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    await this.distinguishingMarksService.postNewDistinguishingMark(
      clientToken,
      prisonerNumber,
      verifiedMarkType,
      specificBodyPart as AllBodyPartSelection,
      req.body[`description-${specificBodyPart}`],
      req.file,
    )

    req.flash('flashMessage', {
      text: `${convertToTitleCase(verifiedMarkType)} added`,
      type: FlashMessageType.success,
      fieldName: 'distinguishing-mark',
    })

    return action === 'returnToProfile'
      ? res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)
      : res.redirect(`/prisoner/${prisonerNumber}/personal/${markType}`)
  }

  public async changeDistinguishingMark(req: Request, res: Response) {
    const { clientToken } = req.middleware
    const { prisonerNumber, markId, markType } = req.params

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, prisonerNumber, markId)
    return res.render('pages/distinguishingMarks/changeDistinguishingMark', {
      prisonerNumber,
      mark,
      markType,
    })
  }

  public async changeBodyPart(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const { clientToken } = req.middleware

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, prisonerNumber, markId)

    const selected = (req.query.selected as string) || getBodyPartToken(mark)

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    const verifiedSelection = bodyPartSelections.find(selection => selection === bodyPartMap[selected])

    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    const refererUrl = `/prisoner/${prisonerNumber}/personal/${markType}/${markId}`

    return res.render('pages/distinguishingMarks/changeBodyPart', {
      markType,
      selected,
      verifiedSelection,
      refererUrl,
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
      await this.distinguishingMarksService.updateDistinguishingMarkLocation(
        clientToken,
        prisonerNumber,
        markId,
        mark,
        verifiedMarkType,
        bodyPartMap[bodyPart] as BodyPartSelection,
      )
    }

    // Neck and back have no specific locations to choose from, so return to the change summary screen
    if (bodyPart === 'neck' || bodyPart === 'back') {
      return res.redirect(`/prisoner/${prisonerNumber}/personal/${markType}/${markId}`)
    }

    return res.redirect(
      `/prisoner/${prisonerNumber}/personal/${markType}/${markId}/location?bodyPart=${bodyPart}&bodyPartChanged=${bodyPartChanged}&referer=body-part`,
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
    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    const verifiedBodyPart = bodyPartSelections.find(selection => selection === bodyPartMap[bodyPart])
    const specificBodyPart = findBodyPartByCodeAndSide(bodyPartCode, sideCode)

    if (!verifiedMarkType || !verifiedBodyPart) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    const cancelUrl = `/prisoner/${prisonerNumber}/personal/${markType}/${markId}`
    const refererUrl = `${cancelUrl}${referer === 'body-part' ? `/body-part?selected=${bodyPart}` : ''}`

    return res.render('pages/distinguishingMarks/changeLocation', {
      markId,
      markType,
      bodyPart: verifiedBodyPart,
      ...(bodyPartChanged ? {} : { specificBodyPart }),
      refererUrl,
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
    await this.distinguishingMarksService.updateDistinguishingMarkLocation(
      clientToken,
      prisonerNumber,
      markId,
      mark,
      verifiedMarkType,
      specificBodyPart as AllBodyPartSelection,
    )

    return res.redirect(`/prisoner/${prisonerNumber}/personal/${markType}/${markId}`)
  }

  public async changeDescription(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const { clientToken } = req.middleware

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, prisonerNumber, markId)

    const verifiedMarkType = markTypeSelections.find(type => type === markType)

    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    const refererUrl = `/prisoner/${prisonerNumber}/personal/${markType}/${markId}`

    const formValues = res.locals.formValues ?? {
      description: mark.comment,
    }

    return res.render('pages/distinguishingMarks/changeDescription', {
      markId,
      markType,
      formValues,
      refererUrl,
    })
  }

  public async updateDescription(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const { description } = req.body
    const { clientToken } = req.middleware

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, prisonerNumber, markId)
    await this.distinguishingMarksService.updateDistinguishingMarkDescription(
      clientToken,
      prisonerNumber,
      markId,
      mark,
      verifiedMarkType,
      description,
    )

    return res.redirect(`/prisoner/${prisonerNumber}/personal/${markType}/${markId}`)
  }

  public async changePhoto(req: Request, res: Response) {
    const { photoId, markId, markType, prisonerNumber } = req.params
    const { clientToken } = req.middleware
    const upload = req.query.upload !== undefined

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, prisonerNumber, markId)

    const verifiedMarkType = markTypeSelections.find(type => type === markType)

    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)

    const photoHtml = mark.photographUuids?.length
      ? `<img src="/api/distinguishing-mark-image/${photoId}?nocache=${Date.now().toString()}" alt="Image of ${mark.markType.description} on ${getBodyPartDescription(mark)}" width="150px" />`
      : null

    const refererUrl = `/prisoner/${prisonerNumber}/personal/${markType}/${markId}`

    return res.render('pages/distinguishingMarks/changePhoto', {
      markId,
      markType,
      photoHtml,
      refererUrl,
      upload,
    })
  }

  public async addNewPhoto(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const upload = req.query.upload !== undefined

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)

    const refererUrl = `/prisoner/${prisonerNumber}/personal/${markType}/${markId}`

    return res.render('pages/distinguishingMarks/addPhoto', {
      markId,
      markType,
      refererUrl,
      upload,
    })
  }

  public async updatePhoto(req: Request, res: Response) {
    const { markId, markType, prisonerNumber, photoId } = req.params
    const { clientToken } = req.middleware
    const file = req.file as MulterFile

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)

    await this.distinguishingMarksService.updateDistinguishingMarkPhoto(clientToken, photoId, file)

    return res.redirect(`/prisoner/${prisonerNumber}/personal/${markType}/${markId}`)
  }

  public async addPhoto(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const { action } = req.body
    const { clientToken } = req.middleware
    const file = req.file as MulterFile

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)

    await this.distinguishingMarksService.addDistinguishingMarkPhoto(clientToken, prisonerNumber, markId, file)
    return action === 'addAnotherPhoto'
      ? res.redirect(`/prisoner/${prisonerNumber}/personal/${markType}/${markId}/photo`)
      : res.redirect(`/prisoner/${prisonerNumber}/personal/${markType}/${markId}`)
  }

  public async viewAllImages(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const { clientToken, prisonerData } = req.middleware
    const { firstName, lastName } = prisonerData
    const prisonerName = formatName(firstName, null, lastName, { style: NameFormatStyle.firstLast })

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#marks`)

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, prisonerNumber, markId)
    return res.render('pages/distinguishingMarks/viewAllImages', {
      prisonerName,
      prisonerNumber,
      mark,
      markType,
    })
  }
}
