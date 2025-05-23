const WARNING = {
  'OMIC.OPEN_COMM': 'This case note could be read by anyone with access to Digital Prison Services.  Check all information recorded here is appropriate and necessary to share across the prison.',
  'KA.KE': 'Use this option to record an activity related to key work that was not a full session. This could include recording when a session did not take place or any other interaction with an allocated prisoner.',
  'KA.KS': 'You should only use this option when you’ve completed a full key worker session with a prisoner. Any other interaction should be recorded as an entry.',
}

function toggleBehaviourPrompts() {
  const behaviourPromptsPos = document.querySelector('.case-notes-behaviour-prompt--pos')
  const behaviourPromptsNeg = document.querySelector('.case-notes-behaviour-prompt--neg')
  const typeElement = document.getElementById('type')

  if (!(behaviourPromptsPos || behaviourPromptsNeg)) return

  behaviourPromptsPos.classList.remove('is-visible')
  behaviourPromptsNeg.classList.remove('is-visible')
  const entryType = typeElement.value
  if (entryType === 'POS') {
    behaviourPromptsPos.classList.add('is-visible')
  } else if (entryType === 'NEG') {
    behaviourPromptsNeg.classList.add('is-visible')
  }
}

toggleBehaviourPrompts()

function toggleOpenCaseNoteWarning() {
  const openCaseNoteWarning = document.querySelectorAll('.case-notes-open-warning')
  const openCaseNoteHint = document.querySelectorAll('.case-notes-open-hint')
  const typeElement = document.getElementById('type')
  const subTypeElement = document.getElementById('subType')
  const typeSubTypeKey = `${typeElement?.value}.${subTypeElement?.value}`

  openCaseNoteWarning.forEach(el => el.classList.remove('is-visible'))
  openCaseNoteHint.forEach(el => el.classList.remove('is-visible'))

  if (typeSubTypeKey === 'OMIC.OPEN_COMM') {
    openCaseNoteHint.forEach(el => el.classList.add('is-visible'))
  }

  if (Object.keys(WARNING).includes(typeSubTypeKey)) {
    openCaseNoteWarning.forEach(el => el.classList.add('is-visible'))
    document.querySelector('.case-notes-open-warning > strong').innerText = WARNING[typeSubTypeKey]
  }
}

toggleOpenCaseNoteWarning()

function initTypeSubTypeDropdowns() {
  const typeElement = document.getElementById('type')
  const subTypeElement = document.getElementById('subType')
  const typeSubTypeMap = JSON.parse(document.getElementById('typeData').textContent)

  typeElement.addEventListener('change', () => {
    toggleBehaviourPrompts()
    toggleOpenCaseNoteWarning()
    subTypeElement.length = 1
    if (typeElement.value === '') return
    typeSubTypeMap[typeElement.value]?.forEach(subType => {
      subTypeElement.add(new Option(subType.text, subType.value))
    })
  })

  subTypeElement.addEventListener('change', () => {
    toggleOpenCaseNoteWarning()
  })
}

initTypeSubTypeDropdowns()
