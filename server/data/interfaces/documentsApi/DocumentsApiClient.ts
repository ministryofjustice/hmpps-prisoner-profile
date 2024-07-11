import DocumentMeta from './DocumentMeta'
import DocumentSearchResponse from './DocumentSearchResponse'

export default interface DocumentsApiClient {
  putProfilePhoto(
    document: Buffer,
    metadata: Record<string, string>,
    uuid: string,
    activeCaseLoadId: string,
    username: string,
  ): Promise<DocumentMeta>

  getPhoto(uuid: string, activeCaseLoadId: string, username: string): Promise<Buffer>

  getPhotosForPrisoner(
    prisonerNumber: string,
    activeCaseLoadId: string,
    username: string,
  ): Promise<DocumentSearchResponse>
}
