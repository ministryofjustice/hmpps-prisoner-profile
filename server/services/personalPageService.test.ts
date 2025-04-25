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
import MetricsService from './metrics/metricsService'
import { prisonUserMock } from '../data/localMockData/user'
import Address from '../data/interfaces/prisonApi/Address'
import SecondaryLanguage from '../data/interfaces/prisonApi/SecondaryLanguage'
import LearnerNeurodivergence from '../data/interfaces/curiousApi/LearnerNeurodivergence'
import {
  PersonIntegrationApiClient,
  PseudonymResponseDto,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import ReferenceDataService from './referenceData/referenceDataService'
import {
  EnglandCountryReferenceDataCodeMock,
  MilitaryRecordsMock,
} from '../data/localMockData/personIntegrationApiReferenceDataMock'
import {
  HealthAndMedicationApiClient,
  ValueWithMetadata,
} from '../data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'
import {
  dietAndAllergyMock,
  healthAndMedicationMock,
} from '../data/localMockData/healthAndMedicationApi/healthAndMedicationMock'
import { corePersonPhysicalAttributesMock } from '../data/localMockData/physicalAttributesMock'
import { ReferenceDataValue } from '../data/interfaces/ReferenceDataValue'
import { personIntegrationApiClientMock } from '../../tests/mocks/personIntegrationApiClientMock'
import PrisonService from './prisonService'
import { Prison } from './interfaces/prisonService/PrisonServicePrisons'
import {
  PersonalRelationshipsApiClient,
  PersonalRelationshipsDomesticStatusDto,
  PersonalRelationshipsDomesticStatusUpdateRequest,
  PersonalRelationshipsNumberOfChildrenUpdateRequest,
} from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import {
  PersonalRelationshipsContactsDtoMock,
  PersonalRelationshipsDomesticStatusMock,
  PersonalRelationshipsNumberOfChildrenMock,
} from '../data/localMockData/personalRelationshipsApiMock'
import NextOfKinService from './nextOfKinService'
import DomesticStatusService from './domesticStatusService'

jest.mock('./metrics/metricsService')
jest.mock('./referenceData/referenceDataService')

describe('PersonalPageService', () => {
  let prisonApiClient: PrisonApiClient
  let curiousApiClient: CuriousApiClient
  let personIntegrationApiClient: PersonIntegrationApiClient
  let healthAndMedicationApiClient: HealthAndMedicationApiClient
  let personalRelationshipsApiClient: PersonalRelationshipsApiClient
  let referenceDataService: ReferenceDataService
  let prisonService: PrisonService
  let metricsService: MetricsService
  let nextOfKinService: NextOfKinService
  let domesticStatusService: DomesticStatusService

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
    personIntegrationApiClient = personIntegrationApiClientMock()

    healthAndMedicationApiClient = {
      getReferenceDataCodes: jest.fn(),
      getHealthAndMedication: jest.fn(async () => healthAndMedicationMock),
      updateDietAndAllergyData: jest.fn(async () => dietAndAllergyMock),
      updateSmokerStatus: jest.fn(async () => {}),
    }

    referenceDataService = new ReferenceDataService(null, null) as jest.Mocked<ReferenceDataService>
    referenceDataService.getReferenceData = jest.fn(async () => EnglandCountryReferenceDataCodeMock)

    prisonService = new PrisonService(null, null) as jest.Mocked<PrisonService>
    prisonService.getPrisonByPrisonId = jest.fn(async () => ({ prisonId: 'STI', prisonName: 'Styal (HMP)' }))

    metricsService = new MetricsService(null) as jest.Mocked<MetricsService>

    personalRelationshipsApiClient = {
      getContacts: jest.fn(async () => PersonalRelationshipsContactsDtoMock),
      getContactCount: jest.fn(async () => ({ official: 1, social: 1 })),
      getNumberOfChildren: jest.fn(async () => PersonalRelationshipsNumberOfChildrenMock),
      updateNumberOfChildren: jest.fn(async () => PersonalRelationshipsNumberOfChildrenMock),
      getDomesticStatus: jest.fn(async () => PersonalRelationshipsDomesticStatusMock),
      updateDomesticStatus: jest.fn(async () => PersonalRelationshipsDomesticStatusMock),
      createContact: jest.fn(),
      getReferenceDataCodes: jest.fn(),
    }

    nextOfKinService = new NextOfKinService(null, referenceDataService, metricsService) as jest.Mocked<NextOfKinService>
    nextOfKinService.getNextOfKinEmergencyContacts = jest.fn(async () => PersonalRelationshipsContactsDtoMock.content)

    domesticStatusService = new DomesticStatusService(
      null,
      referenceDataService,
      metricsService,
    ) as jest.Mocked<DomesticStatusService>
    domesticStatusService.getDomesticStatus = jest.fn(async () => PersonalRelationshipsDomesticStatusMock)
  })

  const constructService = () =>
    new PersonalPageService(
      () => prisonApiClient,
      () => curiousApiClient,
      () => personIntegrationApiClient,
      () => healthAndMedicationApiClient,
      () => personalRelationshipsApiClient,
      referenceDataService,
      prisonService,
      metricsService,
      () => Promise.resolve({ curiousApiToken: 'token' }),
      nextOfKinService,
      domesticStatusService,
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
      describe('Aliases from Prisoner Search', () => {
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
            { dateOfBirth: '2022-01-01', firstName: 'First name', lastName: 'Last name', gender: 'Male' },
            {
              dateOfBirth: '2023-01-01',
              firstName: 'First',
              middleNames: 'Middle',
              lastName: 'Last',
              gender: 'Female',
            },
          ])
          expect(response.personalDetails.aliases[0]).toEqual({
            alias: 'First Name Last Name',
            dateOfBirth: '01/01/2022',
            sex: 'Male',
          })
          expect(response.personalDetails.aliases[1]).toEqual({
            alias: 'First Middle Last',
            dateOfBirth: '01/01/2023',
            sex: 'Female',
          })
        })
      })

      describe('Aliases from Person Integration API after an update', () => {
        const getResponseWithPseudonyms = async (pseudonyms: PseudonymResponseDto[]) => {
          personIntegrationApiClient.getPseudonyms = jest.fn(async () => pseudonyms)
          const service = constructService()
          return service.get('token', PrisonerMockDataA, false, false, null, { fieldName: 'fullName' })
        }

        it('Handles no pseudonyms', async () => {
          const response = await getResponseWithPseudonyms([])
          expect(response.personalDetails.aliases).toEqual([])
        })

        it('Handles only working name pseudonym', async () => {
          const response = await getResponseWithPseudonyms([
            { firstName: 'Ignore Working Name', isWorkingName: true } as PseudonymResponseDto,
          ])
          expect(response.personalDetails.aliases).toEqual([])
        })

        it('Maps multiple pseudonyms', async () => {
          const male = { description: 'Male' } as ReferenceDataValue
          const female = { description: 'Female' } as ReferenceDataValue

          const response = await getResponseWithPseudonyms([
            { firstName: 'Ignore Working Name', isWorkingName: true } as PseudonymResponseDto,
            {
              dateOfBirth: '2022-01-01',
              firstName: 'First name',
              lastName: 'Last name',
              sex: male,
            } as PseudonymResponseDto,
            {
              dateOfBirth: '2023-01-01',
              firstName: 'First',
              middleName1: 'Middleone',
              lastName: 'Last',
              sex: female,
            } as PseudonymResponseDto,
            {
              dateOfBirth: '2023-01-01',
              firstName: 'First',
              middleName1: 'Middleone',
              middleName2: 'Middletwo',
              lastName: 'Last',
              sex: female,
            } as PseudonymResponseDto,
          ])

          expect(response.personalDetails.aliases[0]).toEqual({
            alias: 'First Name Last Name',
            dateOfBirth: '01/01/2022',
            sex: 'Male',
          })
          expect(response.personalDetails.aliases[1]).toEqual({
            alias: 'First Middleone Last',
            dateOfBirth: '01/01/2023',
            sex: 'Female',
          })
          expect(response.personalDetails.aliases[2]).toEqual({
            alias: 'First Middleone Middletwo Last',
            dateOfBirth: '01/01/2023',
            sex: 'Female',
          })
        })

        it('Falls back to Prisoner Search results if Person Integration API call fails', async () => {
          personIntegrationApiClient.getPseudonyms = async () => {
            throw new Error()
          }
          const service = constructService()
          const prisonerData = { ...PrisonerMockDataA }
          prisonerData.aliases = [
            {
              dateOfBirth: '2022-01-01',
              firstName: 'First name',
              lastName: 'Last name',
            } as Alias,
          ]
          const response = await service.get('token', prisonerData, false, false, null, { fieldName: 'full-name' })
          expect(response.personalDetails.aliases).toEqual([
            {
              alias: 'First Name Last Name',
              dateOfBirth: '01/01/2022',
            },
          ])
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

      it('Maps the other nationalities field', async () => {
        const response = await constructService().get('token', PrisonerMockDataA)
        expect(response.personalDetails.otherNationalities).toEqual('multiple nationalities field')
      })

      it('Maps the sexual orientation field', async () => {
        const response = await constructService().get('token', PrisonerMockDataA)
        expect(response.personalDetails.sexualOrientation).toEqual('Heterosexual / Straight')
      })

      describe.skip('Smoker or vaper', () => {
        it.each([
          // This isn't provided by the health mock at the moment so is 'Not entered'
          [true, 'Not entered'],
          [false, 'No'],
        ])('Maps the smoker or vaper field (Prison person enabled: %s)', async (prisonPersonEnabled, expectedValue) => {
          const response = await constructService().get('token', PrisonerMockDataA, prisonPersonEnabled)
          expect(response.personalDetails.smokerOrVaper).toEqual(expectedValue)
        })
      })

      describe('Food allergies', () => {
        it.each([
          [true, [{ id: 'FOOD_ALLERGY_EGG', description: 'Egg' }]],
          [false, []],
        ])(
          'Maps the food allergies field (Diet and allergies enabled: %s)',
          async (dietAndAllergiesEnabled, expectedValue) => {
            const response = await constructService().get('token', PrisonerMockDataA, dietAndAllergiesEnabled, false)
            expect(response.personalDetails.dietAndAllergy.foodAllergies).toEqual(expectedValue)
          },
        )
      })

      describe('Medical diet', () => {
        it.each([
          [true, [{ id: 'MEDICAL_DIET_COELIAC', description: 'Coeliac' }]],
          [false, []],
        ])(
          'Maps the medical diet field (Prison person enabled: %s)',
          async (dietAndAllergiesEnabled, expectedValue) => {
            const response = await constructService().get('token', PrisonerMockDataA, dietAndAllergiesEnabled, false)
            expect(response.personalDetails.dietAndAllergy.medicalDietaryRequirements).toEqual(expectedValue)
          },
        )
      })

      describe('Personalised diet', () => {
        it.each([
          [true, [{ id: 'PERSONALISED_DIET_VEGAN', description: 'Vegan' }]],
          [false, []],
        ])(
          'Maps the medical diet field (Prison person enabled: %s)',
          async (dietAndAllergiesEnabled, expectedValue) => {
            const response = await constructService().get('token', PrisonerMockDataA, dietAndAllergiesEnabled, false)
            expect(response.personalDetails.dietAndAllergy.personalisedDietaryRequirements).toEqual(expectedValue)
          },
        )
      })

      describe('Diet and allergy modification details', () => {
        it.each([
          [true, '2 July 2024'],
          [false, ''],
        ])(
          'Maps the lastModifiedAt field to the latest timestamp (Prison person enabled: %s)',
          async (dietAndAllergiesEnabled, expectedValue) => {
            prisonService.getPrisonByPrisonId = jest.fn(async () => ({ prisonName: 'Moorland (HMP & YOI)' }) as Prison)
            const response = await constructService().get('token', PrisonerMockDataA, dietAndAllergiesEnabled, false)
            expect(response.personalDetails.dietAndAllergy.lastModifiedAt).toEqual(expectedValue)
          },
        )

        it.each([
          [true, 'Moorland (HMP & YOI)'],
          [false, ''],
        ])(
          'Maps the lastModifiedPrison field (Prison person enabled: %s)',
          async (dietAndAllergiesEnabled, expectedValue) => {
            prisonService.getPrisonByPrisonId = jest.fn(async () => ({ prisonName: expectedValue }) as Prison)
            const response = await constructService().get('token', PrisonerMockDataA, dietAndAllergiesEnabled, false)
            expect(response.personalDetails.dietAndAllergy.lastModifiedPrison).toEqual(expectedValue)
          },
        )
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
        expect(personalDetails.marriageOrCivilPartnership).toEqual(
          PersonalRelationshipsDomesticStatusMock.domesticStatusDescription,
        )
        expect(personalDetails.nationality).toEqual(PrisonerMockDataA.nationality)
        expect(personalDetails.cityOrTownOfBirth).toEqual(convertToTitleCase(inmateDetailMock.birthPlace))
        expect(personalDetails.countryOfBirth).toEqual(EnglandCountryReferenceDataCodeMock.description)
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

  describe('Appearance', () => {
    it('Maps the data from the API', async () => {
      const { physicalCharacteristics } = await constructService().get('token', PrisonerMockDataA)
      expect(physicalCharacteristics.height).toEqual('1m')
      expect(physicalCharacteristics.weight).toEqual('100kg')
      expect(physicalCharacteristics.hairColour).toEqual('Brown')
      expect(physicalCharacteristics.leftEyeColour).toEqual('Blue')
      expect(physicalCharacteristics.rightEyeColour).toEqual('Blue')
      expect(physicalCharacteristics.shapeOfFace).toEqual('Oval')
      expect(physicalCharacteristics.build).toEqual('Average')
      expect(physicalCharacteristics.shoeSize).toEqual('11')
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
      const data = await constructService().get('token', prisonerData, false, false, apiErrorCallback)
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
      expect(personIntegrationApiClient.getPhysicalAttributes).toHaveBeenCalledWith('A1234AA')
      expect(personIntegrationApiClient.updatePhysicalAttributes).toHaveBeenCalledWith('A1234AA', {
        ...corePersonPhysicalAttributesMock,
        height: 123,
      })
      expect(metricsService.trackPrisonPersonUpdate).toHaveBeenLastCalledWith({
        prisonerNumber: 'A1234AA',
        fieldsUpdated: ['height'],
        user: prisonUserMock,
      })
    })
  })

  describe('Update Smoker or Vaper', () => {
    it('Updates the smoker or vaper on the API', async () => {
      await constructService().updateSmokerOrVaper('token', prisonUserMock, 'A1234AA', 'SMOKER_YES')
      expect(healthAndMedicationApiClient.updateSmokerStatus).toHaveBeenCalledWith('A1234AA', {
        smokerStatus: 'SMOKER_YES',
      })
      expect(metricsService.trackPrisonPersonUpdate).toHaveBeenLastCalledWith({
        prisonerNumber: 'A1234AA',
        fieldsUpdated: ['smokerOrVaper'],
        user: prisonUserMock,
      })
    })
  })

  describe('Get diet and allergy data', () => {
    it('Gets the data from the API when diet and allergy is enabled', async () => {
      const { personalDetails } = await constructService().get('token', PrisonerMockDataA, true, false)

      expect(healthAndMedicationApiClient.getHealthAndMedication).toHaveBeenCalledWith(PrisonerMockDataA.prisonerNumber)

      expect(personalDetails.dietAndAllergy.foodAllergies).toEqual([{ description: 'Egg', id: 'FOOD_ALLERGY_EGG' }])
      expect(personalDetails.dietAndAllergy.medicalDietaryRequirements).toEqual([
        { description: 'Coeliac', id: 'MEDICAL_DIET_COELIAC' },
      ])
      expect(personalDetails.dietAndAllergy.personalisedDietaryRequirements).toEqual([
        { description: 'Vegan', id: 'PERSONALISED_DIET_VEGAN' },
      ])
      expect(personalDetails.dietAndAllergy.cateringInstructions).toEqual('Some catering instructions.')
      expect(personalDetails.dietAndAllergy.lastModifiedAt).toEqual('2 July 2024')
      expect(personalDetails.dietAndAllergy.lastModifiedPrison).toEqual('Styal (HMP)')
    })

    it('Handles missing dietAndAllergy fields', async () => {
      healthAndMedicationApiClient.getHealthAndMedication = jest.fn(async () => ({
        dietAndAllergy: {
          ...dietAndAllergyMock,
          cateringInstructions: undefined as ValueWithMetadata<string>,
        },
      }))

      const { personalDetails } = await constructService().get('token', PrisonerMockDataA, true, false)

      expect(personalDetails.dietAndAllergy.cateringInstructions).toBeFalsy()
      expect(personalDetails.dietAndAllergy.lastModifiedAt).toEqual('1 July 2024')
      expect(personalDetails.dietAndAllergy.lastModifiedPrison).toEqual('Styal (HMP)')
    })

    it('Does not get the data from the API when diet and allergy is disabled', async () => {
      const { personalDetails } = await constructService().get('token', PrisonerMockDataA, false, false)

      expect(healthAndMedicationApiClient.getHealthAndMedication).not.toHaveBeenCalledWith(
        PrisonerMockDataA.prisonerNumber,
      )

      expect(personalDetails.dietAndAllergy.foodAllergies).toEqual([])
      expect(personalDetails.dietAndAllergy.medicalDietaryRequirements).toEqual([])
      expect(personalDetails.dietAndAllergy.personalisedDietaryRequirements).toEqual([])
    })
  })

  describe('Update diet and food allergies', () => {
    it('Updates the diet and food allergies on the health and medication api', async () => {
      const update = {
        foodAllergies: [{ value: 'FOOD_ALLERGY' }],
        medicalDietaryRequirements: [{ value: 'MEDICAL_DIET' }],
        personalisedDietaryRequirements: [{ value: 'PERSONALISED_DIET' }],
      }

      await constructService().updateDietAndFoodAllergies('token', prisonUserMock, 'ABC123', update)
      expect(healthAndMedicationApiClient.updateDietAndAllergyData).toHaveBeenCalledWith('ABC123', update)
      expect(metricsService.trackHealthAndMedicationUpdate).toHaveBeenLastCalledWith({
        prisonerNumber: 'ABC123',
        fieldsUpdated: ['foodAllergies', 'medicalDietaryRequirements', 'personalisedDietaryRequirements'],
        user: prisonUserMock,
      })
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

  describe('Update country of birth', () => {
    it('Updates the country of birth using Person Integration API', async () => {
      await constructService().updateCountryOfBirth('token', prisonUserMock, 'A1234AA', 'France')
      expect(personIntegrationApiClient.updateCountryOfBirth).toHaveBeenCalledWith('A1234AA', 'France')
      expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenLastCalledWith({
        prisonerNumber: 'A1234AA',
        fieldsUpdated: ['countryOfBirth'],
        user: prisonUserMock,
      })
    })
  })

  describe('Update religion', () => {
    it('Updates the religion using Person Integration API', async () => {
      await constructService().updateReligion('token', prisonUserMock, 'A1234AA', 'ZORO', 'Some comment')
      expect(personIntegrationApiClient.updateReligion).toHaveBeenCalledWith('A1234AA', 'ZORO', 'Some comment')
      expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenLastCalledWith({
        prisonerNumber: 'A1234AA',
        fieldsUpdated: ['religion'],
        user: prisonUserMock,
      })
    })
  })

  describe('Update nationality', () => {
    it('Updates the nationality using Person Integration API', async () => {
      await constructService().updateNationality('token', prisonUserMock, 'A1234AA', 'BRIT', 'Some other nationality')
      expect(personIntegrationApiClient.updateNationality).toHaveBeenCalledWith(
        'A1234AA',
        'BRIT',
        'Some other nationality',
      )
      expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenLastCalledWith({
        prisonerNumber: 'A1234AA',
        fieldsUpdated: ['nationality', 'otherNationalities'],
        user: prisonUserMock,
      })
    })
  })

  describe('Update sexual orientation', () => {
    it('Updates the sexual orientation using Person Integration API', async () => {
      await constructService().updateSexualOrientation('token', prisonUserMock, 'A1234AA', 'HET')
      expect(personIntegrationApiClient.updateSexualOrientation).toHaveBeenCalledWith('A1234AA', 'HET')
      expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenLastCalledWith({
        prisonerNumber: 'A1234AA',
        fieldsUpdated: ['sexualOrientation'],
        user: prisonUserMock,
      })
    })
  })

  describe('getMilitaryRecords', () => {
    it('should get military records from the API', async () => {
      const service = constructService()
      personIntegrationApiClient.getMilitaryRecords = jest.fn(async () => MilitaryRecordsMock)

      const result = await service.getMilitaryRecords('token', 'A1234AA')
      expect(result).toEqual(MilitaryRecordsMock)
      expect(personIntegrationApiClient.getMilitaryRecords).toHaveBeenCalledWith('A1234AA')
    })
  })

  describe('number of children', () => {
    it('Gets the number of children from the Personal Relationships API', async () => {
      const service = constructService()
      personalRelationshipsApiClient.getNumberOfChildren = jest.fn(
        async () => PersonalRelationshipsNumberOfChildrenMock,
      )

      const result = await service.getNumberOfChildren('token', 'A1234AA')
      expect(result).toEqual(PersonalRelationshipsNumberOfChildrenMock)
      expect(personalRelationshipsApiClient.getNumberOfChildren).toHaveBeenCalledWith('A1234AA')
    })

    it('Handles a null response from the Personal Relationships API', async () => {
      const service = constructService()
      personalRelationshipsApiClient.getNumberOfChildren = jest.fn(
        async (): Promise<PersonalRelationshipsDomesticStatusDto> => null,
      )

      const result = await service.getNumberOfChildren('token', 'A1234AA')
      expect(result).toBeNull()
      expect(personalRelationshipsApiClient.getNumberOfChildren).toHaveBeenCalledWith('A1234AA')
    })

    it('Updates the number of children using the Personal Relationships API and records metrics', async () => {
      const user = prisonUserMock
      const request: PersonalRelationshipsNumberOfChildrenUpdateRequest = {
        numberOfChildren: 5,
        requestedBy: user.username,
      }
      await constructService().updateNumberOfChildren('token', prisonUserMock, 'A1234AA', 5)
      expect(personalRelationshipsApiClient.updateNumberOfChildren).toHaveBeenCalledWith('A1234AA', request)
      expect(metricsService.trackPersonalRelationshipsUpdate).toHaveBeenCalledWith({
        fieldsUpdated: ['numberOfChildren'],
        prisonerNumber: 'A1234AA',
        user,
      })
    })
  })

  describe('domestic status', () => {
    it('Gets the domestic status from the domestic status service', async () => {
      const service = constructService()
      domesticStatusService.getDomesticStatus = jest.fn(async () => PersonalRelationshipsDomesticStatusMock)

      const result = await service.getDomesticStatus('token', 'A1234AA')
      expect(result).toEqual(PersonalRelationshipsDomesticStatusMock)
      expect(domesticStatusService.getDomesticStatus).toHaveBeenCalledWith('token', 'A1234AA')
    })

    it('Gets the domestic status reference data from the domestic status service', async () => {
      const service = constructService()
      const referenceData = [
        {
          id: '1',
          code: 'S',
          description: 'Single',
          listSequence: 99,
          isActive: true,
        },
      ]
      domesticStatusService.getReferenceData = jest.fn(async () => referenceData)

      const result = await service.getDomesticStatusReferenceData('token')
      expect(result).toEqual(referenceData)
      expect(domesticStatusService.getReferenceData).toHaveBeenCalledWith('token')
    })

    it('Updates the number of children using the Personal Relationships API', async () => {
      domesticStatusService.updateDomesticStatus = jest.fn(async () => PersonalRelationshipsDomesticStatusMock)
      const user = prisonUserMock
      const request: PersonalRelationshipsDomesticStatusUpdateRequest = {
        domesticStatusCode: 'M',
        requestedBy: prisonUserMock.username,
      }
      const response = await constructService().updateDomesticStatus('token', user, 'A1234AA', 'M')
      expect(response).toEqual(PersonalRelationshipsDomesticStatusMock)
      expect(domesticStatusService.updateDomesticStatus).toHaveBeenCalledWith('token', user, 'A1234AA', request)
    })
  })
})
