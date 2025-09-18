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
  UpdateIdentityNumberRequestMock,
} from './localMockData/personIntegrationApiReferenceDataMock'
import { CorePersonRecordReferenceDataDomain } from './interfaces/personIntegrationApi/personIntegrationApiClient'
import MulterFile from '../controllers/interfaces/MulterFile'

const token = { access_token: 'token-1', expires_in: 300 }

describe('personIntegrationApiClient (v2)', () => {
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
    config.featureToggles.personEndpointsEnabled = true
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('updateBirthPlace', () => {
    it('should update birth place', async () => {
      fakePersonIntegrationApi.patch('/v2/person/A1234AA').reply(204)
      await personIntegrationApiClient.updateBirthPlace('A1234AA', 'London')
    })
  })

  describe('updateCountryOfBirth', () => {
    it('should update country of birth', async () => {
      fakePersonIntegrationApi.patch('/v2/person/A1234AA').reply(204)
      await personIntegrationApiClient.updateCountryOfBirth('A1234AA', 'London')
    })
  })

  describe('updateNationality', () => {
    it('should update nationality', async () => {
      fakePersonIntegrationApi.put('/v2/person/A1234AA/nationality').reply(204)
      await personIntegrationApiClient.updateNationality('A1234AA', 'BRIT', 'Other nationality')
    })
  })

  describe('updateReligion', () => {
    it('should update religion', async () => {
      fakePersonIntegrationApi.put('/v2/person/A1234AA/religion').reply(204)
      await personIntegrationApiClient.updateReligion('A1234AA', 'ZORO', 'Some comment')
    })
  })

  describe('updateSexualOrientation', () => {
    it('should update sexual orientation', async () => {
      fakePersonIntegrationApi.patch('/v2/person/A1234AA').reply(204)
      await personIntegrationApiClient.updateSexualOrientation('A1234AA', 'HET')
    })
  })

  describe('getReferenceDataCodes', () => {
    it('should return reference data codes', async () => {
      fakePersonIntegrationApi.get('/v2/reference-data/domain/COUNTRY/codes').reply(200, CountryReferenceDataCodesMock)

      const output = await personIntegrationApiClient.getReferenceDataCodes(CorePersonRecordReferenceDataDomain.country)
      expect(output).toEqual(CountryReferenceDataCodesMock)
    })
  })

  describe('getMilitaryRecords', () => {
    it('should get military records from the API', async () => {
      fakePersonIntegrationApi.get('/v2/person/A1234AA/military-records').reply(200, MilitaryRecordsMock)
      const result = await personIntegrationApiClient.getMilitaryRecords('A1234AA')
      expect(result).toEqual(MilitaryRecordsMock)
    })
  })

  describe('updateMilitaryRecord', () => {
    it('should update military record', async () => {
      fakePersonIntegrationApi.put('/v2/person/A1234AA/military-records?militarySeq=1').reply(204)
      await personIntegrationApiClient.updateMilitaryRecord('A1234AA', 1, MilitaryRecordsMock[0])
    })
  })

  describe('createMilitaryRecord', () => {
    it('should create military record', async () => {
      fakePersonIntegrationApi.post('/v2/person/A1234AA/military-records').reply(201)
      await personIntegrationApiClient.createMilitaryRecord('A1234AA', MilitaryRecordsMock[0])
    })
  })

  describe('getDistinguishingMark', () => {
    it('should get the distinguishing mark', async () => {
      fakePersonIntegrationApi
        .get('/v2/person/A1234AA/distinguishing-mark/A1234AA-1')
        .reply(200, DistinguishingMarksMock[0])
      const result = await personIntegrationApiClient.getDistinguishingMark('A1234AA', '1')
      expect(result).toEqual(DistinguishingMarksMock[0])
    })
  })

  describe('getDistinguishingMarks', () => {
    it('should get all distinguishing marks', async () => {
      fakePersonIntegrationApi.get('/v2/person/A1234AA/distinguishing-marks').reply(200, DistinguishingMarksMock)
      const result = await personIntegrationApiClient.getDistinguishingMarks('A1234AA')
      expect(result).toEqual(DistinguishingMarksMock)
    })
  })

  describe('updateDistinguishingMark', () => {
    it('should update an existing distinguishing mark', async () => {
      fakePersonIntegrationApi
        .put('/v2/person/A1234AA/distinguishing-mark/A1234AA-1')
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
      fakePersonIntegrationApi.post('/v2/person/A1234AA/distinguishing-mark').reply(200, DistinguishingMarksMock[0])
      const result = await personIntegrationApiClient.createDistinguishingMark('A1234AA', {
        markType: 'TAT',
        bodyPart: 'LEG',
      })
      expect(result).toEqual(DistinguishingMarksMock[0])
    })

    it('should create a distinguishing mark with an image', async () => {
      fakePersonIntegrationApi.post('/v2/person/A1234AA/distinguishing-mark').reply(200, DistinguishingMarksMock[0])
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
    it('should add distinguishing mark image', async () => {
      fakePersonIntegrationApi.post('/v2/person/A1234AA/distinguishing-mark/A1234AA-1/image').reply(200, response)
      const result = await personIntegrationApiClient.addDistinguishingMarkImage('A1234AA', '1', image)
      expect(result).toEqual(response)
    })
  })

  describe('getPseudonyms', () => {
    it('should get list of pseudonyms', async () => {
      fakePersonIntegrationApi.get('/v2/person/A1234AA/pseudonyms').reply(200, [PseudonymResponseMock])
      const result = await personIntegrationApiClient.getPseudonyms('A1234AA')
      expect(result).toEqual([PseudonymResponseMock])
    })
  })

  describe('createPseudonym', () => {
    it('should create new pseudonym', async () => {
      fakePersonIntegrationApi.post('/v2/person/A1234AA/pseudonym').reply(200, PseudonymResponseMock)
      const result = await personIntegrationApiClient.createPseudonym('A1234AA', PseudonymRequestMock)
      expect(result).toEqual(PseudonymResponseMock)
    })
  })

  describe('updatePseudonym', () => {
    it('should update existing pseudonym', async () => {
      fakePersonIntegrationApi.put('/v2/person/AB123CD/pseudonym/12345').reply(200, PseudonymResponseMock)
      const result = await personIntegrationApiClient.updatePseudonym(12345, PseudonymRequestMock)
      expect(result).toEqual(PseudonymResponseMock)
    })
  })

  describe('updateIdentityNumber', () => {
    it('should update existing identity number', async () => {
      fakePersonIntegrationApi.put('/v2/person/AB123CD/identifiers?offenderId=1&seqId=2').reply(204)
      await expect(async () =>
        personIntegrationApiClient.updateIdentityNumber(1, 2, UpdateIdentityNumberRequestMock),
      ).resolves.not.toThrow()
    })
  })

  describe('addIdentityNumbers', () => {
    it('should add new identity numbers', async () => {
      fakePersonIntegrationApi.post('/v2/person/A1234AA/identifiers').reply(204)
      await expect(async () =>
        personIntegrationApiClient.addIdentityNumbers('A1234AA', AddIdentityNumbersRequestMock),
      ).resolves.not.toThrow()
    })
  })

  describe('updateProfileImage', () => {
    it('Should upload the image and return the response', async () => {
      fakePersonIntegrationApi.put('/v2/person/A1234AA/profile-image').reply(200)
      await expect(async () => personIntegrationApiClient.updateProfileImage('A1234AA', image)).resolves.not.toThrow()
    })
  })

  describe('getContacts', () => {
    it('Should return the response from the API', async () => {
      fakePersonIntegrationApi.get('/v2/person/A1234AA/contacts').reply(200, ContactsResponseMock)
      const result = await personIntegrationApiClient.getContacts('A1234AA')
      expect(result).toEqual(ContactsResponseMock)
    })
  })

  describe('createContact', () => {
    it('Should create the contact and return the response', async () => {
      fakePersonIntegrationApi.post('/v2/person/A1234AA/contacts').reply(200, ContactsResponseMock[1])
      const result = await personIntegrationApiClient.createContact('A1234AA', {
        contactType: 'EMAIL',
        contactValue: 'updated@email.com',
      })
      expect(result).toEqual(ContactsResponseMock[1])
    })
  })

  describe('updateContact', () => {
    it('Should update the contact and return the response', async () => {
      fakePersonIntegrationApi.put('/v2/person/A1234AA/contacts/10').reply(200, ContactsResponseMock[1])
      const result = await personIntegrationApiClient.updateContact('A1234AA', '10', {
        contactType: 'EMAIL',
        contactValue: 'updated@email.com',
      })
      expect(result).toEqual(ContactsResponseMock[1])
    })
  })
})
