import { Details } from '../../interfaces/prisonApi/details'

export const GetDetailsMock: Details = {
  offenderNo: 'A1234AA',
  bookingId: 432132,
  bookingNo: 'string',
  offenderId: 0,
  rootOffenderId: 0,
  firstName: 'string',
  middleName: 'string',
  lastName: 'string',
  dateOfBirth: '1970-03-15',
  age: 0,
  activeFlag: true,
  facialImageId: 0,
  agencyId: 'string',
  assignedLivingUnitId: 0,
  religion: 'string',
  language: 'string',
  interpreterRequired: true,
  writtenLanguage: 'string',
  alertsCodes: ['string'],
  activeAlertCount: 0,
  inactiveAlertCount: 0,
  alerts: [
    {
      alertId: 1,
      bookingId: 14,
      offenderNo: 'G3878UK',
      alertType: 'X',
      alertTypeDescription: 'Security',
      alertCode: 'XER',
      alertCodeDescription: 'Escape Risk',
      comment: 'Profession lock pick.',
      dateCreated: '2019-08-20',
      dateExpires: '2020-08-20',
      modifiedDateTime: '2021-07-05T10:35:17',
      expired: true,
      active: false,
      addedByFirstName: 'John',
      addedByLastName: 'Smith',
      expiredByFirstName: 'John',
      expiredByLastName: 'Smith',
    },
  ],
  assignedLivingUnit: {
    agencyId: 'string',
    locationId: 0,
    description: 'string',
    agencyName: 'string',
  },
  physicalAttributes: {
    sexCode: 'M',
    gender: 'Male',
    raceCode: 'W1',
    ethnicity: 'White: Eng./Welsh/Scot./N.Irish/British',
    heightFeet: 5,
    heightInches: 60,
    heightMetres: 1.76,
    heightCentimetres: 176,
    weightPounds: 50,
    weightKilograms: 67,
  },
  physicalCharacteristics: [
    {
      type: 'string',
      characteristic: 'string',
      detail: 'string',
      imageId: 0,
    },
  ],
  profileInformation: [
    {
      type: 'string',
      question: 'string',
      resultValue: 'string',
    },
  ],
  physicalMarks: [
    {
      type: 'string',
      side: 'string',
      bodyPart: 'string',
      orientation: 'string',
      comment: 'string',
      imageId: 0,
    },
  ],
  assessments: [
    {
      bookingId: 123456,
      offenderNo: 'GV09876N',
      classificationCode: 'C',
      classification: 'Cat C',
      assessmentCode: 'CATEGORY',
      assessmentDescription: 'Categorisation',
      cellSharingAlertFlag: true,
      assessmentDate: '2018-02-11',
      nextReviewDate: '2018-02-11',
      approvalDate: '2018-02-11',
      assessmentAgencyId: 'MDI',
      assessmentStatus: 'A',
      assessmentSeq: 1,
      assessmentComment: 'Comment details',
      assessorId: 130000,
      assessorUser: 'NGK33Y',
    },
  ],
  csra: 'string',
  csraClassificationCode: 'STANDARD',
  csraClassificationDate: '2023-09-28',
  category: 'string',
  categoryCode: 'string',
  birthPlace: 'WALES',
  birthCountryCode: 'GBR',
  inOutStatus: 'IN, OUT, TRN',
  identifiers: [
    {
      type: 'PNC',
      value: '1231/XX/121',
      offenderNo: 'A1234AB',
      bookingId: 1231223,
      issuedAuthorityText: 'Important Auth',
      issuedDate: '2018-01-21',
      caseloadType: 'GENERAL',
      whenCreated: '2021-07-05T10:35:17',
    },
  ],
  personalCareNeeds: [
    {
      personalCareNeedId: 1,
      problemType: 'MATSTAT',
      problemCode: 'ACCU9',
      problemStatus: 'ON',
      problemDescription: 'Preg, acc under 9mths',
      commentText: 'a comment',
      startDate: '2010-06-21',
      endDate: '2010-06-21',
    },
  ],
  sentenceDetail: {
    sentenceExpiryDate: '2020-02-03',
    automaticReleaseDate: '2020-02-03',
    conditionalReleaseDate: '2020-02-03',
    nonParoleDate: '2020-02-03',
    postRecallReleaseDate: '2020-02-03',
    licenceExpiryDate: '2020-02-03',
    homeDetentionCurfewEligibilityDate: '2020-02-03',
    paroleEligibilityDate: '2020-02-03',
    homeDetentionCurfewActualDate: '2020-02-03',
    actualParoleDate: '2020-02-03',
    releaseOnTemporaryLicenceDate: '2020-02-03',
    earlyRemovalSchemeEligibilityDate: '2020-02-03',
    earlyTermDate: '2020-02-03',
    midTermDate: '2020-02-03',
    lateTermDate: '2020-02-03',
    topupSupervisionExpiryDate: '2020-02-03',
    tariffDate: '2020-02-03',
    dtoPostRecallReleaseDate: '2020-02-03',
    tariffEarlyRemovalSchemeEligibilityDate: '2020-02-03',
    effectiveSentenceEndDate: '2020-02-03',
    bookingId: 1234123,
    sentenceStartDate: '2010-02-03',
    additionalDaysAwarded: 5,
    automaticReleaseOverrideDate: '2020-02-03',
    conditionalReleaseOverrideDate: '2020-02-03',
    nonParoleOverrideDate: '2020-02-03',
    postRecallReleaseOverrideDate: '2020-04-01',
    dtoPostRecallReleaseDateOverride: '2020-04-01',
    nonDtoReleaseDate: '2020-04-01',
    sentenceExpiryCalculatedDate: '2020-02-03',
    sentenceExpiryOverrideDate: '2020-02-03',
    licenceExpiryCalculatedDate: '2020-02-03',
    licenceExpiryOverrideDate: '2020-02-03',
    paroleEligibilityCalculatedDate: '2020-02-03',
    paroleEligibilityOverrideDate: '2020-02-03',
    topupSupervisionExpiryCalculatedDate: '2020-02-03',
    topupSupervisionExpiryOverrideDate: '2020-02-03',
    homeDetentionCurfewEligibilityCalculatedDate: '2020-02-03',
    homeDetentionCurfewEligibilityOverrideDate: '2020-02-03',
    nonDtoReleaseDateType: 'CRD',
    confirmedReleaseDate: '2020-04-20',
    releaseDate: '2020-04-01',
    etdOverrideDate: '2019-04-02',
    etdCalculatedDate: '2019-04-02',
    mtdOverrideDate: '2019-04-02',
    mtdCalculatedDate: '2019-04-02',
    ltdOverrideDate: '2019-04-02',
    ltdCalculatedDate: '2019-04-02',
    topupSupervisionStartDate: '2019-04-01',
    homeDetentionCurfewEndDate: '2019-04-01',
  },
  offenceHistory: [
    {
      bookingId: 1123456,
      offenceDate: '2018-02-10',
      offenceRangeDate: '2018-03-10',
      offenceDescription: 'Commit an act / series of acts with intent to pervert the course of public justice',
      offenceCode: 'RR84070',
      statuteCode: 'RR84',
      mostSerious: true,
      primaryResultCode: 'string',
      secondaryResultCode: 'string',
      primaryResultDescription: 'string',
      secondaryResultDescription: 'string',
      primaryResultConviction: true,
      secondaryResultConviction: true,
      courtDate: '2018-02-10',
      caseId: 100,
    },
  ],
  sentenceTerms: [
    {
      bookingId: 1132400,
      sentenceSequence: 2,
      termSequence: 1,
      consecutiveTo: 2,
      sentenceType: '2',
      sentenceTypeDescription: '2',
      startDate: '2018-12-31',
      years: 1,
      months: 2,
      weeks: 3,
      days: 4,
      lifeSentence: true,
      caseId: 'string',
      fineAmount: 0,
      sentenceTermCode: 'IMP',
      lineSeq: 1,
      sentenceStartDate: '2018-12-31',
    },
  ],
  aliases: [
    {
      firstName: 'Mike',
      middleName: 'John',
      lastName: 'Smith',
      age: 32,
      dob: '1980-02-28',
      gender: 'Male',
      ethnicity: 'Mixed: White and Black African',
      nameType: 'Alias Name',
      createDate: '2019-02-15',
    },
  ],
  status: 'ACTIVE IN, INACTIVE OUT, INACTIVE TRN',
  statusReason: 'CRT-CA',
  lastMovementTypeCode: 'TAP, CRT, TRN, ADM, REL',
  lastMovementReasonCode: 'CA',
  legalStatus: 'REMAND',
  recall: true,
  imprisonmentStatus: 'LIFE',
  imprisonmentStatusDescription: 'Serving Life Imprisonment',
  receptionDate: '1980-01-01',
  locationDescription: 'Outside - released from Leeds',
  latestLocationId: 'MDI',
}

export default {
  GetDetailsMock,
}