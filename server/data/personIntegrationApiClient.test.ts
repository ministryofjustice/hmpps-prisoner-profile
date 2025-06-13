import nock from 'nock'
import config from '../config'
import PersonIntegrationApiRestClient from './personIntegrationApiClient'
import {
  ContactsResponseMock,
  AddIdentityNumbersRequestMock,
  CountryReferenceDataCodesMock,
  DistinguishingMarksMock,
  MilitaryRecordsMock,
  PseudonymRequestMock,
  PseudonymResponseMock,
} from './localMockData/personIntegrationApiReferenceDataMock'
import { CorePersonRecordReferenceDataDomain } from './interfaces/personIntegrationApi/personIntegrationApiClient'
import MulterFile from '../controllers/interfaces/MulterFile'

const token = { access_token: 'token-1', expires_in: 300 }

describe('personIntegrationApiClient', () => {
  let fakePersonIntegrationApi: nock.Scope
  let personIntegrationApiClient: PersonIntegrationApiRestClient

  const image: MulterFile = {
    buffer: Buffer.from('image'),
    originalname: 'image',
    mimetype: 'image/png',
    size: 123,
    filename: 'image',
    path: 'path',
    fieldname: 'field',
    stream: undefined,
    destination: 'destination',
    encoding: 'utf-8',
  }

  beforeEach(() => {
    fakePersonIntegrationApi = nock(config.apis.personIntegrationApi.url)
    personIntegrationApiClient = new PersonIntegrationApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('updateBirthPlace', () => {
    it('should update birth place', async () => {
      fakePersonIntegrationApi.patch('/v1/core-person-record?prisonerNumber=A1234AA').reply(204)
      await personIntegrationApiClient.updateBirthPlace('A1234AA', 'London')
    })
  })

  describe('updateCountryOfBirth', () => {
    it('should update country of birth', async () => {
      fakePersonIntegrationApi.patch('/v1/core-person-record?prisonerNumber=A1234AA').reply(204)
      await personIntegrationApiClient.updateCountryOfBirth('A1234AA', 'London')
    })
  })

  describe('updateNationality', () => {
    it('should update nationality', async () => {
      fakePersonIntegrationApi.put('/v1/core-person-record/nationality?prisonerNumber=A1234AA').reply(204)
      await personIntegrationApiClient.updateNationality('A1234AA', 'BRIT', 'Other nationality')
    })
  })

  describe('updateReligion', () => {
    it('should update religion', async () => {
      fakePersonIntegrationApi.put('/v1/person-protected-characteristics/religion?prisonerNumber=A1234AA').reply(204)
      await personIntegrationApiClient.updateReligion('A1234AA', 'ZORO', 'Some comment')
    })
  })

  describe('updateSexualOrientation', () => {
    it('should update sexual orientation', async () => {
      fakePersonIntegrationApi.patch('/v1/core-person-record?prisonerNumber=A1234AA').reply(204)
      await personIntegrationApiClient.updateSexualOrientation('A1234AA', 'HET')
    })
  })

  describe('getReferenceDataCodes', () => {
    it('should return reference data codes', async () => {
      fakePersonIntegrationApi
        .get('/v1/core-person-record/reference-data/domain/COUNTRY/codes')
        .reply(200, CountryReferenceDataCodesMock)

      const output = await personIntegrationApiClient.getReferenceDataCodes(CorePersonRecordReferenceDataDomain.country)
      expect(output).toEqual(CountryReferenceDataCodesMock)
    })
  })

  describe('getMilitaryRecords', () => {
    it('should get military records from the API', async () => {
      fakePersonIntegrationApi
        .get('/v1/core-person-record/military-records?prisonerNumber=A1234AA')
        .reply(200, MilitaryRecordsMock)

      const result = await personIntegrationApiClient.getMilitaryRecords('A1234AA')
      expect(result).toEqual(MilitaryRecordsMock)
    })
  })

  describe('updateMilitaryRecord', () => {
    it('should update military record', async () => {
      fakePersonIntegrationApi
        .put('/v1/core-person-record/military-records?prisonerNumber=A1234AA&militarySeq=1')
        .reply(204)
      await personIntegrationApiClient.updateMilitaryRecord('A1234AA', 1, MilitaryRecordsMock[0])
    })
  })

  describe('createMilitaryRecord', () => {
    it('should create military record', async () => {
      fakePersonIntegrationApi.post('/v1/core-person-record/military-records?prisonerNumber=A1234AA').reply(201)
      await personIntegrationApiClient.createMilitaryRecord('A1234AA', MilitaryRecordsMock[0])
    })
  })

  describe('getDistinguishingMark', () => {
    it('should get the distinguishing mark', async () => {
      fakePersonIntegrationApi
        .get('/v1/distinguishing-mark/A1234AA-1?sourceSystem=NOMIS')
        .reply(200, DistinguishingMarksMock[0])
      const result = await personIntegrationApiClient.getDistinguishingMark('A1234AA', '1')
      expect(result).toEqual(DistinguishingMarksMock[0])
    })
  })

  describe('getDistinguishingMarks', () => {
    it('should get all distinguishing marks', async () => {
      fakePersonIntegrationApi
        .get('/v1/distinguishing-marks?prisonerNumber=A1234AA&sourceSystem=NOMIS')
        .reply(200, DistinguishingMarksMock)
      const result = await personIntegrationApiClient.getDistinguishingMarks('A1234AA')
      expect(result).toEqual(DistinguishingMarksMock)
    })
  })

  describe('updateDistinguishingMark', () => {
    it('should update an existing distinguishing mark', async () => {
      fakePersonIntegrationApi
        .put('/v1/distinguishing-mark/A1234AA-1?sourceSystem=NOMIS')
        .reply(200, DistinguishingMarksMock[0])
      const result = await personIntegrationApiClient.updateDistinguishingMark('A1234AA', '1', {
        markType: 'TAT',
        bodyPart: 'LEG',
      })
      expect(result).toEqual(DistinguishingMarksMock[0])
    })
  })

  describe('createDistinguishingMark', () => {
    it('should create a distinguishing mark without an image', async () => {
      fakePersonIntegrationApi
        .post('/v1/distinguishing-mark?prisonerNumber=A1234AA&sourceSystem=NOMIS')
        .reply(200, DistinguishingMarksMock[0])
      const result = await personIntegrationApiClient.createDistinguishingMark('A1234AA', {
        markType: 'TAT',
        bodyPart: 'LEG',
      })
      expect(result).toEqual(DistinguishingMarksMock[0])
    })

    it('should create a distinguishing mark with an image', async () => {
      fakePersonIntegrationApi
        .post('/v1/distinguishing-mark?prisonerNumber=A1234AA&sourceSystem=NOMIS')
        .reply(200, DistinguishingMarksMock[0])
      const result = await personIntegrationApiClient.createDistinguishingMark(
        'A1234AA',
        {
          markType: 'TAT',
          bodyPart: 'LEG',
        },
        image,
      )
      expect(result).toEqual(DistinguishingMarksMock[0])
    })
  })

  describe('addDistinguishingMarkImage', () => {
    const response = {
      stream: image.stream,
      contentType: 'image/jpeg',
    }
    it('should get the distinguishing mark image', async () => {
      fakePersonIntegrationApi.post('/v1/distinguishing-mark/A1234AA-1/image?sourceSystem=NOMIS').reply(200, response)
      const result = await personIntegrationApiClient.addDistinguishingMarkImage('A1234AA', '1', image)
      expect(result).toEqual(response)
    })
  })

  describe('getPseudonyms', () => {
    it('should get list of pseudonyms', async () => {
      fakePersonIntegrationApi
        .get('/v1/pseudonyms?prisonerNumber=A1234AA&sourceSystem=NOMIS')
        .reply(200, [PseudonymResponseMock])
      const result = await personIntegrationApiClient.getPseudonyms('A1234AA')
      expect(result).toEqual([PseudonymResponseMock])
    })
  })

  describe('createPseudonym', () => {
    it('should create new pseudonym', async () => {
      fakePersonIntegrationApi
        .post('/v1/pseudonym?prisonerNumber=A1234AA&sourceSystem=NOMIS')
        .reply(200, PseudonymResponseMock)
      const result = await personIntegrationApiClient.createPseudonym('A1234AA', PseudonymRequestMock)
      expect(result).toEqual(PseudonymResponseMock)
    })
  })

  describe('updatePseudonym', () => {
    it('should update existing pseudonym', async () => {
      fakePersonIntegrationApi.put('/v1/pseudonym/12345?sourceSystem=NOMIS').reply(200, PseudonymResponseMock)
      const result = await personIntegrationApiClient.updatePseudonym(12345, PseudonymRequestMock)
      expect(result).toEqual(PseudonymResponseMock)
    })
  })

  describe('addIdentityNumbers', () => {
    it('should add new identity numbers', async () => {
      fakePersonIntegrationApi
        .post('/v1/core-person-record/identifiers?prisonerNumber=A1234AA&sourceSystem=NOMIS')
        .reply(204)
      expect(async () =>
        personIntegrationApiClient.addIdentityNumbers('A1234AA', AddIdentityNumbersRequestMock),
      ).not.toThrow()
    })
  })

  describe('updateProfileImage', () => {
    it('Should upload the image and return the response', async () => {
      fakePersonIntegrationApi.put('/v1/core-person-record/profile-image?prisonerNumber=A1234AA').reply(200)
      expect(async () => personIntegrationApiClient.updateProfileImage('A1234AA', image)).not.toThrow()
    })
  })

  describe('getContacts', () => {
    it('Should return the response from the API', async () => {
      fakePersonIntegrationApi.get('/v1/person/A1234AA/contacts').reply(200, ContactsResponseMock)
      const result = await personIntegrationApiClient.getContacts('A1234AA')
      expect(result).toEqual(ContactsResponseMock)
    })
  })

  describe('updateContact', () => {
    it('Should update the contact and return the response', async () => {
      fakePersonIntegrationApi.put('/v1/person/A1234AA/contacts/10').reply(200, ContactsResponseMock[1])
      const result = await personIntegrationApiClient.updateContact('A1234AA', '10', {
        contactType: 'EMAIL',
        contactValue: 'updated@email.com',
      })
      expect(result).toEqual(ContactsResponseMock[1])
    })
  })
})
