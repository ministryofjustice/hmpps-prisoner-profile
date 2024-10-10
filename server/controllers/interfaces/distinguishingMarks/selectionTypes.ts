// initial body parts that can be selected on the body map
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

// specific body parts that can be selected on the distinguishing mark detail pages
const detailedBodyParts = [
  'ear',
  'head',
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

export const allBodyParts = [...bodyPartSelections, ...detailedBodyParts] as const
export type AllBodyPartSelection = (typeof allBodyParts)[number]

export const markTypeSelections = ['tattoo', 'scar', 'mark'] as const
export type MarkTypeSelection = (typeof markTypeSelections)[number]
