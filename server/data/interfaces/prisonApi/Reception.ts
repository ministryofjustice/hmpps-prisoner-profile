export default interface Reception {
  id: number
  description: string
  userDescription: string
  capacity: number
  noOfOccupants: number
  attributes: ReceptionAttribute[]
}

export interface ReceptionAttribute {
  code: string
  description: string
}
