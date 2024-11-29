export const formatMedicalDietaryRequirements = (requirements: { id: string; description: string }[]): string[] => {
  return requirements
    .filter(({ id }) => !id.endsWith('FREE_FROM'))
    .map(req => {
      if (req.id.startsWith('FREE_FROM')) return `Free from: ${req.description}`
      return req.description
    })
    .sort((a, b) => a.localeCompare(b))
}
