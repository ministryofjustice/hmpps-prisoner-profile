export interface AlertsMetadata {
  activeCount: number
  inactiveCount: number
  types: AlertTypeFilter[]
}

export interface AlertTypeFilter {
  code: string
  description: string
  count: number
}
