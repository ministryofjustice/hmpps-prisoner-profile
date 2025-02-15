document.addEventListener('DOMContentLoaded', () => {
  const appointmentDateInput = document.getElementById('date')
  const appointmentLocationSelect = document.getElementById('location')
  const appointmentTypeSelect = document.getElementById('appointmentType')
  const recurringRadios = document.querySelector('.js-recurring-radios')
  const optionalVideoLabel = document.getElementById('optional-video-label')
  const appointmentRepeatsSelect = document.getElementById('repeats')
  const appointmentRepeatsTimesInput = document.getElementById('times')
  const lastAppointmentDate = document.getElementById('last-appointment-date')
  const locationEventsContainer = document.getElementById('location-events')
  const offenderEventsContainer = document.getElementById('offender-events')
  const appointmentId = document.getElementById('appointment-id')?.innerText || ''

  async function getEventsForLocation() {
    const date = appointmentDateInput.value
    const locationId = appointmentLocationSelect.value

    const response =
      date && locationId && (await fetch(`/api/get-location-events?date=${date}&locationId=${locationId}&appointmentId=${appointmentId}`))

    if (response?.ok) {
      locationEventsContainer.innerHTML = await response.text()
      locationEventsContainer.style.display = 'block'
    } else {
      locationEventsContainer.style.display = 'none'
    }
  }

  async function getEventsForOffender() {
    const date = appointmentDateInput.value
    const prisonerNumber = document.getElementById('prisonerNumber').textContent

    const response =
      prisonerNumber && date && (await fetch(`/api/get-offender-events?date=${date}&prisonerNumber=${prisonerNumber}&appointmentId=${appointmentId}`))

    if (response?.ok) {
      offenderEventsContainer.style.display = 'block'
      offenderEventsContainer.innerHTML = await response.text()
    } else {
      offenderEventsContainer.style.display = 'none'
    }
  }

  async function getAppointmentEndDate() {
    const date = appointmentDateInput.value
    const repeats = appointmentRepeatsSelect.value
    const times = appointmentRepeatsTimesInput.value

    const response =
      times && date && (await fetch(`/api/get-recurring-end-date?date=${date}&repeats=${repeats}&times=${times}`))

    if (response?.ok) {
      lastAppointmentDate.style.display = 'block'
      lastAppointmentDate.innerText = await response.text()
    } else {
      lastAppointmentDate.style.display = 'none'
    }
  }

  function showHideRecurring() {
    const appointmentType = appointmentTypeSelect.value

    if (appointmentType === 'VLB') {
      recurringRadios.style.display = 'none'
    } else {
      recurringRadios.style.display = 'block'
    }
  }

  function showHideVideoLabel() {
    const appointmentType = appointmentTypeSelect.value

    if (appointmentType === 'VLB' || appointmentType === 'VLPM') {
      optionalVideoLabel.style.display = 'block'
    } else {
      optionalVideoLabel.style.display = 'none'
    }
  }

  appointmentTypeSelect.addEventListener('change', () => {
    showHideRecurring()
  })

  appointmentTypeSelect.addEventListener('change', () => {
    showHideVideoLabel()
  })

  appointmentLocationSelect.addEventListener('change', () => {
    getEventsForLocation()
  })

  appointmentDateInput.addEventListener('change', () => {
    getEventsForLocation()
  })

  appointmentDateInput.addEventListener('change', () => {
    getEventsForOffender()
  })

  appointmentRepeatsSelect.addEventListener('change', () => {
    getAppointmentEndDate()
  })

  appointmentDateInput.addEventListener('change', () => {
    getAppointmentEndDate()
  })

  appointmentRepeatsTimesInput.addEventListener('keyup', () => {
    getAppointmentEndDate()
  })

  // Initialise on form load
  getEventsForOffender()
  getEventsForLocation()
  getAppointmentEndDate()
  showHideRecurring()
  showHideVideoLabel()
})
