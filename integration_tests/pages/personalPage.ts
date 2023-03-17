import Page, { PageElement } from './page'

export default class PersonalPage extends Page {
  constructor() {
    super('Personal')
  }

  activeTab = (): PageElement => cy.get('[data-qa=active-tab]')

  personalDetails = () => {
    const cardData = dataQa => cy.get('[data-qa=personal-details]').find(`[data-qa=${dataQa}]`)
    return {
      fullName: (): PageElement => cardData('full-name'),
      aliases: () => ({
        row: (rowNumber: number) => {
          const row = cardData('alias-list').find('table').find('tr').eq(rowNumber).find('th, td')
          return {
            name: (): PageElement => row.eq(0),
            dateOfBirth: (): PageElement => row.eq(1),
          }
        },
      }),
      languages: () => ({
        spoken: (): PageElement => cardData('languages').find('[data-qa=spoken-language]'),
        written: (): PageElement => cardData('languages').find('[data-qa=written-language]'),
        otherLanguages: (language: string) => ({
          language: (): PageElement =>
            cardData('languages')
              .find('[data-qa=other-languages-list]')
              .find(`[data-qa=other-language-${language}-key]`),
          proficiency: (): PageElement =>
            cardData('languages').find('[data-qa=other-languages-list]').find(`[data-qa=other-language-${language}]`),
        }),
      }),
      aliasList: (): PageElement => cardData('alias-list'),
      preferredName: (): PageElement => cardData('preferred-name'),
      dateOfBirth: () => cardData('date-of-birth'),
      placeOfBirth: () => cardData('place-of-birth'),
      nationality: () => cardData('nationality'),
      otherNationalities: () => cardData('other-nationalities'),
      ethnicGroup: () => cardData('ethnic-group'),
      religionOrBelief: () => cardData('religion-or-belief'),
      sex: () => cardData('sex'),
      sexualOrientation: () => cardData('sexual-orientation'),
      marriageOrCivilPartnership: () => cardData('marriage-or-civil-partnership'),
      numberOfChildren: () => cardData('number-of-children'),
      otherLanguages: () => cardData('other-languages'),
      typeOfDiet: () => cardData('type-of-diet'),
      smokeOrVaper: () => cardData('smoker-or-vaper'),
      domesticAbusePerpetrator: () => cardData('domestic-abuse-perpetrator'),
      domesticAbuseVictim: () => cardData('domestic-abuse-victim'),
      socialCareNeeded: () => cardData('social-care-needed'),
    }
  }

  identityNumbers = () => {
    const cardData = dataQa => cy.get('[data-qa=personal-details]').find(`[data-qa=${dataQa}]`)
    return {
      prisonNumber: () => cardData('prison-number'),
      pncNumber: () => cardData('pnc-number'),
      croNumber: () => cardData('cro-number'),
      homeOfficeReferenceNumber: () => cardData('home-office-reference-number'),
      nationalInsuranceNumber: () => cardData('national-insurance-number'),
      drivingLicenceNumber: () => cardData('driving-licence-number'),
    }
  }
}
