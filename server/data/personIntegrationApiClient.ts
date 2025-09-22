import { Readable } from 'stream'
import RestClient from './restClient'
import {
  AddIdentifierRequestDto,
  AddressRequestDto,
  AddressResponseDto,
  ContactsRequestDto,
  ContactsResponseDto,
  CorePersonPhysicalAttributesDto,
  CorePersonPhysicalAttributesRequest,
  CorePersonRecordReferenceDataCodeDto,
  CorePersonRecordReferenceDataDomain,
  DistinguishingMarkRequest,
  MilitaryRecord,
  PersonIntegrationApiClient,
  PersonIntegrationDistinguishingMark,
  PrisonerProfileSummary,
  PseudonymRequestDto,
  PseudonymResponseDto,
  UpdateIdentifierRequestDto,
} from './interfaces/personIntegrationApi/personIntegrationApiClient'
import config from '../config'
import MulterFile from '../controllers/interfaces/MulterFile'
import { handleNomisLockedError } from '../utils/nomisLockedError'

export default class PersonIntegrationApiRestClient extends RestClient implements PersonIntegrationApiClient {
  constructor(token: string) {
    super('Person Integration API', config.apis.personIntegrationApi, token)
  }

  getPrisonerProfileSummary(prisonerNumber: string): Promise<PrisonerProfileSummary> {
    return this.get<PrisonerProfileSummary>({ path: `/v2/person/${prisonerNumber}` }, this.token)
  }

  updateBirthPlace(prisonerNumber: string, birthPlace: string): Promise<void> {
    return handleNomisLockedError(() => this.updateCorePersonRecord(prisonerNumber, 'BIRTHPLACE', birthPlace))
  }

  updateNationality(prisonerNumber: string, nationality: string, otherNationalities: string): Promise<void> {
    const request = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${prisonerNumber}/nationality`,
          data: { nationality, otherNationalities } as Record<string, any>,
        }
      : {
          path: '/v1/core-person-record/nationality',
          query: { prisonerNumber },
          data: { nationality, otherNationalities } as Record<string, any>,
        }

    return handleNomisLockedError(() => this.put(request, this.token))
  }

  updateCountryOfBirth(prisonerNumber: string, countryOfBirth: string): Promise<void> {
    return handleNomisLockedError(() => this.updateCorePersonRecord(prisonerNumber, 'COUNTRY_OF_BIRTH', countryOfBirth))
  }

  updateReligion(prisonerNumber: string, religionCode: string, reasonForChange?: string): Promise<void> {
    const request = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${prisonerNumber}/religion`,
          data: { religionCode, reasonForChange } as Record<string, any>,
        }
      : {
          path: '/v1/person-protected-characteristics/religion',
          query: { prisonerNumber },
          data: { religionCode, reasonForChange } as Record<string, any>,
        }

    return handleNomisLockedError(() => this.put(request, this.token))
  }

  updateSexualOrientation(prisonerNumber: string, sexualOrientation: string): Promise<void> {
    return handleNomisLockedError(() =>
      this.updateCorePersonRecord(prisonerNumber, 'SEXUAL_ORIENTATION', sexualOrientation),
    )
  }

  getReferenceDataCodes(domain: CorePersonRecordReferenceDataDomain): Promise<CorePersonRecordReferenceDataCodeDto[]> {
    const request = config.featureToggles.personEndpointsEnabled
      ? { path: `/v2/reference-data/domain/${domain}/codes` }
      : { path: `/v1/core-person-record/reference-data/domain/${domain}/codes` }

    return this.get<CorePersonRecordReferenceDataCodeDto[]>(request, this.token)
  }

  getMilitaryRecords(prisonerNumber: string): Promise<MilitaryRecord[]> {
    const request = config.featureToggles.personEndpointsEnabled
      ? { path: `/v2/person/${prisonerNumber}/military-records` }
      : { path: `/v1/core-person-record/military-records`, query: { prisonerNumber } }

    return this.get<MilitaryRecord[]>(request, this.token)
  }

  updateMilitaryRecord(prisonerNumber: string, militarySeq: number, militaryRecord: MilitaryRecord): Promise<void> {
    const request = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${prisonerNumber}/military-records`,
          query: { militarySeq },
          data: militaryRecord as Record<string, any>,
        }
      : {
          path: '/v1/core-person-record/military-records',
          query: { prisonerNumber, militarySeq },
          data: militaryRecord as Record<string, any>,
        }

    return handleNomisLockedError(() => this.put(request, this.token))
  }

  createMilitaryRecord(prisonerNumber: string, militaryRecord: MilitaryRecord): Promise<void> {
    const request = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${prisonerNumber}/military-records`,
          data: militaryRecord as Record<string, any>,
        }
      : {
          path: '/v1/core-person-record/military-records',
          query: { prisonerNumber },
          data: militaryRecord as Record<string, any>,
        }

    return handleNomisLockedError(() => this.post(request, this.token))
  }

  async getDistinguishingMark(
    prisonerNumber: string,
    sequenceId: string,
  ): Promise<PersonIntegrationDistinguishingMark> {
    const request = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${prisonerNumber}/distinguishing-mark/${prisonerNumber}-${sequenceId}`,
        }
      : {
          path: `/v1/distinguishing-mark/${prisonerNumber}-${sequenceId}`,
          query: { sourceSystem: 'NOMIS' },
        }

    return this.get<PersonIntegrationDistinguishingMark>(request, this.token)
  }

  async getDistinguishingMarks(prisonerNumber: string): Promise<PersonIntegrationDistinguishingMark[]> {
    const request = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${prisonerNumber}/distinguishing-marks`,
        }
      : {
          path: `/v1/distinguishing-marks`,
          query: { prisonerNumber, sourceSystem: 'NOMIS' },
        }

    return this.get<PersonIntegrationDistinguishingMark[]>(request, this.token)
  }

  updateDistinguishingMark(
    prisonerNumber: string,
    sequenceId: string,
    distinguishingMarkRequest: DistinguishingMarkRequest,
  ): Promise<PersonIntegrationDistinguishingMark> {
    const request = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${prisonerNumber}/distinguishing-mark/${prisonerNumber}-${sequenceId}`,
          data: distinguishingMarkRequest as Record<string, any>,
        }
      : {
          path: `/v1/distinguishing-mark/${prisonerNumber}-${sequenceId}`,
          query: { sourceSystem: 'NOMIS' },
          data: distinguishingMarkRequest as Record<string, any>,
        }

    return handleNomisLockedError(() => this.put<PersonIntegrationDistinguishingMark>(request, this.token))
  }

  createDistinguishingMark(
    prisonerNumber: string,
    distinguishingMarkRequest: DistinguishingMarkRequest,
    image?: MulterFile,
  ): Promise<PersonIntegrationDistinguishingMark> {
    const request = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${prisonerNumber}/distinguishing-mark`,
          data: distinguishingMarkRequest as Record<string, any>,
          files: image ? { file: image } : null,
        }
      : {
          path: '/v1/distinguishing-mark',
          query: { prisonerNumber, sourceSystem: 'NOMIS' },
          data: distinguishingMarkRequest as Record<string, any>,
          files: image ? { file: image } : null,
        }

    return handleNomisLockedError(() => this.postMultipart<PersonIntegrationDistinguishingMark>(request))
  }

  updateDistinguishingMarkImage(photoId: string, image: MulterFile): Promise<PersonIntegrationDistinguishingMark> {
    const placeHolderPrisonNumber = 'AB123CD' // Use real when possible
    const request = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${placeHolderPrisonNumber}/distinguishing-mark/image/${photoId}`,
          files: { file: image },
        }
      : {
          path: `/v1/distinguishing-mark/image/${photoId}`,
          query: { sourceSystem: 'NOMIS' },
          files: { file: image },
        }

    return handleNomisLockedError(() => this.putMultipart<PersonIntegrationDistinguishingMark>(request))
  }

  addDistinguishingMarkImage(
    prisonerNumber: string,
    sequenceId: string,
    image: MulterFile,
  ): Promise<PersonIntegrationDistinguishingMark> {
    const request = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${prisonerNumber}/distinguishing-mark/${prisonerNumber}-${sequenceId}/image`,
          files: { file: image },
        }
      : {
          path: `/v1/distinguishing-mark/${prisonerNumber}-${sequenceId}/image`,
          query: { sourceSystem: 'NOMIS' },
          files: { file: image },
        }

    return handleNomisLockedError(() => this.postMultipart<PersonIntegrationDistinguishingMark>(request))
  }

  async getDistinguishingMarkImage(imageId: string): Promise<Readable> {
    const placeHolderPrisonNumber = 'AB123CD' // Use real when possible
    const request = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${placeHolderPrisonNumber}/distinguishing-mark/image/${imageId}`,
        }
      : {
          path: `/v1/distinguishing-mark/image/${imageId}?sourceSystem=NOMIS`,
        }
    return this.stream(request, this.token)
  }

  getPhysicalAttributes(prisonerNumber: string): Promise<CorePersonPhysicalAttributesDto> {
    const request = config.featureToggles.personEndpointsEnabled
      ? { path: `/v2/person/${prisonerNumber}/physical-attributes` }
      : { path: `/v1/core-person-record/physical-attributes`, query: { prisonerNumber } }
    return this.get<CorePersonPhysicalAttributesDto>(request, this.token)
  }

  updatePhysicalAttributes(
    prisonerNumber: string,
    physicalAttributes: CorePersonPhysicalAttributesRequest,
  ): Promise<void> {
    const request = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${prisonerNumber}/physical-attributes`,
          data: physicalAttributes as Record<string, any>,
        }
      : {
          path: '/v1/core-person-record/physical-attributes',
          query: { prisonerNumber },
          data: physicalAttributes as Record<string, any>,
        }

    return handleNomisLockedError(() => this.put(request, this.token))
  }

  getPseudonyms(prisonerNumber: string): Promise<PseudonymResponseDto[]> {
    const request = config.featureToggles.personEndpointsEnabled
      ? { path: `/v2/person/${prisonerNumber}/pseudonyms` }
      : { path: `/v1/pseudonyms`, query: { prisonerNumber, sourceSystem: 'NOMIS' } }

    return this.get<PseudonymResponseDto[]>(request, this.token)
  }

  updatePseudonym(pseudonymId: number, pseudonym: PseudonymRequestDto): Promise<PseudonymResponseDto> {
    const placeHolderPrisonNumber = 'AB123CD' // Use real when possible
    const request = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${placeHolderPrisonNumber}/pseudonym/${pseudonymId}`,
          data: pseudonym as Record<string, any>,
        }
      : {
          path: `/v1/pseudonym/${pseudonymId}`,
          query: { sourceSystem: 'NOMIS' },
          data: pseudonym as Record<string, any>,
        }

    return handleNomisLockedError(() => this.put<PseudonymResponseDto>(request, this.token))
  }

  createPseudonym(prisonerNumber: string, pseudonym: PseudonymRequestDto): Promise<PseudonymResponseDto> {
    const request = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${prisonerNumber}/pseudonym`,
          data: pseudonym as Record<string, any>,
        }
      : {
          path: `/v1/pseudonym`,
          query: { prisonerNumber, sourceSystem: 'NOMIS' },
          data: pseudonym as Record<string, any>,
        }

    return handleNomisLockedError(() => this.post<PseudonymResponseDto>(request, this.token))
  }

  updateIdentityNumber(offenderId: number, seqId: number, requestDto: UpdateIdentifierRequestDto): Promise<void> {
    const placeHolderPrisonNumber = 'AB123CD' // Use real when possible
    const request = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${placeHolderPrisonNumber}/identifiers`,
          query: { offenderId, seqId },
          data: requestDto as Record<string, any>,
        }
      : {
          path: `/v1/core-person-record/identifiers`,
          query: { offenderId, seqId, sourceSystem: 'NOMIS' },
          data: requestDto as Record<string, any>,
        }

    return handleNomisLockedError(() => this.put(request, this.token))
  }

  addIdentityNumbers(prisonerNumber: string, requestDto: AddIdentifierRequestDto[]): Promise<void> {
    const request = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${prisonerNumber}/identifiers`,
          data: requestDto as Record<string, any>,
        }
      : {
          path: `/v1/core-person-record/identifiers`,
          query: { prisonerNumber, sourceSystem: 'NOMIS' },
          data: requestDto as Record<string, any>,
        }

    return handleNomisLockedError(() => this.post(request, this.token))
  }

  private updateCorePersonRecord(prisonerNumber: string, fieldName: string, value: string): Promise<void> {
    const request = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${prisonerNumber}`,
          data: { fieldName, value } as Record<string, any>,
        }
      : {
          path: '/v1/core-person-record',
          query: { prisonerNumber },
          data: { fieldName, value } as Record<string, any>,
        }

    return handleNomisLockedError(() => this.patch(request, this.token))
  }

  updateProfileImage(
    prisonerNumber: string,
    image: { buffer: Buffer<ArrayBufferLike>; originalname: string },
  ): Promise<void> {
    const request = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${prisonerNumber}/profile-image`,
          files: { imageFile: image },
        }
      : {
          path: `/v1/core-person-record/profile-image`,
          query: { prisonerNumber },
          files: { imageFile: image },
        }

    return handleNomisLockedError(() => this.putMultipart<void>(request))
  }

  getAddresses(prisonerNumber: string): Promise<AddressResponseDto[]> {
    const request = config.featureToggles.personEndpointsEnabled
      ? { path: `/v2/person/${prisonerNumber}/addresses` }
      : { path: `/v1/person/${prisonerNumber}/addresses` }

    return this.get<AddressResponseDto[]>(request, this.token)
  }

  createAddress(prisonerNumber: string, address: AddressRequestDto): Promise<AddressResponseDto> {
    const request = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${prisonerNumber}/addresses`,
          data: address as Record<string, any>,
        }
      : {
          path: `/v1/person/${prisonerNumber}/addresses`,
          data: address as Record<string, any>,
        }

    return handleNomisLockedError(() => this.post<AddressResponseDto>(request, this.token))
  }

  // Global phones/addresses (contacts)
  getContacts(prisonerNumber: string): Promise<ContactsResponseDto[]> {
    const request = config.featureToggles.personEndpointsEnabled
      ? { path: `/v2/person/${prisonerNumber}/contacts` }
      : { path: `/v1/person/${prisonerNumber}/contacts` }

    return this.get<ContactsResponseDto[]>(request, this.token)
  }

  createContact(prisonerNumber: string, request: ContactsRequestDto): Promise<ContactsResponseDto> {
    const requestPayload = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${prisonerNumber}/contacts`,
          data: request as Record<string, any>,
        }
      : {
          path: `/v1/person/${prisonerNumber}/contacts`,
          data: request as Record<string, any>,
        }

    return handleNomisLockedError(() => this.post<ContactsResponseDto>(requestPayload, this.token))
  }

  updateContact(prisonerNumber: string, contactId: string, request: ContactsRequestDto): Promise<ContactsResponseDto> {
    const requestPayload = config.featureToggles.personEndpointsEnabled
      ? {
          path: `/v2/person/${prisonerNumber}/contacts/${contactId}`,
          data: request as Record<string, any>,
        }
      : {
          path: `/v1/person/${prisonerNumber}/contacts/${contactId}`,
          data: request as Record<string, any>,
        }

    return handleNomisLockedError(() => this.put<ContactsResponseDto>(requestPayload, this.token))
  }
}
