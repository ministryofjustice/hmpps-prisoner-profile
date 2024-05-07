import { Alert } from '../../../data/interfaces/alertsApi/Alert'
import PrisonApiAlert from '../../../data/interfaces/prisonApi/PrisonApiAlert'

export default interface AlertView extends Alert {
  addMoreDetailsLinkUrl: string
  closeAlertLinkUrl: string
  changeEndDateLinkUrl: string
}

export interface PrisonApiAlertView extends PrisonApiAlert {
  addMoreDetailsLinkUrl: string
  closeAlertLinkUrl: string
  changeEndDateLinkUrl: string
}
