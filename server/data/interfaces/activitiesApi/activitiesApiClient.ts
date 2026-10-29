export interface AttendanceSummary {
  acceptableAbsence: number
  unacceptableAbsence: number
  total: number
}

export interface ActivitiesApiClient {
  getAttendanceSummary(prisonerNumber: string, startDate: string, endDate: string): Promise<AttendanceSummary>
}
