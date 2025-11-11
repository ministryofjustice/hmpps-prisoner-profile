import { startOfYear } from 'date-fns'
import { Role } from '../../../server/data/enums/role'
import { mockAddresses } from '../../../server/data/localMockData/addresses'
import Page from '../../pages/page'
import PersonalPage from '../../pages/personalPage'
import { permissionsTests } from '../permissionsTests'
import { formatDate } from '../../../server/utils/dateHelpers'
import NotFoundPage from '../../pages/notFoundPage'
import { calculateAge } from '../../../server/utils/utils'
import { onlyPastCareNeedsMock, pastCareNeedsMock } from '../../../server/data/localMockData/personalCareNeedsMock'
import {
  CountryReferenceDataCodesMock,
  createPrisonerProfileSummary,
  MilitaryRecordsMock,
  ReligionReferenceDataCodesMock,
} from '../../../server/data/localMockData/personIntegrationApiReferenceDataMock'
import { corePersonPhysicalAttributesDtoMock } from '../../../server/data/localMockData/physicalAttributesMock'
import { distinguishingMarkMultiplePhotosMock } from '../../../server/data/localMockData/distinguishingMarksMock'
import {
  PersonalRelationshipsContactsDtoMock,
  PersonalRelationshipsDomesticStatusMock,
  PersonalRelationshipsNumberOfChildrenMock,
} from '../../../server/data/localMockData/personalRelationshipsApiMock'

const visitPersonalDetailsPage = ({ failOnStatusCode = true } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: 'prisoner/G6123VU/personal' })
}

context('When signed in', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  context('Permissions', () => {
    const visitPage = prisonerDataOverrides => {
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId, prisonerDataOverrides })
      cy.task('stubPersonalCareNeeds')

      visitPersonalDetailsPage({ failOnStatusCode: false })
    }

    permissionsTests({ prisonerNumber, visitPage, pageToDisplay: PersonalPage })
  })

  context('As a global search user who does not have the prisoner in their case loads', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.GlobalSearch] })
      cy.setupComponentsData({
        caseLoads: [
          {
            caseloadFunction: '',
            caseLoadId: 'ZZZ',
            currentlyActive: true,
            description: '',
            type: '',
          },
        ],
      })
      cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
      cy.task('stubInmateDetail', { bookingId: 1102484 })
      cy.task('stubSecondaryLanguages', 1102484)
      cy.task('stubProperty', 1102484)
      cy.task('stubAddresses', { prisonerNumber: 'G6123VU' })
      cy.task('stubOffenderContacts', 'G6123VU')
      cy.task('stubPersonAddresses')
      cy.task('stubImages')
      cy.task('stubHealthReferenceDomain')
      cy.task('stubHealthTreatmentReferenceDomain')
      cy.task('stubReasonableAdjustments', 1102484)
      cy.task('stubPersonalCareNeeds')
      cy.task('stubAllPersonalCareNeeds')
      cy.task('stubGetIdentifiers', 'G6123VU')
      cy.task('stubBeliefHistory')
      cy.task('stubGetDistinguishingMarksForPrisoner', { prisonerNumber: 'G6123VU' })
      cy.task('stubPersonIntegrationGetMilitaryRecords', MilitaryRecordsMock)
      cy.task('stubPersonIntegrationGetPhysicalAttributes', corePersonPhysicalAttributesDtoMock)
      cy.task('stubGetPrisonerProfileSummary', { prisonerNumber: 'G6123VU' })
      cy.task('stubPersonalRelationshipsContacts', {
        prisonerNumber: 'G6123VU',
        resp: PersonalRelationshipsContactsDtoMock,
      })
      cy.task('stubPersonalRelationshipsGetNumberOfChildren', {
        prisonerNumber,
        resp: PersonalRelationshipsNumberOfChildrenMock,
      })
      cy.task('stubPersonalRelationshipsGetDomesticStatus', {
        prisonerNumber,
        resp: PersonalRelationshipsDomesticStatusMock,
      })
      cy.task('stubPersonIntegrationGetReferenceData', {
        domain: 'COUNTRY',
        referenceData: CountryReferenceDataCodesMock,
      })
      cy.task('stubPersonIntegrationGetReferenceData', {
        domain: 'RELF',
        referenceData: ReligionReferenceDataCodesMock,
      })
      cy.task('stubGetPseudonyms', { prisonerNumber, response: [] })
      visitPersonalDetailsPage()
    })

    it('Hides the next of kin card', () => {
      cy.getDataQa('hidden-next-of-kin').should('exist')
      cy.getDataQa('hidden-next-of-kin-nav').should('exist')
    })

    it('Hides the appearance card', () => {
      cy.getDataQa('hidden-appearance').should('exist')
      cy.getDataQa('hidden-appearance-nav').should('exist')
    })

    it('Hides the property card', () => {
      cy.getDataQa('hidden-property').should('exist')
      cy.getDataQa('hidden-property-nav').should('exist')
    })

    it('Hides the fields within personal details', () => {
      cy.getDataQa('hidden-city-or-town-of-birth-key').should('exist')
      cy.getDataQa('hidden-country-of-birth-key').should('exist')
      cy.getDataQa('hidden-religion-or-belief-key').should('exist')
      cy.getDataQa('hidden-sexual-orientation-key').should('exist')
      cy.getDataQa('hidden-marriage-or-civil-partnership-key').should('exist')
      cy.getDataQa('hidden-number-of-children-key').should('exist')
      cy.getDataQa('hidden-languages-key').should('exist')
      cy.getDataQa('hidden-type-of-diet-key').should('exist')
      cy.getDataQa('hidden-diet-and-food-allergies-key').should('exist')
      cy.getDataQa('hidden-smoker-or-vaper-key').should('exist')
      cy.getDataQa('hidden-youth-offender-key').should('exist')
      cy.getDataQa('hidden-domestic-abuse-perpetrator-key').should('exist')
      cy.getDataQa('hidden-domestic-abuse-victim-key').should('exist')
      cy.getDataQa('hidden-social-care-needed-key').should('exist')
    })

    it('Personal page should go to 404 not found page', () => {
      cy.visit(`/prisoner/asudhsdudhid/personal`, { failOnStatusCode: false })
      Page.verifyOnPage(NotFoundPage)
    })
  })

  context('As a user belonging to the prisoners case load', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      visitPersonalDetailsPage()
    })

    it('displays the personal details page', () => {
      cy.request('/prisoner/G6123VU/personal').its('body').should('contain', 'Personal')
    })

    it('should contain elements with CSS classes linked to Google Analytics', () => {
      cy.get('.info__links').should('exist')
      cy.get('.hmpps-profile-tab-links').should('exist')
      cy.get('.hmpps-sidebar').should('exist')
    })

    context('Personal details card', () => {
      it('Displays all the information from the API', () => {
        const page = Page.verifyOnPage(PersonalPage)
        page.personalDetails().fullName().should('have.text', 'John Middle Names Saunders')
        page.personalDetails().aliases().row(1).name().should('have.text', 'John Middleone Middletwo Alias')
        page.personalDetails().aliases().row(1).dateOfBirth().should('have.text', '15/08/1990')
        page.personalDetails().aliases().row(2).name().should('have.text', 'Harry Smith')
        page.personalDetails().aliases().row(2).dateOfBirth().should('have.text', '17/06/1983')
        page.personalDetails().dateOfBirth().should('include.text', '12/10/1990')
        page.personalDetails().cityOrTownOfBirth().should('have.text', 'La La Land')
        page.personalDetails().countryOfBirth().should('have.text', 'England')
        const expectedAge = calculateAge('1990-10-12')
        page
          .personalDetails()
          .dateOfBirth()
          .should('include.text', `${expectedAge.years} years, ${expectedAge.months} month`)
        page
          .personalDetails()
          .nationality()
          .should('include.text', 'Stateless')
          .and('include.text', 'Other nationalities')
          .and('include.text', 'multiple nationalities')
        page.personalDetails().ethnicGroup().should('have.text', 'White: Eng./Welsh/Scot./N.Irish/British (W1)')
        page
          .personalDetails()
          .religionOrBelief()
          .should('contain', 'Celestial Church of God')
          .and(
            'contain.html',
            '<a class="govuk-link govuk-link--no-visited-state govuk-!-display-none-print" href="/prisoner/G6123VU/religion-belief-history">Religion, faith or belief history</a>',
          )
        page.personalDetails().sex().should('have.text', 'Male')
        page.personalDetails().sexualOrientation().should('have.text', 'Heterosexual or straight')
        page
          .personalDetails()
          .marriageOrCivilPartnership()
          .should('have.text', 'Single – never married or in a civil partnership')
        page.personalDetails().numberOfChildren().should('have.text', '2')
        page.personalDetails().typeOfDiet().should('not.exist')
        page
          .personalDetails()
          .dietAndFoodAllergies()
          .should('include.text', 'Egg')
          .and('include.text', 'Nutrient deficiency')
          .and('include.text', 'Vegan')
          .and('include.text', 'Arrange the food like a smiley face.')
        page.personalDetails().smokeOrVaper().should('have.text', 'Does not smoke or vape')
        page.personalDetails().domesticAbusePerpetrator().should('have.text', 'Not stated')
        page.personalDetails().domesticAbuseVictim().should('have.text', 'Not stated')
        page.personalDetails().socialCareNeeded().should('have.text', 'No')
        page.personalDetails().youthOffender().should('have.text', 'Yes')
      })

      it('Displays all the information from the API: Languages', () => {
        const page = Page.verifyOnPage(PersonalPage)
        page.personalDetails().languages().spoken().should('include.text', 'Welsh')
        page.personalDetails().languages().written().should('include.text', 'English').and('include.text', '(written)')
        page.personalDetails().languages().otherLanguages('AZE').language().should('have.text', 'Azerbaijani')
        page.personalDetails().languages().otherLanguages('BSL').language().should('have.text', 'British Sign Language')
        page
          .personalDetails()
          .languages()
          .otherLanguages('BSL')
          .proficiency()
          .should('include.text', 'Speaks and reads')
        page
          .personalDetails()
          .languages()
          .otherLanguages('GLA')
          .language()
          .should('include.text', 'Gaelic; Scottish Gaelic')
        page
          .personalDetails()
          .languages()
          .otherLanguages('GLA')
          .proficiency()
          .should('include.text', 'Speaks and writes')
        page.personalDetails().languages().otherLanguages('MAN').language().should('include.text', 'Mandarin')
        page.personalDetails().languages().otherLanguages('URD').language().should('include.text', 'Urdu')
        page.personalDetails().languages().otherLanguages('URD').proficiency().should('include.text', 'Reads only')
      })

      it('Displays all the information from the API: Military Records', () => {
        const page = Page.verifyOnPage(PersonalPage)
        page.personalDetails().militaryRecords().serviceNumber().should('include.text', '123456789')
        page.personalDetails().militaryRecords().branch().should('include.text', 'Army')
        page.personalDetails().militaryRecords().unitNumber().should('include.text', 'Unit 1')
        page.personalDetails().militaryRecords().rank().should('include.text', 'Corporal')
        page.personalDetails().militaryRecords().comments().should('include.text', 'Description')
        page.personalDetails().militaryRecords().enlistmentDate().should('include.text', 'January 2020')
        page.personalDetails().militaryRecords().enlistmentLocation().should('include.text', 'Location 1')
        page.personalDetails().militaryRecords().conflict().should('include.text', 'Afghanistan')
        page.personalDetails().militaryRecords().disciplinaryAction().should('include.text', 'Court Martial')
        page.personalDetails().militaryRecords().dischargeDate().should('include.text', 'Not entered')
        page.personalDetails().militaryRecords().dischargeLocation().should('include.text', 'Location 2')
        page.personalDetails().militaryRecords().dischargeDescription().should('include.text', 'Honourable')
      })
    })

    context('Identity numbers card', () => {
      it('Displays the information from the API', () => {
        const page = Page.verifyOnPage(PersonalPage)
        page.identityNumbers().prisonNumber().should('include.text', 'G6123VU')
        page.identityNumbers().pncNumber().should('include.text', '08/359381C')
        page.identityNumbers().pncNumber().should('include.text', 'P/CONS')
        page.identityNumbers().pncNumber().should('include.text', '8/359381C')
        page.identityNumbers().pncNumber().should('include.text', 'P/CONS - fixed')
        page.identityNumbers().croNumber().should('include.text', '400862/08W')
        page.identityNumbers().homeOfficeReferenceNumber().should('include.text', 'A1234567')
        page.identityNumbers().nationalInsuranceNumber().should('include.text', 'QQ123456C')
        page.identityNumbers().drivingLicenceNumber().should('include.text', 'ABCD/123456/AB9DE')
      })

      it('Displays the correct section headings', () => {
        const page = Page.verifyOnPage(PersonalPage)
        page.identityNumbers().justiceNumbersHeading().should('include.text', 'Justice numbers')
        page.identityNumbers().personalNumbersHeading().should('include.text', 'Personal numbers')
        page.identityNumbers().homeOfficeNumbersHeading().should('include.text', 'Home office numbers')
        page.identityNumbers().additionalNumbersHeading().should('not.exist')
      })
    })

    context('Property card', () => {
      it('Displays the prisoners property', () => {
        const page = Page.verifyOnPage(PersonalPage)
        page.property().item(0).containerType().should('include.text', 'Valuables')
        page.property().item(0).sealMark().should('include.text', 'MDA646165646')
        page.property().item(0).location().should('include.text', 'Property Box 14')
        page.property().item(1).containerType().should('include.text', 'Confiscated')
        page.property().item(1).sealMark().should('include.text', '')
        page.property().item(1).location().should('include.text', 'Property Box 15')
        page.property().item(2).containerType().should('include.text', 'Branston Storage')
        page.property().item(2).sealMark().should('include.text', 'BOB')
        page.property().item(2).location().should('include.text', 'Property Box 3')
      })
    })

    context('Emergency contacts and next of kin', () => {
      it('Displays the contacts', () => {
        const page = Page.verifyOnPage(PersonalPage)

        const firstContact = page.contacts().contact(0)
        firstContact.name().should('include.text', 'Bill Doe')
        firstContact.nextOfKin().should('be.visible')
        firstContact.emergencyContact().should('not.exist')
        firstContact.relationship().should('include.text', 'Friend')
        firstContact.phoneNumber().should('include.text', 'Phone number not entered')
        firstContact.additionalDetails().click()
        firstContact.dateOfBirth().should('include.text', 'Not entered')
        firstContact.address().should('include.text', 'Flat 2B, Mansion House Acacia Avenue')
        firstContact.address().should('include.text', 'Newcastle Upon Tyne')
        firstContact.address().should('include.text', 'S13 4FH')

        const secondContact = page.contacts().contact(1)
        secondContact.name().should('include.text', 'John Doe')
        secondContact.nextOfKin().should('be.visible')
        secondContact.emergencyContact().should('be.visible')
        secondContact.relationship().should('include.text', 'Friend')
        secondContact.phoneNumber().should('include.text', '+44 1234567890')
        secondContact.additionalDetails().click()
        secondContact.dateOfBirth().should('include.text', '1 January 1980 (45 years old)')
        secondContact.address().should('include.text', 'Not entered')

        const thirdContact = page.contacts().contact(2)
        thirdContact.name().should('include.text', 'Rick William Doe')
        thirdContact.nextOfKin().should('not.exist')
        thirdContact.emergencyContact().should('be.visible')
        thirdContact.relationship().should('include.text', 'Brother')
        thirdContact.phoneNumber().should('include.text', '01234 567890')
        thirdContact.additionalDetails().click()
        thirdContact.dateOfBirth().should('include.text', '25 October 1987 (38 years old)')
        thirdContact.address().should('include.text', '99 Acacia Avenue')
        thirdContact.address().should('include.text', 'Newcastle Upon Tyne')
        thirdContact.address().should('include.text', 'S13 4FH')
      })
    })

    context('Appearance', () => {
      it('Displays the appearance information', () => {
        const page = Page.verifyOnPage(PersonalPage)
        page.appearance().height().should('include.text', '1m')
        page.appearance().weight().should('include.text', '100kg')
        page.appearance().hairColour().should('include.text', 'Brown')
        page.appearance().eyeColour().should('include.text', 'Blue')
        page.appearance().facialHair().should('include.text', 'Full beard')
        page.appearance().shapeOfFace().should('include.text', 'Oval')
        page.appearance().build().should('include.text', 'Average')
        page.appearance().shoeSize().should('include.text', '11')
        page.appearance().warnedAboutTattooing().should('include.text', 'Yes')
        page.appearance().warnedNotTochangeAppearance().should('include.text', 'Yes')
      })

      it('Displays the distinguishing marks', () => {
        const page = Page.verifyOnPage(PersonalPage)
        page.appearance().personIntegrationDistinguishingMarks().tattoos().should('include.text', 'Not entered')
        page.appearance().personIntegrationDistinguishingMarks().others().should('include.text', 'Not entered')

        page.appearance().personIntegrationDistinguishingMarks().scarsDetail().detail().should('not.have.attr', 'open')
        page.appearance().personIntegrationDistinguishingMarks().scarsDetail().detail().find('summary').click()

        page.appearance().personIntegrationDistinguishingMarks().scarsDetail().detail().should('have.attr', 'open')
        const scarsDetailHeaders = page
          .appearance()
          .personIntegrationDistinguishingMarks()
          .scarsDetail()
          .content()
          .find('dt')

        scarsDetailHeaders.each((element, index) => {
          const expectedHeaders = ['Location', 'Description']
          const expectedTexts = ['Arm (general)', 'Horrible arm scar']

          cy.wrap(element).should('include.text', expectedHeaders[index])
          cy.wrap(element).siblings('dd').should('include.text', expectedTexts[index])
        })
        page
          .appearance()
          .personIntegrationDistinguishingMarks()
          .scarsDetail()
          .content()
          .find('img')
          .should('have.length', 1)
        page
          .appearance()
          .personIntegrationDistinguishingMarks()
          .scarsDetail()
          .detail()
          .get('[data-qa=mark-images-link]')
          .should('not.exist')
      })

      it(`Renders only the latest photo when there are multiple photos for a distinguishing mark`, () => {
        cy.task('stubGetPrisonerProfileSummary', {
          prisonerNumber: 'G6123VU',
          response: createPrisonerProfileSummary({
            distinguishingMarks: [distinguishingMarkMultiplePhotosMock],
          }),
        })

        cy.visit(`prisoner/G6123VU/personal`, { failOnStatusCode: false })

        const page = Page.verifyOnPage(PersonalPage)
        page.appearance().personIntegrationDistinguishingMarks().tattoosDetail().detail().find('summary').click()
        page.appearance().personIntegrationDistinguishingMarks().tattoosDetail().detail().should('have.attr', 'open')

        page
          .appearance()
          .personIntegrationDistinguishingMarks()
          .tattoosDetail()
          .content()
          .find('img')
          .should('have.length', 1)
        page
          .appearance()
          .personIntegrationDistinguishingMarks()
          .tattoosDetail()
          .content()
          .should('include.text', '1 of 6 photos.')
      })

      it(`Displays a link allowing the user to view all images for the distinguishing mark`, () => {
        cy.task('stubGetPrisonerProfileSummary', {
          prisonerNumber: 'G6123VU',
          response: createPrisonerProfileSummary({
            distinguishingMarks: [distinguishingMarkMultiplePhotosMock],
          }),
        })

        cy.visit(`prisoner/G6123VU/personal`, { failOnStatusCode: false })

        const page = Page.verifyOnPage(PersonalPage)
        page.appearance().personIntegrationDistinguishingMarks().tattoosDetail().detail().find('summary').click()
        page.appearance().personIntegrationDistinguishingMarks().tattoosDetail().detail().should('have.attr', 'open')

        page
          .appearance()
          .personIntegrationDistinguishingMarks()
          .tattoosDetail()
          .detail()
          .get('[data-qa=mark-images-link]')
          .should('exist')
          .and('have.attr', 'href')
          .and('include', '/all-photos')
      })

      it('Includes hide/show all functionality for a distinguishing mark type', () => {
        const page = Page.verifyOnPage(PersonalPage)
        page.appearance().personIntegrationDistinguishingMarks().scarsDetail().detail().should('not.have.attr', 'open')

        const button = page
          .appearance()
          .personIntegrationDistinguishingMarks()
          .scars()
          .find('button.hmpps-open-close-all__button')
          .should('include.text', 'Show all scar details')

        button.click()
        button.should('include.text', 'Hide all scar details')

        page.appearance().personIntegrationDistinguishingMarks().scarsDetail().detail().should('have.attr', 'open')

        button.click()
        button.should('include.text', 'Show all scar details')

        page.appearance().personIntegrationDistinguishingMarks().scarsDetail().detail().should('not.have.attr', 'open')

        // clicking the individual details should also update the button state
        page.appearance().personIntegrationDistinguishingMarks().scarsDetail().detail().find('summary').click()
        page.appearance().personIntegrationDistinguishingMarks().scarsDetail().detail().should('have.attr', 'open')

        page
          .appearance()
          .personIntegrationDistinguishingMarks()
          .scars()
          .find('button.hmpps-open-close-all__button')
          .should('include.text', 'Hide all scar details')
      })
    })

    context('Addresses', () => {
      it('Displays prisoner addresses', () => {
        const page = Page.verifyOnPage(PersonalPage)
        page.addresses().addressHeading().should('include.text', 'Primary and postal address')

        page.addresses().address().should('include.text', 'No fixed address')
        page.addresses().address().should('include.text', 'Flat 1')
        page.addresses().address().should('include.text', 'The Flats')
        page.addresses().address().should('include.text', '1 The Road')
        page.addresses().address().should('include.text', 'The Area')
        page.addresses().address().should('include.text', 'Sheffield')
        page.addresses().address().should('include.text', 'South Yorkshire')
        page.addresses().address().should('include.text', 'A1 2BC')
        page.addresses().address().should('include.text', 'England')

        page.addresses().addressTypes().should('include.text', 'Home')
        page.addresses().addressDates().should('include.text', 'From June 2024 to June 2099')

        page.addresses().addressPhoneNumbers().should('include.text', 'Home')
        page.addresses().addressPhoneNumbers().should('include.text', '012345678')
        page.addresses().addressPhoneNumbers().should('include.text', 'Ext: 567')

        page.addresses().addressComments().should('include.text', 'Some comment')

        page.addresses().addressAddedDate().should('include.text', 'Added on 16 June 2024')

        page.addresses().addressesLink().should('include.text', 'View all addresses (1)')
        page
          .addresses()
          .addressesLink()
          .get(`a[href="/prisoner/${prisonerNumber}/addresses"]`)
          .should('exist')
          .should('include.text', 'View all addresses (1)')
      })
    })

    context('Security', () => {
      it('Displays the security warnings', () => {
        const page = Page.verifyOnPage(PersonalPage)
        page.security().interestToImmigration().should('be.visible')
        page.security().travelRestrictions().should('be.visible')
        page.security().travelRestrictions().should('include.text', 'some travel restrictions')
      })
    })

    context('Back to top', () => {
      it('Does not display the back to top link initially', () => {
        const page = Page.verifyOnPage(PersonalPage)
        page.backToTopLinkHidden().should('exist')
      })

      it('Displays the back to top link after scrolling down', () => {
        const page = Page.verifyOnPage(PersonalPage)
        cy.get('.connect-dps-common-footer').scrollTo('bottom', { ensureScrollable: false })
        page.backToTopLink().should('be.visible')
      })
    })
  })

  context('Care needs', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
    })

    context('Prisoner has current care needs and no past care needs', () => {
      it('Displays the care needs', () => {
        cy.task('stubPersonalCareNeeds')
        visitPersonalDetailsPage()
        const page = Page.verifyOnPage(PersonalPage)
        page.careNeeds().personalCareNeeds(0).type().should('include.text', 'Maternity Status')
        page.careNeeds().personalCareNeeds(0).description().should('include.text', 'Preg, acc under 9mths')
        page.careNeeds().personalCareNeeds(0).comment().should('include.text', 'a comment')
        page.careNeeds().personalCareNeeds(0).addedOn().should('include.text', '21 June 2010')

        page
          .careNeeds()
          .personalCareNeeds(0)
          .reasonableAdjustments(0)
          .description()
          .should('include.text', 'Behavioural responses/Body language')
        page
          .careNeeds()
          .personalCareNeeds(0)
          .reasonableAdjustments(0)
          .comment()
          .should('include.text', 'psych care type adjustment comment goes here')
        page
          .careNeeds()
          .personalCareNeeds(0)
          .reasonableAdjustments(0)
          .addedBy()
          .should('include.text', 'Moorland (HMP & YOI)')
        page.careNeeds().personalCareNeeds(0).reasonableAdjustments(0).addedOn().should('include.text', '9 June 1999')

        page
          .careNeeds()
          .personalCareNeeds(0)
          .reasonableAdjustments(1)
          .description()
          .should('include.text', 'Comfort and Dressing Aids')
        page
          .careNeeds()
          .personalCareNeeds(0)
          .reasonableAdjustments(1)
          .addedBy()
          .should('include.text', 'Moorland (HMP & YOI)')
        page.careNeeds().personalCareNeeds(0).reasonableAdjustments(1).addedOn().should('include.text', '9 June 2020')
      })

      it('Does not display the past care needs link', () => {
        const page = new PersonalPage()
        page.careNeeds().pastCareNeedsLink().should('not.exist')
        page.careNeeds().noCareNeedsMessage().should('not.exist')
      })
    })

    context('Prisoner has current care needs and past care needs', () => {
      it('Displays the past care needs link', () => {
        cy.task('stubPersonalCareNeeds', pastCareNeedsMock)
        cy.task('stubAllPersonalCareNeeds', pastCareNeedsMock)
        visitPersonalDetailsPage()
        const page = new PersonalPage()
        page.careNeeds().pastCareNeedsLink().should('exist')
        page.careNeeds().noCareNeedsMessage().should('not.exist')
      })
    })

    context('Prisoner has no current care needs but does have past care needs', () => {
      it('Displays the past care needs link', () => {
        cy.task('stubPersonalCareNeeds', onlyPastCareNeedsMock)
        cy.task('stubAllPersonalCareNeeds', onlyPastCareNeedsMock)
        visitPersonalDetailsPage()
        const page = new PersonalPage()
        page.careNeeds().pastCareNeedsLink().should('exist')
        page
          .careNeeds()
          .noCareNeedsMessage()
          .should('contain.text', 'This person does not have any current care needs.')
      })
    })

    context('Prisoner has no current care needs or past care needs', () => {
      it('Displays the past care needs link', () => {
        cy.task('stubPersonalCareNeeds', { offenderNo: 'G6123VU', personalCareNeeds: [] })
        cy.task('stubAllPersonalCareNeeds', { offenderNo: 'G6123VU', personalCareNeeds: [] })
        visitPersonalDetailsPage()
        const page = new PersonalPage()
        page.careNeeds().pastCareNeedsLink().should('not.exist')
        page.careNeeds().noCareNeedsMessage().should('contain.text', 'No care needs have been entered.')
      })
    })
  })

  context('X-ray details', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
    })

    context('With less than the limit', () => {
      it('Displays the xray count and date', () => {
        cy.task('stubXrayCareNeeds', { bookingId, numberOfXrays: 10 })
        visitPersonalDetailsPage()
        const page = Page.verifyOnPage(PersonalPage)
        page.security().xrays().total().should('include.text', '10')
        page
          .security()
          .xrays()
          .since()
          .should('include.text', formatDate(startOfYear(new Date()).toISOString()))
      })
    })

    context('With the limit', () => {
      it('Displays the xray count and date', () => {
        cy.task('stubXrayCareNeeds', { bookingId, numberOfXrays: 116 })
        visitPersonalDetailsPage()
        const page = Page.verifyOnPage(PersonalPage)
        page.security().xrays().total().should('include.text', '116')
        page
          .security()
          .xrays()
          .since()
          .should('include.text', formatDate(startOfYear(new Date()).toISOString()))
        page.security().xrays().warningMessage().should('exist')
      })
    })
  })

  context('Neurodiversity', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
    })

    context('Page section', () => {
      it('Displays neurodiversity sections', () => {
        visitPersonalDetailsPage()

        const page = Page.verifyOnPage(PersonalPage)
        page.neurodiversity().fromNeurodiversityAssessment().should('be.visible')
        page.neurodiversity().neurodivergenceExists().should('be.visible')
        page.neurodiversity().neurodivergenceSupport().should('be.visible')
        page.neurodiversity().neurodiversitySelfAssessment().should('be.visible')
        page.neurodiversity().neurodiversityAssessed().should('be.visible')
        page.neurodiversity().neurodiversityTitle().should('be.visible')
      })

      it('Displays an error banner and not the neurodiversity sections when there was an error calling the Curious API', () => {
        cy.task('stubGetLearnerNeurodivergence', { prisonerNumber, error: true })

        visitPersonalDetailsPage()

        const page = Page.verifyOnPage(PersonalPage)
        page.apiErrorBanner().should('exist')
        page.apiErrorBanner().contains('p', 'Sorry, there is a problem with the service')
        page.neurodiversity().fromNeurodiversityAssessment().should('not.exist')
        page.neurodiversity().neurodivergenceExists().should('not.exist')
        page.neurodiversity().neurodivergenceSupport().should('not.exist')
        page.neurodiversity().neurodiversitySelfAssessment().should('not.exist')
        page.neurodiversity().neurodiversityAssessed().should('not.exist')
        page.neurodiversity().neurodiversityTitle().should('not.exist')
      })
    })
  })

  context('Profile editing and diet and allergy is disabled', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupComponentsData({
        caseLoads: [
          {
            caseloadFunction: '',
            caseLoadId: 'DTI',
            currentlyActive: true,
            description: '',
            type: '',
          },
        ],
      })
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubInmateDetail', { bookingId, inmateDetail: { agencyId: 'DTI' } })
      cy.task('stubPrisonerData', { prisonerNumber, overrides: { prisonId: 'DTI' } })
      visitPersonalDetailsPage()
    })

    it('Displays old type of diet', () => {
      const page = Page.verifyOnPage(PersonalPage)

      page.personalDetails().typeOfDiet().should('have.text', 'Voluntary - Pork Free/Fish Free')
      page.personalDetails().dietAndFoodAllergies().should('not.exist')
    })

    it('Displays distinguishingMarks information from inmate details', () => {
      const page = Page.verifyOnPage(PersonalPage)

      page.appearance().distinguishingMarks(0).bodyPart().should('include.text', 'Arm')
      page.appearance().distinguishingMarks(0).type().should('include.text', 'Tattoo')
      page.appearance().distinguishingMarks(0).side().should('include.text', 'Left')
      page.appearance().distinguishingMarks(0).comment().should('include.text', 'Red bull Logo')
      page.appearance().distinguishingMarks(0).image().should('have.attr', 'src').and('include', '1413021')

      page.appearance().distinguishingMarks(1).bodyPart().should('include.text', 'Front and sides')
      page.appearance().distinguishingMarks(1).type().should('include.text', 'Tattoo')
      page.appearance().distinguishingMarks(1).side().should('include.text', 'Front')
      page.appearance().distinguishingMarks(1).comment().should('include.text', 'ARC reactor image')
      page.appearance().distinguishingMarks(1).image().should('have.attr', 'src').and('include', '1413020')

      page.appearance().distinguishingMarks(2).bodyPart().should('include.text', 'Leg')
      page.appearance().distinguishingMarks(2).type().should('include.text', 'Tattoo')
      page.appearance().distinguishingMarks(2).side().should('include.text', 'Right')
      page.appearance().distinguishingMarks(2).comment().should('include.text', 'Monster drink logo')
      page.appearance().distinguishingMarks(2).orientation().should('include.text', 'Facing')
      page.appearance().distinguishingMarks(2).image().should('have.attr', 'src').and('include', '1413022')
    })

    it('Displays old addresses tile', () => {
      const page = Page.verifyOnPage(PersonalPage)
      page.oldAddresess().address().should('include.text', '7, premises address, street field')
      page.oldAddresess().address().should('include.text', 'Leeds')
      page.oldAddresess().address().should('include.text', 'LS1 AAA')
      page.oldAddresess().address().should('include.text', 'England')

      page.oldAddresess().addressTypes().should('include.text', 'Discharge - Permanent Housing')
      page.oldAddresess().addressTypes().should('include.text', 'HDC Address')
      page.oldAddresess().addressTypes().should('include.text', 'Other')

      page.oldAddresess().phoneNumbers().should('include.text', '4444555566')
      page.oldAddresess().phoneNumbers().should('include.text', '0113444444')
      page.oldAddresess().phoneNumbers().should('include.text', '0113 333444')
      page.oldAddresess().phoneNumbers().should('include.text', '0800 222333')

      page.oldAddresess().comments().should('include.text', mockAddresses[0].comment)
      page.oldAddresess().addedOn().should('include.text', 'May 2020')
    })
  })

  context('Given API call to get next of kin and emergency contacts fails', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
      cy.task('stubPersonalRelationshipsContacts', { prisonerNumber, error: true })
      visitPersonalDetailsPage()
    })

    it('Displays a page error banner and error message replacing the next of kin and emergency contact details', () => {
      const page = Page.verifyOnPage(PersonalPage)

      page.apiErrorBanner().should('exist')
      page.apiErrorBanner().contains('p', 'Sorry, there is a problem with the service')

      page
        .contacts()
        .apiErrorMessage()
        .should('contain.text', 'We cannot show these details right now. Try again later.')
    })
  })
})
