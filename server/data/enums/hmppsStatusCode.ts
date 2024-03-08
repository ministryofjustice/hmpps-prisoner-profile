// eslint-disable-next-line no-shadow
export enum HmppsStatusCode {
  NOT_FOUND, // Generic 404 not found - default - will log Error in errorHandler
  NOT_IN_CASELOAD,
  RESTRICTED_PATIENT,
  PRISONER_IS_RELEASED,
  PRISONER_IS_TRANSFERRING,
}
