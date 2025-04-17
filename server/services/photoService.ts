import { compareDesc } from 'date-fns'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { formatDateTime } from '../utils/dateHelpers'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { AlertSummaryData } from '../data/interfaces/alertsApi/Alert'
import InmateDetail from '../data/interfaces/prisonApi/InmateDetail'
import { withheldPhotoCategoryCodes } from '../utils/utils'

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

  getPhotoStatus(
    prisonerData: Prisoner,
    inmateDetail: InmateDetail,
    alertSummaryData: AlertSummaryData,
  ): { withheld: boolean; placeholder: boolean } {
    // If we can't determine whether or not the photo is withhheld we should return the placeholder for safety
    if (alertSummaryData.apiUnavailable) {
      return { withheld: false, placeholder: true }
    }

    return {
      withheld:
        withheldPhotoCategoryCodes.includes(prisonerData.category) || alertSummaryData.highPublicInterestPrisoner,
      placeholder: !inmateDetail.facialImageId,
    }
  }
}
