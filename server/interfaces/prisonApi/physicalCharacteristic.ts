export interface PhysicalCharacteristic {
  type: string
  characteristic: string
  detail: string
  imageId?: number
}

// eslint-disable-next-line no-shadow
export enum PhysicalCharacteristicType {
  Hair = 'HAIR',
  RightEyeColour = 'R_EYE_C',
  LeftEyeColour = 'L_EYE_C',
  FacialHair = 'FACIAL_HAIR',
  Face = 'FACE',
  Build = 'BUILD',
  ShoeSize = 'SHOESIZE',
}
