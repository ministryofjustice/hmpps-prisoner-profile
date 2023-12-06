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
      youthOffender: () => cardData('youth-offender'),
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
    const cardData = () => cy.getDataQa('next-of-kin')
    return {
      contact: contactNumber => {
        const contactData = () => cardData().find('[data-qa=emergency-contact]').eq(contactNumber)
        const details = () => contactData().find('[data-qa=contact-details]').find('.govuk-summary-list__value')

        return {
          name: () => contactData().find('[data-qa=contact-name]'),
          relationship: () => contactData().find('[data-qa=contact-relationship]'),
          emergencyContact: () => contactData().find('[data-qa=contact-emergency-contact]'),
          phones: () => contactData().find('[data-qa=contact-numbers]'),
          address: () => details().eq(0),
          addressTypes: () => details().eq(1),
          addressPhones: () => details().eq(2),
          emails: () => details().eq(3),
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
      facialHair: () => physicalCharacteristic(5),
      shapeOfFace: () => physicalCharacteristic(6),
      build: () => physicalCharacteristic(7),
      shoeSize: () => physicalCharacteristic(8),
      warnedAboutTattooing: () => physicalCharacteristic(9),
      warnedNotTochangeAppearance: () => physicalCharacteristic(10),
      distinguishingMarks: (row: number) => {
        const mark = () => cardData().findDataQa('distinguishing-marks').findDataQa('distinguishing-mark-row').eq(row)
        return {
          bodyPart: () => mark().findDataQa('mark-body-part'),
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
      xrays: () => ({
        total: () => cardData().findDataQa('security-xrays').findDataQa('total-xrays'),
        since: () => cardData().findDataQa('security-xrays').findDataQa('xrays-since'),
        warningMessage: () => cardData().findDataQa('security-xrays').findDataQa('xray-limit-reached-message'),
      }),
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
        reasonableAdjustments: (adjustmentRow: number) => {
          const adjustmentItem = careNeedItem(row).findDataQa('reasonable-adjustment').eq(adjustmentRow)
          return {
            description: () => adjustmentItem.findDataQa('adjustment-description'),
            comment: () => adjustmentItem.findDataQa('adjustment-comment'),
            addedBy: () => adjustmentItem.findDataQa('adjustment-added-by'),
            addedOn: () => adjustmentItem.findDataQa('adjustment-added-on'),
          }
        },
      }),
      reasonableAdjustments: (row: number) => ({
        type: () => reasonableAdjustmentItem(row).findDataQa('reasonable-adjustment-key'),
        description: () => reasonableAdjustmentValue(row).findDataQa('description'),
        comment: () => reasonableAdjustmentValue(row).findDataQa('comment'),
        addedOn: () => reasonableAdjustmentValue(row).findDataQa('added-on'),
      }),
    }
  }

  backToTopLink = (): PageElement => cy.get('[data-module=hmpps-back-to-top] a')

  backToTopLinkHidden = (): PageElement => cy.get('.hmpps-back-to-top--hidden')

  neurodiversity = () => {
    return {
      neurodivergenceExists: () => cy.get('#neurodiversity'),
      neurodivergenceSupport: () => cy.get('[data-qa="neurodivergence-support"] > [data-qa="-row"] > [data-qa="-key"]'),
      neurodiversityTitle: () => cy.get(':nth-child(5) > [data-qa="-row"] > [data-qa="-key"]'),
      neurodiversitySelfAssessment: () => cy.get(':nth-child(5) > [data-qa="-row"] > .govuk-summary-list__value'),
      fromNeurodiversityAssessment: () => cy.get(':nth-child(9) > [data-qa="-row"] > .govuk-summary-list__value'),
      neurodiversityAssessed: () => cy.get(':nth-child(9) > [data-qa="-row"] > .govuk-summary-list__value'),
    }
  }
}
