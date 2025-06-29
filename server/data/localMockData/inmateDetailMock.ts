import InmateDetail from '../interfaces/prisonApi/InmateDetail'
import ProfileInformation, { ProfileInformationType } from '../interfaces/prisonApi/ProfileInformation'

export const recognisedListenerYes: ProfileInformation = {
  type: ProfileInformationType.RecognisedListener,
  question: 'Recognised Listener?',
  resultValue: 'Yes',
}

export const recognisedListenerNo: ProfileInformation = {
  type: ProfileInformationType.RecognisedListener,
  question: 'Recognised Listener?',
  resultValue: 'No',
}

export const recognisedListenerBlank: ProfileInformation = {
  type: ProfileInformationType.RecognisedListener,
  question: 'Recognised Listener?',
  resultValue: '',
}

export const suitableListenerYes: ProfileInformation = {
  type: ProfileInformationType.SuitableListener,
  question: 'Suitable Listener?',
  resultValue: 'Yes',
}

export const suitableListenerNo: ProfileInformation = {
  type: ProfileInformationType.SuitableListener,
  question: 'Suitable Listener?',
  resultValue: 'No',
}

export const suitableListenerBlank: ProfileInformation = {
  type: ProfileInformationType.SuitableListener,
  question: 'Suitable Listener?',
  resultValue: '',
}

export const inmateDetailMock: InmateDetail = {
  offenderNo: 'G6123VU',
  bookingId: 1102484,
  bookingNo: 'W21339',
  offenderId: 1814850,
  rootOffenderId: 1814850,
  firstName: 'JOHN',
  middleName: 'MIDDLE NAMES',
  lastName: 'SAUNDERS',
  dateOfBirth: '1990-10-12',
  age: 32,
  activeFlag: true,
  facialImageId: 1413311,
  agencyId: 'MDI',
  assignedLivingUnitId: 25728,
  religion: 'Celestial Church of God',
  language: 'Welsh',
  interpreterRequired: false,
  writtenLanguage: 'English',
  alertsCodes: ['P', 'R', 'T', 'D', 'U', 'X', 'F1', 'L', 'M', 'O'],
  activeAlertCount: 1,
  inactiveAlertCount: 1,
  assignedLivingUnit: {
    agencyId: 'MDI',
    locationId: 25728,
    description: '2-2-035',
    agencyName: 'Moorland (HMP & YOI)',
  },
  physicalAttributes: {
    sexCode: 'M',
    gender: 'Male',
    raceCode: 'W1',
    ethnicity: 'White: Eng./Welsh/Scot./N.Irish/British',
    heightFeet: 6,
    heightInches: 2,
    heightMetres: 1.88,
    heightCentimetres: 188,
    weightPounds: 190,
    weightKilograms: 86,
  },
  physicalCharacteristics: [
    {
      type: 'HAIR',
      characteristic: 'Hair Colour',
      detail: 'Brown',
    },
    {
      type: 'R_EYE_C',
      characteristic: 'Right Eye Colour',
      detail: 'Blue',
    },
    {
      type: 'L_EYE_C',
      characteristic: 'Left Eye Colour',
      detail: 'Blue',
    },
    {
      type: 'FACIAL_HAIR',
      characteristic: 'Facial Hair',
      detail: 'Clean Shaven',
    },
    {
      type: 'FACE',
      characteristic: 'Shape of Face',
      detail: 'Angular',
    },
    {
      type: 'BUILD',
      characteristic: 'Build',
      detail: 'Proportional',
    },
    {
      type: 'SHOESIZE',
      characteristic: 'Shoe Size',
      detail: '10',
    },
  ],
  profileInformation: [
    {
      type: 'YOUTH',
      question: 'Youth Offender?',
      resultValue: 'Yes',
    },
    {
      type: 'MARITAL',
      question: 'Domestic Status',
      resultValue: 'No',
    },
    {
      type: 'CHILD',
      question: 'Number of Children?',
      resultValue: '2',
    },
    {
      type: 'DISABILITY',
      question: 'Does The Prisoner Have a Disability?',
      resultValue: 'YES',
    },
    {
      type: 'DOMESTIC',
      question: 'Domestic Abuse Perpetrator?',
      resultValue: 'Not stated',
    },
    {
      type: 'DOMVIC',
      question: 'Domestic Violence Victim?',
      resultValue: 'Not stated',
    },
    {
      type: 'SMOKE',
      question: 'Is the Offender a smoker?',
      resultValue: 'No',
    },
    {
      type: 'TAT',
      question: 'Warned about tattooing?',
      resultValue: 'Yes',
    },
    {
      type: 'APPEAR',
      question: 'Warned not to change appearance?',
      resultValue: 'Yes',
    },
    {
      type: 'DNA',
      question: 'DNA Required?',
      resultValue: 'No',
    },
    {
      type: 'IMM',
      question: 'Interest to Immigration?',
      resultValue: 'Yes',
    },
    {
      type: 'DIET',
      question: 'Type of diet?',
      resultValue: 'Voluntary - Pork Free/Fish Free',
    },
    {
      type: 'LIST_REC',
      question: 'Listener - Recognised?',
      resultValue: 'Yes',
    },
    {
      type: 'SEXO',
      question: 'Sexual Orientation',
      resultValue: 'Heterosexual / Straight',
    },
    {
      type: 'RELF',
      question: 'Religion',
      resultValue: 'Druid',
    },
    {
      type: 'NAT',
      question: 'Nationality?',
      resultValue: 'Stateless',
    },
    {
      type: 'NATIO',
      question: 'Multiple Nationalities - Add Details',
      resultValue: 'multiple nationalities field',
    },
    {
      type: 'TRAVEL',
      question: 'Are there any travel restrictions?',
      resultValue: 'some travel restrictions',
    },
    {
      type: 'PERSC',
      question: 'Social Care Needed?',
      resultValue: 'No',
    },
  ],
  physicalMarks: [
    {
      type: 'Tattoo',
      side: 'Left',
      bodyPart: 'Arm',
      comment: 'Red bull Logo',
      imageId: 1413021,
    },
    {
      type: 'Tattoo',
      side: 'Front',
      bodyPart: 'Front and sides',
      comment: 'ARC reactor image',
      imageId: 1413020,
    },
    {
      type: 'Tattoo',
      side: 'Right',
      bodyPart: 'Leg',
      comment: 'Monster drink logo',
      imageId: 1413022,
      orentiation: 'Facing',
    },
    {
      type: 'Tattoo',
      side: 'Back',
      bodyPart: 'Front and sides',
      comment: 'Tribal',
      imageId: 1413017,
    },
  ],
  assessments: [
    {
      bookingId: 1102484,
      classificationCode: 'HI',
      classification: 'High',
      assessmentCode: 'CSR',
      assessmentDescription: 'CSR Rating',
      cellSharingAlertFlag: true,
      assessmentDate: '2022-09-21',
      nextReviewDate: '2022-09-22',
      assessmentStatus: 'A',
      assessmentSeq: 24,
    },
    {
      bookingId: 1102484,
      classificationCode: 'C',
      classification: 'Cat C',
      assessmentCode: 'CATEGORY',
      assessmentDescription: 'Categorisation',
      cellSharingAlertFlag: false,
      assessmentDate: '2022-11-17',
      nextReviewDate: '2023-11-17',
      assessmentStatus: 'A',
      assessmentSeq: 25,
      assessmentComment: 'Cat-tool Recat',
    },
    {
      bookingId: 1102484,
      classificationCode: 'STANDARD',
      classification: 'Standard',
      assessmentCode: 'CSRREV',
      assessmentDescription: 'CSR Review',
      cellSharingAlertFlag: true,
      assessmentDate: '2021-01-25',
      nextReviewDate: '2021-04-25',
      assessmentStatus: 'A',
      assessmentSeq: 16,
      assessmentComment: 'Can share with his brother',
    },
  ],
  csra: 'High',
  category: 'Cat C',
  categoryCode: 'C',
  birthPlace: 'LA LA LAND',
  birthCountryCode: 'ENG',
  inOutStatus: 'IN',
  identifiers: [
    {
      type: 'CRO',
      value: '400862/08W',
      offenderId: 1,
      offenderIdSeq: 1,
      offenderNo: 'G6123VU',
      issuedAuthorityText: 'P/CONS',
      caseloadType: 'INST',
      whenCreated: '2012-02-13T13:48:31.650303',
    },
    {
      type: 'PNC',
      value: '08/359381C',
      offenderId: 1,
      offenderIdSeq: 2,
      offenderNo: 'G6123VU',
      issuedAuthorityText: 'P/CONS',
      caseloadType: 'INST',
      whenCreated: '2012-02-13T13:48:31.664201',
    },
    {
      type: 'MERGED',
      value: 'A0596CL',
      offenderId: 1,
      offenderIdSeq: 3,
      offenderNo: 'G6123VU',
      caseloadType: 'INST',
      whenCreated: '2012-02-13T13:48:43.632903',
    },
    {
      type: 'MERGE_HMPS',
      value: 'JK7713',
      offenderId: 1,
      offenderIdSeq: 4,
      offenderNo: 'G6123VU',
      caseloadType: 'INST',
      whenCreated: '2012-02-13T13:48:43.636262',
    },
    {
      type: 'DL',
      value: 'ABCD/123456/AB9DE',
      offenderId: 1,
      offenderIdSeq: 5,
      offenderNo: 'G6123VU',
      issuedDate: '2016-09-08',
      caseloadType: 'INST',
      whenCreated: '2016-09-08T09:15:32.160802',
    },
    {
      type: 'NINO',
      value: 'QQ123456C',
      offenderId: 1,
      offenderIdSeq: 6,
      offenderNo: 'G6123VU',
      issuedDate: '2014-06-25',
      caseloadType: 'INST',
      whenCreated: '2014-06-25T10:36:35.515111',
    },
    {
      type: 'HOREF',
      value: 'A1234567',
      offenderId: 1,
      offenderIdSeq: 7,
      offenderNo: 'G6123VU',
      issuedDate: '2016-11-17',
      caseloadType: 'INST',
      whenCreated: '2016-11-17T14:21:20.88026',
    },
  ],
  personalCareNeeds: [
    {
      personalCareNeedId: 1,
      problemType: 'PHY',
      problemCode: 'FALS',
      problemStatus: 'I',
      problemDescription: 'False Limbs',
      commentText: 'description goes here',
      startDate: '2020-05-19',
      endDate: null,
    },
    {
      personalCareNeedId: 2,
      problemType: 'PSYCH',
      problemCode: 'DEP',
      problemStatus: 'ON',
      problemDescription: 'Depression',
      commentText: 'depression comment',
      startDate: '2000-06-01',
      endDate: null,
    },
    {
      personalCareNeedId: 3,
      problemType: 'PSYCH',
      problemCode: 'BIP',
      problemStatus: 'I',
      problemDescription: 'Bi-Polar',
      commentText: 'psychological description goes here',
      startDate: '1980-01-01',
      endDate: null,
    },
    {
      personalCareNeedId: 4,
      problemType: 'SC',
      problemCode: 'BAC',
      problemStatus: 'ON',
      problemDescription: 'Being Appropriately Clothed',
      commentText: null,
      startDate: '2020-06-09',
      endDate: null,
    },
    {
      personalCareNeedId: 5,
      problemType: 'MATSTAT',
      problemCode: 'NO9U18',
      problemStatus: 'ON',
      problemDescription: 'Not Preg, acc over 9mths under 18mths',
      commentText: 'maternity care type comment goes here',
      startDate: '1989-12-01',
      endDate: null,
    },
    {
      personalCareNeedId: 6,
      problemType: 'PHY',
      problemCode: 'DI',
      problemStatus: 'ON',
      problemDescription: 'Diabetic',
      commentText: 'diabetes description goes here',
      startDate: '2017-06-09',
      endDate: null,
    },
    {
      personalCareNeedId: 7,
      problemType: 'DISAB',
      problemCode: 'LD',
      problemStatus: 'ON',
      problemDescription: 'Learning Difficulties (Inc. Dyslexia)',
      commentText: null,
      startDate: '2021-07-02',
      endDate: null,
    },
    {
      personalCareNeedId: 8,
      problemType: 'SC',
      problemCode: 'BAC',
      problemStatus: 'I',
      problemDescription: 'Being Appropriately Clothed',
      commentText: 'social care description goes here',
      startDate: '2018-07-31',
      endDate: null,
    },
    {
      personalCareNeedId: 9,
      problemType: 'PHY',
      problemCode: 'ASTH',
      problemStatus: 'I',
      problemDescription: 'Asthmatic',
      commentText: null,
      startDate: '2001-10-10',
      endDate: null,
    },
    {
      personalCareNeedId: 10,
      problemType: 'DISAB',
      problemCode: 'VI',
      problemStatus: 'ON',
      problemDescription: 'Visual Impairment (Inc. Blind)',
      commentText: 'diability care type comment goes here',
      startDate: '1999-03-02',
      endDate: null,
    },
    {
      personalCareNeedId: 11,
      problemType: 'DISAB',
      problemCode: 'NR',
      problemStatus: 'ON',
      problemDescription: 'No Disability Recorded',
      commentText: 'no disability recorded details go here..',
      startDate: '2020-07-22',
      endDate: null,
    },
    {
      personalCareNeedId: 12,
      problemType: 'PHY',
      problemCode: 'DI',
      problemStatus: 'ON',
      problemDescription: 'Diabetic',
      commentText: 'fdfdfdfd',
      startDate: '2021-07-02',
      endDate: null,
    },
    {
      personalCareNeedId: 13,
      problemType: 'DISAB',
      problemCode: 'HDS',
      problemStatus: 'I',
      problemDescription: 'Deaf - Uses Sign Language',
      commentText: null,
      startDate: '2000-03-03',
      endDate: null,
    },
    {
      personalCareNeedId: 14,
      problemType: 'SC',
      problemCode: 'TTG',
      problemStatus: 'I',
      problemDescription: 'Toileting',
      commentText:
        'description goes here. description goes here. description goes here. description goes here. description goes here. description goes here. description goes here. description goes here.',
      startDate: '1999-02-02',
      endDate: null,
    },
  ],
  sentenceDetail: {
    sentenceExpiryDate: '2132-03-12',
    conditionalReleaseDate: '2076-01-29',
    licenceExpiryDate: '2132-03-12',
    paroleEligibilityDate: '2021-12-12',
    effectiveSentenceEndDate: '2132-03-12',
    bookingId: 1102484,
    sentenceStartDate: '2020-03-02',
    postRecallReleaseOverrideDate: '2021-12-12',
    nonDtoReleaseDate: '2076-01-29',
    sentenceExpiryCalculatedDate: '2132-03-12',
    licenceExpiryCalculatedDate: '2132-03-12',
    paroleEligibilityOverrideDate: '2021-12-12',
    nonDtoReleaseDateType: 'CRD',
    releaseDate: '2076-01-29',
  },
  offenceHistory: [
    {
      bookingId: 1102484,
      offenceDate: '2016-07-14',
      offenceDescription: 'Burglary dwelling - with intent to steal',
      offenceCode: 'TH68026',
      statuteCode: 'TH68',
      mostSerious: false,
      primaryResultCode: '1002',
      primaryResultDescription: 'Imprisonment',
      primaryResultConviction: true,
      secondaryResultConviction: false,
      courtDate: '2020-06-18',
      caseId: 1434365,
    },
    {
      bookingId: 1102484,
      offenceDate: '2016-07-17',
      offenceRangeDate: '2016-05-29',
      offenceDescription: 'Burglary other than dwelling - theft',
      offenceCode: 'TH68037',
      statuteCode: 'TH68',
      mostSerious: false,
      primaryResultCode: '1002',
      primaryResultDescription: 'Imprisonment',
      primaryResultConviction: true,
      secondaryResultConviction: false,
      courtDate: '2017-01-10',
      caseId: 1507172,
    },
    {
      bookingId: 1102484,
      offenceDescription: 'Drive vehicle for more than 13 hours or more in a working day - domestic',
      offenceCode: 'TR68132',
      statuteCode: 'TR68',
      mostSerious: true,
      primaryResultCode: '1002',
      primaryResultDescription: 'Imprisonment',
      primaryResultConviction: true,
      secondaryResultConviction: false,
      courtDate: '2020-03-02',
      caseId: 1563148,
    },
    {
      bookingId: 1102484,
      offenceDescription: 'Import nuclear material with intent to evade a prohibition / restriction',
      offenceCode: 'CE79245',
      statuteCode: 'CE79',
      mostSerious: false,
      primaryResultCode: '1002',
      primaryResultDescription: 'Imprisonment',
      primaryResultConviction: true,
      secondaryResultConviction: false,
      courtDate: '2020-03-02',
      caseId: 1563148,
    },
    {
      bookingId: 1102484,
      offenceDescription: 'Accept private hire booking while not holder of PHV operators licence - London',
      offenceCode: 'PH98001',
      statuteCode: 'PH98',
      mostSerious: false,
      primaryResultCode: '1002',
      primaryResultDescription: 'Imprisonment',
      primaryResultConviction: true,
      secondaryResultConviction: false,
      courtDate: '2020-07-13',
      caseId: 1563201,
    },
    {
      bookingId: 1102484,
      offenceDescription: 'Behave in an indecent / disorderly manner within Manchester International Airport',
      offenceCode: 'MA55026',
      statuteCode: 'MA55',
      mostSerious: false,
      primaryResultCode: '1002',
      primaryResultDescription: 'Imprisonment',
      primaryResultConviction: true,
      secondaryResultConviction: false,
      courtDate: '2020-07-01',
      caseId: 1563198,
    },
    {
      bookingId: 1102484,
      offenceDescription: 'AATF operator/approved exporter fail to include quarterly information in reg 66(1) report',
      offenceCode: 'WE13097',
      statuteCode: 'WE13',
      mostSerious: false,
      primaryResultCode: '1002',
      primaryResultDescription: 'Imprisonment',
      primaryResultConviction: true,
      secondaryResultConviction: false,
      courtDate: '2020-03-02',
      caseId: 1563148,
    },
  ],
  sentenceTerms: [
    {
      bookingId: 1102484,
      sentenceSequence: 4,
      termSequence: 1,
      sentenceType: 'ADIMP',
      sentenceTypeDescription: 'CJA03 Standard Determinate Sentence',
      startDate: '2020-03-02',
      years: 100,
      lifeSentence: false,
      caseId: '1563148',
      fineAmount: 10000.0,
      sentenceTermCode: 'IMP',
      lineSeq: 4,
      sentenceStartDate: '2020-03-02',
    },
    {
      bookingId: 1102484,
      sentenceSequence: 5,
      termSequence: 1,
      sentenceType: 'LASPO_DR',
      sentenceTypeDescription: 'EDS LASPO Discretionary Release',
      startDate: '2020-03-02',
      years: 10,
      lifeSentence: false,
      caseId: '1563148',
      sentenceTermCode: 'IMP',
      lineSeq: 5,
      sentenceStartDate: '2020-03-02',
    },
    {
      bookingId: 1102484,
      sentenceSequence: 6,
      termSequence: 1,
      consecutiveTo: 4,
      sentenceType: 'ADIMP_ORA',
      sentenceTypeDescription: 'ORA CJA03 Standard Determinate Sentence',
      startDate: '2120-03-02',
      years: 10,
      months: 9,
      weeks: 8,
      days: 7,
      lifeSentence: false,
      caseId: '1563198',
      sentenceTermCode: 'IMP',
      lineSeq: 6,
      sentenceStartDate: '2120-03-02',
    },
    {
      bookingId: 1102484,
      sentenceSequence: 13,
      termSequence: 1,
      consecutiveTo: 6,
      sentenceType: 'ADIMP',
      sentenceTypeDescription: 'CJA03 Standard Determinate Sentence',
      startDate: '2131-02-03',
      years: 1,
      months: 1,
      weeks: 1,
      days: 1,
      lifeSentence: false,
      caseId: '1563201',
      fineAmount: 100.0,
      sentenceTermCode: 'IMP',
      lineSeq: 7,
      sentenceStartDate: '2131-02-03',
    },
  ],
  aliases: [
    {
      firstName: 'MASTER',
      lastName: 'CORDIAN',
      age: 32,
      dob: '1990-08-15',
      gender: 'Male',
      ethnicity: 'White: Eng./Welsh/Scot./N.Irish/British',
      nameType: 'Alias Name',
      createDate: '2011-06-02',
    },
    {
      firstName: 'MASTER',
      middleName: 'J117',
      lastName: 'CHIEF',
      age: 39,
      dob: '1983-06-17',
      gender: 'Male',
      createDate: '2020-05-04',
    },
    {
      firstName: 'MASTER',
      middleName: 'J117',
      lastName: 'CHEIF',
      age: 39,
      dob: '1983-06-17',
      gender: 'Male',
      createDate: '2020-05-04',
    },
    {
      firstName: 'TONY',
      middleName: 'IRONMAN',
      lastName: 'STARK',
      age: 52,
      dob: '1970-05-29',
      gender: 'Male',
      createDate: '2020-05-04',
    },
  ],
  status: 'ACTIVE IN',
  statusReason: 'ADM-24',
  lastMovementTypeCode: 'ADM',
  lastMovementReasonCode: '24',
  legalStatus: 'REMAND',
  recall: true,
  imprisonmentStatus: 'CUR_ORA',
  imprisonmentStatusDescription: 'Committed to Crown Court for Trial',
  receptionDate: '2016-05-30',
  locationDescription: 'Moorland (HMP & YOI)',
  latestLocationId: 'MDI',
}

export const inmateDetailMockOverride = (overrides: Partial<InmateDetail>): InmateDetail => ({
  ...inmateDetailMock,
  ...overrides,
})
