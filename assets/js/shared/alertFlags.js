import { Modal } from './modal'

export function alertFlags() {
  const alertDetailsElement = document.getElementById('alert-details')

  if (alertDetailsElement) {
    const alertDetailsModal = new Modal(alertDetailsElement)

    document.querySelectorAll('.alerts-list .dps-alert-status').forEach(el => {
      el.addEventListener('click', event => {
        event.preventDefault()
        const ids = event.target.attributes.href.value.split('?')[1]
        const prisonerNumber = event.target.dataset.prisonerNumber
        alertDetailsModal.load(`/api/prisoner/${prisonerNumber}/get-alert-details?${ids}`)
      })
    })
  }
}
