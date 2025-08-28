import { NextFunction, Request, Response } from 'express'
import { RestClientBuilder } from '../data'
import { PersonIntegrationApiClient } from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { AuditService, PostAction } from '../services/auditService'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'
import MulterFile from './interfaces/MulterFile'
import { FlashMessageType } from '../data/enums/flashMessageType'
import logger from '../../logger'
import { PrisonerProfileApiClient } from '../data/prisonerProfileApiClient'
import MetricsService from '../services/metrics/metricsService'
import { PrisonUser } from '../interfaces/HmppsUser'
import getCommonRequestData from '../utils/getCommonRequestData'
import { userHasAllRoles } from '../utils/utils'
import { Role } from '../data/enums/role'

export default class ImageController {
  constructor(
    private readonly personIntegrationApiClientBuilder: RestClientBuilder<PersonIntegrationApiClient>,
    private readonly prisonerProfileApiClientBuilder: RestClientBuilder<PrisonerProfileApiClient>,
    private readonly auditService: AuditService,
    private readonly metricsService: MetricsService,
  ) {}

  public updateProfileImage() {
    return {
      newImage: {
        get: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber, miniBannerData } = getCommonRequestData(req, res)
          const requestBodyFlash = requestBodyFromFlash<{ photoType?: string }>(req)
          const photoType = requestBodyFlash?.photoType
          res.locals = { ...res.locals, errors: req.flash('errors'), formValues: requestBodyFromFlash(req) }
          const isDpsAppDeveloper = userHasAllRoles([Role.DpsApplicationDeveloper], res.locals.user.userRoles)

          return res.render('pages/edit/photo/addNew', {
            pageTitle: 'Add a new facial image',
            miniBannerData,
            prisonerNumber,
            isDpsAppDeveloper,
            photoType,
          })
        },

        post: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber, miniBannerData } = getCommonRequestData(req, res)

          if (req.body.photoType === 'withheld') {
            return res.redirect(
              `/prisoner/${prisonerNumber}/image/new-withheld${req.query?.referer ? `?referer=${req.query.referer}` : ''}`,
            )
          }

          if (req.body.photoType === 'webcam') {
            return res.redirect(
              `/prisoner/${prisonerNumber}/image/webcam${req.query?.referer ? `?referer=${req.query.referer}` : ''}`,
            )
          }

          const file = req.file as MulterFile
          return res.render('pages/edit/photo/editPhoto', {
            prisonerNumber,
            miniBannerData,
            photoType: 'upload',
            imgSrc: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            fileName: file.originalname,
            fileType: file.mimetype,
          })
        },
      },

      webcamImage: {
        get: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber, miniBannerData } = getCommonRequestData(req, res)
          res.locals = { ...res.locals, errors: req.flash('errors'), formValues: requestBodyFromFlash(req) }

          return res.render('pages/edit/photo/addWebcam', {
            pageTitle: 'Take a photo with a webcam',
            miniBannerData,
            prisonerNumber,
          })
        },

        post: async (req: Request, res: Response, next: NextFunction) => {
          const { prisonerNumber, miniBannerData } = getCommonRequestData(req, res)

          const file = req.file as MulterFile
          return res.render('pages/edit/photo/editPhoto', {
            pageTitle: 'Confirm facial image taken by webcam',
            prisonerNumber,
            miniBannerData,
            webcamImage: true,
            photoType: 'webcam',
            imgSrc: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            fileName: file.originalname,
            fileType: file.mimetype,
          })
        },
      },

      submitImage: async (req: Request, res: Response, next: NextFunction) => {
        const { prisonerData, clientToken } = req.middleware
        const { prisonerNumber } = prisonerData
        const file = req.file as MulterFile

        try {
          await this.personIntegrationApiClientBuilder(clientToken).updateProfileImage(
            prisonerData.prisonerNumber,
            file,
          )
        } catch (_error) {
          req.flash(
            'requestBody',
            JSON.stringify({
              photoType: 'upload',
            }),
          )
          req.flash('errors', [{ text: 'There was an error please try again' }])
          return res.redirect(
            `/prisoner/${prisonerNumber}/image/new${req.query?.referer ? `?referer=${req.query.referer}` : ''}`,
          )
        }

        req.flash('flashMessage', {
          text: `Profile image updated`,
          type: FlashMessageType.success,
        })

        this.auditService
          .sendPostSuccess({
            user: res.locals.user,
            prisonerNumber,
            correlationId: req.id,
            action: PostAction.EditProfileImage,
            details: {},
          })
          .catch(error => logger.error(error))

        this.metricsService.trackPersonIntegrationUpdate({
          prisonerNumber,
          fieldsUpdated: ['profile-image'],
          user: res.locals.user as PrisonUser,
        })

        return res.redirect(
          `/prisoner/${prisonerNumber}/image${req.query?.referer ? `?referer=${req.query.referer}` : ''}`,
        )
      },

      newWithheldImage: {
        get: async (req: Request, res: Response, next: NextFunction) => {
          const { clientToken, prisonerNumber, miniBannerData } = getCommonRequestData(req, res)
          res.locals = { ...res.locals, errors: req.flash('errors'), formValues: requestBodyFromFlash(req) }
          const fileStream = await this.prisonerProfileApiClientBuilder(clientToken).getWithheldPrisonerPhoto()

          const file = {
            buffer: Buffer.from(fileStream.read()),
            originalname: 'prisoner-profile-withheld-image.png',
            mimetype: 'image/png',
          }

          return res.render('pages/edit/photo/addWithheld', {
            pageTitle: 'Confirm facial image',
            miniBannerData,
            prisonerNumber,
            imgSrc: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            fileName: file.originalname,
            fileType: file.mimetype,
          })
        },

        post: async (req: Request, res: Response, next: NextFunction) => {
          const {
            prisonerData: { prisonerNumber },
            clientToken,
          } = req.middleware
          const fileStream = await this.prisonerProfileApiClientBuilder(clientToken).getWithheldPrisonerPhoto()

          const file = {
            buffer: Buffer.from(fileStream.read()),
            originalname: 'prisoner-profile-withheld-image.png',
            mimetype: 'image/png',
          }

          try {
            await this.personIntegrationApiClientBuilder(clientToken).updateProfileImage(prisonerNumber, file)
          } catch (_error) {
            req.flash('errors', [{ text: 'There was an error please try again' }])
            req.flash(
              'requestBody',
              JSON.stringify({
                photoType: 'withheld',
              }),
            )
            return res.redirect(
              `/prisoner/${prisonerNumber}/image/new-withheld${req.query?.referer ? `?referer=${req.query.referer}` : ''}`,
            )
          }

          req.flash('flashMessage', {
            text: `Profile image updated`,
            type: FlashMessageType.success,
          })

          this.auditService
            .sendPostSuccess({
              user: res.locals.user,
              prisonerNumber,
              correlationId: req.id,
              action: PostAction.EditProfileImageWithheld,
              details: {},
            })
            .catch(error => logger.error(error))

          this.metricsService.trackPersonIntegrationUpdate({
            prisonerNumber,
            fieldsUpdated: ['withheld-profile-image'],
            user: res.locals.user as PrisonUser,
          })

          return res.redirect(
            `/prisoner/${prisonerNumber}/image${req.query?.referer ? `?referer=${req.query.referer}` : ''}`,
          )
        },
      },
    }
  }
}
