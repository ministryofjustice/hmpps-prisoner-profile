import { Request, Response } from 'express'
import DistinguishingMarksService from '../services/distinguishingMarksService'
import { bodyPartSelections, markTypeSelections } from './interfaces/distinguishingMarks/selectionTypes'

export default class DistinguishingMarksController {
  constructor(private readonly distinguishingMarksService: DistinguishingMarksService) {
    this.newDistinguishingMark = this.newDistinguishingMark.bind(this)
    this.postNewDistinguishingMark = this.postNewDistinguishingMark.bind(this)
  }

  public newDistinguishingMark(req: Request, res: Response) {
    const { markType, prisonerNumber } = req.params
    const { selected } = req.query

    const verifiedMarkType = markTypeSelections.find(type => type === markType)
    const verifiedSelection = bodyPartSelections.find(selection => selection === selected)

    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)

    return res.render('pages/distinguishingMarks/addNewDistinguishingMark', {
      markType,
      selected: verifiedSelection,
    })
  }

  public async postNewDistinguishingMark(req: Request, res: Response) {
    const { markType, prisonerNumber } = req.params
    const { bodyPart } = req.body
    const { clientToken } = req.middleware

    const verifiedSelection = bodyPartSelections.find(selection => selection === bodyPart)
    const verifiedMarkType = markTypeSelections.find(type => type === markType)

    if (!verifiedMarkType) return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)
    if (!verifiedSelection) {
      // TODO validation flow
      throw new Error('Unacceptable selection')
    }

    await this.distinguishingMarksService.postNewDistinguishingMark(
      clientToken,
      prisonerNumber,
      verifiedMarkType,
      verifiedSelection,
    )

    return res.redirect(`/prisoner/${prisonerNumber}/personal#appearance`)
  }
}
