import {
  AllBodyPartSelection,
  BodyPartSelection,
  MarkTypeSelection,
} from '../../controllers/interfaces/distinguishingMarks/selectionTypes'

type BodyPartConfig = {
  tab: string
  title: string
  specificParts: { name: AllBodyPartSelection; desc: string; hint?: string }[]
}

const bodyPartConfig: Record<BodyPartSelection, BodyPartConfig> = {
  back: {
    tab: 'Back %s',
    title: 'Add back %s details',
    specificParts: [{ name: 'back', desc: '' }],
  },
  face: {
    tab: 'Face %s',
    title: 'Add face and head %s details',
    specificParts: [
      { name: 'face', desc: 'Face' },
      { name: 'ear', desc: 'Ears' },
      { name: 'nose', desc: 'Nose' },
      { name: 'lip', desc: 'Lips' },
      { name: 'head', desc: 'Head' },
    ],
  },
  neck: { tab: 'Neck %s', title: 'Add neck %s details', specificParts: [{ name: 'neck', desc: '' }] },
  rightArm: {
    tab: 'Right arm %s',
    title: 'Add right arm %s details',
    specificParts: [
      { name: 'rightArm', desc: 'Arm (general)', hint: 'The %s spans more than one area, or the location is unknown.' },
      { name: 'rightShoulder', desc: 'Shoulder' },
      { name: 'upperRightArm', desc: 'Upper arm' },
      { name: 'rightElbow', desc: 'Elbow' },
      { name: 'lowerRightArm', desc: 'Lower Arm' },
    ],
  },
  leftArm: {
    tab: 'Left arm %s',
    title: 'Add left arm %s details',
    specificParts: [
      { name: 'leftArm', desc: 'Arm (general)', hint: 'The %s spans more than one area, or the location is unknown.' },
      { name: 'leftShoulder', desc: 'Shoulder' },
      { name: 'upperLeftArm', desc: 'Upper arm' },
      { name: 'leftElbow', desc: 'Elbow' },
      { name: 'lowerLeftArm', desc: 'Lower arm' },
    ],
  },
  rightFoot: {
    tab: 'Right foot %s',
    title: 'Add right foot %s details',
    specificParts: [
      { name: 'rightFoot', desc: 'Foot' },
      { name: 'rightAnkle', desc: 'Ankle' },
      { name: 'rightToe', desc: 'Toes' },
    ],
  },
  leftFoot: {
    tab: 'Left foot %s',
    title: 'Add left foot %s details',
    specificParts: [
      { name: 'leftFoot', desc: 'Foot' },
      { name: 'leftAnkle', desc: 'Ankle' },
      { name: 'leftToe', desc: 'Toes' },
    ],
  },
  leftHand: {
    tab: 'Left hand %s',
    title: 'Add left hand %s details',
    specificParts: [
      { name: 'leftHand', desc: 'Hand' },
      { name: 'leftFinger', desc: 'Fingers' },
    ],
  },
  rightHand: {
    tab: 'Right hand %s',
    title: 'Add right hand %s details',
    specificParts: [
      { name: 'rightHand', desc: 'Hand' },
      { name: 'rightFinger', desc: 'Fingers' },
    ],
  },
  leftLeg: {
    tab: 'Left leg %s',
    title: 'Add left leg %s details',
    specificParts: [
      {
        name: 'leftLeg',
        desc: 'Leg (general)',
        hint: 'The %s spans more than one area, or the exact location is unknown.',
      },
      { name: 'leftThigh', desc: 'Thigh' },
      { name: 'leftKnee', desc: 'Knee' },
      { name: 'lowerLeftLeg', desc: 'Lower leg' },
    ],
  },
  rightLeg: {
    tab: 'Right leg %s',
    title: 'Add right leg %s details',
    specificParts: [
      {
        name: 'rightLeg',
        desc: 'Leg (general)',
        hint: 'The %s spans more than one area, or the exact location is unknown.',
      },
      { name: 'rightThigh', desc: 'Thigh' },
      { name: 'rightKnee', desc: 'Knee' },
      { name: 'lowerRightLeg', desc: 'Lower leg' },
    ],
  },
  torso: {
    tab: 'Front and side %s',
    title: 'Add front and side %s details',
    specificParts: [
      { name: 'frontTorso', desc: 'Front', hint: 'The abdomen, chest or pelvis.' },
      { name: 'rightTorso', desc: 'Right side', hint: 'The left side of the abdomen, chest or pelvis.' },
      { name: 'leftTorso', desc: 'Left side', hint: 'The right side of the abdomen, chest or pelvis.' },
    ],
  },
}

export default (bodyPartSelection: BodyPartSelection, markType: MarkTypeSelection): BodyPartConfig => {
  const conf = bodyPartConfig[bodyPartSelection]
  return {
    tab: `${conf.tab?.replace('%s', markType)}s`,
    title: conf.title.replace('%s', markType),
    specificParts: conf.specificParts.map(part => ({
      ...part,
      hint: part.hint?.replace('%s', markType),
    })),
  }
}
