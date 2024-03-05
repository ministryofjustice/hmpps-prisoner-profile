import AddressUsage from './AddressUsage'
import Telephone from './Telephone'

export default interface Address {
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
