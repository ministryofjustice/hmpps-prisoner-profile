import { Readable } from 'stream'
import RestClient from './restClient'
import {
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
  PseudonymRequestDto,
  PseudonymResponseDto,
} from './interfaces/personIntegrationApi/personIntegrationApiClient'
import config from '../config'
import MulterFile from '../controllers/interfaces/MulterFile'

export default class PersonIntegrationApiRestClient implements PersonIntegrationApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Person Integration API', config.apis.personIntegrationApi, token)
  }

  updateBirthPlace(prisonerNumber: string, birthPlace: string): Promise<void> {
    return this.updateCorePersonRecord(prisonerNumber, 'BIRTHPLACE', birthPlace)
  }

  updateNationality(prisonerNumber: string, nationality: string, otherNationalities: string): Promise<void> {
    return this.restClient.put({
      path: '/v1/core-person-record/nationality',
      query: { prisonerNumber },
      data: { nationality, otherNationalities },
    })
  }

  updateCountryOfBirth(prisonerNumber: string, countryOfBirth: string): Promise<void> {
    return this.updateCorePersonRecord(prisonerNumber, 'COUNTRY_OF_BIRTH', countryOfBirth)
  }

  updateReligion(prisonerNumber: string, religionCode: string, reasonForChange?: string): Promise<void> {
    return this.restClient.put({
      path: '/v1/person-protected-characteristics/religion',
      query: { prisonerNumber },
      data: { religionCode, reasonForChange },
    })
  }

  updateSexualOrientation(prisonerNumber: string, sexualOrientation: string): Promise<void> {
    return this.updateCorePersonRecord(prisonerNumber, 'SEXUAL_ORIENTATION', sexualOrientation)
  }

  getReferenceDataCodes(domain: CorePersonRecordReferenceDataDomain): Promise<CorePersonRecordReferenceDataCodeDto[]> {
    return this.restClient.get({ path: `/v1/core-person-record/reference-data/domain/${domain}/codes` })
  }

  getMilitaryRecords(prisonerNumber: string): Promise<MilitaryRecord[]> {
    return this.restClient.get({ path: `/v1/core-person-record/military-records`, query: { prisonerNumber } })
  }

  updateMilitaryRecord(prisonerNumber: string, militarySeq: number, militaryRecord: MilitaryRecord): Promise<void> {
    return this.restClient.put({
      path: '/v1/core-person-record/military-records',
      query: { prisonerNumber, militarySeq },
      data: militaryRecord,
    })
  }

  createMilitaryRecord(prisonerNumber: string, militaryRecord: MilitaryRecord): Promise<void> {
    return this.restClient.post({
      path: '/v1/core-person-record/military-records',
      query: { prisonerNumber },
      data: militaryRecord,
    })
  }

  async getDistinguishingMark(
    prisonerNumber: string,
    sequenceId: string,
  ): Promise<PersonIntegrationDistinguishingMark> {
    return this.restClient.get<PersonIntegrationDistinguishingMark>({
      path: `/v1/distinguishing-mark/${prisonerNumber}-${sequenceId}`,
      query: { sourceSystem: 'NOMIS' },
    })
  }

  async getDistinguishingMarks(prisonerNumber: string): Promise<PersonIntegrationDistinguishingMark[]> {
    return this.restClient.get<PersonIntegrationDistinguishingMark[]>({
      path: `/v1/distinguishing-marks`,
      query: { prisonerNumber, sourceSystem: 'NOMIS' },
    })
  }

  updateDistinguishingMark(
    prisonerNumber: string,
    sequenceId: string,
    distinguishingMarkRequest: DistinguishingMarkRequest,
  ): Promise<PersonIntegrationDistinguishingMark> {
    return this.restClient.put<PersonIntegrationDistinguishingMark>({
      path: `/v1/distinguishing-mark/${prisonerNumber}-${sequenceId}`,
      query: { sourceSystem: 'NOMIS' },
      data: distinguishingMarkRequest,
    })
  }

  createDistinguishingMark(
    prisonerNumber: string,
    distinguishingMarkRequest: DistinguishingMarkRequest,
    image?: MulterFile,
  ): Promise<PersonIntegrationDistinguishingMark> {
    return this.restClient.postMultipart<PersonIntegrationDistinguishingMark>({
      path: '/v1/distinguishing-mark',
      query: { prisonerNumber, sourceSystem: 'NOMIS' },
      data: distinguishingMarkRequest,
      files: image ? { file: image } : null,
    })
  }

  updateDistinguishingMarkImage(photoId: string, image: MulterFile): Promise<PersonIntegrationDistinguishingMark> {
    return this.restClient.putMultipart<PersonIntegrationDistinguishingMark>({
      path: `/v1/distinguishing-mark/image/${photoId}`,
      query: { sourceSystem: 'NOMIS' },
      files: { file: image },
    })
  }

  addDistinguishingMarkImage(
    prisonerNumber: string,
    sequenceId: string,
    image: MulterFile,
  ): Promise<PersonIntegrationDistinguishingMark> {
    return this.restClient.postMultipart<PersonIntegrationDistinguishingMark>({
      path: `/v1/distinguishing-mark/${prisonerNumber}-${sequenceId}/image`,
      query: { sourceSystem: 'NOMIS' },
      files: { file: image },
    })
  }

  async getDistinguishingMarkImage(imageId: string): Promise<Readable> {
    return this.restClient.stream({
      path: `/v1/distinguishing-mark/image/${imageId}`,
      query: { sourceSystem: 'NOMIS' },
    })
  }

  getPhysicalAttributes(prisonerNumber: string): Promise<CorePersonPhysicalAttributesDto> {
    return this.restClient.get({ path: `/v1/core-person-record/physical-attributes`, query: { prisonerNumber } })
  }

  updatePhysicalAttributes(
    prisonerNumber: string,
    physicalAttributes: CorePersonPhysicalAttributesRequest,
  ): Promise<void> {
    return this.restClient.put({
      path: '/v1/core-person-record/physical-attributes',
      query: { prisonerNumber },
      data: physicalAttributes,
    })
  }

  getPseudonyms(prisonerNumber: string): Promise<PseudonymResponseDto[]> {
    return this.restClient.get({ path: `/v1/pseudonyms`, query: { prisonerNumber, sourceSystem: 'NOMIS' } })
  }

  updatePseudonym(pseudonymId: number, pseudonym: PseudonymRequestDto): Promise<PseudonymResponseDto> {
    return this.restClient.put({
      path: `/v1/pseudonym/${pseudonymId}`,
      query: { sourceSystem: 'NOMIS' },
      data: pseudonym,
    })
  }

  createPseudonym(prisonerNumber: string, pseudonym: PseudonymRequestDto): Promise<PseudonymResponseDto> {
    return this.restClient.post({
      path: `/v1/pseudonym`,
      query: { prisonerNumber, sourceSystem: 'NOMIS' },
      data: pseudonym,
    })
  }

  private updateCorePersonRecord(prisonerNumber: string, fieldName: string, value: string): Promise<void> {
    return this.restClient.patch({
      path: '/v1/core-person-record',
      query: { prisonerNumber },
      data: { fieldName, value },
    })
  }

  updateProfileImage(
    prisonerNumber: string,
    image: { buffer: Buffer<ArrayBufferLike>; originalname: string },
  ): Promise<void> {
    return this.restClient.putMultipart<void>({
      path: `/v1/core-person-record/profile-image`,
      query: { prisonerNumber },
      files: { imageFile: image },
    })
  }

  getAddresses(prisonerNumber: string): Promise<AddressResponseDto[]> {
    return this.restClient.get({ path: `/v1/person/${prisonerNumber}/addresses` })
  }

  createAddress(prisonerNumber: string, address: AddressRequestDto): Promise<AddressResponseDto> {
    return this.restClient.post({
      path: `/v1/person/${prisonerNumber}/addresses`,
      data: address,
    })
  }

  // Global phones/addresses (contacts)
  getContacts(prisonerNumber: string): Promise<ContactsResponseDto[]> {
    return this.restClient.get<ContactsResponseDto[]>({
      path: `/v1/person/${prisonerNumber}/contacts`,
    })
  }

  updateContact(prisonerNumber: string, contactId: string, request: ContactsRequestDto): Promise<ContactsResponseDto> {
    return this.restClient.put<ContactsResponseDto>({
      path: `/v1/person/${prisonerNumber}/contacts/${contactId}`,
      data: request,
    })
  }
}
