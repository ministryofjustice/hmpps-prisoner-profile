import type { AllQualificationsDTO, LearnerEducationDTO, LearnerQualificationsDTO } from 'curiousApiClient'

const anAllQualificationsDTO = (options?: {
  v1CoursesAndQualifications?: Array<LearnerEducationDTO>
  v2CoursesAndQualifications?: Array<LearnerQualificationsDTO>
}): AllQualificationsDTO => ({
  v1:
    options?.v1CoursesAndQualifications === null
      ? null
      : options?.v1CoursesAndQualifications || [aLearnerEducationDTO()],
  v2:
    options?.v2CoursesAndQualifications === null
      ? null
      : options?.v2CoursesAndQualifications || [aLearnerQualificationsDTO()],
})

const aLearnerQualificationsDTO = (options?: {
  prisonNumber?: string
  prisonId?: string
}): LearnerQualificationsDTO => ({
  prn: options?.prisonNumber || 'A1234BC',
  establishmentId: options?.prisonId || 'BXI',
  establishmentName: 'BRIXTON (HMP)',
  qualificationCode: '270828',
  qualificationName: 'CIMA Strategic Level',
  learningStartDate: '2024-06-01',
  learningPlannedEndDate: '2024-06-30',
  learnerOnRemand: 'Yes',
  isAccredited: true,
  aimType: 'Programme aim',
  fundingType: 'YCS',
  deliveryApproach: '',
  deliveryLocationpostcode: 'SW2 5XF',
  completionStatus: 'Continuing',
  learningActualEndDate: null,
  outcome: null,
  outcomeGrade: null,
  outcomeDate: null,
  withdrawalReason: null,
  withdrawalReasonAgreed: null,
  withdrawalReviewed: false,
})

const aLearnerEducationDTO = (options?: { prisonNumber?: string; prisonId?: string }): LearnerEducationDTO => {
  return {
    prn: options?.prisonNumber || 'A1234BC',
    establishmentId: options?.prisonId || 'BXI',
    establishmentName: 'BRIXTON (HMP)',
    courseName: 'Certificate of Management',
    courseCode: '101448',
    isAccredited: true,
    aimSequenceNumber: null,
    learningStartDate: '2023-10-13',
    learningPlannedEndDate: '2023-12-29',
    learningActualEndDate: '2024-01-24',
    learnersAimType: 'Component learning aim within a programme',
    miNotionalNVQLevelV2: 'Level 4',
    sectorSubjectAreaTier1: 'Business, Administration and Law',
    sectorSubjectAreaTier2: 'Business Management',
    occupationalIndicator: false,
    accessHEIndicator: false,
    keySkillsIndicator: false,
    functionalSkillsIndicator: false,
    gceIndicator: false,
    gcsIndicator: false,
    asLevelIndicator: false,
    a2LevelIndicator: false,
    qcfIndicator: false,
    qcfDiplomaIndicator: false,
    qcfCertificateIndicator: false,
    lrsGLH: 0,
    attendedGLH: null,
    actualGLH: 7567,
    outcome: 'Achieved',
    outcomeGrade: null,
    employmentOutcome: null,
    withdrawalReasons: null,
    prisonWithdrawalReason: null,
    completionStatus: 'Completed',
    withdrawalReasonAgreed: false,
    fundingModel: 'Adult skills',
    fundingAdjustmentPriorLearning: null,
    subcontractedPartnershipUKPRN: null,
    deliveryLocationPostCode: 'SW2 5XF',
    unitType: 'QUALIFICATION',
    fundingType: 'Family Learning',
    deliveryMethodType: null,
    alevelIndicator: false,
  }
}

export { anAllQualificationsDTO, aLearnerQualificationsDTO, aLearnerEducationDTO }
