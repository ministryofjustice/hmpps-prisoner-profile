import {
  allBodyParts,
  bodyPartMap,
  bodyPartSelections,
} from '../../controllers/interfaces/distinguishingMarks/selectionTypes'

interface BodySubmission {
  bodyPart?: string
}

interface BodySpecificSubmission {
  specificBodyPart?: string
  [key: string]: string
}

export function newDistinguishingMarkValidator({ bodyPart }: BodySubmission) {
  const verifiedBodyPart = bodyPartSelections.find(selection => selection === bodyPartMap[bodyPart])
  if (!verifiedBodyPart) {
    return [{ text: 'Select a body part' }]
  }

  return []
}

export function newDetailedDistinguishingMarkValidator(body: BodySpecificSubmission) {
  const verifiedBodyPart = allBodyParts.find(selection => selection === body.specificBodyPart)

  if (!verifiedBodyPart) {
    return [{ text: 'Select a body part', href: '#specific-body-part-selection' }]
  }

  if (body[`description-${body.specificBodyPart}`].length > 240) {
    return [
      {
        text: 'The description must be 240 characters or less',
        href: `#description-${body.specificBodyPart}`,
      },
    ]
  }

  return []
}
