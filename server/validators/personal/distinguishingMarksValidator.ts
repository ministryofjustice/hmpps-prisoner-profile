import { bodyPartSelections } from '../../controllers/interfaces/distinguishingMarks/selectionTypes'

interface Body {
  bodyPart?: string
}

export function newDistinguishingMarkValidator({ bodyPart }: Body) {
  const verifiedBodyPart = bodyPartSelections.find(selection => selection === bodyPart)
  if (!verifiedBodyPart) {
    return [{ text: 'Select a body part' }]
  }

  return []
}
