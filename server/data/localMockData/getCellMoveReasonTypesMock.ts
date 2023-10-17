import { CellMoveReasonType } from '../../interfaces/prisonApi/cellMoveReasonTypes'

export const getCellMoveReasonTypesMock: CellMoveReasonType[] = [
  {
    domain: 'TASK_TYPE',
    code: 'ADM',
    description: 'Some description',
    parentDomain: 'TASK_TYPE',
    parentCode: 'MIGRATION',
    activeFlag: 'Y',
    listSeq: 1,
    systemDataFlag: 'Y',
    expiredDate: '2018-03-09',
    subCodes: ['string'],
  },
]

export default {
  getCellMoveReasonTypesMock,
}
