type ImageOrientation =
  | 'NECK'
  | 'KNEE'
  | 'TORSO'
  | 'FACE'
  | 'DAMAGE'
  | 'INJURY'
  | 'HAND'
  | 'HEAD'
  | 'THIGH'
  | 'ELBOW'
  | 'FOOT'
  | 'INCIDENT'
  | 'ARM'
  | 'SHOULDER'
  | 'ANKLE'
  | 'FINGER'
  | 'EAR'
  | 'TOE'
  | 'FIGHT'
  | 'FRONT'
  | 'LEG'
  | 'LIP'
  | 'NOSE'

type ImageView = 'OIC' | 'FACE' | 'TAT' | 'MARK' | 'SCAR' | 'OTH'

type ImageType = 'OFF_IDM' | 'OFF_BKG' | 'OIC'

export default interface ImageDetails {
  imageId: number
  active: boolean
  captureDate: string
  captureDateTime: string
  imageView: ImageView
  imageOrientation: ImageOrientation
  imageType: ImageType
  objectId?: number
}
