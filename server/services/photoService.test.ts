import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { AlertSummaryData } from '../data/interfaces/alertsApi/Alert'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { imageDetailListMock, imageDetailMock } from '../data/localMockData/imageMock'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import PhotoService from './photoService'

describe('PhotoService', () => {
  let prisonApiClient: PrisonApiClient
  let service: PhotoService

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    prisonApiClient.getImageDetail = jest.fn(async () => imageDetailMock)
    prisonApiClient.getImagesForPrisoner = jest.fn(async () => imageDetailListMock)
  })

  describe('getImageDetail', () => {
    it('Gets the image detail from the API and returns it', async () => {
      service = new PhotoService(() => prisonApiClient)
      const res = await service.getImageDetail(1234, 'clientToken')
      expect(prisonApiClient.getImageDetail).toHaveBeenCalledWith(1234)
      expect(res).toEqual(imageDetailMock)
    })
  })

  describe('getAllFacialPhotos', () => {
    it('Gets the images detail from the API and returns the facial photos correctly', async () => {
      service = new PhotoService(() => prisonApiClient)
      const res = await service.getAllFacialPhotos('abc123', 1680496, 'clientToken')
      expect(prisonApiClient.getImagesForPrisoner).toHaveBeenCalledWith('abc123')
      expect(res.length).toEqual(10)
      expect(res[0].main).toEqual(true)
      expect(res[0].imageId).toEqual(1680496)
      expect(res[0].uploadedDateTime).toEqual('23 November 2023 at 11:25')

      expect(res[9].main).toEqual(false)
      expect(res[9].imageId).toEqual(452873)
      expect(res[9].uploadedDateTime).toEqual('2 June 2011 at 14:45')
    })
  })

  describe('getPhotoStatus', () => {
    it.each(['A', 'H', 'P'])('Correctly marks the photo as withheld for cat a prisoners (Category code: %s)', code => {
      service = new PhotoService(() => prisonApiClient)
      const alertSummaryData: AlertSummaryData = {
        apiUnavailable: false,
        highPublicInterestPrisoner: false,
      }

      expect(
        service.getPhotoStatus({ ...PrisonerMockDataA, category: code }, inmateDetailMock, alertSummaryData),
      ).toEqual({ withheld: true, placeholder: false })
    })

    it('Correctly marks the photo as withheld for high public interest prisoners', () => {
      service = new PhotoService(() => prisonApiClient)
      const alertSummaryData: AlertSummaryData = {
        apiUnavailable: false,
        highPublicInterestPrisoner: true,
      }

      expect(
        service.getPhotoStatus({ ...PrisonerMockDataA, category: 'B' }, inmateDetailMock, alertSummaryData),
      ).toEqual({ withheld: true, placeholder: false })
    })

    it('Correctly marks the photo as not withheld for non-cat a/non-high public interest prisoners', () => {
      service = new PhotoService(() => prisonApiClient)
      const alertSummaryData: AlertSummaryData = {
        apiUnavailable: false,
        highPublicInterestPrisoner: false,
      }

      expect(
        service.getPhotoStatus({ ...PrisonerMockDataA, category: 'B' }, inmateDetailMock, alertSummaryData),
      ).toEqual({ withheld: false, placeholder: false })
    })

    it('Correctly marks the photo as placeholder for prisoners with a missing photo', () => {
      service = new PhotoService(() => prisonApiClient)
      const alertSummaryData: AlertSummaryData = {
        apiUnavailable: false,
        highPublicInterestPrisoner: false,
      }

      expect(
        service.getPhotoStatus(
          { ...PrisonerMockDataA, category: 'B' },
          { ...inmateDetailMock, facialImageId: undefined },
          alertSummaryData,
        ),
      ).toEqual({ withheld: false, placeholder: true })
    })

    it('Correctly marks the photo as placeholder when the alert api is unavailable', () => {
      service = new PhotoService(() => prisonApiClient)
      const alertSummaryData: AlertSummaryData = {
        apiUnavailable: true,
        highPublicInterestPrisoner: false,
      }

      expect(
        service.getPhotoStatus(
          { ...PrisonerMockDataA, category: 'B' },
          { ...inmateDetailMock, facialImageId: 12345 },
          alertSummaryData,
        ),
      ).toEqual({ withheld: false, placeholder: true })
    })
  })
})
