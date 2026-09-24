import { Modal } from '@ministryofjustice/hmpps-connect-dps-shared-items/dist/assets/dps/components/modal'

export function alertFlags() {
  const alertDetailsModal = Modal.getById('alert-details')
  if (alertDetailsModal) {
    document.querySelectorAll<HTMLAnchorElement>('.alerts-list .dps-alert-status').forEach(el => {
      el.addEventListener('click', event => {
        event.preventDefault()
        const ids = el.href.split('?')[1]
        const prisonerNumber = el.dataset.prisonerNumber
        alertDetailsModal.load(`/api/prisoner/${prisonerNumber}/get-alert-details?${ids}`)
      })
    })
  }
}
