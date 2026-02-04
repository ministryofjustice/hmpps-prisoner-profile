document.addEventListener('DOMContentLoaded', () => {
  const preAppointmentEventsContainer = document.getElementById('preAppointmentEventsContainer') as HTMLDivElement
  const preAppointmentLocation = document.getElementById('preAppointmentLocation') as HTMLSelectElement
  const postAppointmentEventsContainer = document.getElementById('postAppointmentEventsContainer') as HTMLDivElement
  const postAppointmentLocation = document.getElementById('postAppointmentLocation') as HTMLSelectElement
  const appointmentId = (document.getElementById('appointment-id') as HTMLSpanElement)?.innerText || ''
  const date = (document.getElementById('date') as HTMLInputElement).value

  async function getPrePostEventsForLocation(input: HTMLSelectElement, container: HTMLElement): Promise<void> {
    const locationId = input.value

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

  if (preAppointmentLocation) {
    preAppointmentLocation.addEventListener('change', () => {
      getPrePostEventsForLocation(preAppointmentLocation, preAppointmentEventsContainer)
    })

    getPrePostEventsForLocation(preAppointmentLocation, preAppointmentEventsContainer)
  }

  if (postAppointmentLocation) {
    postAppointmentLocation.addEventListener('change', () => {
      getPrePostEventsForLocation(postAppointmentLocation, postAppointmentEventsContainer)
    })

    getPrePostEventsForLocation(postAppointmentLocation, postAppointmentEventsContainer)
  }
})
