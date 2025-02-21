import { Readable } from 'stream'
import config from '../config'
import {
  PrisonPerson,
  PrisonPersonApiClient,
  PrisonPersonDistinguishingMark,
  PrisonPersonDistinguishingMarkRequest,
  PrisonPersonHealthUpdate,
} from './interfaces/prisonPersonApi/prisonPersonApiClient'
import RestClient from './restClient'
import MulterFile from '../controllers/interfaces/MulterFile'

export default class PrisonPersonApiRestClient implements PrisonPersonApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison Person API', config.apis.prisonPersonApi, token)
  }

  async updateHealth(prisonerNumber: string, healthData: Partial<PrisonPersonHealthUpdate>): Promise<PrisonPerson> {
    return this.restClient.patch<PrisonPerson>({
      path: `/prisoners/${prisonerNumber}/health`,
      data: healthData,
    })
  }

  async getDistinguishingMarks(prisonerNumber: string): Promise<PrisonPersonDistinguishingMark[]> {
    return this.restClient.get<PrisonPersonDistinguishingMark[]>({
      path: `/distinguishing-marks/prisoner/${prisonerNumber}`,
    })
  }

  postDistinguishingMark(
    distinguishingMarkRequest: PrisonPersonDistinguishingMarkRequest,
    photograph: MulterFile,
  ): Promise<PrisonPersonDistinguishingMark> {
    return this.restClient.postMultipart<PrisonPersonDistinguishingMark>({
      path: '/distinguishing-marks/mark',
      data: distinguishingMarkRequest,
      file: photograph,
    })
  }

  async getDistinguishingMark(markId: string): Promise<PrisonPersonDistinguishingMark> {
    return this.restClient.get<PrisonPersonDistinguishingMark>({
      path: `/distinguishing-marks/mark/${markId}`,
    })
  }

  patchDistinguishingMark(
    distinguishingMarkRequest: PrisonPersonDistinguishingMarkRequest,
  ): Promise<PrisonPersonDistinguishingMark> {
    return this.restClient.patch<PrisonPersonDistinguishingMark>({
      path: `/distinguishing-marks/mark/${distinguishingMarkRequest.markId}`,
      data: distinguishingMarkRequest,
    })
  }

  postDistinguishingMarkPhoto(markId: string, photograph: MulterFile): Promise<PrisonPersonDistinguishingMark> {
    return this.restClient.postMultipart<PrisonPersonDistinguishingMark>({
      path: `/distinguishing-marks/mark/${markId}/photo`,
      file: photograph,
    })
  }

  async getImage(photoUuid: string): Promise<{ stream: Readable; contentType: string }> {
    const { stream, contentType } = await this.restClient.streamWithContentType({
      path: `/distinguishing-marks/photo/${photoUuid}`,
    })

    return { stream, contentType }
  }
}
