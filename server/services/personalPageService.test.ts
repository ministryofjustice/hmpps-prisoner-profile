import { addDays, startOfYear } from 'date-fns'
import PersonalPageService from './personalPageService'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { prisonerDetailMock } from '../data/localMockData/prisonerDetailMock'
import { Alias } from '../data/interfaces/prisonerSearchApi/Prisoner'
import { formatName } from '../utils/utils'
import { secondaryLanguagesMock } from '../data/localMockData/secondaryLanguages'
import { propertyMock } from '../data/localMockData/property'
import { mockAddresses } from '../data/localMockData/addresses'
import { mockOffenderContacts } from '../data/localMockData/offenderContacts'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { PersonalCareNeed } from '../data/interfaces/prisonApi/PersonalCareNeeds'
import ReferenceCode, { ReferenceCodeDomain } from '../data/interfaces/prisonApi/ReferenceCode'
import { mockReasonableAdjustments } from '../data/localMockData/reasonableAdjustments'
import { personalCareNeedsMock } from '../data/localMockData/personalCareNeedsMock'
import { formatDate } from '../utils/dateHelpers'
import { identifiersMock } from '../data/localMockData/identifiersMock'
import { addressSummaryMock } from '../data/localMockData/addressSummary'
import { curiousApiClientMock } from '../../tests/mocks/curiousApiClientMock'
import { LearnerNeurodivergenceMock } from '../data/localMockData/learnerNeurodivergenceMock'
import { mockReferenceDomains } from '../data/localMockData/referenceDomains'
import CuriousApiClient from '../data/interfaces/curiousApi/curiousApiClient'
import { OffenderContacts } from '../data/interfaces/prisonApi/OffenderContact'

describe('PersonalPageService', () => {
  let prisonApiClient: PrisonApiClient
  let curiousApiClient: CuriousApiClient

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    prisonApiClient.getPrisoner = jest.fn(async () => prisonerDetailMock)
    prisonApiClient.getInmateDetail = jest.fn(async () => inmateDetailMock)
    prisonApiClient.getSecondaryLanguages = jest.fn(async () => secondaryLanguagesMock)
    prisonApiClient.getProperty = jest.fn(async () => propertyMock)
    prisonApiClient.getAddresses = jest.fn(async () => mockAddresses)
    prisonApiClient.getAddressesForPerson = jest.fn(async () => mockAddresses)
    prisonApiClient.getOffenderContacts = jest.fn(async () => mockOffenderContacts)
    prisonApiClient.getReferenceCodesByDomain = jest.fn(async (domain: ReferenceCodeDomain) => {
      switch (domain) {
        case ReferenceCodeDomain.Health:
          return mockReferenceDomains.health
        case ReferenceCodeDomain.HealthTreatments:
          return mockReferenceDomains.healthTreatment
        default:
          return []
      }
    })
    prisonApiClient.getPersonalCareNeeds = jest.fn(async () => personalCareNeedsMock)
    prisonApiClient.getReasonableAdjustments = jest.fn(async () => mockReasonableAdjustments)
    prisonApiClient.getIdentifiers = jest.fn(async () => identifiersMock)

    curiousApiClient = curiousApiClientMock()

    curiousApiClient.getLearnerNeurodivergence = jest.fn(async () => LearnerNeurodivergenceMock)
  })

  const setPersonalCareNeeds = (careNeeds: PersonalCareNeed[]) => {
    prisonApiClient.getPersonalCareNeeds = jest.fn(async () => ({
      offenderNo: 'AB1234',
      personalCareNeeds: careNeeds,
    }))
  }

  const setCodeReferences = (referenceCodes: ReferenceCode[]) => {
    prisonApiClient.getReferenceCodesByDomain = jest.fn(async () => referenceCodes)
  }

  const constructService = () =>
    new PersonalPageService(
      () => prisonApiClient,
      () => curiousApiClient,
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

      it('Maps the smoker or vaper field', async () => {
        const response = await constructService().get('token', PrisonerMockDataA)
        expect(response.personalDetails.smokerOrVaper).toEqual('No')
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
          prisonApiClient.getSecondaryLanguages = jest.fn(async () => [])
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
      const { identityNumbers } = await constructService().get('token', PrisonerMockDataA)
      expect(identityNumbers.croNumber).toEqual(PrisonerMockDataA.croNumber)
      expect(identityNumbers.drivingLicenceNumber).toEqual('ABCD/123456/AB9DE')
      expect(identityNumbers.homeOfficeReferenceNumber).toEqual('A1234567')
      expect(identityNumbers.nationalInsuranceNumber).toEqual('QQ123456C')
      expect(identityNumbers.pncNumber).toEqual(PrisonerMockDataA.pncNumber)
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
      prisonApiClient.getAddresses = jest.fn(async () => null)
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
      prisonApiClient.getAddressesForPerson = jest.fn(async () => [])
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

    describe('X-ray information', () => {
      const xrayNeed = (daysAfterStartOfYear: number): PersonalCareNeed => ({
        personalCareNeedId: 1,
        commentText: '',
        problemCode: 'BSC5.5',
        problemDescription: 'Body scan',
        problemStatus: 'ON',
        problemType: 'BSCAN',
        startDate: addDays(startOfYear(new Date()), daysAfterStartOfYear).toISOString(),
      })

      beforeEach(() => {
        setCodeReferences([
          {
            description: 'X-ray body scan',
            code: 'BSCAN',
            activeFlag: 'Y',
            domain: 'HEALTH',
          },
        ])
      })

      describe('Given no x-ray care needs', () => {
        it('Returns no xray security information', async () => {
          setPersonalCareNeeds([])
          const {
            security: { xrays },
          } = await constructService().get('token', PrisonerMockDataA)
          expect(xrays.total).toEqual(0)
          expect(xrays.since).toBeUndefined()
        })
      })

      describe('Given x-rays for this year', () => {
        it('Returns the correct number of x-rays and the start date', async () => {
          setPersonalCareNeeds([xrayNeed(0), xrayNeed(10), xrayNeed(20), xrayNeed(40)])
          const {
            security: { xrays },
          } = await constructService().get('token', PrisonerMockDataA)
          expect(xrays.total).toEqual(4)
          expect(xrays.since).toBe(startOfYear(new Date()).toISOString())
        })
      })

      describe('Given x-rays over multiple years', () => {
        it('Returns the correct number of x-rays for this year and the start date', async () => {
          setPersonalCareNeeds([
            xrayNeed(-10),
            xrayNeed(-20),
            xrayNeed(-40),
            xrayNeed(0),
            xrayNeed(10),
            xrayNeed(20),
            xrayNeed(40),
          ])
          const {
            security: { xrays },
          } = await constructService().get('token', PrisonerMockDataA)
          expect(xrays.total).toEqual(4)
          expect(xrays.since).toBe(startOfYear(new Date()).toISOString())
        })
      })
    })
  })

  describe('Care needs', () => {
    it('Handles empty personal care needs', async () => {
      setPersonalCareNeeds([])

      const { careNeeds } = await constructService().get('token', PrisonerMockDataA)
      expect(careNeeds.personalCareNeeds.length).toEqual(0)
    })

    it('Only maps care needs with problem status ON', async () => {
      setPersonalCareNeeds([
        {
          personalCareNeedId: 1,
          problemCode: 'code',
          problemStatus: 'ON',
          commentText: 'Comment text',
          problemType: 'TYPE',
          startDate: 'start date',
          problemDescription: 'problem description',
        },
        {
          personalCareNeedId: 2,
          problemCode: 'code',
          problemStatus: 'OFF',
          commentText: 'Comment text',
          problemType: 'TYPE',
          startDate: 'start date',
          problemDescription: 'problem description',
        },
      ])

      setCodeReferences([
        {
          description: 'Code reference description',
          code: 'TYPE',
          activeFlag: 'Y',
          domain: 'HEALTH',
        },
      ])

      const { careNeeds } = await constructService().get('token', PrisonerMockDataA)
      expect(careNeeds.personalCareNeeds.length).toEqual(1)
    })

    it('Doesnt map care needs without matching health codes', async () => {
      setPersonalCareNeeds([
        {
          personalCareNeedId: 1,
          problemCode: 'code',
          problemStatus: 'ON',
          commentText: 'Comment text',
          problemType: 'A',
          startDate: 'start date',
          problemDescription: 'problem description',
        },
      ])

      setCodeReferences([
        {
          description: 'Code reference description',
          code: 'TYPE',
          activeFlag: 'Y',
          domain: 'HEALTH',
        },
      ])

      const { careNeeds } = await constructService().get('token', PrisonerMockDataA)
      expect(careNeeds.personalCareNeeds.length).toEqual(0)
    })

    it('Doesnt map care needs with problem code NR', async () => {
      setPersonalCareNeeds([
        {
          personalCareNeedId: 1,
          problemCode: 'NR',
          problemStatus: 'ON',
          commentText: 'Comment text',
          problemType: 'TYPE',
          startDate: 'start date',
          problemDescription: 'problem description',
        },
      ])

      setCodeReferences([
        {
          description: 'Code reference description',
          code: 'TYPE',
          activeFlag: 'Y',
          domain: 'HEALTH',
        },
      ])

      const { careNeeds } = await constructService().get('token', PrisonerMockDataA)
      expect(careNeeds.personalCareNeeds.length).toEqual(0)
    })

    it('Doesnt map care needs with problem type BSCAN', async () => {
      setPersonalCareNeeds([
        {
          personalCareNeedId: 1,
          problemCode: 'BSC5.5',
          problemStatus: 'ON',
          commentText: 'Comment text',
          problemType: 'BSCAN',
          startDate: 'start date',
          problemDescription: 'problem description',
        },
      ])

      setCodeReferences([
        {
          description: 'Code reference description',
          code: 'BSCAN',
          activeFlag: 'Y',
          domain: 'HEALTH',
        },
      ])

      const { careNeeds } = await constructService().get('token', PrisonerMockDataA)
      expect(careNeeds.personalCareNeeds.length).toEqual(0)
    })

    it('Maps the personal care needs', async () => {
      setPersonalCareNeeds([
        {
          personalCareNeedId: 1,
          problemCode: 'code',
          problemStatus: 'ON',
          commentText: 'Comment text',
          problemType: 'TYPE',
          startDate: 'start date',
          problemDescription: 'problem description',
        },
      ])

      setCodeReferences([
        {
          description: 'Code reference description',
          code: 'TYPE',
          activeFlag: 'Y',
          domain: 'HEALTH',
        },
      ])

      const { careNeeds } = await constructService().get('token', PrisonerMockDataA)
      expect(careNeeds.personalCareNeeds.length).toEqual(1)
      expect(careNeeds.personalCareNeeds[0].description).toEqual('problem description')
      expect(careNeeds.personalCareNeeds[0].startDate).toEqual('start date')
      expect(careNeeds.personalCareNeeds[0].type).toEqual('Code reference description')
      expect(careNeeds.personalCareNeeds[0].comment).toEqual('Comment text')
    })

    it('Gets the reasonable adjustments for the domain types', async () => {
      prisonApiClient.getReferenceCodesByDomain = jest.fn(
        async () =>
          [
            {
              domain: 'HEALTH_TREAT',
              code: 'AC',
              description: 'Accessible Cell',
              activeFlag: 'Y',
              listSeq: 99,
              systemDataFlag: 'N',
              subCodes: [],
            },
            {
              domain: 'HEALTH_TREAT',
              code: 'AMP TEL',
              description: 'Amplified telephone',
              activeFlag: 'Y',
              listSeq: 99,
              systemDataFlag: 'N',
              subCodes: [],
            },
          ] as ReferenceCode[],
      )
      await constructService().get('token', PrisonerMockDataA)
      expect(prisonApiClient.getReasonableAdjustments).toHaveBeenCalledWith(PrisonerMockDataA.bookingId, [
        'AC',
        'AMP TEL',
      ])
    })

    it('Maps the reasonable adjustments to the matching care needs', async () => {
      setPersonalCareNeeds([
        {
          personalCareNeedId: 1,
          problemCode: 'code',
          problemStatus: 'ON',
          commentText: 'Comment text',
          problemType: 'TYPE',
          startDate: 'start date',
          problemDescription: 'problem description',
        },
        {
          personalCareNeedId: 2,
          problemCode: 'code',
          problemStatus: 'ON',
          commentText: 'Comment text',
          problemType: 'TYPE',
          startDate: 'start date',
          problemDescription: 'problem description',
        },
      ])

      setCodeReferences([
        {
          description: 'Code reference description',
          code: 'TYPE',
          activeFlag: 'Y',
          domain: 'HEALTH',
        },
      ])

      prisonApiClient.getReasonableAdjustments = jest.fn(async () => ({
        reasonableAdjustments: [
          {
            personalCareNeedId: 1,
            treatmentCode: 'BEH/BODY LAN',
            commentText: 'psych care type adjustment comment goes here',
            startDate: '1999-06-09',
            agencyId: 'MDI',
            agencyDescription: 'Moorland (HMP & YOI)',
            treatmentDescription: 'Behavioural responses/Body language',
          },
        ],
      }))

      const {
        careNeeds: { personalCareNeeds },
      } = await constructService().get('token', PrisonerMockDataA)

      const { reasonableAdjustments } = personalCareNeeds[0]
      expect(personalCareNeeds[1].reasonableAdjustments.length).toEqual(0)
      expect(reasonableAdjustments.length).toEqual(1)
      expect(reasonableAdjustments[0].description).toEqual('Behavioural responses/Body language')
      expect(reasonableAdjustments[0].comment).toEqual('psych care type adjustment comment goes here')
      expect(reasonableAdjustments[0].startDate).toEqual('1999-06-09')
      expect(reasonableAdjustments[0].agency).toEqual('Moorland (HMP & YOI)')
    })
  })

  describe('Addresses returns undefined', () => {
    it('Sets the address to empty', async () => {
      prisonApiClient.getAddresses = jest.fn(async () => undefined)
      const { addresses } = await constructService().get('token', PrisonerMockDataA)
      expect(addresses).toBeUndefined()
    })
  })

  describe('Get Learner Neurodivergence information', () => {
    it('Sets the address to empty', async () => {
      curiousApiClient.getLearnerNeurodivergence = jest.fn(async () => LearnerNeurodivergenceMock)
      const data = await constructService().get('token', PrisonerMockDataA)
      expect(data.learnerNeurodivergence).toBe(LearnerNeurodivergenceMock)
    })
  })
})
