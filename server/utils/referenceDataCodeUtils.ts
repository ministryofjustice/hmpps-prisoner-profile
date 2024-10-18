export const formatMedicalDietaryRequirements = (requirements: { id: string; description: string }[]): string[] => {
  if (requirements.length === 0) {
    return ['None']
  }
  return requirements
    .filter(({ id }) => !id.endsWith('FREE_FROM'))
    .map(req => {
      if (req.id.startsWith('FREE_FROM')) return `Free from: ${req.description}`
      return req.description
    })
}
