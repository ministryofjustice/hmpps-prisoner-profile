export enum CsipStatus {
  referralPending = 'REFERRAL_PENDING',
  referralSubmitted = 'REFERRAL_SUBMITTED',
  investigationPending = 'INVESTIGATION_PENDING',
  awaitingDecision = 'AWAITING_DECISION',
  planPending = 'PLAN_PENDING',
  noFurtherAction = 'NO_FURTHER_ACTION',
  supportOutsideCsip = 'SUPPORT_OUTSIDE_CSIP',
  acctSupport = 'ACCT_SUPPORT',
  csipOpen = 'CSIP_OPEN',
  csipClosed = 'CSIP_CLOSED',
}

export default { CsipStatus }
