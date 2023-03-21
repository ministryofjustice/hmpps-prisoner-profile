export interface Location {
  agencyId: string
  currentOccupancy?: number
  description: string
  internalLocationCode?: string
  locationId: number
  locationPrefix?: string
  locationType: string
  locationUsage?: string
  operationalCapacity?: number
  parentLocationId?: number
  userDescription?: string
}
