import Alert from '../../../data/interfaces/prisonApi/Alert'

export default interface AlertView extends Alert {
  addMoreDetailsLinkUrl: string
  closeAlertLinkUrl: string
  changeEndDateLinkUrl: string
}
