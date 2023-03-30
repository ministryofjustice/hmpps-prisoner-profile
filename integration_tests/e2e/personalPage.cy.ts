import { mockAddresses } from '../../server/data/localMockData/addresses'
import { yearsBetweenDateStrings } from '../../server/utils/utils'
import Page from '../pages/page'
import PersonalPage from '../pages/personalPage'

const visitPersonalDetailsPage = (): PersonalPage => {
  cy.signIn({ redirectPath: 'prisoner/G6123VU/personal' })
  return Page.verifyOnPage(PersonalPage)
}

context('When signed in', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
    cy.task('stubInmateDetail', 1102484)
    cy.task('stubPrisonerDetail', 'G6123VU')
    cy.task('stubSecondaryLanguages', 1102484)
    cy.task('stubProperty', 1102484)
    cy.task('stubAddresses', 'G6123VU')
    cy.task('stubOffenderContacts', 'G6123VU')
    cy.task('stubPersonAddresses')
  })

  it('displays the personal details page', () => {
    visitPersonalDetailsPage()
    cy.request('/prisoner/G6123VU/personal').its('body').should('contain', 'Personal')
  })

  context('Personal details card', () => {
    it('Displays all the information from the API', () => {
      const page = visitPersonalDetailsPage()
      page.personalDetails().fullName().should('have.text', 'John Middle Names Saunders')
      page.personalDetails().aliases().row(1).name().should('have.text', 'Master Cordian')
      page.personalDetails().aliases().row(1).dateOfBirth().should('have.text', '1990-08-15')
      page.personalDetails().aliases().row(2).name().should('have.text', 'Master J117 Chief')
      page.personalDetails().aliases().row(2).dateOfBirth().should('have.text', '1983-06-17')
      page.personalDetails().preferredName().should('have.text', 'Working Name')
      page.personalDetails().dateOfBirth().should('include.text', '1990-10-12')
      const expectedAge = yearsBetweenDateStrings(new Date('1990-10-12').toISOString(), new Date().toISOString())
      page.personalDetails().dateOfBirth().should('include.text', `${expectedAge} years old`)
      page.personalDetails().nationality().should('have.text', 'Stateless')
      page.personalDetails().otherNationalities().should('have.text', 'multiple nationalities field')
      page.personalDetails().ethnicGroup().should('have.text', 'White: Eng./Welsh/Scot./N.Irish/British')
      page.personalDetails().religionOrBelief().should('have.text', 'Celestial Church of God')
      page.personalDetails().sex().should('have.text', 'Male')
      page.personalDetails().sexualOrientation().should('have.text', 'Heterosexual / Straight')
      page.personalDetails().marriageOrCivilPartnership().should('have.text', 'No')
      page.personalDetails().numberOfChildren().should('have.text', '2')
      page.personalDetails().typeOfDiet().should('have.text', 'Voluntary - Pork Free/Fish Free')
      page.personalDetails().smokeOrVaper().should('have.text', 'No')
      page.personalDetails().domesticAbusePerpetrator().should('have.text', 'Not stated')
      page.personalDetails().domesticAbuseVictim().should('have.text', 'Not stated')
      page.personalDetails().socialCareNeeded().should('have.text', 'No')
    })

    it('Displays all the information from the API: Languages', () => {
      const page = visitPersonalDetailsPage()
      page.personalDetails().languages().spoken().should('include.text', 'Welsh')
      page.personalDetails().languages().written().should('include.text', 'English').and('include.text', '(written)')
      page.personalDetails().languages().otherLanguages('AZE').language().should('have.text', 'Azerbaijani')
      page.personalDetails().languages().otherLanguages('BSL').language().should('have.text', 'British Sign Language')
      page
        .personalDetails()
        .languages()
        .otherLanguages('BSL')
        .proficiency()
        .should('include.text', 'reads and speaks only')
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
        .should('include.text', 'writes and speaks only')
      page.personalDetails().languages().otherLanguages('MAN').language().should('include.text', 'Mandarin')
      page.personalDetails().languages().otherLanguages('URD').language().should('include.text', 'Urdu')
      page.personalDetails().languages().otherLanguages('URD').proficiency().should('include.text', 'reads only')
    })
  })

  context('Identity numbers card', () => {
    it('Displays the information from the API', () => {
      const page = visitPersonalDetailsPage()
      page.identityNumbers().prisonNumber().should('include.text', 'G6123VU')
      page.identityNumbers().pncNumber().should('include.text', '08/359381C')
      page.identityNumbers().croNumber().should('include.text', '400862/08W')
      page.identityNumbers().homeOfficeReferenceNumber().should('include.text', 'A1234567')
      page.identityNumbers().nationalInsuranceNumber().should('include.text', 'AB123456A')
      page.identityNumbers().drivingLicenceNumber().should('include.text', 'ABCD/123456/AB9DE')
    })
  })

  context('Property card', () => {
    it('Displays the prisoners property', () => {
      const page = visitPersonalDetailsPage()
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

  context('Addresses', () => {
    it('Displays the prisoners address', () => {
      const page = visitPersonalDetailsPage()
      page.addresess().address().should('include.text', 'Flat 7, premises address, street field')
      page.addresess().address().should('include.text', 'Leeds')
      page.addresess().address().should('include.text', 'LS1 AAA')
      page.addresess().address().should('include.text', 'England')

      page.addresess().addressTypes().should('include.text', 'Discharge - Permanent Housing')
      page.addresess().addressTypes().should('include.text', 'HDC Address')
      page.addresess().addressTypes().should('include.text', 'Other')

      page.addresess().phoneNumbers().should('include.text', '4444555566')
      page.addresess().phoneNumbers().should('include.text', '0113444444')
      page.addresess().phoneNumbers().should('include.text', '0113 333444')
      page.addresess().phoneNumbers().should('include.text', '0800 222333')

      page.addresess().comments().should('include.text', mockAddresses[0].comment)
      page.addresess().addedOn().should('include.text', '1 May 2020')
    })
  })

  context('Emergency contacts and next of kin', () => {
    it('Displays the contacts', () => {
      const page = visitPersonalDetailsPage()

      const addressShouldIncludeCorrectText = contact => {
        contact.address().should('include.text', 'Flat 7, premises address, street field')
        contact.address().should('include.text', 'Leeds')
        contact.address().should('include.text', 'LS1 AAA')
        contact.address().should('include.text', 'England')

        contact.addressTypes().should('include.text', 'Discharge - Permanent Housing')
        contact.addressTypes().should('include.text', 'HDC Address')
        contact.addressTypes().should('include.text', 'Other')

        contact.addressPhones().should('include.text', '4444555566')
        contact.addressPhones().should('include.text', '0113444444')
        contact.addressPhones().should('include.text', '0113 333444')
        contact.addressPhones().should('include.text', '0800 222333')
      }

      const firstContact = page.contacts().contact(0)
      addressShouldIncludeCorrectText(firstContact)
      firstContact.name().should('include.text', 'First Name Middle Name Surname')
      firstContact.emergencyContact().should('be.visible')
      firstContact.relationship().should('include.text', 'Grandson')
      firstContact.emails().should('include.text', 'Not entered')

      const secondContact = page.contacts().contact(1)
      addressShouldIncludeCorrectText(secondContact)
      secondContact.name().should('include.text', 'First Name Middle Name Bob')
      secondContact.emergencyContact().should('be.visible')
      secondContact.relationship().should('include.text', 'Cousin')
      secondContact.emails().should('include.text', 'Not entered')
      secondContact.phones().should('include.text', '555555 6666666')

      const thirdContact = page.contacts().contact(2)
      addressShouldIncludeCorrectText(thirdContact)
      thirdContact.name().should('include.text', 'Dom Bull')
      thirdContact.relationship().should('include.text', 'Grandfather')
      thirdContact.emails().should('include.text', 'email@addressgoeshere.com')
      thirdContact.emails().should('include.text', 'email2@address.com')
      thirdContact.phones().should('include.text', '0113222333')
      thirdContact.phones().should('include.text', '0113333444')
      thirdContact.phones().should('include.text', '07711333444')
    })
  })
})
