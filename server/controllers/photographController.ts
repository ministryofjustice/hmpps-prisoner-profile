import { NextFunction, Request, Response } from 'express'
import { PrisonUser } from '../interfaces/HmppsUser'
import DocumentService from '../services/documentService'

export default class PhotographController {
  constructor(private readonly documentService: DocumentService) {
    this.displayUploadPage = this.displayUploadPage.bind(this)
    this.displayEditPage = this.displayEditPage.bind(this)
    this.submitPhotograph = this.submitPhotograph.bind(this)
    this.getPhotoFile = this.getPhotoFile.bind(this)
    this.getAllPhotosForPrisoner = this.getAllPhotosForPrisoner.bind(this)
  }

  displayUploadPage(req: Request, res: Response, next: NextFunction) {
    res.render('pages/edit/photograph/photoUpload')
  }

  displayEditPage(req: Request, res: Response, next: NextFunction) {
    res.render('pages/edit/photograph/photo', {
      imgSrc: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      prisonerNumber: req.middleware.prisonerData.prisonerNumber,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
    })
  }

  async submitPhotograph(req: Request, res: Response, next: NextFunction) {
    const user = res.locals.user as PrisonUser
    const { prisonerNumber } = req.middleware.prisonerData

    await this.documentService.putProfilePhoto(
      req.middleware.clientToken,
      req.file.buffer,
      { prisonerNumber: req.middleware.prisonerData.prisonerNumber },
      user,
    )

    res.redirect(`/prisoner/${prisonerNumber}/personal/edit/photo/all`)
  }

  async getPhotoFile(req: Request, res: Response, next: NextFunction) {
    const { uuid } = req.params
    const photo = await this.documentService.getPhoto(req.middleware.clientToken, uuid, res.locals.user as PrisonUser)
    res.send(photo)
  }

  async getAllPhotosForPrisoner(req: Request, res: Response, next: NextFunction) {
    const { prisonerNumber } = req.middleware.prisonerData

    const photos = await this.documentService.getAllPhotosForPrisoner(
      req.middleware.clientToken,
      prisonerNumber,
      res.locals.user as PrisonUser,
    )

    res.render('pages/edit/photograph/photos', { photos })
  }
}
