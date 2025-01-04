import PersonalPageService from './personalPageService'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { prisonerDetailMock } from '../data/localMockData/prisonerDetailMock'
import { Alias } from '../data/interfaces/prisonerSearchApi/Prisoner'
import { convertToTitleCase, formatName } from '../utils/utils'
import { secondaryLanguagesMock } from '../data/localMockData/secondaryLanguages'
import { propertyMock } from '../data/localMockData/property'
import { mockAddresses } from '../data/localMockData/addresses'
import { mockOffenderContacts } from '../data/localMockData/offenderContacts'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { formatDate } from '../utils/dateHelpers'
import { identifiersMock } from '../data/localMockData/identifiersMock'
import { addressSummaryMock } from '../data/localMockData/addressSummary'
import { curiousApiClientMock } from '../../tests/mocks/curiousApiClientMock'
import { LearnerNeurodivergenceMock } from '../data/localMockData/learnerNeurodivergenceMock'
import CuriousApiClient from '../data/interfaces/curiousApi/curiousApiClient'
import { OffenderContacts } from '../data/interfaces/prisonApi/OffenderContact'
import { PrisonPersonApiClient } from '../data/interfaces/prisonPersonApi/prisonPersonApiClient'
import MetricsService from './metrics/metricsService'
import { prisonUserMock } from '../data/localMockData/user'
import { distinguishingMarkMock } from '../data/localMockData/distinguishingMarksMock'
import Address from '../data/interfaces/prisonApi/Address'
import SecondaryLanguage from '../data/interfaces/prisonApi/SecondaryLanguage'
import LearnerNeurodivergence from '../data/interfaces/curiousApi/LearnerNeurodivergence'
import { PersonIntegrationApiClient } from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { prisonPersonApiClientMock } from '../../tests/mocks/prisonPersonApiClientMock'
import ReferenceDataService from './referenceDataService'
import { EnglandCountryReferenceDataCodeMock } from '../data/localMockData/personIntegrationReferenceDataMock'

jest.mock('./metrics/metricsService')
jest.mock('./referenceDataService')

describe('PersonalPageService', () => {
  let prisonApiClient: PrisonApiClient
  let curiousApiClient: CuriousApiClient
  let prisonPersonApiClient: PrisonPersonApiClient
  let personIntegrationApiClient: PersonIntegrationApiClient
  let referenceDataService: ReferenceDataService
  let metricsService: MetricsService

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    prisonApiClient.getPrisoner = jest.fn(async () => prisonerDetailMock)
    prisonApiClient.getInmateDetail = jest.fn(async () => inmateDetailMock)
    prisonApiClient.getSecondaryLanguages = jest.fn(async () => secondaryLanguagesMock)
    prisonApiClient.getProperty = jest.fn(async () => propertyMock)
    prisonApiClient.getAddresses = jest.fn(async () => mockAddresses)
    prisonApiClient.getAddressesForPerson = jest.fn(async () => mockAddresses)
    prisonApiClient.getOffenderContacts = jest.fn(async () => mockOffenderContacts)
    prisonApiClient.getIdentifiers = jest.fn(async () => identifiersMock)

    curiousApiClient = curiousApiClientMock()
    curiousApiClient.getLearnerNeurodivergence = jest.fn(async () => LearnerNeurodivergenceMock)

    prisonPersonApiClient = prisonPersonApiClientMock()

    personIntegrationApiClient = {
      updateBirthPlace: jest.fn(),
      updateCountryOfBirth: jest.fn(),
      getReferenceDataCodes: jest.fn(),
    }

    referenceDataService = new ReferenceDataService(null, null) as jest.Mocked<ReferenceDataService>
    referenceDataService.getReferenceData = jest.fn(async () => EnglandCountryReferenceDataCodeMock)

    metricsService = new MetricsService(null) as jest.Mocked<MetricsService>
  })

  const constructService = () =>
    new PersonalPageService(
      () => prisonApiClient,
      () => curiousApiClient,
      () => prisonPersonApiClient,
      () => personIntegrationApiClient,
      referenceDataService,
      metricsService,
    )

  describe('Getting information from the Prison API', () => {
    it('Gets inmate details from the api', async () => {
      const service = constructService()
      await service.get('token', PrisonerMockDataA)
      expect(prisonApiClient.getInmateDetail).toHaveBeenCalledWith(PrisonerMockDataA.bookingId)
    })

    it('Gets secondary languages from the api', async () => {
      const service = constructService()
      await service.get('token', PrisonerMockDataA)
      expect(prisonApiClient.getSecondaryLanguages).toHaveBeenCalledWith(PrisonerMockDataA.bookingId)
    })

    it('Gets prisoner detail from the api', async () => {
      const service = constructService()
      await service.get('token', PrisonerMockDataA)
      expect(prisonApiClient.getPrisoner).toHaveBeenCalledWith(PrisonerMockDataA.prisonerNumber)
    })
  })

  describe('Personal details', () => {
    describe('Age', () => {
      it('calculates the age from the date of birth', async () => {
        jest.useFakeTimers().setSystemTime(new Date('2024-01-23'))

        const service = constructService()
        const response = await service.get('token', PrisonerMockDataA)
        expect(response.personalDetails.age).toEqual({ months: 3, years: 33 })

        jest.useRealTimers()
      })
    })

    describe('Aliases', () => {
      const getResponseWithAliases = async (aliases: Alias[]) => {
        const prisonerData = { ...PrisonerMockDataA }
        prisonerData.aliases = aliases
        const service = constructService()
        return service.get('token', prisonerData)
      }

      it('Handles no aliases', async () => {
        const response = await getResponseWithAliases([])
        expect(response.personalDetails.aliases).toEqual([])
      })

      it('Maps multiple aliases', async () => {
        const response = await getResponseWithAliases([
          { dateOfBirth: '2022-01-01', firstName: 'First name', lastName: 'Last name', gender: '' },
          { dateOfBirth: '2023-01-01', firstName: 'First', middleNames: 'Middle', lastName: 'Last', gender: '' },
        ])
        expect(response.personalDetails.aliases[0]).toEqual({
          alias: 'First Name Last Name',
          dateOfBirth: '01/01/2022',
        })
        expect(response.personalDetails.aliases[1]).toEqual({
          alias: 'First Middle Last',
          dateOfBirth: '01/01/2023',
        })
      })
    })

    describe('Data from profile information', () => {
      it('Maps the domestic abuse perpetrator field', async () => {
        const response = await constructService().get('token', PrisonerMockDataA)
        expect(response.personalDetails.domesticAbusePerpetrator).toEqual('Not stated')
      })

      it('Maps the domestic abuse victim field', async () => {
        const response = await constructService().get('token', PrisonerMockDataA)
        expect(response.personalDetails.domesticAbuseVictim).toEqual('Not stated')
      })

      it('Maps the number of children field', async () => {
        const response = await constructService().get('token', PrisonerMockDataA)
        expect(response.personalDetails.numberOfChildren).toEqual('2')
      })

      it('Maps the other nationalities field', async () => {
        const response = await constructService().get('token', PrisonerMockDataA)
        expect(response.personalDetails.otherNationalities).toEqual('multiple nationalities field')
      })

      it('Maps the sexual orientation field', async () => {
        const response = await constructService().get('token', PrisonerMockDataA)
        expect(response.personalDetails.sexualOrientation).toEqual('Heterosexual / Straight')
      })

      describe('Smoker or vaper', () => {
        it.each([
          [true, 'Smoker'],
          [false, 'No'],
        ])('Maps the smoker or vaper field (Prison person enabled: %s)', async (prisonPersonEnabled, expectedValue) => {
          const response = await constructService().get('token', PrisonerMockDataA, prisonPersonEnabled)
          expect(response.personalDetails.smokerOrVaper).toEqual(expectedValue)
        })
      })

      describe('Medical diet', () => {
        it.each([
          [true, [{ id: 'MEDICAL_DIET_LOW_FAT', description: 'Low fat' }]],
          [false, []],
        ])('Maps the medical diet field (Prison person enabled: %s)', async (prisonPersonEnabled, expectedValue) => {
          const response = await constructService().get('token', PrisonerMockDataA, prisonPersonEnabled)
          expect(response.personalDetails.medicalDietaryRequirements).toEqual(expectedValue)
        })
      })

      describe('Food allergies', () => {
        it.each([
          [true, [{ id: 'FOOD_ALLERGY_GLUTEN', description: 'Gluten' }]],
          [false, []],
        ])('Maps the food allergies field (Prison person enabled: %s)', async (prisonPersonEnabled, expectedValue) => {
          const response = await constructService().get('token', PrisonerMockDataA, prisonPersonEnabled)
          expect(response.personalDetails.foodAllergies).toEqual(expectedValue)
        })
      })

      it('Maps the social care needed field', async () => {
        const response = await constructService().get('token', PrisonerMockDataA)
        expect(response.personalDetails.socialCareNeeded).toEqual('No')
      })

      it('Maps the type of diet field', async () => {
        const response = await constructService().get('token', PrisonerMockDataA)
        expect(response.personalDetails.typeOfDiet).toEqual('Voluntary - Pork Free/Fish Free')
      })
    })

    describe('Languages', () => {
      it('Maps the primary language and interpreter requirement', async () => {
        const response = await constructService().get('token', PrisonerMockDataA)
        const { languages } = response.personalDetails
        expect(languages.written).toEqual(inmateDetailMock.writtenLanguage)
        expect(languages.spoken).toEqual(inmateDetailMock.language)
        expect(languages.interpreterRequired).toEqual(inmateDetailMock.interpreterRequired)
      })

      describe('Other languages', () => {
        it('Correctly handles no secondary languages', async () => {
          prisonApiClient.getSecondaryLanguages = jest.fn(async (): Promise<SecondaryLanguage[]> => [])
          const response = await constructService().get('token', PrisonerMockDataA)
          expect(response.personalDetails.otherLanguages).toEqual([])
        })

        it('Maps the other languages from the secondary languages provided', async () => {
          const response = await constructService().get('token', PrisonerMockDataA)
          expect(response.personalDetails.otherLanguages.length).toEqual(5)
          const [first, second] = response.personalDetails.otherLanguages
          expect(first).toEqual({
            canRead: false,
            canSpeak: false,
            canWrite: false,
            code: 'AZE',
            language: 'Azerbaijani',
          })
          expect(second).toEqual({
            canRead: true,
            canSpeak: true,
            canWrite: false,
            code: 'BSL',
            language: 'British Sign Language',
          })
        })
      })
    })

    describe('One-to-one mapped data', () => {
      it('Maps the data from the API', async () => {
        const { personalDetails } = await constructService().get('token', PrisonerMockDataA)
        expect(personalDetails.dateOfBirth).toEqual(formatDate(PrisonerMockDataA.dateOfBirth, 'short'))
        expect(personalDetails.ethnicGroup).toEqual(
          `${PrisonerMockDataA.ethnicity} (${prisonerDetailMock.ethnicityCode})`,
        )
        expect(personalDetails.fullName).toEqual(
          formatName(PrisonerMockDataA.firstName, PrisonerMockDataA.middleNames, PrisonerMockDataA.lastName),
        )
        expect(personalDetails.marriageOrCivilPartnership).toEqual(PrisonerMockDataA.maritalStatus)
        expect(personalDetails.nationality).toEqual(PrisonerMockDataA.nationality)
        expect(personalDetails.cityOrTownOfBirth).toEqual(convertToTitleCase(inmateDetailMock.birthPlace))
        expect(personalDetails.countryOfBirth).toEqual(EnglandCountryReferenceDataCodeMock.description)
        expect(personalDetails.preferredName).toEqual(
          formatName(prisonerDetailMock.currentWorkingFirstName, undefined, prisonerDetailMock.currentWorkingLastName),
        )
        expect(personalDetails.religionOrBelief).toEqual(PrisonerMockDataA.religion)
        expect(personalDetails.sex).toEqual(PrisonerMockDataA.gender)
      })
    })
  })

  describe('Identity numbers', () => {
    it('Maps the data from the API', async () => {
      const { identityNumbers } = await constructService().get('token', PrisonerMockDataA)
      expect(identityNumbers.croNumber).toEqual([{ comment: 'P/CONS', value: '400862/08W' }])
      expect(identityNumbers.drivingLicenceNumber).toEqual([{ value: 'ABCD/123456/AB9DE' }])
      expect(identityNumbers.homeOfficeReferenceNumber).toEqual([{ value: 'A1234567' }])
      expect(identityNumbers.nationalInsuranceNumber).toEqual([{ value: 'QQ123456C' }])
      expect(identityNumbers.pncNumber).toEqual([
        { comment: 'P/CONS', value: '08/359381C' },
        { comment: 'P/CONS - fixed', value: '8/359381C' },
      ])
      expect(identityNumbers.prisonNumber).toEqual(PrisonerMockDataA.prisonerNumber)
    })
  })

  describe('Property', () => {
    it('Maps the data from the API', async () => {
      const { property } = await constructService().get('token', PrisonerMockDataA)
      expect(property[0].containerType).toEqual('Valuables')
      expect(property[0].sealMark).toEqual('MDA646165646')
      expect(property[0].location).toEqual('Property Box 14')
      expect(property[1].containerType).toEqual('Confiscated')
      expect(property[1].sealMark).toEqual('Not entered')
      expect(property[1].location).toEqual('Property Box 15')
    })
  })

  describe('Addresses', () => {
    it('Handles the API returning 404 for addresses', async () => {
      prisonApiClient.getAddresses = jest.fn(async (): Promise<Address[]> => null)
      const { addresses, addressSummary } = await constructService().get('token', PrisonerMockDataA)
      expect(addresses).toBe(undefined)
      expect(addressSummary).toEqual([])
    })

    it('Maps the data from the API for the primary address', async () => {
      const { addresses, addressSummary } = await constructService().get('token', PrisonerMockDataA)
      const expectedAddress = mockAddresses[0]
      const expectedPhones = ['4444555566', '0113444444', '0113 333444', '0800 222333']
      const expectedTypes = ['Discharge - Permanent Housing', 'HDC Address', 'Other']

      expect(addresses.addedOn).toEqual(expectedAddress.startDate)
      expect(addresses.comment).toEqual(expectedAddress.comment)
      expect(addresses.phones).toEqual(expectedPhones)
      expect(addresses.addressTypes).toEqual(expectedTypes)

      const { country, county, flat, locality, postalCode, premise, street, town } = addresses.address

      expect(country).toEqual(expectedAddress.country)
      expect(county).toEqual(expectedAddress.county)
      expect(flat).toEqual(expectedAddress.flat)
      expect(locality).toEqual(expectedAddress.locality)
      expect(postalCode).toEqual(expectedAddress.postalCode)
      expect(premise).toEqual(expectedAddress.premise)
      expect(street).toEqual(expectedAddress.street)
      expect(town).toEqual(expectedAddress.town)

      expect(addressSummary).toEqual(addressSummaryMock)
    })
  })

  describe('Next of kin', () => {
    it('Only maps the active next of kin', async () => {
      const { nextOfKin } = await constructService().get('token', PrisonerMockDataA)
      expect(nextOfKin.length).toEqual(3)
    })

    it('Gets the addresses for each active next of kin', async () => {
      await constructService().get('token', PrisonerMockDataA)
      expect(prisonApiClient.getAddressesForPerson).toHaveBeenCalledTimes(3)

      const expectedPersonIds = mockOffenderContacts.offenderContacts
        .filter(contact => contact.active && contact.nextOfKin)
        .map(({ personId }) => personId)

      expectedPersonIds.forEach(personId =>
        expect(prisonApiClient.getAddressesForPerson).toHaveBeenCalledWith(personId),
      )
    })

    it('Maps the primary address for the contact', async () => {
      const { nextOfKin } = await constructService().get('token', PrisonerMockDataA)
      const expectedAddress = mockAddresses[0]
      const expectedPhones = ['4444555566', '0113444444', '0113 333444', '0800 222333']
      const expectedTypes = ['Discharge - Permanent Housing', 'HDC Address', 'Other']

      nextOfKin.forEach(contact => {
        const { address } = contact

        expect(address.phones).toEqual(expectedPhones)
        expect(address.addressTypes).toEqual(expectedTypes)
        const { country, county, flat, locality, postalCode, premise, street, town } = address.address

        expect(country).toEqual(expectedAddress.country)
        expect(county).toEqual(expectedAddress.county)
        expect(flat).toEqual(expectedAddress.flat)
        expect(locality).toEqual(expectedAddress.locality)
        expect(postalCode).toEqual(expectedAddress.postalCode)
        expect(premise).toEqual(expectedAddress.premise)
        expect(street).toEqual(expectedAddress.street)
        expect(town).toEqual(expectedAddress.town)
      })
    })

    it('Maps the data for the contact from the API', async () => {
      const offenderContacts: OffenderContacts = {
        offenderContacts: [
          {
            bookingId: 12345,
            approvedVisitor: true,
            contactType: 'Person',
            active: true,
            nextOfKin: true,
            emergencyContact: true,
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last',
            relationshipCode: 'CODE',
            relationshipDescription: 'Relationship description',
            phones: [
              {
                number: '12345',
                type: 'MOB',
              },
              {
                number: '54321',
                type: 'MOB',
              },
            ],
            emails: [{ email: 'example@one.com' }, { email: 'example@two.com' }],
          },
        ],
      }
      prisonApiClient.getOffenderContacts = jest.fn(async () => offenderContacts)
      const { nextOfKin } = await constructService().get('token', PrisonerMockDataA)
      const contact = nextOfKin[0]

      expect(contact.emails).toEqual(['example@one.com', 'example@two.com'])
      expect(contact.phones).toEqual(['12345', '54321'])

      expect(contact.name).toEqual('First Middle Last')
      expect(contact.nextOfKin).toEqual(true)
      expect(contact.emergencyContact).toEqual(true)
      expect(contact.relationship).toEqual('Relationship description')
    })

    it('Handles no addresses defined for the contact', async () => {
      const offenderContacts: OffenderContacts = {
        offenderContacts: [
          {
            bookingId: 12345,
            approvedVisitor: true,
            contactType: 'Person',
            active: true,
            nextOfKin: true,
            emergencyContact: true,
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last',
            relationshipCode: 'CODE',
            relationshipDescription: 'Relationship description',
            phones: [
              {
                number: '12345',
                type: 'MOB',
              },
              {
                number: '54321',
                type: 'MOB',
              },
            ],
            emails: [{ email: 'example@one.com' }, { email: 'example@two.com' }],
          },
        ],
      }
      prisonApiClient.getOffenderContacts = jest.fn(async () => offenderContacts)
      prisonApiClient.getAddressesForPerson = jest.fn(async (): Promise<Address[]> => [])
      const { nextOfKin } = await constructService().get('token', PrisonerMockDataA)
      const contact = nextOfKin[0]

      expect(contact.emails).toEqual(['example@one.com', 'example@two.com'])
      expect(contact.phones).toEqual(['12345', '54321'])

      expect(contact.name).toEqual('First Middle Last')
      expect(contact.nextOfKin).toEqual(true)
      expect(contact.emergencyContact).toEqual(true)
      expect(contact.relationship).toEqual('Relationship description')
    })
  })

  describe('Appearance', () => {
    it('Maps the data from the API', async () => {
      const { physicalCharacteristics } = await constructService().get('token', PrisonerMockDataA)
      expect(physicalCharacteristics.height).toEqual('1.88m')
      expect(physicalCharacteristics.weight).toEqual('86kg')
      expect(physicalCharacteristics.hairColour).toEqual('Brown')
      expect(physicalCharacteristics.leftEyeColour).toEqual('Blue')
      expect(physicalCharacteristics.rightEyeColour).toEqual('Blue')
      expect(physicalCharacteristics.shapeOfFace).toEqual('Angular')
      expect(physicalCharacteristics.build).toEqual('Proportional')
      expect(physicalCharacteristics.shoeSize).toEqual('10')
      expect(physicalCharacteristics.warnedAboutTattooing).toEqual('Yes')
      expect(physicalCharacteristics.warnedNotToChangeAppearance).toEqual('Yes')

      const { distinguishingMarks } = physicalCharacteristics
      expect(distinguishingMarks.length).toEqual(4)

      expect(distinguishingMarks[0].type).toEqual('Tattoo')
      expect(distinguishingMarks[0].side).toEqual('Left')
      expect(distinguishingMarks[0].comment).toEqual('Red bull Logo')
      expect(distinguishingMarks[0].imageId).toEqual(1413021)

      expect(distinguishingMarks[1].type).toEqual('Tattoo')
      expect(distinguishingMarks[1].side).toEqual('Front')
      expect(distinguishingMarks[1].comment).toEqual('ARC reactor image')
      expect(distinguishingMarks[1].imageId).toEqual(1413020)

      expect(distinguishingMarks[2].type).toEqual('Tattoo')
      expect(distinguishingMarks[2].side).toEqual('Right')
      expect(distinguishingMarks[2].comment).toEqual('Monster drink logo')
      expect(distinguishingMarks[2].orientation).toEqual('Facing')
      expect(distinguishingMarks[2].imageId).toEqual(1413022)
    })

    it('Handles no physical marks', async () => {
      const inmateDetail = { ...inmateDetailMock }
      inmateDetail.physicalMarks = []
      prisonApiClient.getInmateDetail = jest.fn(async () => inmateDetail)
      const { physicalCharacteristics } = await constructService().get('token', PrisonerMockDataA)
      expect(physicalCharacteristics.distinguishingMarks.length).toEqual(0)
    })
  })

  describe('Security', () => {
    it('Maps the data from the API', async () => {
      const { security } = await constructService().get('token', PrisonerMockDataA)
      expect(security.interestToImmigration).toEqual('Yes')
      expect(security.travelRestrictions).toEqual('some travel restrictions')
    })
  })

  describe('Addresses returns undefined', () => {
    it('Sets the address to empty', async () => {
      prisonApiClient.getAddresses = jest.fn(async (): Promise<Address[]> => undefined)
      const { addresses } = await constructService().get('token', PrisonerMockDataA)
      expect(addresses).toBeUndefined()
    })
  })

  describe('Get Learner Neurodivergence information', () => {
    const neurodivergenceEnabledPrison = 'BLI'
    const neurodivergenceDisabledPrison = 'MDI'
    const prisonerData = { ...PrisonerMockDataA, prisonId: neurodivergenceEnabledPrison }

    it('Gets the neurodivergence information', async () => {
      curiousApiClient.getLearnerNeurodivergence = jest.fn(async () => LearnerNeurodivergenceMock)
      const data = await constructService().get('token', prisonerData)
      expect(data.learnerNeurodivergence.isFulfilled()).toBe(true)
      expect(data.learnerNeurodivergence.getOrNull()).toEqual(LearnerNeurodivergenceMock)
    })

    it('Handles a 404 from the Curious API, which is presented to the service as null', async () => {
      curiousApiClient.getLearnerNeurodivergence = jest.fn(async (): Promise<LearnerNeurodivergence[]> => null)
      const data = await constructService().get('token', prisonerData)
      expect(data.learnerNeurodivergence.isFulfilled()).toBe(true)
      expect(data.learnerNeurodivergence.getOrThrow()).toBeNull()
    })

    it('Handles a Curious API failure', async () => {
      const curiousApiError = {
        status: 501,
        data: {
          status: 501,
          userMessage: 'An unexpected error occurred',
          developerMessage: 'An unexpected error occurred',
        },
      }
      const apiErrorCallback = jest.fn()
      curiousApiClient.getLearnerNeurodivergence = jest.fn(async () => Promise.reject(curiousApiError))
      const data = await constructService().get('token', prisonerData, false, apiErrorCallback)
      expect(data.learnerNeurodivergence.isFulfilled()).toBe(false)
      expect(apiErrorCallback).toHaveBeenCalledWith(curiousApiError)
    })

    it('should not return neurodiversity if not at supported prison', async () => {
      curiousApiClient.getLearnerNeurodivergence = jest.fn(async (): Promise<LearnerNeurodivergence[]> => null)
      const data = await constructService().get('token', { ...prisonerData, prisonId: neurodivergenceDisabledPrison })
      expect(data.learnerNeurodivergence.isFulfilled()).toBe(true)
      expect(data.learnerNeurodivergence.getOrNull()).toEqual([])
    })
  })

  describe('Prison Person API Enabled', () => {
    it('Gets the height and weight from the prison person API', async () => {
      const data = await constructService().get('token', PrisonerMockDataA, true)
      expect(data.physicalCharacteristics.height).toBe('1m')
      expect(data.physicalCharacteristics.weight).toBe('100kg')
    })
  })

  describe('Update physical attributes', () => {
    it('Makes a call to the prison person api to update physical attributes', async () => {
      await constructService().updatePhysicalAttributes('token', prisonUserMock, 'A1234AA', { height: 123 })
      expect(prisonPersonApiClient.updatePhysicalAttributes).toHaveBeenCalledWith('A1234AA', { height: 123 })
      expect(metricsService.trackPrisonPersonUpdate).toHaveBeenLastCalledWith({
        prisonerNumber: 'A1234AA',
        fieldsUpdated: ['height'],
        user: prisonUserMock,
      })
    })
  })

  describe('Update Smoker or Vaper', () => {
    it('Updates the smoker or vaper on the API', async () => {
      await constructService().updateSmokerOrVaper('token', prisonUserMock, 'A1234AA', 'Yes')
      expect(prisonPersonApiClient.updateHealth).toHaveBeenCalledWith('A1234AA', { smokerOrVaper: 'Yes' })
      expect(metricsService.trackPrisonPersonUpdate).toHaveBeenLastCalledWith({
        prisonerNumber: 'A1234AA',
        fieldsUpdated: ['smokerOrVaper'],
        user: prisonUserMock,
      })
    })
  })

  describe('Update medical diet', () => {
    it('Updates the medical diet on the API', async () => {
      await constructService().updateMedicalDietaryRequirements('token', prisonUserMock, 'A1234AA', [
        'MEDICAL_DIET_LOW_FAT',
      ])
      expect(prisonPersonApiClient.updateHealth).toHaveBeenCalledWith('A1234AA', {
        medicalDietaryRequirements: ['MEDICAL_DIET_LOW_FAT'],
      })
      expect(metricsService.trackPrisonPersonUpdate).toHaveBeenLastCalledWith({
        prisonerNumber: 'A1234AA',
        fieldsUpdated: ['medicalDietaryRequirements'],
        user: prisonUserMock,
      })
    })
  })

  describe('Update food allergies', () => {
    it('Updates the food allergies on the API', async () => {
      await constructService().updateFoodAllergies('token', prisonUserMock, 'A1234AA', ['FOOD_ALLERGY_GLUTEN'])
      expect(prisonPersonApiClient.updateHealth).toHaveBeenCalledWith('A1234AA', {
        foodAllergies: ['FOOD_ALLERGY_GLUTEN'],
      })
      expect(metricsService.trackPrisonPersonUpdate).toHaveBeenLastCalledWith({
        prisonerNumber: 'A1234AA',
        fieldsUpdated: ['foodAllergies'],
        user: prisonUserMock,
      })
    })
  })

  describe('Prison person distinguishing marks', () => {
    it('should get distinguishing marks from prison person api when enabled', async () => {
      const { distinguishingMarks } = await constructService().get('token', PrisonerMockDataA, true)
      expect(distinguishingMarks).toEqual([distinguishingMarkMock])
    })

    it('should not get distinguishing marks from prison person api when not enabled', async () => {
      const { distinguishingMarks } = await constructService().get('token', PrisonerMockDataA, false)
      expect(distinguishingMarks).toEqual(null)
    })
  })

  describe('Update city or town of birth', () => {
    it('Updates the birth place using Person Integration API', async () => {
      await constructService().updateCityOrTownOfBirth('token', prisonUserMock, 'A1234AA', 'London')
      expect(personIntegrationApiClient.updateBirthPlace).toHaveBeenCalledWith('A1234AA', 'London')
      expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenLastCalledWith({
        prisonerNumber: 'A1234AA',
        fieldsUpdated: ['cityOrTownOfBirth'],
        user: prisonUserMock,
      })
    })
  })
})
