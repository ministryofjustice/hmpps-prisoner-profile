import { Validator } from '../../middleware/validationMiddleware'

export const numberOfChildrenValidator: Validator = (body: Record<string, string>) => {
  const { hasChildren, numberOfChildren } = body
  const errors = []

  if (hasChildren !== 'YES') {
    return []
  }
  const children = Number(numberOfChildren)

  if (
    numberOfChildren === undefined ||
    numberOfChildren === null ||
    numberOfChildren.trim().length < 1 ||
    Number.isNaN(children) ||
    !Number.isInteger(children)
  ) {
    errors.push({ href: '#numberOfChildren', text: `Enter the number of children.` })
  } else if (children < 1 || children > 99) {
    errors.push({ href: '#numberOfChildren', text: `Number of children must be between 1 and 99.` })
  }

  return errors
}

export default { numberOfChildrenValidator }
