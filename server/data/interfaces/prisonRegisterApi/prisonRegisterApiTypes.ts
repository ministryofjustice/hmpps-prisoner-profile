/**
 * Prison Register API types - manually implemented here by copying from the Prison Register API swagger spec:
 * https://prison-register-dev.hmpps.service.justice.gov.uk/v3/api-docs
 */
export interface PrisonDto {
  /**
   * @description Prison ID
   * @example MDI
   */
  prisonId: string
  /**
   * @description Name of the prison
   * @example Moorland HMP
   */
  prisonName: string
  /** @description Whether the prison is still active */
  active: boolean
  /** @description Whether the prison has male prisoners */
  male: boolean
  /** @description Whether the prison has female prisoners */
  female: boolean
  /** @description Whether the prison is contracted */
  contracted: boolean
  /** @description List of types for this prison */
  types: Array<PrisonTypeDto>
  /** @description List of the categories for this prison */
  categories: ('A' | 'B' | 'C' | 'D')[]
  /** @description List of address for this prison */
  addresses: Array<AddressDto>
  /** @description List of operators for this prison */
  operators: Array<PrisonOperatorDto>
}

export interface PrisonTypeDto {
  /**
   * @description Prison type code
   * @example HMP
   * @enum {string}
   */
  code: 'HMP' | 'YOI' | 'IRC' | 'STC' | 'YCS'
  /**
   * @description Prison type description
   * @example Her Majesty’s Prison
   */
  description: string
}

export interface PrisonOperatorDto {
  /**
   * @description Prison operator name
   * @example PSP, G4S
   */
  name: string
}

export interface AddressDto {
  /**
   * Format: int64
   * @description Unique ID of the address
   * @example 10000
   */
  id: number
  /**
   * @description Address line 1
   * @example Bawtry Road
   */
  addressLine1?: string
  /**
   * @description Address line 2
   * @example Hatfield Woodhouse
   */
  addressLine2?: string
  /**
   * @description Village/Town/City
   * @example Doncaster
   */
  town: string
  /**
   * @description County
   * @example South Yorkshire
   */
  county?: string
  /**
   * @description Postcode
   * @example DN7 6BW
   */
  postcode: string
  /**
   * @description Country
   * @example England
   */
  country: string
}
