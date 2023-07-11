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

function initTypeSubTypeDropdowns() {
  const typeElement = document.getElementById('type')
  const subTypeElement = document.getElementById('subType')
  const typeSubTypeMap = JSON.parse(document.getElementById('typeData').textContent)

  typeElement.addEventListener('change', () => {
    toggleBehaviourPrompts()
    subTypeElement.length = 1
    if (typeElement.value === '') return
    typeSubTypeMap[typeElement.value]?.forEach(subType => {
      subTypeElement.add(new Option(subType.text, subType.value))
    })
  })
}

initTypeSubTypeDropdowns()
