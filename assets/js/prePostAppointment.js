document.addEventListener('DOMContentLoaded', () => {
  const preAppointmentEventsContainer = document.getElementById('preAppointmentEventsContainer')
  const preAppointmentLocation = document.getElementById('preAppointmentLocation')
  const postAppointmentEventsContainer = document.getElementById('postAppointmentEventsContainer')
  const postAppointmentLocation = document.getElementById('postAppointmentLocation')
  const appointmentId = document.getElementById('appointment-id')?.innerText || ''

  async function getPrePostEventsForLocation(input, container) {
    const locationId = input.value
    const date = document.getElementById('date').value

    const response =
      date &&
      locationId &&
      (await fetch(`/api/get-location-events?date=${date}&locationId=${locationId}&appointmentId=${appointmentId}`))

    if (response?.ok) {
      container.innerHTML = await response.text()
      container.style.display = 'block'
    } else {
      container.style.display = 'none'
    }
  }

  preAppointmentLocation?.addEventListener('change', () => {
    getPrePostEventsForLocation(preAppointmentLocation, preAppointmentEventsContainer)
  })
  postAppointmentLocation?.addEventListener('change', () => {
    getPrePostEventsForLocation(postAppointmentLocation, postAppointmentEventsContainer)
  })

  // Initialise
  preAppointmentLocation ? getPrePostEventsForLocation(preAppointmentLocation, preAppointmentEventsContainer) : null
  postAppointmentLocation ? getPrePostEventsForLocation(postAppointmentLocation, postAppointmentEventsContainer) : null
})
