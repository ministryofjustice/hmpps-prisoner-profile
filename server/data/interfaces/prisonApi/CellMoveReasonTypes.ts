export default interface CellMoveReasonType {
  domain: string
  code: string
  description: string
  parentDomain: string
  parentCode: string
  activeFlag: string
  listSeq: number
  systemDataFlag: string
  expiredDate: string
  subCodes: [string]
}
