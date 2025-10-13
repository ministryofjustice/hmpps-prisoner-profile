import { Request, Response } from 'express'
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

const photoErrorHtml = (backLinkHref: string) => `
<p>There was an issue saving the photo. Your internet connection might be slow or there might be a problem with the file.</p>
<a class="govuk-link--no-visited-state photo-upload-error__back-link" href="${backLinkHref}">Go back to the previous page and try uploading the file again</a><br /><br />
<details class="govuk-details">
  <summary class="govuk-details__summary">
    <span class="govuk-details__summary-text">
      If you've tried to upload the file more than once
    </span>
  </summary>
  <div class="govuk-details__text">
    <p>
      Try to open the file on your computer. If it does not open, it may be corrupt and you will not be able to upload it. You'll need to take a new photo.<br /><br />
      If there's an issue with your connection, you may need to cancel and try again later.
    </p>
  </div>
</details>`

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
        get: async (req: Request, res: Response) => {
          const { miniBannerData } = getCommonRequestData(req, res)
          const requestBodyFlash = requestBodyFromFlash<{ photoType?: string }>(req)
          const photoType = requestBodyFlash?.photoType
          res.locals = { ...res.locals, errors: req.flash('errors'), formValues: requestBodyFromFlash(req) }

          return res.render('pages/edit/photo/addNew', {
            pageTitle: 'Add a new facial image',
            miniBannerData,
            photoType,
          })
        },

        post: async (req: Request, res: Response) => {
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
          const imgSrc = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
          return res.render('pages/edit/photo/editPhoto', {
            miniBannerData,
            photoType: 'upload',
            imgSrc,
            originalImgSrc: imgSrc,
            fileName: file.originalname,
            fileType: file.mimetype,
          })
        },
      },

      webcamImage: {
        get: async (req: Request, res: Response) => {
          const { miniBannerData } = getCommonRequestData(req, res)
          res.locals = { ...res.locals, errors: req.flash('errors'), formValues: requestBodyFromFlash(req) }

          return res.render('pages/edit/photo/addWebcam', {
            pageTitle: 'Take a photo with a webcam',
            miniBannerData,
          })
        },

        post: async (req: Request, res: Response) => {
          const { miniBannerData } = getCommonRequestData(req, res)

          const file = req.file as MulterFile
          const imgSrc = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
          return res.render('pages/edit/photo/editPhoto', {
            pageTitle: 'Confirm facial image taken by webcam',
            miniBannerData,
            webcamImage: true,
            photoType: 'webcam',
            imgSrc,
            originalImgSrc: imgSrc,
            fileName: file.originalname,
            fileType: file.mimetype,
          })
        },
      },

      submitImage: async (req: Request, res: Response) => {
        const { clientToken, prisonerNumber, miniBannerData } = getCommonRequestData(req, res)
        const file = req.file as MulterFile
        const { photoType } = req.body

        try {
          await this.personIntegrationApiClientBuilder(clientToken).updateProfileImage(
            prisonerNumber,
            file,
            photoType === 'webcam' ? 'DPS_WEBCAM' : 'GEN',
          )
        } catch (error) {
          logger.error(error)
          const { originalImgSrc } = req.body
          const imgSrc = originalImgSrc || `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
          return res.render('pages/edit/photo/editPhoto', {
            miniBannerData,
            photoType,
            webcamImage: photoType === 'webcam',
            imgSrc,
            originalImgSrc,
            fileName: file.originalname,
            fileType: file.mimetype,
            errors: [{ html: photoErrorHtml(`/prisoner/${prisonerNumber}/image/new`) }],
          })
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

        this.metricsService.trackPersonIntegrationUpdate<{ photoType: string }>({
          prisonerNumber,
          fieldsUpdated: ['profile-image'],
          user: res.locals.user as PrisonUser,
          additionalProperties: {
            photoType,
          },
        })

        return res.redirect(
          `/prisoner/${prisonerNumber}/image${req.query?.referer ? `?referer=${req.query.referer}` : ''}`,
        )
      },

      newWithheldImage: {
        get: async (req: Request, res: Response) => {
          const { clientToken, miniBannerData } = getCommonRequestData(req, res)
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
            imgSrc: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            fileName: file.originalname,
            fileType: file.mimetype,
          })
        },

        post: async (req: Request, res: Response) => {
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
            await this.personIntegrationApiClientBuilder(clientToken).updateProfileImage(prisonerNumber, file, 'GEN')
          } catch (error) {
            logger.error(error)
            req.flash('errors', [{ html: photoErrorHtml(`/prisoner/${prisonerNumber}/image/new`) }])
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
