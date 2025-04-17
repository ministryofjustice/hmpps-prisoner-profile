export default interface LatestCalculation {
  prisonerId: string
  bookingId: number
  calculatedAt: string
  calculationRequestId?: number
  establishment?: string
  reason: string
  source: 'NOMIS' | 'CRDS'
  dates: {
    type:
      | 'CRD'
      | 'LED'
      | 'SED'
      | 'NPD'
      | 'ARD'
      | 'TUSED'
      | 'PED'
      | 'SLED'
      | 'HDCED'
      | 'NCRD'
      | 'ETD'
      | 'MTD'
      | 'LTD'
      | 'DPRRD'
      | 'PRRD'
      | 'ESED'
      | 'ERSED'
      | 'TERSED'
      | 'APD'
      | 'HDCAD'
      | 'None'
      | 'Tariff'
      | 'ROTL'
      | 'HDCED4PLUS'
    description: string
    date: string
    hints: {
      text: string
      link?: string
    }[]
  }[]
}
