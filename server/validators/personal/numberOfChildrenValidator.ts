import { Validator } from '../../middleware/validationMiddleware'

export const numberOfChildrenValidator: Validator = (body: Record<string, string>) => {
  const { hasChildren, numberOfChildren } = body
  const errors = []

  if (hasChildren !== 'YES') {
    return []
  }

  const children = Number(numberOfChildren)
  if (Number.isNaN(children) || !Number.isInteger(children) || children < 1) {
    errors.push({ href: '#numberOfChildren', text: `Enter the number of children.` })
  }

  return errors
}
