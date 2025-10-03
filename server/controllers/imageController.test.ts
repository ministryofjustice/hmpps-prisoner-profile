import { Readable } from 'stream'
import { Request, Response } from 'express'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { personIntegrationApiClientMock } from '../../tests/mocks/personIntegrationApiClientMock'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { PersonIntegrationApiClient } from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { PrisonerProfileApiClient } from '../data/prisonerProfileApiClient'
import { AuditService } from '../services/auditService'
import ImageController from './imageController'
import MulterFile from './interfaces/MulterFile'
import MetricsService from '../services/metrics/metricsService'
import { metricsServiceMock } from '../../tests/mocks/metricsServiceMock'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { Role } from '../data/enums/role'

describe('ImageController', () => {
  let controller: ImageController
  let auditService: AuditService
  let metricsService: MetricsService
  let personIntegrationApi: PersonIntegrationApiClient
  let prisonerProfileApi: PrisonerProfileApiClient
  let response: Response

  const defaultMiddleware = {
    clientToken: 'token',
    prisonerData: {
      firstName: 'First',
      lastName: 'Last',
      cellLocation: '2-3-001',
      prisonerNumber: 'A1234BC',
      prisonId: 999,
    },
    inmateDetail: inmateDetailMock,
  }

  const miniBannerData = {
    cellLocation: '2-3-001',
    prisonerName: 'Last, First',
    prisonerNumber: 'A1234BC',
    prisonerThumbnailImageUrl: '/api/prisoner/A1234BC/image?imageId=1413311&fullSizeImage=false',
  }

  const file = {
    buffer: Buffer.from('Totally a file'),
    originalname: 'A name dot jpeg.jpeg',
    mimetype: 'image/jpeg',
  } as MulterFile

  const fileStream = () => {
    const s = new Readable()
    s.push('Totally a file stream')
    s.push(null)
    return s
  }

  const withheldFile = {
    buffer: Buffer.from(fileStream().read()),
    originalname: 'prisoner-profile-withheld-image.png',
    mimetype: 'image/png',
  }

  beforeEach(() => {
    auditService = auditServiceMock()
    metricsService = metricsServiceMock()
    personIntegrationApi = personIntegrationApiClientMock()
    prisonerProfileApi = {
      getWithheldPrisonerPhoto: jest.fn(async () => fileStream()),
    }
    controller = new ImageController(
      () => personIntegrationApi,
      () => prisonerProfileApi,
      auditService,
      metricsService,
    )
    response = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: { userRoles: [] },
        prisonerNumber: 'A1234BC',
        prisonerName: {
          firstLast: 'First Last',
          lastCommaFirst: 'Last, First',
          full: 'First Last',
        },
        prisonId: 999,
      },
    } as unknown as Response
  })

  describe('newImage', () => {
    describe('get', () => {
      it('Loads the page with the correct information', async () => {
        const request = {
          middleware: defaultMiddleware,
          flash: jest.fn(),
        } as unknown as Request

        await controller.updateProfileImage().newImage.get(request, response)
        expect(response.render).toHaveBeenCalledWith('pages/edit/photo/addNew', {
          isDpsAppDeveloper: false,
          miniBannerData,
          pageTitle: 'Add a new facial image',
        })
      })

      it('DPS App Developer: Loads the page with the correct information', async () => {
        const request = {
          middleware: defaultMiddleware,
          flash: jest.fn(),
        } as unknown as Request

        await controller.updateProfileImage().newImage.get(request, {
          ...response,
          locals: {
            user: { userRoles: [Role.DpsApplicationDeveloper] },
            prisonerNumber: 'A1234BC',
            prisonerName: {
              firstLast: 'First Last',
              lastCommaFirst: 'Last, First',
              full: 'First Last',
            },
            prisonId: 999,
          },
        } as unknown as Response)
        expect(response.render).toHaveBeenCalledWith('pages/edit/photo/addNew', {
          isDpsAppDeveloper: true,
          miniBannerData,
          pageTitle: 'Add a new facial image',
        })
      })

      it('Populates the errors if there are any', async () => {
        const request = {
          middleware: defaultMiddleware,
          flash: jest.fn(s => {
            if (s === 'errors') return ['Error']
            return null
          }),
        } as unknown as Request

        await controller.updateProfileImage().newImage.get(request, response)
        expect(response.locals.errors).toEqual(['Error'])
      })

      it('Populates the request if there is any', async () => {
        const request = {
          middleware: defaultMiddleware,
          flash: jest.fn(s => {
            if (s === 'requestBody') return [JSON.stringify({ value: 'Example' })]
            return null
          }),
        } as unknown as Request

        await controller.updateProfileImage().newImage.get(request, response)
        expect(response.locals.formValues).toEqual({ value: 'Example' })
      })
    })

    describe('Post', () => {
      it('Non-withheld: Loads the page with the correct information', async () => {
        const request = {
          middleware: defaultMiddleware,
          body: { photoType: 'new' },
          flash: jest.fn(),
          file,
        } as unknown as Request

        await controller.updateProfileImage().newImage.post(request, response)

        const imgSrc = 'data:image/jpeg;base64,VG90YWxseSBhIGZpbGU='

        expect(response.render).toHaveBeenCalledWith('pages/edit/photo/editPhoto', {
          fileName: 'A name dot jpeg.jpeg',
          fileType: 'image/jpeg',
          imgSrc,
          originalImgSrc: imgSrc,
          miniBannerData,
          photoType: 'upload',
        })
      })

      it('Withheld: Redirects the users', async () => {
        const request = {
          middleware: defaultMiddleware,
          body: { photoType: 'withheld' },
          flash: jest.fn(),
        } as unknown as Request

        await controller.updateProfileImage().newImage.post(request, response)

        expect(response.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/image/new-withheld')
      })

      it('Withheld: Redirects with referer', async () => {
        const request = {
          middleware: defaultMiddleware,
          body: { photoType: 'withheld' },
          query: { referer: 'case-notes' },
          flash: jest.fn(),
        } as unknown as Request

        await controller.updateProfileImage().newImage.post(request, response)

        expect(response.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/image/new-withheld?referer=case-notes')
      })

      it('Webcam: Redirects the users', async () => {
        const request = {
          middleware: defaultMiddleware,
          body: { photoType: 'webcam' },
          flash: jest.fn(),
        } as unknown as Request

        await controller.updateProfileImage().newImage.post(request, response)

        expect(response.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/image/webcam')
      })

      it('Webcam: Redirects with referer', async () => {
        const request = {
          middleware: defaultMiddleware,
          body: { photoType: 'webcam' },
          query: { referer: 'case-notes' },
          flash: jest.fn(),
        } as unknown as Request

        await controller.updateProfileImage().newImage.post(request, response)

        expect(response.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/image/webcam?referer=case-notes')
      })
    })
  })

  describe('Submit image', () => {
    it('Updates the image on the API', async () => {
      const request = {
        body: { photoType: 'new' },
        file,
        flash: jest.fn(),
        middleware: defaultMiddleware,
      } as unknown as Request

      await controller.updateProfileImage().submitImage(request, response)
      expect(personIntegrationApi.updateProfileImage).toHaveBeenCalledWith('A1234BC', file)
    })

    it('Populates the flash and redirects', async () => {
      const request = {
        body: { photoType: 'new' },
        file,
        flash: jest.fn(),
        middleware: defaultMiddleware,
      } as unknown as Request

      await controller.updateProfileImage().submitImage(request, response)
      expect(request.flash).toHaveBeenCalledWith('flashMessage', {
        text: 'Profile image updated',
        type: FlashMessageType.success,
      })
      expect(response.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/image')
    })

    it('Redirects with referer', async () => {
      const request = {
        body: { photoType: 'new' },
        query: { referer: 'case-notes' },
        file,
        flash: jest.fn(),
        middleware: defaultMiddleware,
      } as unknown as Request

      await controller.updateProfileImage().submitImage(request, response)
      expect(response.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/image?referer=case-notes')
    })

    it('Records that the image was updated', async () => {
      const request = {
        body: { photoType: 'new' },
        file,
        flash: jest.fn(),
        middleware: defaultMiddleware,
      } as unknown as Request

      await controller.updateProfileImage().submitImage(request, response)
      expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
        user: expect.anything(),
        fieldsUpdated: ['profile-image'],
        prisonerNumber: 'A1234BC',
        additionalProperties: {
          photoType: 'new',
        },
      })
    })

    it('Re-renders the page with an error message if the update throws an error', async () => {
      personIntegrationApi.updateProfileImage = jest.fn().mockRejectedValue(null)
      const request = {
        body: { photoType: 'new' },
        file,
        query: { referer: 'personal' },
        flash: jest.fn(),
        middleware: defaultMiddleware,
      } as unknown as Request

      await controller.updateProfileImage().submitImage(request, response)
      expect(metricsService.trackPersonIntegrationUpdate).not.toHaveBeenCalled()
      expect(response.render).toHaveBeenCalledWith(
        'pages/edit/photo/editPhoto',
        expect.objectContaining({
          errors: [
            {
              html: expect.stringContaining(
                '<p>There was an issue saving the photo. Your internet connection might be slow or there might be a problem with the file.</p>',
              ),
            },
          ],
        }),
      )
    })
  })

  describe('newWithheldImage', () => {
    describe('get', () => {
      it('Loads the page with the correct information', async () => {
        const request = {
          middleware: defaultMiddleware,
          flash: jest.fn(),
        } as unknown as Request

        await controller.updateProfileImage().newWithheldImage.get(request, response)
        expect(response.render).toHaveBeenCalledWith('pages/edit/photo/addWithheld', {
          miniBannerData,
          pageTitle: 'Confirm facial image',
          fileName: 'prisoner-profile-withheld-image.png',
          fileType: 'image/png',
          imgSrc: 'data:image/png;base64,VG90YWxseSBhIGZpbGUgc3RyZWFt',
        })
      })

      it('Populates the errors if there are any', async () => {
        const request = {
          middleware: defaultMiddleware,
          flash: jest.fn(s => {
            if (s === 'errors') return ['Error']
            return null
          }),
        } as unknown as Request

        await controller.updateProfileImage().newWithheldImage.get(request, response)
        expect(response.locals.errors).toEqual(['Error'])
      })

      it('Populates the request if there is any', async () => {
        const request = {
          middleware: defaultMiddleware,
          flash: jest.fn(s => {
            if (s === 'requestBody') return [JSON.stringify({ value: 'Example' })]
            return null
          }),
        } as unknown as Request

        await controller.updateProfileImage().newWithheldImage.get(request, response)
        expect(response.locals.formValues).toEqual({ value: 'Example' })
      })
    })

    describe('Post', () => {
      it('Updates the image on the API', async () => {
        const request = {
          flash: jest.fn(),
          middleware: defaultMiddleware,
        } as unknown as Request

        await controller.updateProfileImage().newWithheldImage.post(request, response)
        expect(personIntegrationApi.updateProfileImage).toHaveBeenCalledWith('A1234BC', withheldFile)
      })

      it('Populates the flash and redirects', async () => {
        const request = {
          body: { photoType: 'new' },
          file,
          flash: jest.fn(),
          middleware: defaultMiddleware,
        } as unknown as Request

        await controller.updateProfileImage().newWithheldImage.post(request, response)
        expect(request.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Profile image updated',
          type: FlashMessageType.success,
        })
        expect(response.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/image')
      })

      it('Redirects with referer', async () => {
        const request = {
          body: { photoType: 'new' },
          query: { referer: 'case-notes' },
          file,
          flash: jest.fn(),
          middleware: defaultMiddleware,
        } as unknown as Request

        await controller.updateProfileImage().newWithheldImage.post(request, response)
        expect(response.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/image?referer=case-notes')
      })

      it('Records that the image was updated', async () => {
        const request = {
          body: { photoType: 'new' },
          file,
          flash: jest.fn(),
          middleware: defaultMiddleware,
        } as unknown as Request

        await controller.updateProfileImage().newWithheldImage.post(request, response)
        expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
          user: expect.anything(),
          fieldsUpdated: ['withheld-profile-image'],
          prisonerNumber: 'A1234BC',
        })
      })

      it('Redirects if the update throws an error', async () => {
        personIntegrationApi.updateProfileImage = jest.fn().mockRejectedValue(null)
        const request = {
          body: { photoType: 'new' },
          file,
          query: { referer: 'personal' },
          flash: jest.fn(),
          middleware: defaultMiddleware,
        } as unknown as Request

        await controller.updateProfileImage().newWithheldImage.post(request, response)
        expect(metricsService.trackPersonIntegrationUpdate).not.toHaveBeenCalled()
        expect(request.flash).toHaveBeenCalledWith('errors', [
          {
            html: expect.stringContaining(
              '<p>There was an issue saving the photo. Your internet connection might be slow or there might be a problem with the file.</p>',
            ),
          },
        ])
        expect(response.redirect).toHaveBeenCalledWith('/prisoner/A1234BC/image/new-withheld?referer=personal')
      })
    })
  })

  describe('webcamImage', () => {
    describe('get', () => {
      it('Loads the page with the correct information', async () => {
        const request = {
          middleware: defaultMiddleware,
          flash: jest.fn(),
          file,
        } as unknown as Request

        await controller.updateProfileImage().webcamImage.get(request, response)

        expect(response.render).toHaveBeenCalledWith('pages/edit/photo/addWebcam', {
          pageTitle: expect.anything(),
          miniBannerData,
        })
      })
    })

    describe('post', () => {
      it('Loads the page with the correct information', async () => {
        const request = {
          middleware: defaultMiddleware,
          flash: jest.fn(),
          file,
        } as unknown as Request

        await controller.updateProfileImage().webcamImage.post(request, response)

        const imgSrc = 'data:image/jpeg;base64,VG90YWxseSBhIGZpbGU='

        expect(response.render).toHaveBeenCalledWith('pages/edit/photo/editPhoto', {
          pageTitle: expect.anything(),
          photoType: 'webcam',
          webcamImage: true,
          fileName: 'A name dot jpeg.jpeg',
          fileType: 'image/jpeg',
          imgSrc,
          originalImgSrc: imgSrc,
          miniBannerData,
        })
      })
    })
  })
})
