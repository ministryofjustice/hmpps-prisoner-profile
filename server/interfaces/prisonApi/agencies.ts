export interface AgencyDetails {
  agencyId: string
  description: string
  longDescription: string
  agencyType: string
  active: boolean
  courtType: string
  deactivationDate: string
  addresses: AgenciesAddress[]
  phones: AgenciesPhone[]
  emails: AgenciesEmail[]
}

export interface AgenciesAddress {
  addressId: number
  addressType: string
  flat: string
  premise: string
  street: string
  locality: string
  town: string
  postalCode: string
  county: string
  country: string
  comment: string
  primary: boolean
  noFixedAddress: boolean
  startDate: string
  endDate: string
  phones: AgenciesPhone[]
  addressUsages: AgenciesAddressUsage[]
}

export interface AgenciesPhone {
  phoneId: number
  number: string
  type: string
  ext: string
}

export interface AgenciesAddressUsage {
  phoneId?: number
  number?: string
  type?: string
  ext?: string
  addressId: number
  addressUsage: string
  addressUsageDescription: string
  activeFlag: boolean
}

export interface AgenciesEmail {
  email: string
}
