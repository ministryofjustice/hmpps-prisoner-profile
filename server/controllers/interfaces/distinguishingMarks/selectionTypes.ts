/** initial body parts that can be selected on the body map */
export const bodyPartSelections = [
  'back',
  'face',
  'leftArm',
  'leftFoot',
  'leftHand',
  'leftLeg',
  'neck',
  'rightArm',
  'rightFoot',
  'rightHand',
  'rightLeg',
  'torso',
] as const
export type BodyPartSelection = (typeof bodyPartSelections)[number]

/** specific body parts that can be selected on the distinguishing mark detail pages */
const detailedBodyParts = [
  'ear',
  'head',
  'frontTorso',
  'leftAnkle',
  'leftElbow',
  'leftFinger',
  'leftKnee',
  'leftShoulder',
  'leftThigh',
  'leftToe',
  'leftTorso',
  'lip',
  'lowerBack',
  'lowerLeftArm',
  'lowerLeftLeg',
  'lowerRightArm',
  'lowerRightLeg',
  'nose',
  'rightAnkle',
  'rightElbow',
  'rightFinger',
  'rightKnee',
  'rightShoulder',
  'rightThigh',
  'rightToe',
  'rightTorso',
  'upperBack',
  'upperLeftArm',
  'upperRightArm',
] as const

/** body parts’ values selectable with `bodyParts` component */
export const validBodyParts = [
  'face',
  'neck',
  'front-and-sides',
  'right-arm',
  'right-hand',
  'left-arm',
  'left-hand',
  'right-leg',
  'right-foot',
  'left-leg',
  'left-foot',
  'back',
] as const
export type ValidBodyPart = (typeof validBodyParts)[number]

/** body parts’ labels selectable with `bodyParts` component */
export const bodyPartLabels: Record<ValidBodyPart, string> = {
  face: 'Face and head',
  neck: 'Neck',
  'front-and-sides': 'Front and sides',
  'right-arm': 'Right arm',
  'right-hand': 'Right hand',
  'left-arm': 'Left arm',
  'left-hand': 'Left hand',
  'right-leg': 'Right leg',
  'right-foot': 'Right foot',
  'left-leg': 'Left leg',
  'left-foot': 'Left foot',
  back: 'Back',
}

/** mapping of body part selectable with `bodyParts` component to initial body parts */
export const bodyPartMap: Record<ValidBodyPart, BodyPartSelection> = {
  face: 'face',
  'front-and-sides': 'torso',
  'right-arm': 'rightArm',
  'right-leg': 'rightLeg',
  'right-hand': 'rightHand',
  'right-foot': 'rightFoot',
  'left-arm': 'leftArm',
  'left-leg': 'leftLeg',
  'left-hand': 'leftHand',
  'left-foot': 'leftFoot',
  back: 'back',
  neck: 'neck',
}

export const allBodyParts = [...bodyPartSelections, ...detailedBodyParts] as const
export type AllBodyPartSelection = (typeof allBodyParts)[number]

export const markTypeSelections = ['tattoo', 'scar', 'mark'] as const
export type MarkTypeSelection = (typeof markTypeSelections)[number]
