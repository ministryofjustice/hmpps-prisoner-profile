const alertDetailsModal = new Modal(document.getElementById('alert-details'))

document.querySelectorAll('.alerts-list .alert-status').forEach(el => {
  el.addEventListener('click', event => {
    event.preventDefault()
    const ids = event.target.attributes.href.value.split('?')[1]
    const prisonerNumber = event.target.dataset.prisonerNumber
    alertDetailsModal.load(`/api/prisoner/${prisonerNumber}/get-alert-details?${ids}`)
  })
})
