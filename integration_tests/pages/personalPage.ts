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
          language: (): PageElement => cardData('languages').find(`[data-qa=other-language-${language}-key]`),
          proficiency: (): PageElement => cardData('languages').find(`[data-qa=other-language-${language}]`),
        }),
      }),
      dateOfBirth: () => cardData('date-of-birth'),
      cityOrTownOfBirth: () => cardData('city-or-town-of-birth'),
      countryOfBirth: () => cardData('country-of-birth'),
      nationality: () => cardData('nationality'),
      ethnicGroup: () => cardData('ethnic-group'),
      religionOrBelief: () => cardData('religion-or-belief'),
      sex: () => cardData('sex'),
      sexualOrientation: () => cardData('sexual-orientation'),
      marriageOrCivilPartnership: () => cardData('marriage-or-civil-partnership'),
      numberOfChildren: () => cardData('number-of-children'),
      otherLanguages: () => cardData('other-languages'),
      typeOfDiet: () => cardData('type-of-diet'),
      dietAndFoodAllergies: () => cardData('diet-and-food-allergies'),
      smokeOrVaper: () => cardData('smoker-or-vaper'),
      domesticAbusePerpetrator: () => cardData('domestic-abuse-perpetrator'),
      domesticAbuseVictim: () => cardData('domestic-abuse-victim'),
      socialCareNeeded: () => cardData('social-care-needed'),
      youthOffender: () => cardData('youth-offender'),
      militaryRecords: () => ({
        serviceNumber: (): PageElement => cardData('military-records').find('[data-qa=service-number]'),
        branch: (): PageElement => cardData('military-records').find('[data-qa=branch]'),
        unitNumber: (): PageElement => cardData('military-records').find('[data-qa=unit-number]'),
        rank: (): PageElement => cardData('military-records').find('[data-qa=rank]'),
        comments: (): PageElement => cardData('military-records').find('[data-qa=comments]'),
        enlistmentDate: (): PageElement => cardData('military-records').find('[data-qa=enlistment-date]'),
        enlistmentLocation: (): PageElement => cardData('military-records').find('[data-qa=enlistment-location]'),
        conflict: (): PageElement => cardData('military-records').find('[data-qa=conflict]'),
        disciplinaryAction: (): PageElement => cardData('military-records').find('[data-qa=disciplinary-action]'),
        dischargeDate: (): PageElement => cardData('military-records').find('[data-qa=discharge-date]'),
        dischargeLocation: (): PageElement => cardData('military-records').find('[data-qa=discharge-location]'),
        dischargeDescription: (): PageElement => cardData('military-records').find('[data-qa=discharge-description]'),
        lengthOfService: (): PageElement => cardData('military-records').find('[data-qa=length-of-service]'),
      }),
    }
  }

  identityNumbers = () => {
    const cardData = dataQa => cy.get('[data-qa=identity-numbers]').find(`[data-qa=${dataQa}]`)
    return {
      justiceNumbersHeading: () => cardData('justice-numbers-section-heading'),
      personalNumbersHeading: () => cardData('personal-numbers-section-heading'),
      homeOfficeNumbersHeading: () => cardData('home-office-numbers-section-heading'),
      additionalNumbersHeading: () => cardData('additional-identity-numbers-section-heading'),
      prisonNumber: () => cardData('prison-number'),
      pncNumber: () => cardData('pnc'),
      croNumber: () => cardData('cro'),
      homeOfficeReferenceNumber: () => cardData('home-office-reference'),
      nationalInsuranceNumber: () => cardData('national-insurance'),
      drivingLicenceNumber: () => cardData('driving-licence'),
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

  addresses = () => {
    const primaryAndPostalAddress = () => cy.get('#hmpps-address-primary-and-postal')
    const summaryListValues = () => primaryAndPostalAddress().find('.govuk-summary-list__value')
    return {
      addressHeading: () => primaryAndPostalAddress().get('span'),
      address: () => primaryAndPostalAddress().get('p'),
      addressTypes: () => summaryListValues().eq(0),
      addressDates: () => summaryListValues().eq(1),
      addressPhoneNumbers: () => summaryListValues().eq(2),
      addressComments: () => summaryListValues().eq(3),
      addressAddedDate: () => primaryAndPostalAddress().get('.hmpps-address__added-date'),
      addressesLink: () => cy.getDataQa('all-addresses-link'),
    }
  }

  // TODO: this can be removed once edit profile is rolled out
  oldAddresess = () => {
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
    const cardData = () => cy.get('#next-of-kin')
    return {
      apiErrorMessage: () => cardData().find('[data-qa=next-of-kin-api-error]'),

      contact: contactNumber => {
        const contactData = () => cardData().find('[data-qa=contact-item]').eq(contactNumber)

        return {
          nextOfKin: () => contactData().find('[data-qa=next-of-kin]'),
          emergencyContact: () => contactData().find('[data-qa=emergency-contact]'),
          name: () => contactData().find('[data-qa=contact-name]'),
          relationship: () => contactData().find('[data-qa=contact-relationship]'),
          phoneNumber: () => contactData().find('[data-qa=contact-phone]'),
          additionalDetails: () => contactData().find('.govuk-details__summary-text'),
          dateOfBirth: () => contactData().find('.govuk-summary-list > :nth-child(1) > .govuk-summary-list__value'),
          address: () => contactData().find('.govuk-summary-list > :nth-child(2) > .govuk-summary-list__value'),
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
      personIntegrationDistinguishingMarks: () => {
        const marks = () => cy.get('.personal-distinguishing-marks__info')
        const scarsDetail = () => marks().findDataQa('distinguishing-marks-scars').find('details')
        const tattoosDetail = () => marks().findDataQa('distinguishing-marks-tattoos').find('details')
        return {
          tattoos: () => marks().findDataQa('distinguishing-marks-tattoos'),
          scars: () => marks().findDataQa('distinguishing-marks-scars'),
          others: () => marks().findDataQa('distinguishing-marks-others'),
          scarsDetail: () => ({
            detail: () => scarsDetail(),
            content: () => scarsDetail().find('div.govuk-details__text'),
          }),
          tattoosDetail: () => ({
            detail: () => tattoosDetail(),
            content: () => tattoosDetail().find('div.govuk-details__text'),
          }),
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
      pastCareNeedsLink: () => cy.getDataQa('past-care-needs-link'),
      noCareNeedsMessage: () => cy.getDataQa('no-care-needs-message'),
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
