export default interface Court {
  courtId: number
  code: string
  description: string
  enabled: boolean
  notes?: string
}

export interface ProbationTeam {
  probationTeamId: number
  code: string
  description: string
  enabled: boolean
  notes?: string
}
