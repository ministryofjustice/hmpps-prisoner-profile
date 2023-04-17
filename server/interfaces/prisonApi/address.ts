import { AddressUsage } from './addressUsage'
import { Telephone } from './telephone'

export interface Address {
  addressId?: number
  addressType?: string
  flat?: string
  premise?: string
  street?: string
  locality?: string
  town?: string
  postalCode?: string
  county?: string
  country?: string
  comment?: string
  primary: boolean
  noFixedAddress: boolean
  startDate?: string
  endDate?: string
  phones?: Telephone[]
  addressUsages?: AddressUsage[]
}
