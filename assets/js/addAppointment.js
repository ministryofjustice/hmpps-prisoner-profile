document.addEventListener('DOMContentLoaded', () => {
  const appointmentDateInput = document.getElementById('date')
  const appointmentLocationGroup = document.querySelector('.js-appointment-locations-group')
  const appointmentLocationSelect = document.getElementById('location')
  const videoLocationGroup = document.querySelector('.js-video-locations-group')
  const videoLocationSelect = document.querySelector('.js-video-location')
  const appointmentTypeSelect = document.getElementById('appointmentType')
  const recurringRadios = document.querySelector('.js-recurring-radios')
  const appointmentRepeatsSelect = document.getElementById('repeats')
  const appointmentRepeatsTimesInput = document.getElementById('times')
  const lastAppointmentDate = document.getElementById('last-appointment-date')
  const locationEventsContainer = document.getElementById('location-events')
  const offenderEventsContainer = document.getElementById('offender-events')

  async function getEventsForLocation() {
    const date = appointmentDateInput.value
    const locationId = appointmentLocationGroup.style.display === 'block' && appointmentLocationSelect.value
    const locationKey = videoLocationGroup?.style.display === 'block' && videoLocationSelect?.value

    const response =
      date && locationId && (await fetch(`/api/get-location-events?date=${date}&locationId=${locationId}`)) ||
      date && locationKey && (await fetch(`/api/get-location-events?date=${date}&locationKey=${locationKey}`))

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
      prisonerNumber && date && (await fetch(`/api/get-offender-events?date=${date}&prisonerNumber=${prisonerNumber}`))

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

  function showHideVlbLocations() {
    const appointmentType = appointmentTypeSelect.value
    if (videoLocationGroup !== null) {
      if (appointmentType === 'VLB') {
        appointmentLocationGroup.style.display = 'none'
        videoLocationGroup.style.display = 'block'
      } else {
        appointmentLocationGroup.style.display = 'block'
        videoLocationGroup.style.display = 'none'
      }

      getEventsForLocation()
    }
  }

  appointmentTypeSelect.addEventListener('change', () => {
    showHideRecurring()
    showHideVlbLocations()
  })

  appointmentLocationSelect.addEventListener('change', () => {
    getEventsForLocation()
  })
  videoLocationSelect?.addEventListener('change', () => {
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
  showHideVlbLocations()
})
