import OsPlacesDeliveryPointAddress from './osPlacesDeliveryPointAddress'

export default interface OsPlacesQueryResponse {
  header: OsPlacesResponseHeader
  results: OsPlacesQueryResult[]
}

interface OsPlacesResponseHeader {
  uri: string
  query: string
  offset: number
  totalresults: number
  format: string
  dataset: string
  lr: string
  maxresults: number
  matchprecision: number
  epoch: string
  lastupdate: string
  output_srs: string
}

interface OsPlacesQueryResult {
  DPA?: OsPlacesDeliveryPointAddress
  LPI?: OsPlacesLandPropertyIdentifier
}

interface OsPlacesLandPropertyIdentifier {
  UPRN: number
  ADDRESS: string
  USRN: number
  LPI_KEY: string
  ORGANISATION: string
  SAO_START_NUMBER: number
  SAO_START_SUFFIX: string
  SAO_END_NUMBER: number
  SAO_END_SUFFIX: string
  SAO_TEXT: string
  PAO_START_NUMBER: number
  PAO_START_SUFFIX: string
  PAO_END_NUMBER: number
  PAO_END_SUFFIX: string
  PAO_TEXT: string
  STREET_DESCRIPTION: string
  LOCALITY_NAME: string
  TOWN_NAME: string
  ADMINISTRATIVE_AREA: string
  AREA_NAME: string
  POSTCODE_LOCATOR: string
  RPC: string
  X_COORDINATE: number
  Y_COORDINATE: number
  LNG: number
  LAT: number
  STATUS: string
  LOGICAL_STATUS_CODE: number
  CLASSIFICATION_CODE: string
  CLASSIFICATION_CODE_DESCRIPTION: string
  LOCAL_CUSTODIAN_CODE: number
  LOCAL_CUSTODIAN_CODE_DESCRIPTION: string
  COUNTRY_CODE: string
  COUNTRY_CODE_DESCRIPTION: string
  POSTAL_ADDRESS_CODE: string
  POSTAL_ADDRESS_CODE_DESCRIPTION: string
  BLPU_STATE_CODE: number
  BLPU_STATE_CODE_DESCRIPTION: string
  TOPOGRAPHY_LAYER_TOID: string
  WARD_CODE: string
  PARISH_CODE: string
  PARENT_UPRN: number
  LAST_UPDATE_DATE: string
  ENTRY_DATE: string
  LEGAL_NAME: string
  BLPU_STATE_DATE: string
  STREET_STATE_CODE: number
  STREET_STATE_CODE_DESCRIPTION: string
  STREET_CLASSIFICATION_CODE: string
  STREET_CLASSIFICATION_CODE_DESCRIPTION: string
  LPI_LOGICAL_STATUS_CODE: number
  LPI_LOGICAL_STATUS_CODE_DESCRIPTION: string
  LANGUAGE: string
  MATCH: number
  MATCH_DESCRIPTION: string
}
