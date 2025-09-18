import { bodyPartMap, BodyPartSelection } from '../../controllers/interfaces/distinguishingMarks/selectionTypes'
import { PersonIntegrationDistinguishingMark } from '../../data/interfaces/personIntegrationApi/personIntegrationApiClient'

type DistinguishingMarkDecorated = PersonIntegrationDistinguishingMark & { location: string }
type MarkCategory = 'tattoos' | 'scars' | 'others'
type BodyPartCategory =
  | 'Arm'
  | 'Back'
  | 'Face and head'
  | 'Foot'
  | 'Front and sides'
  | 'Hand'
  | 'Left arm'
  | 'Left foot'
  | 'Left hand'
  | 'Left leg'
  | 'Leg'
  | 'Neck'
  | 'Right arm'
  | 'Right foot'
  | 'Right hand'
  | 'Right leg'
  | 'Uncategorised'

type CategorisedMarks = Record<MarkCategory, Partial<Record<BodyPartCategory, DistinguishingMarkDecorated[]>>>
export type CategorisedMarksForView = CategorisedMarks & {
  highlights: {
    asset: string
    class: string
    name: string
  }[]
}

interface BodyPartConfig {
  name: BodyPartCategory
  markIsForBodyPart: (mark: PersonIntegrationDistinguishingMark) => boolean
  getHighlightConfig: (mark: PersonIntegrationDistinguishingMark) => {
    asset: string
    class: string
    name: string
  } | null
  getLocationDescription: (mark: PersonIntegrationDistinguishingMark) => string
}

const bodyPartsConfig: Record<string, BodyPartConfig> = {
  leftArm: {
    name: 'Left arm',
    markIsForBodyPart: (mark: PersonIntegrationDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_ARM' ||
        mark.bodyPart.id === 'BODY_PART_SHOULDER' ||
        mark.bodyPart.id === 'BODY_PART_ELBOW') &&
      mark.side?.id === 'SIDE_L',
    getHighlightConfig: (_mark: PersonIntegrationDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/left-arm-overlay.svg',
      class: 'dm-overlay-left-arm',
      name: 'left arm',
    }),
    getLocationDescription: (mark: PersonIntegrationDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_ELBOW') return 'Elbow'
      if (mark.bodyPart.id === 'BODY_PART_SHOULDER') return 'Shoulder'
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower arm'
      if (mark.partOrientation?.id === 'PART_ORIENT_UPP') return 'Upper arm'
      return 'Arm (general)'
    },
  },
  rightArm: {
    name: 'Right arm',
    markIsForBodyPart: (mark: PersonIntegrationDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_ARM' ||
        mark.bodyPart.id === 'BODY_PART_SHOULDER' ||
        mark.bodyPart.id === 'BODY_PART_ELBOW') &&
      mark.side?.id === 'SIDE_R',
    getHighlightConfig: (_mark: PersonIntegrationDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/right-arm-overlay.svg',
      class: 'dm-overlay-right-arm',
      name: 'right arm',
    }),
    getLocationDescription: (mark: PersonIntegrationDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_ELBOW') return 'Elbow'
      if (mark.bodyPart.id === 'BODY_PART_SHOULDER') return 'Shoulder'
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower arm'
      if (mark.partOrientation?.id === 'PART_ORIENT_UPP') return 'Upper arm'
      return 'Arm (general)'
    },
  },
  arm: {
    name: 'Arm',
    markIsForBodyPart: (mark: PersonIntegrationDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_ARM' ||
        mark.bodyPart.id === 'BODY_PART_SHOULDER' ||
        mark.bodyPart.id === 'BODY_PART_ELBOW') &&
      mark.side?.id !== 'SIDE_R' &&
      mark.side?.id !== 'SIDE_L',
    getHighlightConfig: (_mark: PersonIntegrationDistinguishingMark) => null,
    getLocationDescription: (mark: PersonIntegrationDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_ELBOW') return 'Elbow'
      if (mark.bodyPart.id === 'BODY_PART_SHOULDER') return 'Shoulder'
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower arm'
      if (mark.partOrientation?.id === 'PART_ORIENT_UPP') return 'Upper arm'
      return 'Arm - no specific location'
    },
  },
  neck: {
    name: 'Neck',
    markIsForBodyPart: (mark: PersonIntegrationDistinguishingMark) => mark.bodyPart.id === 'BODY_PART_NECK',
    getHighlightConfig: (_mark: PersonIntegrationDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/neck-overlay.svg',
      class: 'dm-overlay-neck',
      name: 'neck',
    }),
    getLocationDescription: () => 'Neck',
  },
  face: {
    name: 'Face and head',
    markIsForBodyPart: (mark: PersonIntegrationDistinguishingMark) =>
      mark.bodyPart.id === 'BODY_PART_FACE' ||
      mark.bodyPart.id === 'BODY_PART_HEAD' ||
      mark.bodyPart.id === 'BODY_PART_EAR' ||
      mark.bodyPart.id === 'BODY_PART_LIP' ||
      mark.bodyPart.id === 'BODY_PART_NOSE',
    getHighlightConfig: (_mark: PersonIntegrationDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/face-overlay.svg',
      class: 'dm-overlay-face',
      name: 'face',
    }),
    getLocationDescription: (mark: PersonIntegrationDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_FACE') return 'Face'
      if (mark.bodyPart.id === 'BODY_PART_EAR') return 'Ear'
      if (mark.bodyPart.id === 'BODY_PART_LIP') return 'Lip'
      if (mark.bodyPart.id === 'BODY_PART_NOSE') return 'Nose'
      return 'Head'
    },
  },
  rightFoot: {
    name: 'Right foot',
    markIsForBodyPart: (mark: PersonIntegrationDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_FOOT' ||
        mark.bodyPart.id === 'BODY_PART_TOE' ||
        mark.bodyPart.id === 'BODY_PART_ANKLE') &&
      mark.side?.id === 'SIDE_R',
    getHighlightConfig: (_mark: PersonIntegrationDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/right-foot-overlay.svg',
      class: 'dm-overlay-right-foot',
      name: 'right foot',
    }),
    getLocationDescription: (mark: PersonIntegrationDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_TOE') return 'Toes on right foot'
      if (mark.bodyPart.id === 'BODY_PART_ANKLE') return 'Right ankle'
      return 'Right foot'
    },
  },
  leftFoot: {
    name: 'Left foot',
    markIsForBodyPart: (mark: PersonIntegrationDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_FOOT' ||
        mark.bodyPart.id === 'BODY_PART_TOE' ||
        mark.bodyPart.id === 'BODY_PART_ANKLE') &&
      mark.side?.id === 'SIDE_L',
    getHighlightConfig: (_mark: PersonIntegrationDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/left-foot-overlay.svg',
      class: 'dm-overlay-left-foot',
      name: 'left foot',
    }),
    getLocationDescription: (mark: PersonIntegrationDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_TOE') return 'Toes on left foot'
      if (mark.bodyPart.id === 'BODY_PART_ANKLE') return 'Left ankle'
      return 'Left foot'
    },
  },
  foot: {
    name: 'Foot',
    markIsForBodyPart: (mark: PersonIntegrationDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_FOOT' ||
        mark.bodyPart.id === 'BODY_PART_TOE' ||
        mark.bodyPart.id === 'BODY_PART_ANKLE') &&
      mark.side?.id !== 'SIDE_R' &&
      mark.side?.id !== 'SIDE_L',
    getHighlightConfig: (_mark: PersonIntegrationDistinguishingMark) => null,
    getLocationDescription: (mark: PersonIntegrationDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_TOE') return 'Toe'
      if (mark.bodyPart.id === 'BODY_PART_ANKLE') return 'Ankle'
      return 'Foot'
    },
  },
  rightHand: {
    name: 'Right hand',
    markIsForBodyPart: (mark: PersonIntegrationDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_HAND' || mark.bodyPart.id === 'BODY_PART_FINGER') && mark.side?.id === 'SIDE_R',
    getHighlightConfig: (_mark: PersonIntegrationDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/right-hand-overlay.svg',
      class: 'dm-overlay-right-hand',
      name: 'right hand',
    }),
    getLocationDescription: (mark: PersonIntegrationDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_FINGER') return 'Fingers on right hand'
      return 'Right hand'
    },
  },
  leftHand: {
    name: 'Left hand',
    markIsForBodyPart: (mark: PersonIntegrationDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_HAND' || mark.bodyPart.id === 'BODY_PART_FINGER') && mark.side?.id === 'SIDE_L',
    getHighlightConfig: (_mark: PersonIntegrationDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/left-hand-overlay.svg',
      class: 'dm-overlay-left-hand',
      name: 'left hand',
    }),
    getLocationDescription: (mark: PersonIntegrationDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_FINGER') return 'Fingers on left hand'
      return 'Left hand'
    },
  },
  hand: {
    name: 'Hand',
    markIsForBodyPart: (mark: PersonIntegrationDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_HAND' || mark.bodyPart.id === 'BODY_PART_FINGER') &&
      mark.side?.id !== 'SIDE_L' &&
      mark.side?.id !== 'SIDE_R',
    getHighlightConfig: (_mark: PersonIntegrationDistinguishingMark) => null,
    getLocationDescription: (mark: PersonIntegrationDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_FINGER') return 'Finger'
      return 'Hand - no specific location'
    },
  },
  rightLeg: {
    name: 'Right leg',
    markIsForBodyPart: (mark: PersonIntegrationDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_LEG' ||
        mark.bodyPart.id === 'BODY_PART_THIGH' ||
        mark.bodyPart.id === 'BODY_PART_KNEE') &&
      mark.side?.id === 'SIDE_R',
    getHighlightConfig: (_mark: PersonIntegrationDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/right-leg-overlay.svg',
      class: 'dm-overlay-right-leg',
      name: 'right leg',
    }),
    getLocationDescription: (mark: PersonIntegrationDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_THIGH') return 'Right thigh'
      if (mark.bodyPart.id === 'BODY_PART_KNEE') return 'Right knee'
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower right leg'
      return 'Leg (general)'
    },
  },
  leftLeg: {
    name: 'Left leg',
    markIsForBodyPart: (mark: PersonIntegrationDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_LEG' ||
        mark.bodyPart.id === 'BODY_PART_THIGH' ||
        mark.bodyPart.id === 'BODY_PART_KNEE') &&
      mark.side?.id === 'SIDE_L',
    getHighlightConfig: (_mark: PersonIntegrationDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/left-leg-overlay.svg',
      class: 'dm-overlay-left-leg',
      name: 'left leg',
    }),
    getLocationDescription: (mark: PersonIntegrationDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_THIGH') return 'Left thigh'
      if (mark.bodyPart.id === 'BODY_PART_KNEE') return 'Left knee'
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower left leg'
      return 'Leg (general)'
    },
  },
  leg: {
    name: 'Leg',
    markIsForBodyPart: (mark: PersonIntegrationDistinguishingMark) =>
      (mark.bodyPart.id === 'BODY_PART_LEG' ||
        mark.bodyPart.id === 'BODY_PART_THIGH' ||
        mark.bodyPart.id === 'BODY_PART_KNEE') &&
      mark.side?.id !== 'SIDE_L' &&
      mark.side?.id !== 'SIDE_R',
    getHighlightConfig: (_mark: PersonIntegrationDistinguishingMark) => null,
    getLocationDescription: (mark: PersonIntegrationDistinguishingMark) => {
      if (mark.bodyPart.id === 'BODY_PART_THIGH') return 'Thigh'
      if (mark.bodyPart.id === 'BODY_PART_KNEE') return 'Knee'
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower leg'
      return 'Leg - no specific location'
    },
  },
  torso: {
    name: 'Front and sides',
    markIsForBodyPart: (mark: PersonIntegrationDistinguishingMark) =>
      mark.bodyPart.id === 'BODY_PART_TORSO' && mark.side?.id !== 'SIDE_B',
    getHighlightConfig: (_mark: PersonIntegrationDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/torso-front-overlay.svg',
      class: 'dm-overlay-torso',
      name: 'torso',
    }),
    getLocationDescription: (mark: PersonIntegrationDistinguishingMark) => {
      if (mark.side?.id === 'SIDE_F') return 'Front'
      if (mark.side?.id === 'SIDE_R') return 'Right side'
      if (mark.side?.id === 'SIDE_L') return 'Left side'
      return 'Not entered'
    },
  },
  back: {
    name: 'Back',
    markIsForBodyPart: (mark: PersonIntegrationDistinguishingMark) =>
      mark.bodyPart.id === 'BODY_PART_TORSO' && mark.side?.id === 'SIDE_B',
    getHighlightConfig: (_mark: PersonIntegrationDistinguishingMark) => ({
      asset: '/assets/images/distinguishingMarks/back-overlay.svg',
      class: 'dm-overlay-back',
      name: 'back',
    }),
    getLocationDescription: (mark: PersonIntegrationDistinguishingMark) => {
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower back'
      if (mark.partOrientation?.id === 'PART_ORIENT_UPP') return 'Upper back'
      return 'Back'
    },
  },
}

export default (distinguishingMarks: PersonIntegrationDistinguishingMark[]): CategorisedMarksForView => {
  const categoryForMarkTypeId: Record<string, MarkCategory> = {
    MARK_TYPE_TAT: 'tattoos',
    MARK_TYPE_SCAR: 'scars',
    MARK_TYPE_OTH: 'others',
    MARK_TYPE_MARK: 'others',
  }

  const unsortedMarks = distinguishingMarks.reduce<CategorisedMarksForView>(
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

  return {
    tattoos: sortMarks(unsortedMarks.tattoos),
    scars: sortMarks(unsortedMarks.scars),
    others: sortMarks(unsortedMarks.others),
    highlights: unsortedMarks.highlights,
  }
}

const sortMarks = (marks: Partial<Record<BodyPartCategory, DistinguishingMarkDecorated[]>>) => {
  const markOrder: BodyPartCategory[] = [
    'Face and head',
    'Neck',
    'Front and sides',
    'Right arm',
    'Right hand',
    'Left arm',
    'Left hand',
    'Right leg',
    'Right foot',
    'Left leg',
    'Left foot',
    'Back',
  ]

  return Object.keys(marks)
    .sort((a: BodyPartCategory, b: BodyPartCategory) => markOrder.indexOf(a) - markOrder.indexOf(b))
    .reduce(
      (sortedObj, key: BodyPartCategory) => ({ ...sortedObj, [key]: marks[key] }),
      {} as Partial<Record<BodyPartCategory, DistinguishingMarkDecorated[]>>,
    )
}

export const getMarkLocationDescription = (distinguishingMark: PersonIntegrationDistinguishingMark): string => {
  const bodyPartConfig = Object.values(bodyPartsConfig).find(partConfig =>
    partConfig.markIsForBodyPart(distinguishingMark),
  )

  return bodyPartConfig?.getLocationDescription(distinguishingMark) ?? 'No specific location'
}

export const getBodyPartDescription = (distinguishingMark: PersonIntegrationDistinguishingMark): string => {
  const bodyPartConfig = Object.values(bodyPartsConfig).find(partConfig =>
    partConfig.markIsForBodyPart(distinguishingMark),
  )
  return bodyPartConfig?.name ?? 'Uncategorised'
}

const findBodyPartToken = (map: Record<string, string>, value: BodyPartSelection): string | undefined => {
  const entry = Object.entries(map).find(([_, mapValue]) => mapValue === value)
  return entry ? entry[0] : undefined
}

export const getBodyPartToken = (distinguishingMark: PersonIntegrationDistinguishingMark): string => {
  const bodyPart = Object.entries(bodyPartsConfig).find(([, partConfig]) =>
    partConfig.markIsForBodyPart(distinguishingMark),
  )?.[0]

  return findBodyPartToken(bodyPartMap, bodyPart as BodyPartSelection)
}

function mergeIn(mark: DistinguishingMarkDecorated, target: CategorisedMarks, path: [MarkCategory, BodyPartCategory]) {
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
