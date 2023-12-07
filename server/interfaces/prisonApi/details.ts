export interface Details {
  offenderNo: string
  bookingId: number
  bookingNo: string
  offenderId: number
  rootOffenderId: number
  firstName: string
  middleName: string
  lastName: string
  dateOfBirth: string
  age: number
  activeFlag: boolean
  facialImageId: number
  agencyId: string
  assignedLivingUnitId: number
  religion: string
  language: string
  interpreterRequired: boolean
  writtenLanguage: string
  alertsCodes: [string]
  activeAlertCount: number
  inactiveAlertCount: number
  alerts: [
    {
      alertId: number
      bookingId: number
      offenderNo: string
      alertType: string
      alertTypeDescription: string
      alertCode: string
      alertCodeDescription: string
      comment: string
      dateCreated: string
      dateExpires: string
      modifiedDateTime: string
      expired: boolean
      active: boolean
      addedByFirstName: string
      addedByLastName: string
      expiredByFirstName: string
      expiredByLastName: string
    },
  ]
  assignedLivingUnit: {
    agencyId: string
    locationId: number
    description: string
    agencyName: string
  }
  physicalAttributes: {
    sexCode: string
    gender: string
    raceCode: string
    ethnicity: string
    heightFeet: number
    heightInches: number
    heightMetres: number
    heightCentimetres: number
    weightPounds: number
    weightKilograms: number
  }
  physicalCharacteristics: [
    {
      type: string
      characteristic: string
      detail: string
      imageId: number
    },
  ]
  profileInformation: [
    {
      type: string
      question: string
      resultValue: string
    },
  ]
  physicalMarks: [
    {
      type: string
      side: string
      bodyPart: string
      orientation: string
      comment: string
      imageId: number
    },
  ]
  assessments: [
    {
      bookingId: number
      offenderNo: string
      classificationCode: string
      classification: string
      assessmentCode: string
      assessmentDescription: string
      cellSharingAlertFlag: boolean
      assessmentDate: string
      nextReviewDate: string
      approvalDate: string
      assessmentAgencyId: string
      assessmentStatus: string
      assessmentSeq: number
      assessmentComment: string
      assessorId: number
      assessorUser: string
    },
  ]
  csra: string
  csraClassificationCode: string
  csraClassificationDate: string
  category: string
  categoryCode: string
  birthPlace: string
  birthCountryCode: string
  inOutStatus: string
  identifiers: [
    {
      type: string
      value: string
      offenderNo: string
      bookingId: number
      issuedAuthorityText: string
      issuedDate: string
      caseloadType: string
      whenCreated: string
    },
  ]
  personalCareNeeds: [
    {
      personalCareNeedId: number
      problemType: string
      problemCode: string
      problemStatus: string
      problemDescription: string
      commentText: string
      startDate: string
      endDate: string
    },
  ]
  sentenceDetail: {
    sentenceExpiryDate: string
    automaticReleaseDate: string
    conditionalReleaseDate: string
    nonParoleDate: string
    postRecallReleaseDate: string
    licenceExpiryDate: string
    homeDetentionCurfewEligibilityDate: string
    paroleEligibilityDate: string
    homeDetentionCurfewActualDate: string
    actualParoleDate: string
    releaseOnTemporaryLicenceDate: string
    earlyRemovalSchemeEligibilityDate: string
    earlyTermDate: string
    midTermDate: string
    lateTermDate: string
    topupSupervisionExpiryDate: string
    tariffDate: string
    dtoPostRecallReleaseDate: string
    tariffEarlyRemovalSchemeEligibilityDate: string
    effectiveSentenceEndDate: string
    bookingId: number
    sentenceStartDate: string
    additionalDaysAwarded: number
    automaticReleaseOverrideDate: string
    conditionalReleaseOverrideDate: string
    nonParoleOverrideDate: string
    postRecallReleaseOverrideDate: string
    dtoPostRecallReleaseDateOverride: string
    nonDtoReleaseDate: string
    sentenceExpiryCalculatedDate: string
    sentenceExpiryOverrideDate: string
    licenceExpiryCalculatedDate: string
    licenceExpiryOverrideDate: string
    paroleEligibilityCalculatedDate: string
    paroleEligibilityOverrideDate: string
    topupSupervisionExpiryCalculatedDate: string
    topupSupervisionExpiryOverrideDate: string
    homeDetentionCurfewEligibilityCalculatedDate: string
    homeDetentionCurfewEligibilityOverrideDate: string
    nonDtoReleaseDateType: string
    confirmedReleaseDate: string
    releaseDate: string
    etdOverrideDate: string
    etdCalculatedDate: string
    mtdOverrideDate: string
    mtdCalculatedDate: string
    ltdOverrideDate: string
    ltdCalculatedDate: string
    topupSupervisionStartDate: string
    homeDetentionCurfewEndDate: string
  }
  offenceHistory: [
    {
      bookingId: number
      offenceDate: string
      offenceRangeDate: string
      offenceDescription: string
      offenceCode: string
      statuteCode: string
      mostSerious: boolean
      primaryResultCode: string
      secondaryResultCode: string
      primaryResultDescription: string
      secondaryResultDescription: string
      primaryResultConviction: boolean
      secondaryResultConviction: boolean
      courtDate: string
      caseId: number
    },
  ]
  sentenceTerms: [
    {
      bookingId: number
      sentenceSequence: number
      termSequence: number
      consecutiveTo: number
      sentenceType: string
      sentenceTypeDescription: string
      startDate: string
      years: number
      months: number
      weeks: number
      days: number
      lifeSentence: boolean
      caseId: string
      fineAmount: number
      sentenceTermCode: string
      lineSeq: number
      sentenceStartDate: string
    },
  ]
  aliases: [
    {
      firstName: string
      middleName: string
      lastName: string
      age: number
      dob: string
      gender: string
      ethnicity: string
      nameType: string
      createDate: string
    },
  ]
  status: string
  statusReason: string
  lastMovementTypeCode: string
  lastMovementReasonCode: string
  legalStatus: string
  recall: boolean
  imprisonmentStatus: string
  imprisonmentStatusDescription: string
  receptionDate: string
  locationDescription: string
  latestLocationId: string
}
