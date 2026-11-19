/**
 * True when given prisoner is high profile and outside user’s caseloads.
 * Normally, users with global search role would have limited access.
 */
// TODO: Fold into permissions library
export default function isHighProfilePrisonerOutsideCaseloads(): boolean {
  // TODO: integrate with `res.locals.isHighProfilePrisoner` flag: what parameters need to be passed in?
  return false
}
