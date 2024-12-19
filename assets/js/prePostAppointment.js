document.addEventListener('DOMContentLoaded', () => {
  const preAppointmentEventsContainer = document.getElementById('preAppointmentEventsContainer')
  const preAppointmentLocation = document.getElementById('preAppointmentLocation')
  const postAppointmentEventsContainer = document.getElementById('postAppointmentEventsContainer')
  const postAppointmentLocation = document.getElementById('postAppointmentLocation')
  const courtSelect = document.getElementById('court')

  async function getPrePostEventsForLocation(input, container) {
    const locationId = input.value
    const date = document.getElementById('date').value

    const response =
      date && locationId && (await fetch(`/api/get-location-events?date=${date}&locationId=${locationId}`))

    if (response?.ok) {
      container.innerHTML = await response.text()
      container.style.display = 'block'
    } else {
      container.style.display = 'none'
    }
  }

  preAppointmentLocation.addEventListener('change', () => {
    getPrePostEventsForLocation(preAppointmentLocation, preAppointmentEventsContainer)
  })
  postAppointmentLocation.addEventListener('change', () => {
    getPrePostEventsForLocation(postAppointmentLocation, postAppointmentEventsContainer)
  })

  courtSelect.addEventListener('change', () => {
    showHideOtherCourt()
  })

  // Initialise
  getPrePostEventsForLocation(preAppointmentLocation, preAppointmentEventsContainer)
  getPrePostEventsForLocation(postAppointmentLocation, postAppointmentEventsContainer)
})
