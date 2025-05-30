document.addEventListener('DOMContentLoaded', () => {
  const appointmentDateInput = document.getElementById('date')
  const appointmentLocationSelect = document.getElementById('location')
  const appointmentTypeSelect = document.getElementById('appointmentType')
  const probationTeamSelect = document.querySelector('.js-probation-team')
  const probationMeetingRadios = document.querySelector('.js-meeting-type')
  const probationOfficerDetails = document.querySelector('.js-probation-officer')
  const recurringRadios = document.querySelector('.js-recurring-radios')
  const commentsHint = document.getElementById('comments-hint')
  const appointmentRepeatsSelect = document.getElementById('repeats')
  const appointmentRepeatsTimesInput = document.getElementById('times')
  const lastAppointmentDate = document.getElementById('last-appointment-date')
  const locationEventsContainer = document.getElementById('location-events')
  const offenderEventsContainer = document.getElementById('offender-events')
  const appointmentId = document.getElementById('appointment-id')?.value || ''
  const publicPrivateNotes = document.querySelector('.js-public-private-notes')
  const comments = document.querySelector('.js-comments')
  const courtHintText = document.getElementById('court-hint-text')
  const probationHintText = document.getElementById('probation-hint-text')

  async function getEventsForLocation() {
    const date = appointmentDateInput.value
    const locationId = appointmentLocationSelect.value

    const response =
      date && locationId && (await fetch(`/api/get-location-events?date=${date}&locationId=${locationId}&appointmentId=${appointmentId}`))

    if (response?.ok) {
      locationEventsContainer.innerHTML = await response.text()
      locationEventsContainer.removeAttribute("style");
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
      offenderEventsContainer.removeAttribute("style");
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
      lastAppointmentDate.removeAttribute("style");
      lastAppointmentDate.innerText = await response.text()
    } else {
      lastAppointmentDate.style.display = 'none'
    }
  }

  function showHideRecurring() {
    const appointmentType = appointmentTypeSelect.value

    if (appointmentType === 'VLB' || appointmentType === 'VLPM') {
      recurringRadios.style.display = 'none'
    } else {
      recurringRadios.removeAttribute("style");
    }
  }

  function showHideProbationFields() {
    const appointmentType = appointmentTypeSelect.value

    if (appointmentType === 'VLPM') {
      probationTeamSelect.removeAttribute("style");
      probationMeetingRadios.removeAttribute("style");
      probationOfficerDetails.removeAttribute("style");
    } else {
      probationTeamSelect.style.display = 'none'
      probationMeetingRadios.style.display = 'none'
      probationOfficerDetails.style.display = 'none'
    }
  }

  function showHidePublicPrivateNotes() {
    if (!publicPrivateNotes) {
      return
    }

    const appointmentType = appointmentTypeSelect.value

    if (appointmentType === 'VLB' || appointmentType === 'VLPM') {
      comments.style.display = 'none'

      if (appointmentType === 'VLB') {
        courtHintText.removeAttribute("style");
        probationHintText.style.display = 'none'
      } else {
        probationHintText.removeAttribute("style");
        courtHintText.style.display = 'none'
      }

      publicPrivateNotes.removeAttribute("style");
    } else {
      comments.removeAttribute("style");
      publicPrivateNotes.style.display = 'none'
    }
  }

  function showHideCommentsHint() {
    if (!comments) {
      return
    }

    const appointmentType = appointmentTypeSelect.value

    if (appointmentType === 'VLB' || appointmentType === 'VLPM') {
      commentsHint.removeAttribute("style");
    } else {
      commentsHint.style.display = 'none'
    }
  }

  appointmentTypeSelect.addEventListener('change', () => {
    showHideRecurring()
    showHideProbationFields()
    showHideCommentsHint()
    showHidePublicPrivateNotes()
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
  showHideProbationFields()
  showHidePublicPrivateNotes()
  showHideCommentsHint()
})
