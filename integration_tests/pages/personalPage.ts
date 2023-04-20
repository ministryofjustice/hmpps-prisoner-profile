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
    const cardData = dataQa => cy.get('[data-qa=identity-numbers]').find(`[data-qa=${dataQa}]`)
    return {
      prisonNumber: () => cardData('prison-number'),
      pncNumber: () => cardData('pnc-number'),
      croNumber: () => cardData('cro-number'),
      homeOfficeReferenceNumber: () => cardData('home-office-reference-number'),
      nationalInsuranceNumber: () => cardData('national-insurance-number'),
      drivingLicenceNumber: () => cardData('driving-licence-number'),
    }
  }

  property = () => {
    const cardData = dataQa => cy.get('[data-qa=property]').find(`[data-qa=${dataQa}]`)
    const propertyItem = itemNumber => cardData('property-item').eq(itemNumber)
    return {
      item: itemNumber => ({
        containerType: () => propertyItem(itemNumber).find('[data-qa=container-type]'),
        sealMark: () => propertyItem(itemNumber).find('.govuk-summary-list__value').eq(0),
        location: () => propertyItem(itemNumber).find('.govuk-summary-list__value').eq(1),
      }),
    }
  }

  addresess = () => {
    const cardData = () => cy.get('[data-qa=addresses]')
    const summaryListValues = () => cardData().find('.govuk-summary-list__value')
    return {
      address: () => summaryListValues().eq(0),
      addressTypes: () => summaryListValues().eq(1),
      phoneNumbers: () => summaryListValues().eq(2),
      comments: () => summaryListValues().eq(3),
      addedOn: () => cardData().find('[data-qa=address-added-on]'),
    }
  }

  contacts = () => {
    const cardData = () => cy.getDataQa('emergency-contacts')
    return {
      contact: contactNumber => {
        const contactData = () => cardData().find('[data-qa=emergency-contact]').eq(contactNumber)
        const details = () => contactData().find('[data-qa=contact-details]').find('.govuk-summary-list__value')

        return {
          name: () => contactData().find('[data-qa=contact-name]'),
          relationship: () => contactData().find('[data-qa=contact-relationship]'),
          emergencyContact: () => contactData().find('[data-qa=contact-emergency-contact]'),
          phones: () => contactData().find('[data-qa=contact-numbers]'),
          emails: () => details().eq(0),
          address: () => details().eq(1),
          addressPhones: () => details().eq(2),
          addressTypes: () => details().eq(3),
        }
      },
    }
  }

  appearance = () => {
    const cardData = () => cy.getDataQa('appearance')
    const physicalCharacteristic = (row: number) =>
      cardData().getDataQa('physical-characteristics').find('.govuk-summary-list__value').eq(row)
    return {
      height: () => physicalCharacteristic(0),
      weight: () => physicalCharacteristic(1),
      hairColour: () => physicalCharacteristic(2),
      leftEyeColour: () => physicalCharacteristic(3),
      rightEyeColour: () => physicalCharacteristic(4),
      shapeOfFace: () => physicalCharacteristic(5),
      build: () => physicalCharacteristic(6),
      shoeSize: () => physicalCharacteristic(7),
      warnedAboutTattooing: () => physicalCharacteristic(8),
      warnedNotTochangeAppearance: () => physicalCharacteristic(9),
      distinguishingMarks: (row: number) => {
        const mark = () => cardData().findDataQa('distinguishing-marks').findDataQa('distinguishing-mark-row').eq(row)
        return {
          type: () => cardData().findDataQa('distinguishing-marks').findDataQa('distinguishing-mark-key').eq(row),
          side: () => mark().findDataQa('mark-side'),
          orientation: () => mark().findDataQa('mark-orientation'),
          comment: () => mark().findDataQa('mark-comment'),
          image: () => mark().findDataQa('mark-image'),
        }
      },
    }
  }

  security = () => {
    const cardData = () => cy.getDataQa('security')
    return {
      interestToImmigration: () => cardData().findDataQa('interest-to-immigration'),
      travelRestrictions: () => cardData().findDataQa('travel-restrictions'),
    }
  }

  careNeeds = () => {
    const cardData = () => cy.getDataQa('care-needs')
    const careNeedItem = (row: number) => cardData().findDataQa('care-needs-list').findDataQa('care-need-row').eq(row)
    const careNeedValue = (row: number) => careNeedItem(row).find('.govuk-summary-list__value')
    const reasonableAdjustmentItem = (row: number) =>
      cardData().findDataQa('care-needs-list').findDataQa('reasonable-adjustment-row').eq(row)
    const reasonableAdjustmentValue = (row: number) => reasonableAdjustmentItem(row).find('.govuk-summary-list__value')

    return {
      personalCareNeeds: (row: number) => ({
        type: () => careNeedItem(row).findDataQa('care-need-key'),
        description: () => careNeedValue(row).findDataQa('description'),
        comment: () => careNeedValue(row).findDataQa('comment'),
        addedOn: () => careNeedValue(row).findDataQa('added-on'),
      }),
      reasonableAdjustments: (row: number) => ({
        type: () => reasonableAdjustmentItem(row).findDataQa('reasonable-adjustment-key'),
        description: () => reasonableAdjustmentValue(row).findDataQa('description'),
        comment: () => reasonableAdjustmentValue(row).findDataQa('comment'),
        addedOn: () => reasonableAdjustmentValue(row).findDataQa('added-on'),
      }),
    }
  }
}
