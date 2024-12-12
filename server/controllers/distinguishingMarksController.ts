import { Request, Response } from 'express'
import DistinguishingMarksService from '../services/distinguishingMarksService'
import {
  AllBodyPartSelection,
  bodyPartMap,
  BodyPartSelection,
  bodyPartSelections,
  markTypeSelections,
} from './interfaces/distinguishingMarks/selectionTypes'
import MulterFile from './interfaces/MulterFile'
import { getBodyPartDescription } from '../views/dataUtils/groupDistinguishingMarksForView'

interface MulterFiles {
  [fieldname: string]: MulterFile[]
}

export default class DistinguishingMarksController {
  constructor(private readonly distinguishingMarksService: DistinguishingMarksService) {
    this.newDistinguishingMark = this.newDistinguishingMark.bind(this)
    this.postNewDistinguishingMark = this.postNewDistinguishingMark.bind(this)
    this.postNewDistinguishingMarkWithDetail = this.postNewDistinguishingMarkWithDetail.bind(this)
    this.changeDistinguishingMark = this.changeDistinguishingMark.bind(this)
  }

  public newDistinguishingMark(req: Request, res: Response) {
    const { markType, prisonerNumber } = req.params
    const selected = req.query.selected as string

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    const verifiedSelection = bodyPartSelections.find(selection => selection === bodyPartMap[selected])

    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)

    return res.render('pages/distinguishingMarks/addNewDistinguishingMark', {
      markType,
      selected: verifiedSelection,
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
}
