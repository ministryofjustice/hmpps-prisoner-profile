export const bodyPartSelections = [
  'face',
  'head',
  'torso',
  'rightArm',
  'rightLeg',
  'rightHand',
  'rightFoot',
  'leftArm',
  'leftLeg',
  'leftFoot',
  'leftHand',
  'back',
  'neck',
] as const
export type BodyPartSelection = (typeof bodyPartSelections)[number]

export const markTypeSelections = ['tattoo', 'scar', 'mark'] as const
export type MarkTypeSelection = (typeof markTypeSelections)[number]
