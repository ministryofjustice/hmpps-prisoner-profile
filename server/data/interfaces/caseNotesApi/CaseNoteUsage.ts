export default interface CaseNoteUsage {
  personIdentifier: string
  type: string
  subType: string
  count: number
  latestNote: {
    occurredAt: string
  }
}

export interface CaseNoteUsageSummary {
  content: Record<string, CaseNoteUsage[]>
}

export interface CaseNoteTypeSubTypeRequest {
  type: string
  subTypes: string[]
}

export interface BehaviourCaseNoteCount {
  positiveBehaviourCount: number
  negativeBehaviourCount: number
}
