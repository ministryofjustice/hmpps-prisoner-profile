import { PrisonPersonDistinguishingMark } from '../../data/interfaces/prisonPersonApi/prisonPersonApiClient'

type DistinguishingMarkDecorated = PrisonPersonDistinguishingMark & { location: string }
type MarkCategory = 'tattoos' | 'scars' | 'others'
type BodyPart =
  | 'Left arm'
  | 'Right arm'
  | 'Arm'
  | 'Face and head'
  | 'Right foot'
  | 'Left foot'
  | 'Foot'
  | 'Right hand'
  | 'Left hand'
  | 'Hand'
  | 'Right leg'
  | 'Left leg'
  | 'Leg'
  | 'Front and sides'
  | 'Back'
  | 'Uncategorised'

type CategorisedMarks = Record<MarkCategory, Partial<Record<BodyPart, DistinguishingMarkDecorated[]>>>
export type CategorisedMarksForView = CategorisedMarks & {
  highlights: {
    asset: string
    class: string
    name: string
  }[]
}

interface BodyPartConfig {
  name: BodyPart
  markIsForBodyPart: (mark: PrisonPersonDistinguishingMark) => boolean
  getHighlightConfig: (mark: PrisonPersonDistinguishingMark) => {
    asset: string
    class: string
    name: string
  } | null
  getLocationDescription: (mark: PrisonPersonDistinguishingMark) => string
}

const bodyPartsConfig: Record<string, BodyPartConfig> = {
  leftArm: {
    name: 'Left arm',
    markIsForBodyPart: (mark: PrisonPersonDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_ARM' ||
        mark.bodyPart.id === 'BODY_PART_SHOULDER' ||
        mark.bodyPart.id === 'BODY_PART_ELBOW') &&
      mark.side?.id === 'SIDE_L',
    getHighlightConfig: (_mark: PrisonPersonDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/left-arm-overlay.svg',
      class: 'dm-overlay-left-arm',
      name: 'left arm',
    }),
    getLocationDescription: (mark: PrisonPersonDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_ELBOW') return 'Elbow'
      if (mark.bodyPart.id === 'BODY_PART_SHOULDER') return 'Shoulder'
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower arm'
      if (mark.partOrientation?.id === 'PART_ORIENT_UPP') return 'Upper arm'
      return 'Arm - no specific location'
    },
  },
  rightArm: {
    name: 'Right arm',
    markIsForBodyPart: (mark: PrisonPersonDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_ARM' ||
        mark.bodyPart.id === 'BODY_PART_SHOULDER' ||
        mark.bodyPart.id === 'BODY_PART_ELBOW') &&
      mark.side?.id === 'SIDE_R',
    getHighlightConfig: (_mark: PrisonPersonDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/right-arm-overlay.svg',
      class: 'dm-overlay-right-arm',
      name: 'right arm',
    }),
    getLocationDescription: (mark: PrisonPersonDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_ELBOW') return 'Elbow'
      if (mark.bodyPart.id === 'BODY_PART_SHOULDER') return 'Shoulder'
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower arm'
      if (mark.partOrientation?.id === 'PART_ORIENT_UPP') return 'Upper arm'
      return 'Arm - no specific location'
    },
  },
  arm: {
    name: 'Arm',
    markIsForBodyPart: (mark: PrisonPersonDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_ARM' ||
        mark.bodyPart.id === 'BODY_PART_SHOULDER' ||
        mark.bodyPart.id === 'BODY_PART_ELBOW') &&
      mark.side?.id !== 'SIDE_R' &&
      mark.side?.id !== 'SIDE_L',
    getHighlightConfig: (_mark: PrisonPersonDistinguishingMark) => null,
    getLocationDescription: (mark: PrisonPersonDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_ELBOW') return 'Elbow'
      if (mark.bodyPart.id === 'BODY_PART_SHOULDER') return 'Shoulder'
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower arm'
      if (mark.partOrientation?.id === 'PART_ORIENT_UPP') return 'Upper arm'
      return 'Arm - no specific location'
    },
  },
  faceAndHead: {
    name: 'Face and head',
    markIsForBodyPart: (mark: PrisonPersonDistinguishingMark) =>
      mark.bodyPart.id === 'BODY_PART_FACE' ||
      mark.bodyPart.id === 'BODY_PART_HEAD' ||
      mark.bodyPart.id === 'BODY_PART_EAR' ||
      mark.bodyPart.id === 'BODY_PART_LIP' ||
      mark.bodyPart.id === 'BODY_PART_NECK',
    getHighlightConfig: (mark: PrisonPersonDistinguishingMark) =>
      mark.bodyPart.id === 'BODY_PART_HEAD'
        ? {
            asset: '/assets/images/distinguishingMarks/back-head-overlay.svg',
            class: 'dm-overlay-back-head',
            name: 'back of the head',
          }
        : {
            asset: '/assets/images/distinguishingMarks/face-overlay.svg',
            class: 'dm-overlay-face',
            name: 'face',
          },
    getLocationDescription: (mark: PrisonPersonDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_FACE') return 'Face'
      if (mark.bodyPart.id === 'BODY_PART_NECK') return 'Neck'
      if (mark.bodyPart.id === 'BODY_PART_EAR') return 'Ear'
      if (mark.bodyPart.id === 'BODY_PART_LIP') return 'Lip'
      return 'Head'
    },
  },
  rightFoot: {
    name: 'Right foot',
    markIsForBodyPart: (mark: PrisonPersonDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_FOOT' ||
        mark.bodyPart.id === 'BODY_PART_TOE' ||
        mark.bodyPart.id === 'BODY_PART_ANKLE') &&
      mark.side?.id === 'SIDE_R',
    getHighlightConfig: (_mark: PrisonPersonDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/right-foot-overlay.svg',
      class: 'dm-overlay-right-foot',
      name: 'right foot',
    }),
    getLocationDescription: (mark: PrisonPersonDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_TOE') return 'Toe on right foot'
      if (mark.bodyPart.id === 'BODY_PART_ANKLE') return 'Right ankle'
      return 'Right foot'
    },
  },
  leftFoot: {
    name: 'Left foot',
    markIsForBodyPart: (mark: PrisonPersonDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_FOOT' ||
        mark.bodyPart.id === 'BODY_PART_TOE' ||
        mark.bodyPart.id === 'BODY_PART_ANKLE') &&
      mark.side?.id === 'SIDE_L',
    getHighlightConfig: (_mark: PrisonPersonDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/left-foot-overlay.svg',
      class: 'dm-overlay-left-foot',
      name: 'left foot',
    }),
    getLocationDescription: (mark: PrisonPersonDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_TOE') return 'Toe on left foot'
      if (mark.bodyPart.id === 'BODY_PART_ANKLE') return 'Left ankle'
      return 'Left foot'
    },
  },
  foot: {
    name: 'Foot',
    markIsForBodyPart: (mark: PrisonPersonDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_FOOT' ||
        mark.bodyPart.id === 'BODY_PART_TOE' ||
        mark.bodyPart.id === 'BODY_PART_ANKLE') &&
      mark.side?.id !== 'SIDE_R' &&
      mark.side?.id !== 'SIDE_L',
    getHighlightConfig: (_mark: PrisonPersonDistinguishingMark) => null,
    getLocationDescription: (mark: PrisonPersonDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_TOE') return 'Toe'
      if (mark.bodyPart.id === 'BODY_PART_ANKLE') return 'Ankle'
      return 'Foot'
    },
  },
  rightHand: {
    name: 'Right hand',
    markIsForBodyPart: (mark: PrisonPersonDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_HAND' || mark.bodyPart.id === 'BODY_PART_FINGER') && mark.side?.id === 'SIDE_R',
    getHighlightConfig: (_mark: PrisonPersonDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/right-hand-overlay.svg',
      class: 'dm-overlay-right-hand',
      name: 'right hand',
    }),
    getLocationDescription: (mark: PrisonPersonDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_FINGER') return 'Finger on right hand'
      return 'Right hand'
    },
  },
  leftHand: {
    name: 'Left hand',
    markIsForBodyPart: (mark: PrisonPersonDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_HAND' || mark.bodyPart.id === 'BODY_PART_FINGER') && mark.side?.id === 'SIDE_L',
    getHighlightConfig: (_mark: PrisonPersonDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/left-hand-overlay.svg',
      class: 'dm-overlay-left-hand',
      name: 'left hand',
    }),
    getLocationDescription: (mark: PrisonPersonDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_FINGER') return 'Finger on left hand'
      return 'Left hand'
    },
  },
  hand: {
    name: 'Hand',
    markIsForBodyPart: (mark: PrisonPersonDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_HAND' || mark.bodyPart.id === 'BODY_PART_FINGER') &&
      mark.side?.id !== 'SIDE_L' &&
      mark.side?.id !== 'SIDE_R',
    getHighlightConfig: (_mark: PrisonPersonDistinguishingMark) => null,
    getLocationDescription: (mark: PrisonPersonDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_FINGER') return 'Finger'
      return 'Hand - no specific location'
    },
  },
  rightLeg: {
    name: 'Right leg',
    markIsForBodyPart: (mark: PrisonPersonDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_LEG' ||
        mark.bodyPart.id === 'BODY_PART_THIGH' ||
        mark.bodyPart.id === 'BODY_PART_KNEE') &&
      mark.side?.id === 'SIDE_R',
    getHighlightConfig: (_mark: PrisonPersonDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/right-leg-overlay.svg',
      class: 'dm-overlay-right-leg',
      name: 'right leg',
    }),
    getLocationDescription: (mark: PrisonPersonDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_THIGH') return 'Right thigh'
      if (mark.bodyPart.id === 'BODY_PART_KNEE') return 'Right knee'
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower right leg'
      return 'Right leg'
    },
  },
  leftLeg: {
    name: 'Left leg',
    markIsForBodyPart: (mark: PrisonPersonDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_LEG' ||
        mark.bodyPart.id === 'BODY_PART_THIGH' ||
        mark.bodyPart.id === 'BODY_PART_KNEE') &&
      mark.side?.id === 'SIDE_L',
    getHighlightConfig: (_mark: PrisonPersonDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/left-leg-overlay.svg',
      class: 'dm-overlay-left-leg',
      name: 'left leg',
    }),
    getLocationDescription: (mark: PrisonPersonDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_THIGH') return 'Left thigh'
      if (mark.bodyPart.id === 'BODY_PART_KNEE') return 'Left knee'
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower left leg'
      return 'Left leg'
    },
  },
  leg: {
    name: 'Leg',
    markIsForBodyPart: (mark: PrisonPersonDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_LEG' ||
        mark.bodyPart.id === 'BODY_PART_THIGH' ||
        mark.bodyPart.id === 'BODY_PART_KNEE') &&
      mark.side?.id !== 'SIDE_L' &&
      mark.side?.id !== 'SIDE_R',
    getHighlightConfig: (_mark: PrisonPersonDistinguishingMark) => null,
    getLocationDescription: (mark: PrisonPersonDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_THIGH') return 'Thigh'
      if (mark.bodyPart.id === 'BODY_PART_KNEE') return 'Knee'
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower leg'
      return 'Leg - no specific location'
    },
  },
  frontAndSides: {
    name: 'Front and sides',
    markIsForBodyPart: (mark: PrisonPersonDistinguishingMark) =>
      mark.bodyPart.id === 'BODY_PART_TORSO' && mark.side?.id !== 'SIDE_B',
    getHighlightConfig: (_mark: PrisonPersonDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/torso-front-overlay.svg',
      class: 'dm-overlay-torso',
      name: 'torso',
    }),
    getLocationDescription: (mark: PrisonPersonDistinguishingMark) => {
      if (mark.side?.id === 'SIDE_F') return 'Front'
      if (mark.side?.id === 'SIDE_R') return 'Right side'
      if (mark.side?.id === 'SIDE_L') return 'Left side'
      return 'Torso - no specific location'
    },
  },
  back: {
    name: 'Back',
    markIsForBodyPart: (mark: PrisonPersonDistinguishingMark) =>
      mark.bodyPart.id === 'BODY_PART_TORSO' && mark.side?.id === 'SIDE_B',
    getHighlightConfig: (_mark: PrisonPersonDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/back-overlay.svg',
      class: 'dm-overlay-back',
      name: 'back',
    }),
    getLocationDescription: (mark: PrisonPersonDistinguishingMark) => {
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower back'
      if (mark.partOrientation?.id === 'PART_ORIENT_UPP') return 'Upper back'
      return 'Back - no specific location'
    },
  },
}

export default (distinguishingMarks: PrisonPersonDistinguishingMark[]): CategorisedMarksForView => {
  const categoryForMarkTypeId: Record<string, MarkCategory> = {
    MARK_TYPE_TAT: 'tattoos',
    MARK_TYPE_SCAR: 'scars',
    MARK_TYPE_OTH: 'others',
    MARK_TYPE_MARK: 'others',
  }

  return distinguishingMarks.reduce<CategorisedMarksForView>(
    ({ highlights, ...outputMark }, mark) => {
      const markCategory = categoryForMarkTypeId[mark.markType.id]
      const bodyPartConfig = Object.values(bodyPartsConfig).find(partConfig => partConfig.markIsForBodyPart(mark))

      const bodyPartDescription = bodyPartConfig?.name ?? 'Uncategorised'
      const markLocationDesc = bodyPartConfig?.getLocationDescription(mark) ?? 'No specific location'

      const markWithLocation = { ...mark, location: markLocationDesc }
      const newGroupedMarks = mergeIn(markWithLocation, outputMark, [markCategory, bodyPartDescription])

      // If the body part config for mark has highlight image config, add it to the highlights array (if not already there) to be used by view
      const highlight = bodyPartConfig?.getHighlightConfig(mark)
      const newHighlights =
        !highlight || highlights.find(hl => hl.name === highlight.name) ? highlights : [...highlights, highlight]

      return {
        ...newGroupedMarks,
        highlights: newHighlights,
      }
    },
    { tattoos: {}, scars: {}, others: {}, highlights: [] },
  )
}

function mergeIn(mark: DistinguishingMarkDecorated, target: CategorisedMarks, path: [MarkCategory, BodyPart]) {
  const [markCategory, bodyPartDescription] = path

  // create new body part category if it doesn't exist
  if (!target[markCategory]?.[bodyPartDescription]) {
    return {
      ...target,
      [markCategory]: {
        ...target[markCategory],
        [bodyPartDescription]: [mark],
      },
    }
  }

  // add to body part category if it already exists
  return {
    ...target,
    [markCategory]: {
      ...target[markCategory],
      [bodyPartDescription]: [...target[markCategory][bodyPartDescription], mark],
    },
  }
}
