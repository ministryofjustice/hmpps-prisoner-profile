import getDistinguishingMarkDetailsFormConfig from './getDistinguishingMarkDetailsFormConfig'

const faceConfig = {
  tab: 'Face tattoos',
  title: 'Add face and head tattoo details',
  specificParts: [
    { name: 'face', desc: 'Face' },
    { name: 'ear', desc: 'Ears' },
    { name: 'nose', desc: 'Nose' },
    { name: 'lip', desc: 'Lips' },
    { name: 'head', desc: 'Head' },
  ],
}

const backConfig = {
  tab: 'Back tattoos',
  title: 'Add back tattoo details',
  specificParts: [{ name: 'back', desc: '' }],
}

const neckConfig = {
  tab: 'Neck tattoos',
  title: 'Add neck tattoo details',
  specificParts: [{ name: 'neck', desc: '' }],
}

const rightArmConfig = {
  tab: 'Right arm tattoos',
  title: 'Add right arm tattoo details',
  specificParts: [
    {
      name: 'rightArm',
      desc: 'Arm (general)',
      hint: 'The tattoo spans more than one area, or the location is unknown.',
    },
    { name: 'rightShoulder', desc: 'Shoulder' },
    { name: 'upperRightArm', desc: 'Upper arm' },
    { name: 'rightElbow', desc: 'Elbow' },
    { name: 'lowerRightArm', desc: 'Lower Arm' },
  ],
}

const leftArmConfig = {
  tab: 'Left arm tattoos',
  title: 'Add left arm tattoo details',
  specificParts: [
    {
      name: 'leftArm',
      desc: 'Arm (general)',
      hint: 'The tattoo spans more than one area, or the location is unknown.',
    },
    { name: 'leftShoulder', desc: 'Shoulder' },
    { name: 'upperLeftArm', desc: 'Upper arm' },
    { name: 'leftElbow', desc: 'Elbow' },
    { name: 'lowerLeftArm', desc: 'Lower arm' },
  ],
}

const rightFootConfig = {
  tab: 'Right foot tattoos',
  title: 'Add right foot tattoo details',
  specificParts: [
    { name: 'rightFoot', desc: 'Foot' },
    { name: 'rightAnkle', desc: 'Ankle' },
    { name: 'rightToe', desc: 'Toes' },
  ],
}

const leftFootConfig = {
  tab: 'Left foot tattoos',
  title: 'Add left foot tattoo details',
  specificParts: [
    { name: 'leftFoot', desc: 'Foot' },
    { name: 'leftAnkle', desc: 'Ankle' },
    { name: 'leftToe', desc: 'Toes' },
  ],
}

const leftHandConfig = {
  tab: 'Left hand tattoos',
  title: 'Add left hand tattoo details',
  specificParts: [
    { name: 'leftHand', desc: 'Hand' },
    { name: 'leftFinger', desc: 'Fingers' },
  ],
}

const rightHandConfig = {
  tab: 'Right hand tattoos',
  title: 'Add right hand tattoo details',
  specificParts: [
    { name: 'rightHand', desc: 'Hand' },
    { name: 'rightFinger', desc: 'Fingers' },
  ],
}

const leftLegDetailsConfig = {
  tab: 'Left leg tattoos',
  title: 'Add left leg tattoo details',
  specificParts: [
    {
      name: 'leftLeg',
      desc: 'Leg (general)',
      hint: 'The tattoo spans more than one area, or the exact location is unknown.',
    },
    { name: 'leftThigh', desc: 'Thigh' },
    { name: 'leftKnee', desc: 'Knee' },
    { name: 'lowerLeftLeg', desc: 'Lower leg' },
  ],
}

const rightLegDetailsConfig = {
  tab: 'Right leg tattoos',
  title: 'Add right leg tattoo details',
  specificParts: [
    {
      name: 'rightLeg',
      desc: 'Leg (general)',
      hint: 'The tattoo spans more than one area, or the exact location is unknown.',
    },
    { name: 'rightThigh', desc: 'Thigh' },
    { name: 'rightKnee', desc: 'Knee' },
    { name: 'lowerRightLeg', desc: 'Lower leg' },
  ],
}

const torsoDetailsConfig = {
  tab: 'Front and side tattoos',
  title: 'Add front and side tattoo details',
  specificParts: [
    { name: 'frontTorso', desc: 'Front', hint: 'The abdomen, chest or pelvis.' },
    { name: 'rightTorso', desc: 'Right side', hint: 'The left side of the abdomen, chest or pelvis.' },
    { name: 'leftTorso', desc: 'Left side', hint: 'The right side of the abdomen, chest or pelvis.' },
  ],
}
describe('getDistinguishingMarkDetailsFormConfig', () => {
  test.each`
    bodyPart       | config
    ${'back'}      | ${backConfig}
    ${'face'}      | ${faceConfig}
    ${'neck'}      | ${neckConfig}
    ${'rightArm'}  | ${rightArmConfig}
    ${'leftArm'}   | ${leftArmConfig}
    ${'rightFoot'} | ${rightFootConfig}
    ${'leftFoot'}  | ${leftFootConfig}
    ${'leftHand'}  | ${leftHandConfig}
    ${'rightHand'} | ${rightHandConfig}
    ${'leftLeg'}   | ${leftLegDetailsConfig}
    ${'rightLeg'}  | ${rightLegDetailsConfig}
    ${'torso'}     | ${torsoDetailsConfig}
  `('should return $config for $bodyPart', ({ bodyPart, config }) => {
    const accessCode = getDistinguishingMarkDetailsFormConfig(bodyPart, 'tattoo')

    expect(accessCode).toEqual(config)
  })
})
