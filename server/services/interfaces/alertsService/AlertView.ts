import { Alert } from '../../../data/interfaces/alertsApi/Alert'

export default interface AlertView extends Alert {
  addMoreDetailsLinkUrl: string
  closeAlertLinkUrl: string
  changeEndDateLinkUrl: string
}
