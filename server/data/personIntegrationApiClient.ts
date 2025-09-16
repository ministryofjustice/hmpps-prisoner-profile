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
    return handleNomisLockedError(() =>
      this.put(
        {
          path: '/v1/core-person-record/nationality',
          query: { prisonerNumber },
          data: { nationality, otherNationalities } as Record<string, any>,
        },
        this.token,
      ),
    )
  }

  updateCountryOfBirth(prisonerNumber: string, countryOfBirth: string): Promise<void> {
    return handleNomisLockedError(() => this.updateCorePersonRecord(prisonerNumber, 'COUNTRY_OF_BIRTH', countryOfBirth))
  }

  updateReligion(prisonerNumber: string, religionCode: string, reasonForChange?: string): Promise<void> {
    return handleNomisLockedError(() =>
      this.put(
        {
          path: '/v1/person-protected-characteristics/religion',
          query: { prisonerNumber },
          data: { religionCode, reasonForChange } as Record<string, any>,
        },
        this.token,
      ),
    )
  }

  updateSexualOrientation(prisonerNumber: string, sexualOrientation: string): Promise<void> {
    return handleNomisLockedError(() =>
      this.updateCorePersonRecord(prisonerNumber, 'SEXUAL_ORIENTATION', sexualOrientation),
    )
  }

  getReferenceDataCodes(domain: CorePersonRecordReferenceDataDomain): Promise<CorePersonRecordReferenceDataCodeDto[]> {
    return this.get({ path: `/v1/core-person-record/reference-data/domain/${domain}/codes` }, this.token)
  }

  getMilitaryRecords(prisonerNumber: string): Promise<MilitaryRecord[]> {
    return this.get({ path: `/v1/core-person-record/military-records`, query: { prisonerNumber } }, this.token)
  }

  updateMilitaryRecord(prisonerNumber: string, militarySeq: number, militaryRecord: MilitaryRecord): Promise<void> {
    return handleNomisLockedError(() =>
      this.put(
        {
          path: '/v1/core-person-record/military-records',
          query: { prisonerNumber, militarySeq },
          data: militaryRecord as Record<string, any>,
        },
        this.token,
      ),
    )
  }

  createMilitaryRecord(prisonerNumber: string, militaryRecord: MilitaryRecord): Promise<void> {
    return handleNomisLockedError(() =>
      this.post(
        {
          path: '/v1/core-person-record/military-records',
          query: { prisonerNumber },
          data: militaryRecord as Record<string, any>,
        },
        this.token,
      ),
    )
  }

  async getDistinguishingMark(
    prisonerNumber: string,
    sequenceId: string,
  ): Promise<PersonIntegrationDistinguishingMark> {
    return this.get<PersonIntegrationDistinguishingMark>(
      {
        path: `/v1/distinguishing-mark/${prisonerNumber}-${sequenceId}`,
        query: { sourceSystem: 'NOMIS' },
      },
      this.token,
    )
  }

  async getDistinguishingMarks(prisonerNumber: string): Promise<PersonIntegrationDistinguishingMark[]> {
    return this.get<PersonIntegrationDistinguishingMark[]>(
      {
        path: `/v1/distinguishing-marks`,
        query: { prisonerNumber, sourceSystem: 'NOMIS' },
      },
      this.token,
    )
  }

  updateDistinguishingMark(
    prisonerNumber: string,
    sequenceId: string,
    distinguishingMarkRequest: DistinguishingMarkRequest,
  ): Promise<PersonIntegrationDistinguishingMark> {
    return handleNomisLockedError(() =>
      this.put<PersonIntegrationDistinguishingMark>(
        {
          path: `/v1/distinguishing-mark/${prisonerNumber}-${sequenceId}`,
          query: { sourceSystem: 'NOMIS' },
          data: distinguishingMarkRequest as Record<string, any>,
        },
        this.token,
      ),
    )
  }

  createDistinguishingMark(
    prisonerNumber: string,
    distinguishingMarkRequest: DistinguishingMarkRequest,
    image?: MulterFile,
  ): Promise<PersonIntegrationDistinguishingMark> {
    return handleNomisLockedError(() =>
      this.postMultipart<PersonIntegrationDistinguishingMark>({
        path: '/v1/distinguishing-mark',
        query: { prisonerNumber, sourceSystem: 'NOMIS' },
        data: distinguishingMarkRequest as Record<string, any>,
        files: image ? { file: image } : null,
      }),
    )
  }

  updateDistinguishingMarkImage(photoId: string, image: MulterFile): Promise<PersonIntegrationDistinguishingMark> {
    return handleNomisLockedError(() =>
      this.putMultipart<PersonIntegrationDistinguishingMark>({
        path: `/v1/distinguishing-mark/image/${photoId}`,
        query: { sourceSystem: 'NOMIS' },
        files: { file: image },
      }),
    )
  }

  addDistinguishingMarkImage(
    prisonerNumber: string,
    sequenceId: string,
    image: MulterFile,
  ): Promise<PersonIntegrationDistinguishingMark> {
    return handleNomisLockedError(() =>
      this.postMultipart<PersonIntegrationDistinguishingMark>({
        path: `/v1/distinguishing-mark/${prisonerNumber}-${sequenceId}/image`,
        query: { sourceSystem: 'NOMIS' },
        files: { file: image },
      }),
    )
  }

  async getDistinguishingMarkImage(imageId: string): Promise<Readable> {
    return this.stream(
      {
        path: `/v1/distinguishing-mark/image/${imageId}?sourceSystem=NOMIS`,
      },
      this.token,
    )
  }

  getPhysicalAttributes(prisonerNumber: string): Promise<CorePersonPhysicalAttributesDto> {
    return this.get({ path: `/v1/core-person-record/physical-attributes`, query: { prisonerNumber } }, this.token)
  }

  updatePhysicalAttributes(
    prisonerNumber: string,
    physicalAttributes: CorePersonPhysicalAttributesRequest,
  ): Promise<void> {
    return handleNomisLockedError(() =>
      this.put(
        {
          path: '/v1/core-person-record/physical-attributes',
          query: { prisonerNumber },
          data: physicalAttributes as Record<string, any>,
        },
        this.token,
      ),
    )
  }

  getPseudonyms(prisonerNumber: string): Promise<PseudonymResponseDto[]> {
    return this.get({ path: `/v1/pseudonyms`, query: { prisonerNumber, sourceSystem: 'NOMIS' } }, this.token)
  }

  updatePseudonym(pseudonymId: number, pseudonym: PseudonymRequestDto): Promise<PseudonymResponseDto> {
    return handleNomisLockedError(() =>
      this.put(
        {
          path: `/v1/pseudonym/${pseudonymId}`,
          query: { sourceSystem: 'NOMIS' },
          data: pseudonym as Record<string, any>,
        },
        this.token,
      ),
    )
  }

  createPseudonym(prisonerNumber: string, pseudonym: PseudonymRequestDto): Promise<PseudonymResponseDto> {
    return handleNomisLockedError(() =>
      this.post(
        {
          path: `/v1/pseudonym`,
          query: { prisonerNumber, sourceSystem: 'NOMIS' },
          data: pseudonym as Record<string, any>,
        },
        this.token,
      ),
    )
  }

  updateIdentityNumber(offenderId: number, seqId: number, request: UpdateIdentifierRequestDto): Promise<void> {
    return handleNomisLockedError(() =>
      this.put(
        {
          path: `/v1/core-person-record/identifiers`,
          query: { offenderId, seqId, sourceSystem: 'NOMIS' },
          data: request as Record<string, any>,
        },
        this.token,
      ),
    )
  }

  addIdentityNumbers(prisonerNumber: string, request: AddIdentifierRequestDto[]): Promise<void> {
    return handleNomisLockedError(() =>
      this.post(
        {
          path: `/v1/core-person-record/identifiers`,
          query: { prisonerNumber, sourceSystem: 'NOMIS' },
          data: request as Record<string, any>,
        },
        this.token,
      ),
    )
  }

  private updateCorePersonRecord(prisonerNumber: string, fieldName: string, value: string): Promise<void> {
    return handleNomisLockedError(() =>
      this.patch(
        {
          path: '/v1/core-person-record',
          query: { prisonerNumber },
          data: { fieldName, value } as Record<string, any>,
        },
        this.token,
      ),
    )
  }

  updateProfileImage(
    prisonerNumber: string,
    image: { buffer: Buffer<ArrayBufferLike>; originalname: string },
  ): Promise<void> {
    return handleNomisLockedError(() =>
      this.putMultipart<void>({
        path: `/v1/core-person-record/profile-image`,
        query: { prisonerNumber },
        files: { imageFile: image },
      }),
    )
  }

  getAddresses(prisonerNumber: string): Promise<AddressResponseDto[]> {
    return this.get({ path: `/v1/person/${prisonerNumber}/addresses` }, this.token)
  }

  createAddress(prisonerNumber: string, address: AddressRequestDto): Promise<AddressResponseDto> {
    return handleNomisLockedError(() =>
      this.post(
        {
          path: `/v1/person/${prisonerNumber}/addresses`,
          data: address as Record<string, any>,
        },
        this.token,
      ),
    )
  }

  // Global phones/addresses (contacts)
  getContacts(prisonerNumber: string): Promise<ContactsResponseDto[]> {
    return this.get<ContactsResponseDto[]>(
      {
        path: `/v1/person/${prisonerNumber}/contacts`,
      },
      this.token,
    )
  }

  createContact(prisonerNumber: string, request: ContactsRequestDto): Promise<ContactsResponseDto> {
    return handleNomisLockedError(() =>
      this.post<ContactsResponseDto>(
        {
          path: `/v1/person/${prisonerNumber}/contacts`,
          data: request as Record<string, any>,
        },
        this.token,
      ),
    )
  }

  updateContact(prisonerNumber: string, contactId: string, request: ContactsRequestDto): Promise<ContactsResponseDto> {
    return handleNomisLockedError(() =>
      this.put<ContactsResponseDto>(
        {
          path: `/v1/person/${prisonerNumber}/contacts/${contactId}`,
          data: request as Record<string, any>,
        },
        this.token,
      ),
    )
  }
}
