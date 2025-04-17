/**
 * Curious API types representing the data returned from the `/learnerEducation` API. These have been manually implemented
 * here by copying types from the Curious API swagger spec:
 * https://testservices.sequation.net/sequation-virtual-campus2-api/v3/api-docs
 *
 * The types in the Curious API do not have the most descriptive names. To facilitate future maintenance and syncing with
 * changes in the Curious API swagger spec, the types have been defined here by copying them verbatim with their original
 * names, but have been exported with names that make more sense to their use case.
 */

/**
 * LearnerEducationDTO
 * This is the type name as defined in the Curious API, and represents a single educational course or qualification that
 * a prisoner may undertake whilst in prison.
 */
interface LearnerEducationDTO {
  /** @description NOMIS Offender Number */
  prn?: string
  /** @description NOMIS Establishment ID */
  establishmentId?: string
  /** @description NOMIS Establishment Name */
  establishmentName?: string
  /** @description Course Indicator from LRS */
  a2LevelIndicator?: boolean
  /** @description Course Indicator from LRS */
  accessHEIndicator?: boolean
  /** @description Actual guided learning hours allocated to course */
  actualGLH?: number
  /** @description The AIM sequence number of Course for a learner */
  aimSeqNumber?: number
  /** @description Course Indicator from LRS */
  aLevelIndicator?: boolean
  /** @description Course Indicator from LRS */
  asLevelIndicator?: boolean
  /** @description Actual attended Guided Learning Hours by learner on course */
  attendedGLH?: number
  /** @description Course completion Status(for e.g. continuing, completed, withdrawn, temporarily withdrawn) */
  completionStatus?: string
  /** @description Unique Course Code */
  courseCode?: string
  /** @description Course Name */
  courseName?: string
  /** @description Prison Post code of a location where this course is getting delivered */
  deliveryLocationPostCode?: string
  /** @description Course Delivery Method (e.g. Blended Learning, Classroom Only Learning, Pack Only Learning) */
  deliveryMethodType?: string
  /** @description Employment Outcome gained status associated with the course ( with training , without training) */
  employmentOutcome?: string
  /** @description Course Indicator from LRS */
  functionalSkillsIndicator?: boolean
  /** @description Funding adjustment hours from prior learning */
  fundingAdjustmentForPriorLearning?: number
  /** @description Funding Model for a Course (defaulted to Adult Skills) */
  fundingModel?: string
  /** @description Funding type for a course (e.g. DPS, PEF, The Clink etc.) */
  fundingType?: string
  /** @description Course Indicator from LRS */
  gceIndicator?: boolean
  /** @description Course Indicator from LRS */
  gcsIndicator?: boolean
  /** @description Indicates if the course is accredited */
  isAccredited?: boolean
  /** @description Course Indicator from LRS */
  keySkillsIndicator?: boolean
  /** @description Course Indicator from LRS */
  learnAimRef?: string
  /** @description Learners aim on Course (Programme aim, Component learning aim within programme etc.) */
  learnersAimType?: string
  /**
   * Format: date
   * @description Actual Course end date
   */
  learningActualEndDate?: string
  /**
   * Format: date
   * @description Planned Course end date
   */
  learningPlannedEndDate?: string
  /**
   * Format: date
   * @description Course start date
   */
  learningStartDate?: string
  /** @description Course Indicator from LRS */
  level?: string
  /** @description Number of Guided Learning hours from LRS */
  lrsGLH?: number
  /** @description Course Indicator from LRS */
  miNotionalNVQLevelV2?: string
  /** @description Course Indicator from LRS */
  occupationalIndicator?: boolean
  /** @description Outcome of Course (e.g. Achieved, Partially Achieved etc.) */
  outcome?: string
  /** @description Outcome grade of Course (e.g. Passed, Merit, Failed, Distinction etc.) */
  outcomeGrade?: string
  /** @description Withdrawal reason if the learner withdraws from course (e.g. Moved to another establishment or release ,ill health etc.) */
  prisonWithdrawalReason?: string
  /** @description Course Indicator from LRS */
  qcfCertificateIndicator?: boolean
  /** @description Course Indicator from LRS */
  qcfDiplomaIndicator?: boolean
  /** @description Course Indicator from LRS */
  qcfIndicator?: boolean
  /** @description Indicates if the withdrawal is reviewed */
  reviewed?: boolean
  /** @description Course Indicator from LRS */
  sectorSubjectAreaTier1?: string
  /** @description Course Indicator from LRS */
  sectorSubjectAreaTier2?: string
  /** @description Course Indicator from LRS */
  subcontractedPartnershipUKPRN?: number
  /** @description Course Indicator from LRS */
  unitType?: string
  /** @description Indicates if withdrawal is agreed or not */
  withdrawalReasonAgreed?: boolean
  /** @description Withdrawal reason (defaulted to Other) populated for the courses which are withdrawn */
  withdrawalReasons?: string
}

/**
 * Page
 * This is the type name as defined in the Curious API, and represents a paged collection of LearnerEducationDTO
 */
interface Page {
  content?: LearnerEducationDTO[]
  empty?: boolean
  first?: boolean
  last?: boolean
  /** Format: int32 */
  number?: number
  /** Format: int32 */
  numberOfElements?: number
  pageable?: Pageable
  /** Format: int32 */
  size?: number
  sort?: Sort
  /** Format: int64 */
  totalElements?: number
  /** Format: int32 */
  totalPages?: number
}

/**
 * Sort
 * This is the type name as defined in the Curious API
 */
interface Sort {
  empty?: boolean
  sorted?: boolean
  unsorted?: boolean
}

/**
 * Pageable
 * This is the type name as defined in the Curious API
 */
interface Pageable {
  /** Format: int64 */
  offset?: number
  /** Format: int32 */
  pageNumber?: number
  /** Format: int32 */
  pageSize?: number
  paged?: boolean
  sort?: Sort
  unpaged?: boolean
}

/**
 * `LearnerEductionPagedResponse` is an alias for the Curious API type `Page`
 * `LearnerEductionPagedResponse` is a better name as it more accurately describes the fact that the data is part
 * of a paged response of Learner Education data from the Curious API.
 */
export type LearnerEductionPagedResponse = Page

/**
 * `LearnerEduction` is an alias for the Curious API type `LearnerEducationDTO`
 * `LearnerEduction` represents a single educational course or qualification that a prisoner may undertake whilst in
 * prison.
 */
export type LearnerEducation = LearnerEducationDTO
