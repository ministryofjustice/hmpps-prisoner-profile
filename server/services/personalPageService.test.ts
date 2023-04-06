import PersonalPageService from './personalPageService'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { prisonerDetailMock } from '../data/localMockData/prisonerDetailMock'
import { Alias } from '../interfaces/prisoner'
import { formatName, yearsBetweenDateStrings } from '../utils/utils'
import { secondaryLanguagesMock } from '../data/localMockData/secondaryLanguages'
import { propertyMock } from '../data/localMockData/property'

describe('PersonalPageService', () => {
  let prisonApiClient: PrisonApiClient

  beforeEach(() => {
    prisonApiClient = {
      getNonAssociationDetails: jest.fn(),
      getEventsScheduledForToday: jest.fn(),
      getUserCaseLoads: jest.fn(),
      getUserLocations: jest.fn(),
      getVisitBalances: jest.fn(),
      getVisitSummary: jest.fn(),
      getAdjudications: jest.fn(),
      getAccountBalances: jest.fn(),
      getAssessments: jest.fn(),
      getOffenderContacts: jest.fn(),
      getCaseNoteSummaryByTypes: jest.fn(),
      getPrisoner: jest.fn(async () => prisonerDetailMock),
      getInmateDetail: jest.fn(async () => inmateDetailMock),
      getPersonalCareNeeds: jest.fn(),
      getSecondaryLanguages: jest.fn(async () => secondaryLanguagesMock),
      getAlerts: jest.fn(),
      getOffenderActivitiesHistory: jest.fn(),
      getOffenderAttendanceHistory: jest.fn(),
      getProperty: jest.fn(async () => propertyMock),
      getCourtCases: jest.fn(),
      getOffenceHistory: jest.fn(),
      getSentenceTerms: jest.fn(),
      getPrisonerSentenceDetails: jest.fn(),
    }
  })

  describe('Getting information from the Prison API', () => {
    it('Gets inmate details from the api', async () => {
      const service = new PersonalPageService(prisonApiClient)
      await service.get(PrisonerMockDataA)
      expect(prisonApiClient.getInmateDetail).toHaveBeenCalledWith(PrisonerMockDataA.bookingId)
    })

    it('Gets secondary languages from the api', async () => {
      const service = new PersonalPageService(prisonApiClient)
      await service.get(PrisonerMockDataA)
      expect(prisonApiClient.getSecondaryLanguages).toHaveBeenCalledWith(PrisonerMockDataA.bookingId)
    })

    it('Gets prisoner detail from the api', async () => {
      const service = new PersonalPageService(prisonApiClient)
      await service.get(PrisonerMockDataA)
      expect(prisonApiClient.getPrisoner).toHaveBeenCalledWith(PrisonerMockDataA.prisonerNumber)
    })
  })

  describe('Personal details', () => {
    describe('Age', () => {
      it('Uses the age from the inmate detail when provided', async () => {
        const service = new PersonalPageService(prisonApiClient)
        const response = await service.get(PrisonerMockDataA)
        expect(response.personalDetails.age).toEqual(inmateDetailMock.age.toString())
      })

      it('Uses calculates the age from the date of birth when no age is given', async () => {
        const inmateDetail = { ...inmateDetailMock }
        inmateDetail.age = undefined
        const expectedAge = yearsBetweenDateStrings(PrisonerMockDataA.dateOfBirth, new Date().toISOString()).toString()
        const service = new PersonalPageService(prisonApiClient)
        const response = await service.get(PrisonerMockDataA)
        expect(response.personalDetails.age).toEqual(expectedAge)
      })
    })

    describe('Aliases', () => {
      const getResponseWithAliases = async (aliases: Alias[]) => {
        const prisonerData = { ...PrisonerMockDataA }
        prisonerData.aliases = aliases
        const service = new PersonalPageService(prisonApiClient)
        return service.get(prisonerData)
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
          dateOfBirth: '2022-01-01',
        })
        expect(response.personalDetails.aliases[1]).toEqual({
          alias: 'First Middle Last',
          dateOfBirth: '2023-01-01',
        })
      })
    })

    describe('Data from profile information', () => {
      it('Maps the domestic abuse perpetrator field', async () => {
        const response = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
        expect(response.personalDetails.domesticAbusePerpetrator).toEqual('Not stated')
      })

      it('Maps the domestic abuse victim field', async () => {
        const response = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
        expect(response.personalDetails.domesticAbuseVictim).toEqual('Not stated')
      })

      it('Maps the number of children field', async () => {
        const response = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
        expect(response.personalDetails.numberOfChildren).toEqual('2')
      })

      it('Maps the other nationalities field', async () => {
        const response = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
        expect(response.personalDetails.otherNationalities).toEqual('multiple nationalities field')
      })

      it('Maps the sexual orientation field', async () => {
        const response = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
        expect(response.personalDetails.sexualOrientation).toEqual('Heterosexual / Straight')
      })

      it('Maps the smoker or vaper field', async () => {
        const response = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
        expect(response.personalDetails.smokerOrVaper).toEqual('No')
      })

      it('Maps the social care needed field', async () => {
        const response = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
        expect(response.personalDetails.socialCareNeeded).toEqual('No')
      })

      it('Maps the type of diet field', async () => {
        const response = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
        expect(response.personalDetails.typeOfDiet).toEqual('Voluntary - Pork Free/Fish Free')
      })
    })

    describe('Languages', () => {
      it('Maps the primary language and interpreter requirement', async () => {
        const response = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
        const { languages } = response.personalDetails
        expect(languages.written).toEqual(inmateDetailMock.writtenLanguage)
        expect(languages.spoken).toEqual(inmateDetailMock.language)
        expect(languages.interpreterRequired).toEqual(inmateDetailMock.interpreterRequired)
      })

      describe('Other languages', () => {
        it('Correctly handles no secondary languages', async () => {
          prisonApiClient.getSecondaryLanguages = jest.fn(async () => [])
          const response = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
          expect(response.personalDetails.otherLanguages).toEqual([])
        })

        it('Maps the other languages from the secondary languages provided', async () => {
          const response = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
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
        const { personalDetails } = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
        expect(personalDetails.dateOfBirth).toEqual(PrisonerMockDataA.dateOfBirth)
        expect(personalDetails.ethnicGroup).toEqual(PrisonerMockDataA.ethnicity)
        expect(personalDetails.fullName).toEqual(
          formatName(PrisonerMockDataA.firstName, PrisonerMockDataA.middleNames, PrisonerMockDataA.lastName),
        )
        expect(personalDetails.marriageOrCivilPartnership).toEqual(PrisonerMockDataA.maritalStatus)
        expect(personalDetails.nationality).toEqual(PrisonerMockDataA.nationality)
        expect(personalDetails.placeOfBirth).toEqual(inmateDetailMock.birthPlace)
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
      const { identityNumbers } = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
      expect(identityNumbers.croNumber).toEqual(PrisonerMockDataA.croNumber)
      expect(identityNumbers.drivingLicenceNumber).toEqual('ABCD/123456/AB9DE')
      expect(identityNumbers.homeOfficeReferenceNumber).toEqual('A1234567')
      expect(identityNumbers.nationalInsuranceNumber).toEqual('AB123456A')
      expect(identityNumbers.pncNumber).toEqual(PrisonerMockDataA.pncNumber)
      expect(identityNumbers.prisonNumber).toEqual(PrisonerMockDataA.prisonerNumber)
    })
  })

  describe('Property', () => {
    it('Maps the data from the API', async () => {
      const { property } = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
      expect(property[0].containerType).toEqual('Valuables')
      expect(property[0].sealMark).toEqual('MDA646165646')
      expect(property[0].location).toEqual('Property Box 14')
      expect(property[1].containerType).toEqual('Confiscated')
      expect(property[1].sealMark).toEqual('Not entered')
      expect(property[1].location).toEqual('Property Box 15')
    })
  })
})
