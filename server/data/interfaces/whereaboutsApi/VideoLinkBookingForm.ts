export default interface VideoLinkBookingForm {
  bookingId: number
  court: string
  courtId: string
  comment?: string
  madeByTheCourt: false
  pre?: {
    locationId: number
    startTime: string
    endTime: string
  }
  main: {
    locationId: number
    startTime: string
    endTime: string
  }
  post?: {
    locationId: number
    startTime: string
    endTime: string
  }
}
