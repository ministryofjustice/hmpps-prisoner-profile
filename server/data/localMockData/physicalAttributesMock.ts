import { CorePersonPhysicalAttributesDto } from '../interfaces/personIntegrationApi/personIntegrationApiClient'
import { CorePersonPhysicalAttributes } from '../../services/interfaces/corePerson/corePersonPhysicalAttributes'

export const corePersonPhysicalAttributesDtoMock: CorePersonPhysicalAttributesDto = {
  height: 100,
  weight: 100,
  hair: {
    id: 'HAIR_BROWN',
    code: 'BROWN',
    description: 'Brown',
  },
  facialHair: {
    id: 'FACIAL_HAIR_BEARDED',
    code: 'BEARDED',
    description: 'Full beard',
  },
  face: {
    id: 'FACE_OVAL',
    code: 'OVAL',
    description: 'Oval',
  },
  build: {
    id: 'BUILD_AVERAGE',
    code: 'AVERAGE',
    description: 'Average',
  },
  leftEyeColour: {
    id: 'EYE_BLUE',
    code: 'BLUE',
    description: 'Blue',
  },
  rightEyeColour: {
    id: 'EYE_BLUE',
    code: 'BLUE',
    description: 'Blue',
  },
  shoeSize: '11',
}

export const corePersonPhysicalAttributesMock: CorePersonPhysicalAttributes = {
  height: 100,
  weight: 100,
  hairCode: 'BROWN',
  hairDescription: 'Brown',
  facialHairCode: 'BEARDED',
  facialHairDescription: 'Full beard',
  faceCode: 'OVAL',
  faceDescription: 'Oval',
  buildCode: 'AVERAGE',
  buildDescription: 'Average',
  leftEyeColourCode: 'BLUE',
  leftEyeColourDescription: 'Blue',
  rightEyeColourCode: 'BLUE',
  rightEyeColourDescription: 'Blue',
  shoeSize: '11',
}
