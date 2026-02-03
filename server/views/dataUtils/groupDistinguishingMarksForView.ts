import {
  bodyPartMap,
  BodyPartSelection,
  ValidBodyPart,
} from '../../controllers/interfaces/distinguishingMarks/selectionTypes'
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
  selected: readonly ValidBodyPart[]
}

interface BodyPartConfig {
  name: BodyPartCategory
  markIsForBodyPart: (mark: PersonIntegrationDistinguishingMark) => boolean
  selectableBodyPart?: ValidBodyPart
  getLocationDescription: (mark: PersonIntegrationDistinguishingMark) => string
}

const bodyPartsConfig: Record<string, BodyPartConfig> = {
  leftArm: {
    name: 'Left arm',
    markIsForBodyPart: mark =>
      (mark.bodyPart.id === 'BODY_PART_ARM' ||
        mark.bodyPart.id === 'BODY_PART_SHOULDER' ||
        mark.bodyPart.id === 'BODY_PART_ELBOW') &&
      mark.side?.id === 'SIDE_L',
    selectableBodyPart: 'left-arm',
    getLocationDescription: mark => {
      if (mark.bodyPart.id === 'BODY_PART_ELBOW') return 'Elbow'
      if (mark.bodyPart.id === 'BODY_PART_SHOULDER') return 'Shoulder'
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower arm'
      if (mark.partOrientation?.id === 'PART_ORIENT_UPP') return 'Upper arm'
      return 'Arm (general)'
    },
  },
  rightArm: {
    name: 'Right arm',
    markIsForBodyPart: mark =>
      (mark.bodyPart.id === 'BODY_PART_ARM' ||
        mark.bodyPart.id === 'BODY_PART_SHOULDER' ||
        mark.bodyPart.id === 'BODY_PART_ELBOW') &&
      mark.side?.id === 'SIDE_R',
    selectableBodyPart: 'right-arm',
    getLocationDescription: mark => {
      if (mark.bodyPart.id === 'BODY_PART_ELBOW') return 'Elbow'
      if (mark.bodyPart.id === 'BODY_PART_SHOULDER') return 'Shoulder'
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower arm'
      if (mark.partOrientation?.id === 'PART_ORIENT_UPP') return 'Upper arm'
      return 'Arm (general)'
    },
  },
  arm: {
    name: 'Arm',
    markIsForBodyPart: mark =>
      (mark.bodyPart.id === 'BODY_PART_ARM' ||
        mark.bodyPart.id === 'BODY_PART_SHOULDER' ||
        mark.bodyPart.id === 'BODY_PART_ELBOW') &&
      mark.side?.id !== 'SIDE_R' &&
      mark.side?.id !== 'SIDE_L',
    getLocationDescription: mark => {
      if (mark.bodyPart.id === 'BODY_PART_ELBOW') return 'Elbow'
      if (mark.bodyPart.id === 'BODY_PART_SHOULDER') return 'Shoulder'
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower arm'
      if (mark.partOrientation?.id === 'PART_ORIENT_UPP') return 'Upper arm'
      return 'Arm - no specific location'
    },
  },
  neck: {
    name: 'Neck',
    markIsForBodyPart: mark => mark.bodyPart.id === 'BODY_PART_NECK',
    selectableBodyPart: 'neck',
    getLocationDescription: () => 'Neck',
  },
  face: {
    name: 'Face and head',
    markIsForBodyPart: mark =>
      mark.bodyPart.id === 'BODY_PART_FACE' ||
      mark.bodyPart.id === 'BODY_PART_HEAD' ||
      mark.bodyPart.id === 'BODY_PART_EAR' ||
      mark.bodyPart.id === 'BODY_PART_LIP' ||
      mark.bodyPart.id === 'BODY_PART_NOSE',
    selectableBodyPart: 'face',
    getLocationDescription: mark => {
      if (mark.bodyPart.id === 'BODY_PART_FACE') return 'Face'
      if (mark.bodyPart.id === 'BODY_PART_EAR') return 'Ear'
      if (mark.bodyPart.id === 'BODY_PART_LIP') return 'Lip'
      if (mark.bodyPart.id === 'BODY_PART_NOSE') return 'Nose'
      return 'Head'
    },
  },
  rightFoot: {
    name: 'Right foot',
    markIsForBodyPart: mark =>
      (mark.bodyPart.id === 'BODY_PART_FOOT' ||
        mark.bodyPart.id === 'BODY_PART_TOE' ||
        mark.bodyPart.id === 'BODY_PART_ANKLE') &&
      mark.side?.id === 'SIDE_R',
    selectableBodyPart: 'right-foot',
    getLocationDescription: mark => {
      if (mark.bodyPart.id === 'BODY_PART_TOE') return 'Toes on right foot'
      if (mark.bodyPart.id === 'BODY_PART_ANKLE') return 'Right ankle'
      return 'Right foot'
    },
  },
  leftFoot: {
    name: 'Left foot',
    markIsForBodyPart: mark =>
      (mark.bodyPart.id === 'BODY_PART_FOOT' ||
        mark.bodyPart.id === 'BODY_PART_TOE' ||
        mark.bodyPart.id === 'BODY_PART_ANKLE') &&
      mark.side?.id === 'SIDE_L',
    selectableBodyPart: 'left-foot',
    getLocationDescription: mark => {
      if (mark.bodyPart.id === 'BODY_PART_TOE') return 'Toes on left foot'
      if (mark.bodyPart.id === 'BODY_PART_ANKLE') return 'Left ankle'
      return 'Left foot'
    },
  },
  foot: {
    name: 'Foot',
    markIsForBodyPart: mark =>
      (mark.bodyPart.id === 'BODY_PART_FOOT' ||
        mark.bodyPart.id === 'BODY_PART_TOE' ||
        mark.bodyPart.id === 'BODY_PART_ANKLE') &&
      mark.side?.id !== 'SIDE_R' &&
      mark.side?.id !== 'SIDE_L',
    getLocationDescription: mark => {
      if (mark.bodyPart.id === 'BODY_PART_TOE') return 'Toe'
      if (mark.bodyPart.id === 'BODY_PART_ANKLE') return 'Ankle'
      return 'Foot'
    },
  },
  rightHand: {
    name: 'Right hand',
    markIsForBodyPart: mark =>
      (mark.bodyPart.id === 'BODY_PART_HAND' || mark.bodyPart.id === 'BODY_PART_FINGER') && mark.side?.id === 'SIDE_R',
    selectableBodyPart: 'right-hand',
    getLocationDescription: mark => {
      if (mark.bodyPart.id === 'BODY_PART_FINGER') return 'Fingers on right hand'
      return 'Right hand'
    },
  },
  leftHand: {
    name: 'Left hand',
    markIsForBodyPart: mark =>
      (mark.bodyPart.id === 'BODY_PART_HAND' || mark.bodyPart.id === 'BODY_PART_FINGER') && mark.side?.id === 'SIDE_L',
    selectableBodyPart: 'left-hand',
    getLocationDescription: mark => {
      if (mark.bodyPart.id === 'BODY_PART_FINGER') return 'Fingers on left hand'
      return 'Left hand'
    },
  },
  hand: {
    name: 'Hand',
    markIsForBodyPart: mark =>
      (mark.bodyPart.id === 'BODY_PART_HAND' || mark.bodyPart.id === 'BODY_PART_FINGER') &&
      mark.side?.id !== 'SIDE_L' &&
      mark.side?.id !== 'SIDE_R',
    getLocationDescription: mark => {
      if (mark.bodyPart.id === 'BODY_PART_FINGER') return 'Finger'
      return 'Hand - no specific location'
    },
  },
  rightLeg: {
    name: 'Right leg',
    markIsForBodyPart: mark =>
      (mark.bodyPart.id === 'BODY_PART_LEG' ||
        mark.bodyPart.id === 'BODY_PART_THIGH' ||
        mark.bodyPart.id === 'BODY_PART_KNEE') &&
      mark.side?.id === 'SIDE_R',
    selectableBodyPart: 'right-leg',
    getLocationDescription: mark => {
      if (mark.bodyPart.id === 'BODY_PART_THIGH') return 'Right thigh'
      if (mark.bodyPart.id === 'BODY_PART_KNEE') return 'Right knee'
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower right leg'
      return 'Leg (general)'
    },
  },
  leftLeg: {
    name: 'Left leg',
    markIsForBodyPart: mark =>
      (mark.bodyPart.id === 'BODY_PART_LEG' ||
        mark.bodyPart.id === 'BODY_PART_THIGH' ||
        mark.bodyPart.id === 'BODY_PART_KNEE') &&
      mark.side?.id === 'SIDE_L',
    selectableBodyPart: 'left-leg',
    getLocationDescription: mark => {
      if (mark.bodyPart.id === 'BODY_PART_THIGH') return 'Left thigh'
      if (mark.bodyPart.id === 'BODY_PART_KNEE') return 'Left knee'
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower left leg'
      return 'Leg (general)'
    },
  },
  leg: {
    name: 'Leg',
    markIsForBodyPart: mark =>
      (mark.bodyPart.id === 'BODY_PART_LEG' ||
        mark.bodyPart.id === 'BODY_PART_THIGH' ||
        mark.bodyPart.id === 'BODY_PART_KNEE') &&
      mark.side?.id !== 'SIDE_L' &&
      mark.side?.id !== 'SIDE_R',
    getLocationDescription: mark => {
      if (mark.bodyPart.id === 'BODY_PART_THIGH') return 'Thigh'
      if (mark.bodyPart.id === 'BODY_PART_KNEE') return 'Knee'
      if (mark.partOrientation?.id === 'PART_ORIENT_LOW') return 'Lower leg'
      return 'Leg - no specific location'
    },
  },
  torso: {
    name: 'Front and sides',
    markIsForBodyPart: mark => mark.bodyPart.id === 'BODY_PART_TORSO' && mark.side?.id !== 'SIDE_B',
    selectableBodyPart: 'front-and-sides',
    getLocationDescription: mark => {
      if (mark.side?.id === 'SIDE_F') return 'Front'
      if (mark.side?.id === 'SIDE_R') return 'Right side'
      if (mark.side?.id === 'SIDE_L') return 'Left side'
      return 'Not entered'
    },
  },
  back: {
    name: 'Back',
    markIsForBodyPart: mark => mark.bodyPart.id === 'BODY_PART_TORSO' && mark.side?.id === 'SIDE_B',
    selectableBodyPart: 'back',
    getLocationDescription: mark => {
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

  const unsortedMarks = distinguishingMarks.reduce<CategorisedMarks & { selected: Set<ValidBodyPart> }>(
    ({ selected, ...outputMark }, mark) => {
      const markCategory = categoryForMarkTypeId[mark.markType.id]
      const bodyPartConfig = Object.values(bodyPartsConfig).find(partConfig => partConfig.markIsForBodyPart(mark))

      const bodyPartDescription = bodyPartConfig?.name ?? 'Uncategorised'
      const markLocationDesc = bodyPartConfig?.getLocationDescription(mark) ?? 'No specific location'

      const markWithLocation = { ...mark, location: markLocationDesc }
      const newGroupedMarks = mergeIn(markWithLocation, outputMark, [markCategory, bodyPartDescription])

      if (bodyPartConfig?.selectableBodyPart) {
        selected.add(bodyPartConfig.selectableBodyPart)
      }

      return {
        ...newGroupedMarks,
        selected,
      }
    },
    { tattoos: {}, scars: {}, others: {}, selected: new Set() },
  )

  return {
    tattoos: sortMarks(unsortedMarks.tattoos),
    scars: sortMarks(unsortedMarks.scars),
    others: sortMarks(unsortedMarks.others),
    selected: Array.from(unsortedMarks.selected),
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

const findBodyPartToken = (value: BodyPartSelection | undefined): ValidBodyPart | undefined => {
  const entry = Object.entries(bodyPartMap).find(([_, mapValue]) => mapValue === value)
  return entry?.[0] as ValidBodyPart | undefined
}

export const getBodyPartToken = (
  distinguishingMark: PersonIntegrationDistinguishingMark,
): ValidBodyPart | undefined => {
  const bodyPart = Object.entries(bodyPartsConfig).find(([, partConfig]) =>
    partConfig.markIsForBodyPart(distinguishingMark),
  )?.[0] as BodyPartSelection

  return findBodyPartToken(bodyPart)
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
