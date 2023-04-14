import PersonalPageService from './personalPageService'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { prisonerDetailMock } from '../data/localMockData/prisonerDetailMock'
import { Alias } from '../interfaces/prisoner'
import { formatName, yearsBetweenDateStrings } from '../utils/utils'
import { secondaryLanguagesMock } from '../data/localMockData/secondaryLanguages'
import { propertyMock } from '../data/localMockData/property'
import { mockAddresses } from '../data/localMockData/addresses'
import { mockOffenderContacts } from '../data/localMockData/offenderContacts'
import { OffenderContacts } from '../interfaces/prisonApi/offenderContacts'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { PersonalCareNeed } from '../interfaces/personalCareNeeds'
import { ReferenceCode } from '../interfaces/prisonApi/referenceCode'
import { mockReasonableAdjustments } from '../data/localMockData/reasonableAdjustments'

describe('PersonalPageService', () => {
  let prisonApiClient: PrisonApiClient

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    prisonApiClient.getPrisoner = jest.fn(async () => prisonerDetailMock)
    prisonApiClient.getInmateDetail = jest.fn(async () => inmateDetailMock)
    prisonApiClient.getSecondaryLanguages = jest.fn(async () => secondaryLanguagesMock)
    prisonApiClient.getProperty = jest.fn(async () => propertyMock)
    prisonApiClient.getAddresses = jest.fn(async () => mockAddresses)
    prisonApiClient.getAddressesForPerson = jest.fn(async () => mockAddresses)
    prisonApiClient.getOffenderContacts = jest.fn(async () => mockOffenderContacts)
    prisonApiClient.getReferenceCodesByDomain = jest.fn(async () => [])
    prisonApiClient.getReasonableAdjustments = jest.fn(async () => mockReasonableAdjustments)
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

  describe('Addresses', () => {
    it('Maps the data from the API for the primary address', async () => {
      const { addresses } = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
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
    })
  })

  describe('Next of kin', () => {
    it('Only maps the active next of kin', async () => {
      const { nextOfKin } = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
      expect(nextOfKin.length).toEqual(3)
    })

    it('Gets the addresses for each active next of kin', async () => {
      await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
      expect(prisonApiClient.getAddressesForPerson).toHaveBeenCalledTimes(3)

      const expectedPersonIds = mockOffenderContacts.offenderContacts
        .filter(contact => contact.active && contact.nextOfKin)
        .map(({ personId }) => personId)

      expectedPersonIds.forEach(personId =>
        expect(prisonApiClient.getAddressesForPerson).toHaveBeenCalledWith(personId),
      )
    })

    it('Maps the primary address for the contact', async () => {
      const { nextOfKin } = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
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
      const { nextOfKin } = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
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
      const { nextOfKin } = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
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
      const { physicalCharacteristics } = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
      expect(physicalCharacteristics.height).toEqual('1.88')
      expect(physicalCharacteristics.weight).toEqual('86')
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
      const { physicalCharacteristics } = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
      expect(physicalCharacteristics.distinguishingMarks.length).toEqual(0)
    })
  })

  describe('Security', () => {
    it('Maps the data from the API', async () => {
      const { security } = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
      expect(security.interestToImmigration).toEqual('Yes')
      expect(security.travelRestrictions).toEqual('some travel restrictions')
    })
  })

  describe('Care needs', () => {
    const setPersonalCareNeeds = (careNeeds: PersonalCareNeed[]) => {
      const inmateDetail = { ...inmateDetailMock }
      inmateDetail.personalCareNeeds = careNeeds
      prisonApiClient.getInmateDetail = jest.fn(async () => inmateDetail)
    }

    const setCodeReferences = (referenceCodes: ReferenceCode[]) => {
      prisonApiClient.getReferenceCodesByDomain = jest.fn(async () => referenceCodes)
    }

    it('Handles empty personal care needs', async () => {
      setPersonalCareNeeds([])

      const { careNeeds } = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
      expect(careNeeds.personalCareNeeds.length).toEqual(0)
    })

    it('Maps the personal care needs', async () => {
      setPersonalCareNeeds([
        {
          problemCode: 'code',
          problemStatus: 'status',
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

      const { careNeeds } = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
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
      await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)
      expect(prisonApiClient.getReasonableAdjustments).toHaveBeenCalledWith(PrisonerMockDataA.bookingId, [
        'AC',
        'AMP TEL',
      ])
    })

    it('Maps the reasonable adjustments', async () => {
      prisonApiClient.getReasonableAdjustments = jest.fn(async () => ({
        reasonableAdjustments: [
          {
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
        careNeeds: { reasonableAdjustments },
      } = await new PersonalPageService(prisonApiClient).get(PrisonerMockDataA)

      expect(reasonableAdjustments.length).toEqual(1)
      expect(reasonableAdjustments[0].description).toEqual('Behavioural responses/Body language')
      expect(reasonableAdjustments[0].comment).toEqual('psych care type adjustment comment goes here')
      expect(reasonableAdjustments[0].startDate).toEqual('1999-06-09')
      expect(reasonableAdjustments[0].agency).toEqual('Moorland (HMP & YOI)')
    })
  })
})
