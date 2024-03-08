export default interface LearnerEducation {
  content: [
    {
      prn: string
      establishmentId: string
      establishmentName: string
      a2LevelIndicator: boolean
      accessHEIndicator: boolean
      actualGLH: number
      aimSeqNumber: number
      aLevelIndicator: boolean
      asLevelIndicator: boolean
      attendedGLH: number
      completionStatus: string
      courseCode: string
      courseName: string
      deliveryLocationPostCode: string
      deliveryMethodType: string
      employmentOutcome: string
      functionalSkillsIndicator: boolean
      fundingAdjustmentForPriorLearning: number
      fundingModel: string
      fundingType: string
      gceIndicator: boolean
      gcsIndicator: boolean
      isAccredited: boolean
      keySkillsIndicator: boolean
      learnAimRef: string
      learnersAimType: string
      learningActualEndDate: string
      learningPlannedEndDate: string
      learningStartDate: string
      level: string
      lrsGLH: number
      occupationalIndicator: boolean
      outcome: string
      outcomeGrade: string
      prisonWithdrawalReason: string
      qcfCertificateIndicator: boolean
      qcfDiplomaIndicator: boolean
      qcfIndicator: boolean
      reviewed: boolean
      sectorSubjectAreaTier2: string
      subcontractedPartnershipUKPRN: number
      unitType: string
      withdrawalReasonAgreed: boolean
      withdrawalReasons: string
    },
  ]
  empty: boolean
  first: boolean
  last: boolean
  number: number
  numberOfElements: number
  pageable: {
    offset: number
    pageNumber: number
    pageSize: number
    paged: boolean
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    unpaged: boolean
  }
  size: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  totalElements: number
  totalPages: number
}
