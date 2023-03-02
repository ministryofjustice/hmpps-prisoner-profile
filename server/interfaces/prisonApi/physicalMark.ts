export interface PhysicalMark {
  type: string
  side: string
  bodyPart: string
  orientation?: string // This is what's expected to be returned
  orentiation?: string // This is actually returned
  comment: string
  imageId?: number
}
