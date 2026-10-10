export default interface Telephone {
  phoneId?: number
  number: string
  type: string
  ext?: string
  createDatetime?: string
  modifyDatetime?: string
}

export interface AddressPhoneNumberCreateRequest {
  phoneNumber: string
  phoneNumberType: string
  extension?: string
}
