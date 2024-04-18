export default interface OverviewSchedule {
  morning: OverviewScheduleItem[]
  afternoon: OverviewScheduleItem[]
  evening: OverviewScheduleItem[]
}

export interface OverviewScheduleItem {
  name: string
  startTime?: string
  endTime?: string
}
