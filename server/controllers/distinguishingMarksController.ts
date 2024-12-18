import { Request, Response } from 'express'
import DistinguishingMarksService, { findBodyPartByIdAndSide } from '../services/distinguishingMarksService'
import {
  AllBodyPartSelection,
  bodyPartMap,
  BodyPartSelection,
  bodyPartSelections,
  markTypeSelections,
} from './interfaces/distinguishingMarks/selectionTypes'
import MulterFile from './interfaces/MulterFile'
import { getBodyPartDescription, getBodyPartToken } from '../views/dataUtils/groupDistinguishingMarksForView'

interface MulterFiles {
  [fieldname: string]: MulterFile[]
}

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
  }

  public newDistinguishingMark(req: Request, res: Response) {
    const { markType, prisonerNumber } = req.params
    const selected = req.query.selected as string

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    const verifiedSelection = bodyPartSelections.find(selection => selection === bodyPartMap[selected])

    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)

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
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)

    if (action === 'continue') {
      return res.redirect(`/prisoner/${prisonerNumber}/personal/${markType}/${bodyPart}`)
    }

    await this.distinguishingMarksService.postNewDistinguishingMark(
      clientToken,
      prisonerNumber,
      verifiedMarkType,
      bodyPartMap[bodyPart] as BodyPartSelection,
    )

    return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)
  }

  public newDistinguishingMarkWithDetail(req: Request, res: Response) {
    const { markType, prisonerNumber, bodyPart } = req.params

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    const verifiedBodyPart = bodyPartSelections.find(selection => selection === bodyPartMap[bodyPart])

    if (!verifiedMarkType || !verifiedBodyPart) return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)

    return res.render('pages/distinguishingMarks/addNewDistinguishingMarkDetail', {
      markType,
      bodyPart: verifiedBodyPart,
    })
  }

  public async postNewDistinguishingMarkWithDetail(req: Request, res: Response) {
    const { markType, prisonerNumber } = req.params
    const { specificBodyPart, action } = req.body
    const { clientToken } = req.middleware
    const files = req.files as MulterFiles

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)

    await this.distinguishingMarksService.postNewDistinguishingMark(
      clientToken,
      prisonerNumber,
      verifiedMarkType,
      specificBodyPart as AllBodyPartSelection,
      req.body[`description-${specificBodyPart}`],
      files[`file-${specificBodyPart}`]?.[0],
    )

    return action === 'returnToProfile'
      ? res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)
      : res.redirect(`/prisoner/${prisonerNumber}/personal/${markType}`)
  }

  public async changeDistinguishingMark(req: Request, res: Response) {
    const { clientToken } = req.middleware
    const { markId, markType } = req.params

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, markId)
    const latestPhotoId = mark.photographUuids?.find(photo => photo.latest)?.id || mark.photographUuids[0]?.id
    const photoHtml = mark.photographUuids?.length
      ? `<img src="/api/prison-person-image/${latestPhotoId}" alt="Image of ${mark.markType.description} on ${getBodyPartDescription(mark)}" width="350px" />`
      : 'Not entered'
    return res.render('pages/distinguishingMarks/changeDistinguishingMark', {
      markType,
      mark,
      photoHtml,
    })
  }

  public async changeBodyPart(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const { clientToken } = req.middleware

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, markId)

    const selected = (req.query.selected as string) || getBodyPartToken(mark)

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    const verifiedSelection = bodyPartSelections.find(selection => selection === bodyPartMap[selected])

    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)

    return res.render('pages/distinguishingMarks/changeBodyPart', {
      markType,
      selected,
      verifiedSelection,
    })
  }

  public async updateBodyPart(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const { bodyPart, initialBodyPart } = req.body
    const { clientToken } = req.middleware
    const bodyPartChanged = bodyPartMap[bodyPart] !== initialBodyPart

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)

    if (bodyPartChanged) {
      await this.distinguishingMarksService.updateDistinguishingMarkLocation(
        clientToken,
        prisonerNumber,
        markId,
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

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, markId)

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    const verifiedBodyPart = bodyPartSelections.find(selection => selection === bodyPartMap[bodyPart])
    const specificBodyPart = findBodyPartByIdAndSide(mark.bodyPart.id, mark.side?.id)

    if (!verifiedMarkType || !verifiedBodyPart) return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)

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
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)

    await this.distinguishingMarksService.updateDistinguishingMarkLocation(
      clientToken,
      prisonerNumber,
      markId,
      verifiedMarkType,
      specificBodyPart as AllBodyPartSelection,
    )

    return res.redirect(`/prisoner/${prisonerNumber}/personal/${markType}/${markId}`)
  }

  public async changeDescription(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const { clientToken } = req.middleware

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, markId)

    const verifiedMarkType = markTypeSelections.find(type => type === markType)

    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)

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
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)

    await this.distinguishingMarksService.updateDistinguishingMarkDescription(
      clientToken,
      prisonerNumber,
      markId,
      verifiedMarkType,
      description,
    )

    return res.redirect(`/prisoner/${prisonerNumber}/personal/${markType}/${markId}`)
  }

  public async changePhoto(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const { clientToken } = req.middleware
    const upload = req.query.upload !== undefined

    const mark = await this.distinguishingMarksService.getDistinguishingMark(clientToken, markId)

    const verifiedMarkType = markTypeSelections.find(type => type === markType)

    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)

    const latestPhotoId = mark.photographUuids?.find(photo => photo.latest)?.id || mark.photographUuids[0]?.id
    const photoHtml = mark.photographUuids?.length
      ? `<img src="/api/prison-person-image/${latestPhotoId}" alt="Image of ${mark.markType.description} on ${getBodyPartDescription(mark)}" width="150px" />`
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

  public async updatePhoto(req: Request, res: Response) {
    const { markId, markType, prisonerNumber } = req.params
    const { clientToken } = req.middleware
    const file = req.file as MulterFile

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)

    await this.distinguishingMarksService.addDistinguishingMarkPhoto(clientToken, markId, file)

    return res.redirect(`/prisoner/${prisonerNumber}/personal/${markType}/${markId}`)
  }
}
