const appointmentDateInput = document.getElementById('date') as HTMLInputElement
const appointmentLocationSelect = document.getElementById('location') as HTMLSelectElement
const appointmentTypeSelect = document.getElementById('appointmentType') as HTMLSelectElement
const probationTeamSelect = document.querySelector<HTMLDivElement>('.js-probation-team')
const probationMeetingRadios = document.querySelector<HTMLDivElement>('.js-meeting-type')
const probationOfficerDetails = document.querySelector<HTMLDivElement>('.js-probation-officer')
const recurringRadios = document.querySelector<HTMLDivElement>('.js-recurring-radios')
const appointmentRepeatsSelect = document.getElementById('repeats') as HTMLSelectElement
const appointmentRepeatsTimesInput = document.getElementById('times') as HTMLInputElement
const lastAppointmentDateContainer = document.querySelector<HTMLDivElement>('.js-appointment-last-appointment')
const lastAppointmentDate = document.getElementById('last-appointment-date') as HTMLDivElement
const locationEventsContainer = document.getElementById('location-events') as HTMLDivElement
const offenderEventsContainer = document.getElementById('offender-events') as HTMLDivElement
const appointmentId = (document.getElementById('appointment-id') as HTMLInputElement)?.value || ''
const publicPrivateNotes = document.querySelector<HTMLDivElement>('.js-public-private-notes')
const comments = document.querySelector<HTMLDivElement>('.js-comments')
const courtHintText = document.getElementById('court-hint-text') as HTMLSpanElement
const probationHintText = document.getElementById('probation-hint-text') as HTMLSpanElement
const optionalVideoLabel = document.getElementById('optional-video-label') as HTMLDivElement
const optionalStandardLabel = document.getElementById('optional-standard-label') as HTMLDivElement

async function getEventsForLocation() {
  const date = appointmentDateInput.value
  const locationId = appointmentLocationSelect.value

  const response =
    date &&
    locationId &&
    (await fetch(`/api/get-location-events?date=${encodeURIComponent(date)}&locationId=${encodeURIComponent(locationId)}&appointmentId=${encodeURIComponent(appointmentId)}`))

  if (response?.ok) {
    locationEventsContainer.innerHTML = await response.text()
    locationEventsContainer.removeAttribute('style')
  } else {
    locationEventsContainer.style.display = 'none'
  }
}

async function getEventsForOffender() {
  const date = appointmentDateInput.value
  const prisonerNumber = document.getElementById('prisonerNumber').textContent

  const response =
    prisonerNumber &&
    date &&
    (await fetch(
      `/api/get-offender-events?date=${encodeURIComponent(date)}&prisonerNumber=${encodeURIComponent(prisonerNumber)}&appointmentId=${encodeURIComponent(appointmentId)}`,
    ))

  if (response?.ok) {
    offenderEventsContainer.removeAttribute('style')
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
    date && repeats && times  && (await fetch(`/api/get-recurring-end-date?date=${encodeURIComponent(date)}&repeats=${encodeURIComponent(repeats)}&times=${encodeURIComponent(times)}`))

  if (response?.ok) {
    lastAppointmentDateContainer.removeAttribute('style')
    lastAppointmentDate.innerText = await response.text()
  } else {
    lastAppointmentDateContainer.style.display = 'none'
  }
}

function showHideRecurring() {
  const appointmentType = appointmentTypeSelect.value

  if (appointmentType === 'VLB' || appointmentType === 'VLPM') {
    recurringRadios.style.display = 'none'
  } else {
    recurringRadios.removeAttribute('style')
  }
}

function showHideProbationFields() {
  const appointmentType = appointmentTypeSelect.value

  if (appointmentType === 'VLPM') {
    probationTeamSelect.removeAttribute('style')
    probationMeetingRadios.removeAttribute('style')
    probationOfficerDetails.removeAttribute('style')
  } else {
    probationTeamSelect.style.display = 'none'
    probationMeetingRadios.style.display = 'none'
    probationOfficerDetails.style.display = 'none'
  }
}

function showHideVideoLabel() {
  const appointmentType = appointmentTypeSelect.value

  if (appointmentType && ['VLOO', 'VLLA', 'VLPA', 'VLAP'].includes(appointmentType)) {
    optionalVideoLabel.style.display = 'block'
    optionalStandardLabel.style.display = 'none'
  } else {
    optionalVideoLabel.style.display = 'none'
    optionalStandardLabel.style.display = 'block'
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
      courtHintText.removeAttribute('style')
      probationHintText.style.display = 'none'
    } else {
      probationHintText.removeAttribute('style')
      courtHintText.style.display = 'none'
    }

    publicPrivateNotes.removeAttribute('style')
  } else {
    comments.removeAttribute('style')
    publicPrivateNotes.style.display = 'none'
  }
}

appointmentTypeSelect.addEventListener('change', () => {
  showHideRecurring()
  showHideProbationFields()
  showHidePublicPrivateNotes()
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

document.addEventListener('DOMContentLoaded', () => {
  getEventsForOffender()
  getEventsForLocation()
  getAppointmentEndDate()
  showHideRecurring()
  showHideProbationFields()
  showHidePublicPrivateNotes()
  showHideVideoLabel()
})
