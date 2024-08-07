import Prisoner from '../interfaces/prisonerSearchApi/Prisoner'

export const PrisonerMockDataA: Prisoner = {
  prisonerNumber: 'G6123VU',
  pncNumber: '08/359381C',
  pncNumberCanonicalShort: '08/359381C',
  pncNumberCanonicalLong: '2008/359381C',
  croNumber: '400862/08W',
  bookingId: 1102484,
  bookNumber: 'W21339',
  firstName: 'JOHN',
  middleNames: 'MIDDLE NAMES',
  lastName: 'SAUNDERS',
  dateOfBirth: '1990-10-12',
  gender: 'Male',
  ethnicity: 'White: Eng./Welsh/Scot./N.Irish/British',
  youthOffender: true,
  maritalStatus: 'No',
  religion: 'Celestial Church of God',
  nationality: 'Stateless',
  status: 'ACTIVE IN',
  lastMovementTypeCode: 'ADM',
  lastMovementReasonCode: '24',
  inOutStatus: 'IN',
  prisonId: 'MDI',
  prisonName: 'Moorland (HMP & YOI)',
  cellLocation: '1-1-035',
  aliases: [
    {
      firstName: 'MASTER',
      lastName: 'CORDIAN',
      dateOfBirth: '1990-08-15',
      gender: 'Male',
      ethnicity: 'White: Eng./Welsh/Scot./N.Irish/British',
    },
    {
      firstName: 'MASTER',
      middleNames: 'J117',
      lastName: 'CHIEF',
      dateOfBirth: '1983-06-17',
      gender: 'Male',
    },
    {
      firstName: 'MASTER',
      middleNames: 'J117',
      lastName: 'CHEIF',
      dateOfBirth: '1983-06-17',
      gender: 'Male',
    },
    {
      firstName: 'TONY',
      middleNames: 'IRONMAN',
      lastName: 'STARK',
      dateOfBirth: '1970-05-29',
      gender: 'Male',
    },
  ],
  alerts: [
    { alertType: 'R', alertCode: 'RAIC', active: true, expired: false },
    { alertType: 'M', alertCode: 'MSI', active: true, expired: false },
    { alertType: 'R', alertCode: 'RKS', active: true, expired: false },
    { alertType: 'L', alertCode: 'LCE', active: true, expired: false },
    {
      alertType: 'X',
      alertCode: 'XTACT',
      active: true,
      expired: false,
    },
    { alertType: 'U', alertCode: 'USU', active: true, expired: false },
    { alertType: 'X', alertCode: 'XRF', active: true, expired: false },
    { alertType: 'U', alertCode: 'URCU', active: true, expired: false },
    { alertType: 'U', alertCode: 'URS', active: true, expired: false },
    { alertType: 'X', alertCode: 'XR', active: true, expired: false },
    { alertType: 'U', alertCode: 'UPIU', active: true, expired: false },
    {
      alertType: 'R',
      alertCode: 'RNO121',
      active: true,
      expired: false,
    },
    { alertType: 'M', alertCode: 'PEEP', active: true, expired: false },
    { alertType: 'O', alertCode: 'CSIP', active: true, expired: false },
    { alertType: 'X', alertCode: 'XCO', active: true, expired: false },
    { alertType: 'R', alertCode: 'RCON', active: true, expired: false },
    { alertType: 'X', alertCode: 'XCI', active: true, expired: false },
    { alertType: 'X', alertCode: 'XCA', active: true, expired: false },
    { alertType: 'T', alertCode: 'TCPA', active: true, expired: false },
    { alertType: 'X', alertCode: 'XCU', active: true, expired: false },
    { alertType: 'X', alertCode: 'XEL', active: true, expired: false },
    { alertType: 'R', alertCode: 'RTP', active: true, expired: false },
    { alertType: 'R', alertCode: 'RLG', active: true, expired: false },
    { alertType: 'R', alertCode: 'RCDR', active: true, expired: false },
    {
      alertType: 'D',
      alertCode: 'DOCGM',
      active: true,
      expired: false,
    },
    { alertType: 'X', alertCode: 'XSC', active: true, expired: false },
    { alertType: 'P', alertCode: 'PC1', active: true, expired: false },
    { alertType: 'X', alertCode: 'HPI', active: true, expired: false },
    { alertType: 'F1', alertCode: 'F1', active: true, expired: false },
    {
      alertType: 'X',
      alertCode: 'XGANG',
      active: true,
      expired: false,
    },
    { alertType: 'X', alertCode: 'XHT', active: true, expired: false },
    { alertType: 'X', alertCode: 'XC', active: true, expired: false },
    { alertType: 'X', alertCode: 'XVL', active: true, expired: false },
    { alertType: 'X', alertCode: 'XA', active: true, expired: false },
  ],
  csra: 'High',
  category: 'A',
  legalStatus: 'RECALL',
  imprisonmentStatus: 'CUR_ORA',
  imprisonmentStatusDescription: 'ORA Recalled from Curfew Conditions',
  mostSeriousOffence: 'Drive vehicle for more than 13 hours or more in a working day - domestic',
  recall: true,
  indeterminateSentence: false,
  sentenceStartDate: '2020-03-02',
  releaseDate: '2076-01-29',
  sentenceExpiryDate: '2132-03-12',
  licenceExpiryDate: '2132-03-12',
  nonDtoReleaseDate: '2076-01-29',
  nonDtoReleaseDateType: 'CRD',
  receptionDate: '2016-05-30',
  paroleEligibilityDate: '2021-12-12',
  postRecallReleaseDate: '2021-12-12',
  conditionalReleaseDate: '2076-01-29',
  locationDescription: 'Moorland (HMP & YOI)',
  restrictedPatient: false,
  currentIncentive: {
    level: { code: 'STD', description: 'Standard' },
    dateTime: '2023-01-30T14:46:01',
    nextReviewDate: '2024-01-30',
  },
  build: 'Proportional',
  facialHair: 'Clean Shaven',
  hairColour: 'Brown',
  heightCentimetres: 188,
  weightKilograms: 86,
  leftEyeColour: 'Blue',
  rightEyeColour: 'Blue',
  shapeOfFace: 'Angular',
  shoeSize: '10',
}

export const PrisonerMockDataB: Prisoner = {
  prisonerNumber: 'G9981UK',
  pncNumber: '06/333311K',
  pncNumberCanonicalShort: '06/333311K',
  pncNumberCanonicalLong: '2006/333311K',
  croNumber: '1519/07W',
  bookingId: 936883,
  bookNumber: 'P16569',
  firstName: 'AUSTIN',
  lastName: 'AVARY',
  dateOfBirth: '1993-12-08',
  gender: 'Male',
  ethnicity: 'White: Eng./Welsh/Scot./N.Irish/British',
  youthOffender: true,
  maritalStatus: 'Single-not married/in civil partnership',
  religion: 'No Religion',
  nationality: 'British',
  status: 'ACTIVE OUT',
  lastMovementTypeCode: 'TAP',
  lastMovementReasonCode: 'SE',
  inOutStatus: 'OUT',
  prisonId: 'MDI',
  prisonName: 'Moorland (HMP & YOI)',
  cellLocation: '1-1-015',
  aliases: [],
  alerts: [
    { alertType: 'H', alertCode: 'HA', active: true, expired: false },
    { alertType: 'P', alertCode: 'PC2', active: true, expired: false },
    { alertType: 'R', alertCode: 'ROH', active: true, expired: false },
  ],
  category: 'B',
  legalStatus: 'SENTENCED',
  imprisonmentStatus: 'SENT03',
  imprisonmentStatusDescription: 'Adult Imprisonment Without Option CJA03',
  mostSeriousOffence: 'Burglary dwelling - with intent to steal',
  recall: false,
  indeterminateSentence: false,
  sentenceStartDate: '2015-02-19',
  releaseDate: '2017-07-09',
  confirmedReleaseDate: '2017-07-09',
  sentenceExpiryDate: '2020-03-30',
  licenceExpiryDate: '2020-03-30',
  nonDtoReleaseDate: '2017-08-30',
  nonDtoReleaseDateType: 'CRD',
  receptionDate: '2014-12-10',
  conditionalReleaseDate: '2017-08-30',
  locationDescription: 'Moorland (HMP & YOI)',
  restrictedPatient: false,
  currentIncentive: {
    level: { code: 'ENH', description: 'Enhanced' },
    dateTime: '2022-10-17T14:09:15',
    nextReviewDate: '2023-10-17',
  },
  build: 'Proportional',
  facialHair: 'Clean Shaven',
  hairColour: 'Brown',
  heightCentimetres: 188,
  weightKilograms: 86,
  leftEyeColour: 'Blue',
  rightEyeColour: 'Blue',
  shapeOfFace: 'Angular',
  shoeSize: '10',
}

export const PrisonerOnRemandMockData: Prisoner = {
  prisonerNumber: 'X9999XX',
  pncNumber: '08/359381C',
  pncNumberCanonicalShort: '08/359381C',
  pncNumberCanonicalLong: '2008/359381C',
  croNumber: '400862/08W',
  bookingId: 1234568,
  bookNumber: 'W21339',
  firstName: 'JOHN',
  middleNames: 'MIDDLE NAMES',
  lastName: 'SAUNDERS',
  dateOfBirth: '1990-10-12',
  gender: 'Male',
  ethnicity: 'White: Eng./Welsh/Scot./N.Irish/British',
  youthOffender: true,
  maritalStatus: 'No',
  religion: 'Celestial Church of God',
  nationality: 'Stateless',
  status: 'ACTIVE IN',
  lastMovementTypeCode: 'ADM',
  lastMovementReasonCode: '24',
  inOutStatus: 'IN',
  prisonId: 'MDI',
  prisonName: 'Moorland (HMP & YOI)',
  cellLocation: '1-1-035',
  aliases: [
    {
      firstName: 'MASTER',
      lastName: 'CORDIAN',
      dateOfBirth: '1990-08-15',
      gender: 'Male',
      ethnicity: 'White: Eng./Welsh/Scot./N.Irish/British',
    },
    {
      firstName: 'MASTER',
      middleNames: 'J117',
      lastName: 'CHIEF',
      dateOfBirth: '1983-06-17',
      gender: 'Male',
    },
    {
      firstName: 'MASTER',
      middleNames: 'J117',
      lastName: 'CHEIF',
      dateOfBirth: '1983-06-17',
      gender: 'Male',
    },
    {
      firstName: 'TONY',
      middleNames: 'IRONMAN',
      lastName: 'STARK',
      dateOfBirth: '1970-05-29',
      gender: 'Male',
    },
  ],
  alerts: [
    { alertType: 'R', alertCode: 'RAIC', active: true, expired: false },
    { alertType: 'M', alertCode: 'MSI', active: true, expired: false },
    { alertType: 'R', alertCode: 'RKS', active: true, expired: false },
    { alertType: 'L', alertCode: 'LCE', active: true, expired: false },
    {
      alertType: 'X',
      alertCode: 'XTACT',
      active: true,
      expired: false,
    },
    { alertType: 'U', alertCode: 'USU', active: true, expired: false },
    { alertType: 'X', alertCode: 'XRF', active: true, expired: false },
    { alertType: 'U', alertCode: 'URCU', active: true, expired: false },
    { alertType: 'U', alertCode: 'URS', active: true, expired: false },
    { alertType: 'X', alertCode: 'XR', active: true, expired: false },
    { alertType: 'U', alertCode: 'UPIU', active: true, expired: false },
    {
      alertType: 'R',
      alertCode: 'RNO121',
      active: true,
      expired: false,
    },
    { alertType: 'M', alertCode: 'PEEP', active: true, expired: false },
    { alertType: 'O', alertCode: 'CSIP', active: true, expired: false },
    { alertType: 'X', alertCode: 'XCO', active: true, expired: false },
    { alertType: 'R', alertCode: 'RCON', active: true, expired: false },
    { alertType: 'X', alertCode: 'XCI', active: true, expired: false },
    { alertType: 'X', alertCode: 'XCA', active: true, expired: false },
    { alertType: 'T', alertCode: 'TCPA', active: true, expired: false },
    { alertType: 'X', alertCode: 'XCU', active: true, expired: false },
    { alertType: 'X', alertCode: 'XEL', active: true, expired: false },
    { alertType: 'R', alertCode: 'RTP', active: true, expired: false },
    { alertType: 'R', alertCode: 'RLG', active: true, expired: false },
    { alertType: 'R', alertCode: 'RCDR', active: true, expired: false },
    {
      alertType: 'D',
      alertCode: 'DOCGM',
      active: true,
      expired: false,
    },
    { alertType: 'X', alertCode: 'XSC', active: true, expired: false },
    { alertType: 'P', alertCode: 'PC1', active: true, expired: false },
    { alertType: 'X', alertCode: 'HPI', active: true, expired: false },
    { alertType: 'F1', alertCode: 'F1', active: true, expired: false },
    {
      alertType: 'X',
      alertCode: 'XGANG',
      active: true,
      expired: false,
    },
    { alertType: 'X', alertCode: 'XHT', active: true, expired: false },
    { alertType: 'X', alertCode: 'XC', active: true, expired: false },
    { alertType: 'X', alertCode: 'XVL', active: true, expired: false },
    { alertType: 'X', alertCode: 'XA', active: true, expired: false },
  ],
  csra: 'High',
  category: 'A',
  legalStatus: 'REMAND',
  imprisonmentStatus: 'CUR_ORA',
  imprisonmentStatusDescription: 'Committed to Crown Court for Trial',
  mostSeriousOffence: 'Drive vehicle for more than 13 hours or more in a working day - domestic',
  recall: true,
  indeterminateSentence: false,
  sentenceStartDate: '2020-03-02',
  releaseDate: '2076-01-29',
  sentenceExpiryDate: '2132-03-12',
  licenceExpiryDate: '2132-03-12',
  nonDtoReleaseDate: '2076-01-29',
  nonDtoReleaseDateType: 'CRD',
  receptionDate: '2016-05-30',
  paroleEligibilityDate: '2021-12-12',
  postRecallReleaseDate: '2021-12-12',
  conditionalReleaseDate: '2076-01-29',
  locationDescription: 'Moorland (HMP & YOI)',
  restrictedPatient: false,
  currentIncentive: {
    level: { code: 'STD', description: 'Standard' },
    dateTime: '2023-01-30T14:46:01',
    nextReviewDate: '2024-01-30',
  },
  build: 'Proportional',
  facialHair: 'Clean Shaven',
  hairColour: 'Brown',
  heightCentimetres: 188,
  weightKilograms: 86,
  leftEyeColour: 'Blue',
  rightEyeColour: 'Blue',
  shapeOfFace: 'Angular',
  shoeSize: '10',
}
