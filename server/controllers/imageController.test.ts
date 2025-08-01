import { Readable } from 'stream'
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

describe('ImageController', () => {
  let controller: ImageController
  let auditService: AuditService
  let metricsService: MetricsService
  let personIntegrationApi: PersonIntegrationApiClient
  let prisonerProfileApi: PrisonerProfileApiClient

  const defaultMiddleware = {
    clientToken: 'token',
    prisonerData: {
      firstName: 'First',
      lastName: 'Last',
      cellLocation: '2-3-001',
      prisonerNumber: 'ABC123',
      prisonId: 999,
    },
  }

  const miniBannerData = {
    cellLocation: '2-3-001',
    prisonerName: 'Last, First',
    prisonerNumber: 'ABC123',
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
  })

  describe('newImage', () => {
    describe('get', () => {
      it('Loads the page with the correct information', async () => {
        const request = {
          middleware: defaultMiddleware,
          flash: jest.fn(),
        } as any

        const response = {
          render: jest.fn(),
        } as any

        await controller.updateProfileImage().newImage.get(request, response, () => {})
        expect(response.render).toHaveBeenCalledWith('pages/edit/photo/addNew', {
          miniBannerData,
          pageTitle: 'Add a new facial image',
          prisonerNumber: 'ABC123',
        })
      })

      it('Populates the errors if there are any', async () => {
        const request = {
          middleware: defaultMiddleware,
          flash: jest.fn(s => {
            if (s === 'errors') return ['Error']
            return null
          }),
        } as any

        const response = {
          render: jest.fn(),
        } as any

        await controller.updateProfileImage().newImage.get(request, response, () => {})
        expect(response.locals.errors).toEqual(['Error'])
      })

      it('Populates the request if there is any', async () => {
        const request = {
          middleware: defaultMiddleware,
          flash: jest.fn(s => {
            if (s === 'requestBody') return [JSON.stringify({ value: 'Example' })]
            return null
          }),
        } as any

        const response = {
          render: jest.fn(),
        } as any

        await controller.updateProfileImage().newImage.get(request, response, () => {})
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
        } as any

        const response = {
          render: jest.fn(),
        } as any

        await controller.updateProfileImage().newImage.post(request, response, () => {})

        expect(response.render).toHaveBeenCalledWith('pages/edit/photo/editPhoto', {
          fileName: 'A name dot jpeg.jpeg',
          fileType: 'image/jpeg',
          imgSrc: 'data:image/jpeg;base64,VG90YWxseSBhIGZpbGU=',
          miniBannerData,
          prisonerNumber: 'ABC123',
        })
      })

      it('Withheld: Redirects the users', async () => {
        const request = {
          middleware: defaultMiddleware,
          body: { photoType: 'withheld' },
          flash: jest.fn(),
        } as any

        const response = {
          render: jest.fn(),
          redirect: jest.fn(),
        } as any

        await controller.updateProfileImage().newImage.post(request, response, () => {})

        expect(response.redirect).toHaveBeenCalledWith('/prisoner/ABC123/image/new-withheld')
      })

      it('Withheld: Redirects with referer', async () => {
        const request = {
          middleware: defaultMiddleware,
          body: { photoType: 'withheld' },
          query: { referer: 'case-notes' },
          flash: jest.fn(),
        } as any

        const response = {
          render: jest.fn(),
          redirect: jest.fn(),
        } as any

        await controller.updateProfileImage().newImage.post(request, response, () => {})

        expect(response.redirect).toHaveBeenCalledWith('/prisoner/ABC123/image/new-withheld?referer=case-notes')
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
      } as any

      const response = {
        locals: { user: {} },
        redirect: jest.fn(),
      } as any

      await controller.updateProfileImage().submitImage(request, response, () => {})
      expect(personIntegrationApi.updateProfileImage).toHaveBeenCalledWith('ABC123', file)
    })

    it('Populates the flash and redirects', async () => {
      const request = {
        body: { photoType: 'new' },
        file,
        flash: jest.fn(),
        middleware: defaultMiddleware,
      } as any

      const response = {
        locals: { user: {} },
        redirect: jest.fn(),
      } as any

      await controller.updateProfileImage().submitImage(request, response, () => {})
      expect(request.flash).toHaveBeenCalledWith('flashMessage', {
        text: 'Profile image updated',
        type: FlashMessageType.success,
      })
      expect(response.redirect).toHaveBeenCalledWith('/prisoner/ABC123/image')
    })

    it('Redirects with referer', async () => {
      const request = {
        body: { photoType: 'new' },
        query: { referer: 'case-notes' },
        file,
        flash: jest.fn(),
        middleware: defaultMiddleware,
      } as any

      const response = {
        locals: { user: {} },
        redirect: jest.fn(),
      } as any

      await controller.updateProfileImage().submitImage(request, response, () => {})
      expect(response.redirect).toHaveBeenCalledWith('/prisoner/ABC123/image?referer=case-notes')
    })

    it('Records that the image was updated', async () => {
      const request = {
        body: { photoType: 'new' },
        file,
        flash: jest.fn(),
        middleware: defaultMiddleware,
      } as any

      const response = {
        locals: { user: {} },
        redirect: jest.fn(),
      } as any

      await controller.updateProfileImage().submitImage(request, response, () => {})
      expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
        user: expect.anything(),
        fieldsUpdated: ['profile-image'],
        prisonerNumber: 'ABC123',
      })
    })
  })

  describe('newWithheldImage', () => {
    describe('get', () => {
      it('Loads the page with the correct information', async () => {
        const request = {
          middleware: defaultMiddleware,
          flash: jest.fn(),
        } as any

        const response = {
          render: jest.fn(),
        } as any

        await controller.updateProfileImage().newWithheldImage.get(request, response, () => {})
        expect(response.render).toHaveBeenCalledWith('pages/edit/photo/addWithheld', {
          miniBannerData,
          pageTitle: 'Confirm facial image',
          fileName: 'prisoner-profile-withheld-image.png',
          fileType: 'image/png',
          imgSrc: 'data:image/png;base64,VG90YWxseSBhIGZpbGUgc3RyZWFt',
          prisonerNumber: 'ABC123',
        })
      })

      it('Populates the errors if there are any', async () => {
        const request = {
          middleware: defaultMiddleware,
          flash: jest.fn(s => {
            if (s === 'errors') return ['Error']
            return null
          }),
        } as any

        const response = {
          render: jest.fn(),
        } as any

        await controller.updateProfileImage().newWithheldImage.get(request, response, () => {})
        expect(response.locals.errors).toEqual(['Error'])
      })

      it('Populates the request if there is any', async () => {
        const request = {
          middleware: defaultMiddleware,
          flash: jest.fn(s => {
            if (s === 'requestBody') return [JSON.stringify({ value: 'Example' })]
            return null
          }),
        } as any

        const response = {
          render: jest.fn(),
        } as any

        await controller.updateProfileImage().newWithheldImage.get(request, response, () => {})
        expect(response.locals.formValues).toEqual({ value: 'Example' })
      })
    })

    describe('Post', () => {
      it('Updates the image on the API', async () => {
        const request = {
          flash: jest.fn(),
          middleware: defaultMiddleware,
        } as any

        const response = {
          locals: { user: {} },
          redirect: jest.fn(),
        } as any

        await controller.updateProfileImage().newWithheldImage.post(request, response, () => {})
        expect(personIntegrationApi.updateProfileImage).toHaveBeenCalledWith('ABC123', withheldFile)
      })

      it('Populates the flash and redirects', async () => {
        const request = {
          body: { photoType: 'new' },
          file,
          flash: jest.fn(),
          middleware: defaultMiddleware,
        } as any

        const response = {
          locals: { user: {} },
          redirect: jest.fn(),
        } as any

        await controller.updateProfileImage().newWithheldImage.post(request, response, () => {})
        expect(request.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Profile image updated',
          type: FlashMessageType.success,
        })
        expect(response.redirect).toHaveBeenCalledWith('/prisoner/ABC123/image')
      })

      it('Redirects with referer', async () => {
        const request = {
          body: { photoType: 'new' },
          query: { referer: 'case-notes' },
          file,
          flash: jest.fn(),
          middleware: defaultMiddleware,
        } as any

        const response = {
          locals: { user: {} },
          redirect: jest.fn(),
        } as any

        await controller.updateProfileImage().newWithheldImage.post(request, response, () => {})
        expect(response.redirect).toHaveBeenCalledWith('/prisoner/ABC123/image?referer=case-notes')
      })

      it('Records that the image was updated', async () => {
        const request = {
          body: { photoType: 'new' },
          file,
          flash: jest.fn(),
          middleware: defaultMiddleware,
        } as any

        const response = {
          locals: { user: {} },
          redirect: jest.fn(),
        } as any

        await controller.updateProfileImage().newWithheldImage.post(request, response, () => {})
        expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
          user: expect.anything(),
          fieldsUpdated: ['withheld-profile-image'],
          prisonerNumber: 'ABC123',
        })
      })
    })
  })
})
