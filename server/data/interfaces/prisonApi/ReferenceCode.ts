export default interface ReferenceCode {
  domain?: string
  code: string
  description: string
  parentDomain?: string
  parentCode?: string
  activeFlag: 'Y' | 'N'
  listSeq?: number
  systemDataFlag?: 'Y' | 'N'
  expiredDate?: string
  subCodes?: ReferenceCode[]
}

export enum ReferenceCodeDomain {
  Health = 'HEALTH',
  HealthTreatments = 'HEALTH_TREAT',
  VisitCompletionReasons = 'VIS_COMPLETE',
  VisitCancellationReasons = 'MOVE_CANC_RS',
}
