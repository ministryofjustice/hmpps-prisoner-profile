import { NotifyClient } from 'notifications-node-client'
import config from '../config'

export const notifyClient =
  config.notifications.enabled && config.notifications.notifyKey
    ? new NotifyClient(config.notifications.notifyKey)
    : {
        sendEmail() {
          // void
        },
      }

export default {
  notifyClient,
}
