import { compareDesc } from 'date-fns'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { formatDateTime } from '../utils/dateHelpers'

export default class PhotoService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  async getImageDetail(prisonerPhotoId: number, clientToken: string) {
    const prisonApiClient = this.prisonApiClientBuilder(clientToken)
    return prisonApiClient.getImageDetail(prisonerPhotoId)
  }

  async getAllFacialPhotos(prisonerNumber: string, mainPrisonerPhotoId: number, clientToken: string) {
    const prisonApiClient = this.prisonApiClientBuilder(clientToken)
    const images = await prisonApiClient.getImagesForPrisoner(prisonerNumber)
    return images
      .filter(i => i.imageView === 'FACE')
      .sort((a, b) => compareDesc(new Date(a.captureDateTime), new Date(b.captureDateTime)))
      .map(({ captureDateTime, imageId }) => ({
        main: imageId === mainPrisonerPhotoId,
        imageId,
        uploadedDateTime: formatDateTime(captureDateTime, 'long'),
      }))
  }
}
