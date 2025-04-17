export default interface CourtEvent {
  eventId: number
  startTime: string
  courtLocation: string
  courtEventType: string
  comments?: string
  caseReference?: string
}
