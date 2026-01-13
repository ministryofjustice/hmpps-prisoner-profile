import { BodyPartSelection } from '../../controllers/interfaces/distinguishingMarks/SelectionTypes'

const selectionsToText: Record<BodyPartSelection, string> = {
  face: 'Face and head',
  torso: 'Front and sides',
  rightArm: 'Right arm',
  rightLeg: 'Right leg',
  rightHand: 'Right hand',
  rightFoot: 'Right foot',
  leftArm: 'Left arm',
  leftLeg: 'Left leg',
  leftHand: 'Left hand',
  leftFoot: 'Left foot',
  back: 'Back',
  neck: 'Neck',
}

export default (selection: BodyPartSelection) => selectionsToText[selection]
